// =============================================================================
// SqlAppRepository — Membership (Plans + Subscriptions)
// =============================================================================
#nullable enable

using IScream.Models;
using Microsoft.Data.SqlClient;

namespace IScream.Data
{
    public partial class SqlAppRepository
    {
        // -----------------------------------------------------------------
        // Row Mappers
        // -----------------------------------------------------------------
        private static MembershipPlan MapPlan(SqlDataReader r) => new()
        {
            Id = ReadInt(r, "Id"),
            Code = r["Code"].ToString()!,
            Price = ReadDecimal(r, "Price"),
            Currency = r["Currency"].ToString()!,
            DurationDays = ReadInt(r, "DurationDays"),
            IsActive = ReadBool(r, "IsActive")
        };

        private static MembershipSubscription MapSubscription(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadGuid(r, "UserId"),
            PlanId = ReadInt(r, "PlanId"),
            PaymentId = ReadNullGuid(r, "PaymentId"),
            StartDate = ReadDateTime(r, "StartDate"),
            EndDate = ReadDateTime(r, "EndDate"),
            Status = r["Status"].ToString()!,
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            PlanCode = ReadNullString(r, "PlanCode"),
            PlanPrice = ReadNullDecimal(r, "PlanPrice")
        };

        // -----------------------------------------------------------------
        // Plans
        // -----------------------------------------------------------------
        public Task<List<MembershipPlan>> ListPlansAsync()
            => QueryAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS WHERE IsActive = 1 ORDER BY Price",
                null, MapPlan);

        public Task<List<MembershipPlan>> ListAllPlansAsync()
            => QueryAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS ORDER BY IsActive DESC, Price",
                null, MapPlan);

        public Task<MembershipPlan?> GetPlanByIdAsync(int id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS WHERE Id = @Id AND IsActive = 1",
                [P("@Id", id)], MapPlan);

        public Task<MembershipPlan?> GetPlanByIdAdminAsync(int id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS WHERE Id = @Id",
                [P("@Id", id)], MapPlan);

        public async Task<int> CreatePlanAsync(MembershipPlan plan)
        {
            var id = await ExecuteScalarAsync<int?>("""
                INSERT INTO public_data.MEMBERSHIP_PLANS (Code, Price, Currency, DurationDays, IsActive)
                VALUES (@Code, @Price, @Currency, @DurationDays, 1);
                SELECT SCOPE_IDENTITY();
                """,
                [P("@Code", plan.Code), P("@Price", plan.Price), P("@Currency", plan.Currency),
                 P("@DurationDays", plan.DurationDays)]);
            return id ?? 0;
        }

        public async Task<bool> UpdatePlanAsync(MembershipPlan plan)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.MEMBERSHIP_PLANS
                SET Code = @Code, Price = @Price, Currency = @Currency,
                    DurationDays = @DurationDays, IsActive = @IsActive
                WHERE Id = @Id
                """,
                [P("@Id", plan.Id), P("@Code", plan.Code), P("@Price", plan.Price),
                 P("@Currency", plan.Currency), P("@DurationDays", plan.DurationDays),
                 P("@IsActive", plan.IsActive)]);
            return rows > 0;
        }

        // -----------------------------------------------------------------
        // Subscriptions
        // -----------------------------------------------------------------
        public async Task<Guid> CreateSubscriptionAsync(MembershipSubscription sub)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.MEMBERSHIP_SUBSCRIPTIONS
                    (Id, UserId, PlanId, PaymentId, StartDate, EndDate, Status)
                VALUES (@Id, @UserId, @PlanId, @PaymentId, @StartDate, @EndDate, @Status)
                """,
                [P("@Id", newId), P("@UserId", sub.UserId), P("@PlanId", sub.PlanId),
                 P("@PaymentId", sub.PaymentId), P("@StartDate", sub.StartDate),
                 P("@EndDate", sub.EndDate), P("@Status", sub.Status)]);
            return newId;
        }

        public Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId)
            => QueryFirstAsync("""
                SELECT s.*, p.Code AS PlanCode, p.Price AS PlanPrice
                FROM public_data.MEMBERSHIP_SUBSCRIPTIONS s
                JOIN public_data.MEMBERSHIP_PLANS p ON p.Id = s.PlanId
                WHERE s.UserId = @UserId AND s.Status = 'ACTIVE' AND s.EndDate > SYSDATETIME()
                ORDER BY s.EndDate DESC
                """,
                [P("@UserId", userId)], MapSubscription);

        public Task<List<MembershipSubscription>> ListSubscriptionsAsync(Guid userId)
            => QueryAsync("""
                SELECT s.*, p.Code AS PlanCode, p.Price AS PlanPrice
                FROM public_data.MEMBERSHIP_SUBSCRIPTIONS s
                JOIN public_data.MEMBERSHIP_PLANS p ON p.Id = s.PlanId
                WHERE s.UserId = @UserId
                ORDER BY s.CreatedAt DESC
                """,
                [P("@UserId", userId)], MapSubscription);

        public async Task<bool> UpdateSubscriptionStatusAsync(Guid id, string status, Guid? paymentId = null)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.MEMBERSHIP_SUBSCRIPTIONS
                SET Status = @Status, PaymentId = COALESCE(@PaymentId, PaymentId)
                WHERE Id = @Id
                """,
                [P("@Id", id), P("@Status", status), P("@PaymentId", paymentId)]);
            return rows > 0;
        }

        public async Task<bool> CancelSubscriptionAsync(Guid id, Guid userId)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.MEMBERSHIP_SUBSCRIPTIONS
                SET Status = 'CANCELLED'
                WHERE Id = @Id AND UserId = @UserId AND Status = 'ACTIVE'
                """,
                [P("@Id", id), P("@UserId", userId)]);
            return rows > 0;
        }

        public async Task<(List<AppUser> users, int total)> ListActiveMembersAsync(int page, int pageSize)
        {
            var users = await QueryAsync("""
                SELECT DISTINCT u.*
                FROM public_data.USERS u
                INNER JOIN public_data.MEMBERSHIP_SUBSCRIPTIONS s ON s.UserId = u.Id
                WHERE s.Status = 'ACTIVE' AND s.EndDate > SYSDATETIME()
                ORDER BY u.CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """,
                [P("@Skip", (page - 1) * pageSize), P("@Take", pageSize)], MapUser);
            var total = await ExecuteScalarAsync<int?>("""
                SELECT COUNT(DISTINCT u.Id)
                FROM public_data.USERS u
                INNER JOIN public_data.MEMBERSHIP_SUBSCRIPTIONS s ON s.UserId = u.Id
                WHERE s.Status = 'ACTIVE' AND s.EndDate > SYSDATETIME()
                """, null) ?? 0;
            return (users, total);
        }
    }
}
