#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.RECIPES</summary>
    public class Recipe
    {
        public Guid Id { get; set; }
        public string FlavorName { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}