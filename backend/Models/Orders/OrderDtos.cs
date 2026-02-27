#nullable enable

namespace IScream.Models
{
    // --- Order DTOs ---
    public class CreateOrderRequest
    {
        public string CustomerName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public Guid ItemId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = null!; // SHIPPED | DELIVERED | CANCELLED
    }
}