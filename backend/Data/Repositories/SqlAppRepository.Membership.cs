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

        public Task<MembershipPlan?> GetPlanByIdAsync(int id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS WHERE Id = @Id AND IsActive = 1",
                [P("@Id", id)], MapPlan);

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
    }
}
