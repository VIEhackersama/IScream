// =============================================================================
// PaymentService — Business logic for PAYMENTS
// Side-effects: confirm payment → update ORDER or activate SUBSCRIPTION
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IPaymentService
    {
        Task<(Guid paymentId, string error)> CreatePaymentAsync(CreatePaymentRequest req);
        Task<(bool ok, string error)> ConfirmPaymentAsync(Guid paymentId, Guid? linkedEntityId);
        Task<(Payment? payment, string error)> GetByIdAsync(Guid id);
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

        public async Task<(bool ok, string error)> ConfirmPaymentAsync(Guid paymentId, Guid? linkedEntityId)
        {
            var payment = await _repo.GetPaymentByIdAsync(paymentId);
            if (payment == null)
                return (false, "Payment not found.");
            if (payment.Status != "INIT")
                return (false, $"Payment is in {payment.Status} state and cannot be confirmed.");

            // Update payment status → SUCCESS
            var confirmed = await _repo.ConfirmPaymentAsync(paymentId);
            if (!confirmed)
                return (false, "Payment confirmation failed.");

            // Side-effects based on Type
            if (linkedEntityId.HasValue)
            {
                if (payment.Type == "ORDER")
                {
                    // Link payment to order and mark as PAID
                    await _repo.UpdateOrderStatusAsync(linkedEntityId.Value, "PAID", paymentId);
                }
                else if (payment.Type == "MEMBERSHIP")
                {
                    // Link payment to subscription and activate
                    // The subscription should already be created in PENDING — activate it
                    // (Subscription activation is handled in MembershipService.SubscribeAsync)
                }
            }

            return (true, string.Empty);
        }

        public async Task<(Payment? payment, string error)> GetByIdAsync(Guid id)
        {
            var payment = await _repo.GetPaymentByIdAsync(id);
            return payment == null ? (null, "Payment not found.") : (payment, string.Empty);
        }
    }
}
