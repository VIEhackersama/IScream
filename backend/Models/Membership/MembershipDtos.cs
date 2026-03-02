#nullable enable

namespace IScream.Models
{
    // --- Membership DTOs ---
    public class SubscribeRequest
    {
        public Guid UserId { get; set; }
        public int PlanId { get; set; }
        public Guid? PaymentId { get; set; }
    }
}