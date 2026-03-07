// =============================================================================
// SqlAppRepository — Payments
// =============================================================================
#nullable enable

using IScream.Models;
using Microsoft.Data.SqlClient;

namespace IScream.Data
{
    public partial class SqlAppRepository
    {
        // -----------------------------------------------------------------
        // Row Mapper
        // -----------------------------------------------------------------
        private static Payment MapPayment(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadNullGuid(r, "UserId"),
            Amount = ReadDecimal(r, "Amount"),
            Currency = r["Currency"].ToString()!,
            Type = r["Type"].ToString()!,
            Status = r["Status"].ToString()!,
            MetaJson = ReadNullString(r, "MetaJson"),
            CreatedAt = ReadDateTime(r, "CreatedAt")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public async Task<Guid> CreatePaymentAsync(Payment payment)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.PAYMENTS (Id, UserId, Amount, Currency, Type, Status, MetaJson, CreatedAt)
                VALUES (@Id, @UserId, @Amount, @Currency, @Type, 'PENDING', @MetaJson, @CreatedAt)
                """,
                [P("@Id", newId), P("@UserId", payment.UserId), P("@Amount", payment.Amount),
                 P("@Currency", payment.Currency), P("@Type", payment.Type), P("@MetaJson", payment.MetaJson),
                 P("@CreatedAt", DateTime.UtcNow)]);
            return newId;
        }

        public Task<Payment?> GetPaymentByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.PAYMENTS WHERE Id = @Id",
                [P("@Id", id)], MapPayment);

        public async Task<bool> ConfirmPaymentAsync(Guid id)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.PAYMENTS SET Status = 'SUCCESS' WHERE Id = @Id AND Status = 'PENDING'",
                [P("@Id", id)]);
            return rows > 0;
        }

        public async Task<bool> FailPaymentAsync(Guid id)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.PAYMENTS SET Status = 'FAILED' WHERE Id = @Id AND Status = 'PENDING'",
                [P("@Id", id)]);
            return rows > 0;
        }

        public async Task<bool> UpdatePaymentMetaAsync(Guid id, string metaJson)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.PAYMENTS SET MetaJson = @MetaJson WHERE Id = @Id",
                [P("@Id", id), P("@MetaJson", metaJson)]);
            return rows > 0;
        }

        public Task<List<Payment>> ListPaymentsAsync(Guid? userId, string? status, int page, int pageSize)
            => QueryAsync("""
                SELECT * FROM public_data.PAYMENTS
                WHERE (@UserId IS NULL OR UserId = @UserId)
                  AND (@Status IS NULL OR Status = @Status)
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """,
                [P("@UserId", userId), P("@Status", status),
                 P("@Skip", (page - 1) * pageSize), P("@Take", pageSize)], MapPayment);

        public async Task<int> CountPaymentsAsync(Guid? userId, string? status)
            => await ExecuteScalarAsync<int?>("""
                SELECT COUNT(1) FROM public_data.PAYMENTS
                WHERE (@UserId IS NULL OR UserId = @UserId)
                  AND (@Status IS NULL OR Status = @Status)
                """,
                [P("@UserId", userId), P("@Status", status)]) ?? 0;
    }
}
