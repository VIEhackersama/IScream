#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.FEEDBACKS</summary>
    public class Feedback
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRegisteredUser { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}