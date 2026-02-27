#nullable enable

namespace IScream.Models
{
    // --- Payment DTOs ---
    public class CreatePaymentRequest
    {
        public Guid? UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public string Type { get; set; } = null!; // MEMBERSHIP | ORDER
    }

    public class ConfirmPaymentRequest
    {
        /// <summary>Order or Subscription to link after payment SUCCESS</summary>
        public Guid? LinkedEntityId { get; set; }
    }
}