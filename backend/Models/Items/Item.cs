#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.ITEMS</summary>
    public class Item
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}