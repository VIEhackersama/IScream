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
                return (false, "Username phải có ít nhất 3 ký tự.", Guid.Empty);

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
                return (false, "Password phải có ít nhất 6 ký tự.", Guid.Empty);

            var existing = await _repo.FindUserByUsernameAsync(req.Username.Trim());
            if (existing != null)
                return (false, "Username đã tồn tại.", Guid.Empty);

            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var byEmail = await _repo.FindUserByEmailAsync(req.Email.Trim().ToLower());
                if (byEmail != null)
                    return (false, "Email đã được sử dụng.", Guid.Empty);
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
                return (false, "UsernameOrEmail không được để trống.", null);

            AppUser? user;
            if (req.UsernameOrEmail.Contains('@'))
                user = await _repo.FindUserByEmailAsync(req.UsernameOrEmail.Trim().ToLower());
            else
                user = await _repo.FindUserByUsernameAsync(req.UsernameOrEmail.Trim());

            if (user == null || !BC.Verify(req.Password, user.PasswordHash!))
                return (false, "Sai tài khoản hoặc mật khẩu.", null);

            if (!user.IsActive)
                return (false, "Tài khoản đã bị vô hiệu hóa.", null);

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
