// =============================================================================
// AuthService — Register, Login, JWT
// =============================================================================
#nullable enable

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IScream.Data;
using IScream.Models;
using Microsoft.IdentityModel.Tokens;
using BC = BCrypt.Net.BCrypt;

namespace IScream.Services
{
    public interface IAuthService
    {
        Task<(bool ok, string error, Guid userId)> RegisterAsync(RegisterRequest req);
        Task<(bool ok, string error, LoginResponse? response)> LoginAsync(LoginRequest req);
        Task<(UserInfo? user, string error)> GetMeAsync(Guid userId);
        Task<(bool ok, string error)> UpdateProfileAsync(Guid userId, UpdateProfileRequest req);
        Task<(bool ok, string error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest req);
    }

    public class AuthService : IAuthService
    {
        private readonly IAppRepository _repo;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private const int TokenExpiryHours = 8;

        public AuthService(IAppRepository repo)
        {
            _repo = repo;
            _jwtSecret = Environment.GetEnvironmentVariable("JwtSecretKey") ?? "CHANGE_ME_32_CHARS_MIN_SECRET!!";
            _jwtIssuer = Environment.GetEnvironmentVariable("JwtIssuer") ?? "iscream-api";
            _jwtAudience = Environment.GetEnvironmentVariable("JwtAudience") ?? "iscream-client";
        }

        public async Task<(bool ok, string error, Guid userId)> RegisterAsync(RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Username) || req.Username.Length < 3)
                return (false, "Username must be at least 3 characters.", Guid.Empty);

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
                return (false, "Password must be at least 6 characters.", Guid.Empty);

            var existing = await _repo.FindUserByUsernameAsync(req.Username.Trim());
            if (existing != null)
                return (false, "Username already exists.", Guid.Empty);

            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var byEmail = await _repo.FindUserByEmailAsync(req.Email.Trim().ToLower());
                if (byEmail != null)
                    return (false, "Email is already in use.", Guid.Empty);
            }

            var user = new AppUser
            {
                Username = req.Username.Trim(),
                Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim().ToLower(),
                PasswordHash = BC.HashPassword(req.Password),
                FullName = req.FullName?.Trim(),
                Role = "USER"
            };

            var id = await _repo.CreateUserAsync(user);
            return (true, string.Empty, id);
        }

        public async Task<(bool ok, string error, LoginResponse? response)> LoginAsync(LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.UsernameOrEmail))
                return (false, "UsernameOrEmail is required.", null);

            AppUser? user;
            if (req.UsernameOrEmail.Contains('@'))
                user = await _repo.FindUserByEmailAsync(req.UsernameOrEmail.Trim().ToLower());
            else
                user = await _repo.FindUserByUsernameAsync(req.UsernameOrEmail.Trim());

            if (user == null || !BC.Verify(req.Password, user.PasswordHash!))
                return (false, "Invalid username or password.", null);

            if (!user.IsActive)
                return (false, "Account has been deactivated.", null);

            var token = GenerateJwt(user);
            var response = new LoginResponse
            {
                Token = token,
                ExpiresInSeconds = TokenExpiryHours * 3600,
                User = new UserInfo
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role
                }
            };
            return (true, string.Empty, response);
        }

        public async Task<(UserInfo? user, string error)> GetMeAsync(Guid userId)
        {
            var user = await _repo.GetUserByIdAsync(userId);
            if (user == null)
                return (null, "User not found.");

            return (new UserInfo
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            }, string.Empty);
        }

        public async Task<(bool ok, string error)> UpdateProfileAsync(Guid userId, UpdateProfileRequest req)
        {
            var user = await _repo.GetUserByIdAsync(userId);
            if (user == null)
                return (false, "User not found.");

            // If email is being changed, check uniqueness
            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var normalizedEmail = req.Email.Trim().ToLower();
                if (normalizedEmail != user.Email)
                {
                    var existing = await _repo.FindUserByEmailAsync(normalizedEmail);
                    if (existing != null && existing.Id != userId)
                        return (false, "Email is already in use by another account.");
                }
            }

            var ok = await _repo.UpdateUserProfileAsync(
                userId,
                req.FullName?.Trim() ?? user.FullName,
                !string.IsNullOrWhiteSpace(req.Email) ? req.Email.Trim().ToLower() : user.Email);

            return (ok, ok ? string.Empty : "Update failed.");
        }

        public async Task<(bool ok, string error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 6)
                return (false, "New password must be at least 6 characters.");

            var user = await _repo.GetUserByIdAsync(userId);
            if (user == null)
                return (false, "User not found.");

            if (!BC.Verify(req.OldPassword, user.PasswordHash!))
                return (false, "Old password is incorrect.");

            var newHash = BC.HashPassword(req.NewPassword);
            var ok = await _repo.UpdatePasswordHashAsync(userId, newHash);
            return (ok, ok ? string.Empty : "Password change failed.");
        }

        private string GenerateJwt(AppUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(TokenExpiryHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
