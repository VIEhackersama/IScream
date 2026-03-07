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

    public class CreatePlanRequest
    {
        public string Code { get; set; } = null!;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public int DurationDays { get; set; } = 30;
    }

    public class UpdatePlanRequest
    {
        public string? Code { get; set; }
        public decimal? Price { get; set; }
        public string? Currency { get; set; }
        public int? DurationDays { get; set; }
        public bool? IsActive { get; set; }
    }
}