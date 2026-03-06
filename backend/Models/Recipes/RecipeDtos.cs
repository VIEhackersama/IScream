#nullable enable

namespace IScream.Models
{
    // --- Recipe DTOs ---
    public class CreateRecipeRequest
    {
        public string FlavorName { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateRecipeRequest
    {
        public string? FlavorName { get; set; }
        public string? ShortDescription { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }

    /// <summary>Recipe detail with membership-based locking</summary>
    public class RecipeDetailResponse
    {
        public Guid Id { get; set; }
        public string FlavorName { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsLocked { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}