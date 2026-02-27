#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.PAYMENTS — Type: MEMBERSHIP | ORDER</summary>
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public string Type { get; set; } = null!;
        public string Status { get; set; } = "INIT";  // INIT | SUCCESS | FAILED
        public DateTime CreatedAt { get; set; }
    }
}