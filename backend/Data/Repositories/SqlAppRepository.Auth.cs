// =============================================================================
// SqlAppRepository — Auth / Users
// =============================================================================
#nullable enable

using IScream.Models;
using Microsoft.Data.SqlClient;

namespace IScream.Data
{
    public partial class SqlAppRepository
    {
        // -----------------------------------------------------------------
        // Row Mapper
        // -----------------------------------------------------------------
        private static AppUser MapUser(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            Username = r["Username"].ToString()!,
            Email = ReadNullString(r, "Email"),
            PasswordHash = r["PasswordHash"].ToString()!,
            FullName = ReadNullString(r, "FullName"),
            Role = r["Role"].ToString()!,
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            IsActive = ReadBool(r, "IsActive")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public Task<AppUser?> FindUserByUsernameAsync(string username)
            => QueryFirstAsync(
                "SELECT * FROM public_data.USERS WHERE Username = @Username",
                [P("@Username", username)], MapUser);

        public Task<AppUser?> FindUserByEmailAsync(string email)
            => QueryFirstAsync(
                "SELECT * FROM public_data.USERS WHERE Email = @Email",
                [P("@Email", email)], MapUser);

        public Task<AppUser?> GetUserByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.USERS WHERE Id = @Id",
                [P("@Id", id)], MapUser);

        public async Task<Guid> CreateUserAsync(AppUser user)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.USERS (Id, Username, Email, PasswordHash, FullName, Role, IsActive)
                VALUES (@Id, @Username, @Email, @PasswordHash, @FullName, @Role, 1)
                """,
                [P("@Id", newId), P("@Username", user.Username), P("@Email", user.Email),
                 P("@PasswordHash", user.PasswordHash), P("@FullName", user.FullName),
                 P("@Role", user.Role)]);
            return newId;
        }

        public async Task<bool> UpdateUserProfileAsync(Guid id, string? fullName, string? email)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.USERS SET FullName = @FullName, Email = @Email
                WHERE Id = @Id
                """,
                [P("@Id", id), P("@FullName", fullName), P("@Email", email)]);
            return rows > 0;
        }

        public async Task<bool> SetUserActiveAsync(Guid id, bool isActive)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.USERS SET IsActive = @IsActive WHERE Id = @Id",
                [P("@Id", id), P("@IsActive", isActive)]);
            return rows > 0;
        }

        public Task<List<AppUser>> ListUsersAsync(int page, int pageSize)
            => QueryAsync("""
                SELECT * FROM public_data.USERS
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """,
                [P("@Skip", (page - 1) * pageSize), P("@Take", pageSize)], MapUser);

        public async Task<int> CountUsersAsync()
            => await ExecuteScalarAsync<int?>("SELECT COUNT(1) FROM public_data.USERS", null) ?? 0;
    }
}
