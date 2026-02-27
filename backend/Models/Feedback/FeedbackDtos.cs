#nullable enable

namespace IScream.Models
{
    // --- Feedback DTOs ---
    public class CreateFeedbackRequest
    {
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Message { get; set; } = null!;
    }
}