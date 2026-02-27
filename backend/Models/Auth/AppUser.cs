#nullable enable

namespace IScream.Models
{
    /// <summary>public_data.USERS</summary>
    public class AppUser
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Email { get; set; }
        public string PasswordHash { get; set; } = null!;
        public string? FullName { get; set; }
        public string Role { get; set; } = "USER";   // USER | ADMIN
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}