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
            CreatedAt = ReadDateTime(r, "CreatedAt")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public async Task<Guid> CreatePaymentAsync(Payment payment)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.PAYMENTS (Id, UserId, Amount, Currency, Type, Status)
                VALUES (@Id, @UserId, @Amount, @Currency, @Type, 'INIT')
                """,
                [P("@Id", newId), P("@UserId", payment.UserId), P("@Amount", payment.Amount),
                 P("@Currency", payment.Currency), P("@Type", payment.Type)]);
            return newId;
        }

        public Task<Payment?> GetPaymentByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.PAYMENTS WHERE Id = @Id",
                [P("@Id", id)], MapPayment);

        public async Task<bool> ConfirmPaymentAsync(Guid id)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.PAYMENTS SET Status = 'SUCCESS' WHERE Id = @Id AND Status = 'INIT'",
                [P("@Id", id)]);
            return rows > 0;
        }
    }
}
