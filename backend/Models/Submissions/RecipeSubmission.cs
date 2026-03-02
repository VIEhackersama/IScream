#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.RECIPE_SUBMISSIONS</summary>
    public class RecipeSubmission
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING | APPROVED | REJECTED
        public decimal? PrizeMoney { get; set; }
        public string? CertificateUrl { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }
}