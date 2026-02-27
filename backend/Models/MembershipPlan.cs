#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.MEMBERSHIP_PLANS</summary>
    public class MembershipPlan
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public int DurationDays { get; set; } = 30;
        public bool IsActive { get; set; } = true;
    }
}