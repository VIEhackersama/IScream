// =============================================================================
// PaymentService — Business logic for PAYMENTS
// Side-effects: confirm payment → update ORDER or activate SUBSCRIPTION
// Mock card validation: Luhn check, MM/YY expiry, 3-4 digit CVV, amount > 0
// =============================================================================
#nullable enable

using System.Text.Json;
using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IPaymentService
    {
        Task<(Guid paymentId, string error)> CreatePaymentAsync(CreatePaymentRequest req);
        Task<(bool ok, string error)> ConfirmPaymentAsync(Guid paymentId, ConfirmPaymentRequest req);
        Task<(bool ok, string error)> FailPaymentAsync(Guid paymentId);
        Task<(Payment? payment, string error)> GetByIdAsync(Guid id);
        Task<PagedResult<Payment>> ListAsync(Guid? userId, string? status, int page, int pageSize);
    }

    public class PaymentService : IPaymentService
    {
        private readonly IAppRepository _repo;

        public PaymentService(IAppRepository repo) => _repo = repo;

        public async Task<(Guid paymentId, string error)> CreatePaymentAsync(CreatePaymentRequest req)
        {
            if (req.Amount <= 0)
                return (Guid.Empty, "Amount must be greater than 0.");
            if (string.IsNullOrWhiteSpace(req.Type))
                return (Guid.Empty, "Type is required (ORDER | MEMBERSHIP).");

            var validTypes = new[] { "ORDER", "MEMBERSHIP" };
            if (!validTypes.Contains(req.Type.ToUpper()))
                return (Guid.Empty, "Type must be ORDER or MEMBERSHIP.");

            var payment = new Payment
            {
                UserId = req.UserId,
                Amount = req.Amount,
                Currency = string.IsNullOrWhiteSpace(req.Currency) ? "VND" : req.Currency.ToUpper(),
                Type = req.Type.ToUpper(),
                Status = "INIT"
            };

            var id = await _repo.CreatePaymentAsync(payment);
            return (id, string.Empty);
        }

        public async Task<(bool ok, string error)> ConfirmPaymentAsync(Guid paymentId, ConfirmPaymentRequest req)
        {
            var payment = await _repo.GetPaymentByIdAsync(paymentId);
            if (payment == null)
                return (false, "Payment not found.");
            if (payment.Status != "INIT")
                return (false, $"Payment is in {payment.Status} state and cannot be confirmed.");

            // --- Card validation ---
            var (cardValid, cardError, last4) = ValidateCard(req, payment.Amount);

            // Build MetaJson and persist (even on failure)
            var meta = new
            {
                last4,
                validationNote = cardError,
                linkedEntityId = req.LinkedEntityId?.ToString(),
                processedAt = DateTime.UtcNow
            };
            var metaJson = JsonSerializer.Serialize(meta);
            await _repo.UpdatePaymentMetaAsync(paymentId, metaJson);

            if (!cardValid)
            {
                await _repo.FailPaymentAsync(paymentId);
                return (false, cardError);
            }

            // Update payment status → SUCCESS
            var confirmed = await _repo.ConfirmPaymentAsync(paymentId);
            if (!confirmed)
                return (false, "Payment confirmation failed.");

            // Side-effects based on Type
            if (req.LinkedEntityId.HasValue)
            {
                if (payment.Type == "ORDER")
                    await _repo.UpdateOrderStatusAsync(req.LinkedEntityId.Value, "PAID", paymentId);
                else if (payment.Type == "MEMBERSHIP")
                    await _repo.UpdateSubscriptionStatusAsync(req.LinkedEntityId.Value, "ACTIVE", paymentId);
            }

            return (true, string.Empty);
        }

        public async Task<(bool ok, string error)> FailPaymentAsync(Guid paymentId)
        {
            var payment = await _repo.GetPaymentByIdAsync(paymentId);
            if (payment == null)
                return (false, "Payment not found.");
            if (payment.Status != "INIT")
                return (false, $"Payment is in {payment.Status} state and cannot be marked as failed.");

            var ok = await _repo.FailPaymentAsync(paymentId);
            return (ok, ok ? string.Empty : "Failed to update payment status.");
        }

        public async Task<(Payment? payment, string error)> GetByIdAsync(Guid id)
        {
            var payment = await _repo.GetPaymentByIdAsync(id);
            return payment == null ? (null, "Payment not found.") : (payment, string.Empty);
        }

        public async Task<PagedResult<Payment>> ListAsync(Guid? userId, string? status, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var items = await _repo.ListPaymentsAsync(userId, status, page, pageSize);
            var total = await _repo.CountPaymentsAsync(userId, status);
            return new PagedResult<Payment> { Items = items, Page = page, PageSize = pageSize, Total = total };
        }

        // ── Private: Mock card validation ────────────────────────────────────

        private static (bool valid, string error, string last4) ValidateCard(
            ConfirmPaymentRequest req, decimal amount)
        {
            if (amount <= 0)
                return (false, "Amount must be greater than 0.", string.Empty);

            var cardNum = (req.CardNumber ?? "").Replace(" ", "").Replace("-", "");
            if (string.IsNullOrEmpty(cardNum) || !System.Text.RegularExpressions.Regex.IsMatch(cardNum, @"^\d{13,19}$"))
                return (false, "Invalid card number format.", string.Empty);

            if (!LuhnCheck(cardNum))
                return (false, "Card number failed Luhn check.", string.Empty);

            var expiry = (req.Expiry ?? "").Trim();
            if (!System.Text.RegularExpressions.Regex.IsMatch(expiry, @"^\d{2}/\d{2}$"))
                return (false, "Expiry must be in MM/YY format.", cardNum[^4..]);

            var parts = expiry.Split('/');
            if (!int.TryParse(parts[0], out int month) || month < 1 || month > 12)
                return (false, "Expiry month must be 01–12.", cardNum[^4..]);

            if (!int.TryParse(parts[1], out int year))
                return (false, "Invalid expiry year.", cardNum[^4..]);

            var expiryDate = new DateTime(2000 + year, month, 1).AddMonths(1).AddDays(-1);
            if (expiryDate < DateTime.UtcNow.Date)
                return (false, "Card has expired.", cardNum[^4..]);

            var cvv = (req.Cvv ?? "").Trim();
            if (!System.Text.RegularExpressions.Regex.IsMatch(cvv, @"^\d{3,4}$"))
                return (false, "CVV must be 3 or 4 digits.", cardNum[^4..]);

            return (true, string.Empty, cardNum[^4..]);
        }

        private static bool LuhnCheck(string number)
        {
            int sum = 0;
            bool alternate = false;
            for (int i = number.Length - 1; i >= 0; i--)
            {
                if (!char.IsDigit(number[i])) return false;
                int n = number[i] - '0';
                if (alternate)
                {
                    n *= 2;
                    if (n > 9) n -= 9;
                }
                sum += n;
                alternate = !alternate;
            }
            return sum % 10 == 0;
        }
    }
}
