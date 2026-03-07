#nullable enable

namespace IScream.Models
{
    // --- authentication/request & response DTOs ---

    public class RegisterRequest
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Email { get; set; }
        public string? FullName { get; set; }
    }

    public class LoginRequest
    {
        /// <summary>Can be Username or Email</summary>
        public string UsernameOrEmail { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresInSeconds { get; set; } = 28800; // 8 hours
        public UserInfo User { get; set; } = null!;
    }

    public class UserInfo
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string Role { get; set; } = null!;
    }

    /// <summary>Lightweight user record returned by admin list endpoint</summary>
    public class UserSummary
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string Role { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SetUserActiveRequest
    {
        public bool IsActive { get; set; }
    }
}