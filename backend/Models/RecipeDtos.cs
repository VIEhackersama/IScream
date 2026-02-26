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
}