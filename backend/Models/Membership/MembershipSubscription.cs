#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.MEMBERSHIP_SUBSCRIPTIONS</summary>
    public class MembershipSubscription
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int PlanId { get; set; }
        public Guid? PaymentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE | EXPIRED | CANCELLED
        public DateTime CreatedAt { get; set; }

        // Joined fields
        public string? PlanCode { get; set; }
        public decimal? PlanPrice { get; set; }
    }
}