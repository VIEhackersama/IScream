#nullable enable

namespace IScream.Models
{
    // --- RecipeSubmission DTOs ---
    public class CreateSubmissionRequest
    {
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class ReviewSubmissionRequest
    {
        public Guid AdminUserId { get; set; }
        public bool Approve { get; set; }
        public decimal? PrizeMoney { get; set; }
        public string? CertificateUrl { get; set; }
    }
}