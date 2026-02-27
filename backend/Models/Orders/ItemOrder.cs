#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.ITEM_ORDERS — TotalCost is computed (persisted) in DB</summary>
    public class ItemOrder
    {
        public Guid Id { get; set; }
        public string OrderNo { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public Guid ItemId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalCost { get; set; }   // read-only (computed in DB)
        public Guid? PaymentId { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING | PAID | SHIPPED | DELIVERED | CANCELLED
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Joined fields (optional, for richer responses)
        public string? ItemTitle { get; set; }
        public string? ItemImageUrl { get; set; }
    }
}