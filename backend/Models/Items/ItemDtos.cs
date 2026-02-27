#nullable enable

namespace IScream.Models
{
    // --- Item DTOs ---
    public class CreateItemRequest
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
    }

    public class UpdateItemRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? ImageUrl { get; set; }
        public int? Stock { get; set; }
    }
}