// =============================================================================
// SqlAppRepository — Recipe Submissions
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
        private static RecipeSubmission MapSubmission(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadNullGuid(r, "UserId"),
            Name = ReadNullString(r, "Name"),
            Email = ReadNullString(r, "Email"),
            Title = r["Title"].ToString()!,
            Description = ReadNullString(r, "Description"),
            Ingredients = ReadNullString(r, "Ingredients"),
            Steps = ReadNullString(r, "Steps"),
            ImageUrl = ReadNullString(r, "ImageUrl"),
            Status = r["Status"].ToString()!,
            PrizeMoney = ReadNullDecimal(r, "PrizeMoney"),
            CertificateUrl = ReadNullString(r, "CertificateUrl"),
            ReviewedByUserId = ReadNullGuid(r, "ReviewedByUserId"),
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            ReviewedAt = ReadNullDateTime(r, "ReviewedAt")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public async Task<Guid> CreateSubmissionAsync(RecipeSubmission sub)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.RECIPE_SUBMISSIONS
                    (Id, UserId, Name, Email, Title, [Description], Ingredients, Steps, ImageUrl, Status)
                VALUES (@Id, @UserId, @Name, @Email, @Title, @Description, @Ingredients, @Steps, @ImageUrl, 'PENDING')
                """,
                [P("@Id", newId), P("@UserId", sub.UserId), P("@Name", sub.Name),
                 P("@Email", sub.Email), P("@Title", sub.Title), P("@Description", sub.Description),
                 P("@Ingredients", sub.Ingredients), P("@Steps", sub.Steps), P("@ImageUrl", sub.ImageUrl)]);
            return newId;
        }

        public Task<RecipeSubmission?> GetSubmissionByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.RECIPE_SUBMISSIONS WHERE Id = @Id",
                [P("@Id", id)], MapSubmission);

        public Task<List<RecipeSubmission>> ListSubmissionsAsync(string? status, int page, int pageSize)
        {
            var where = string.IsNullOrEmpty(status) ? "" : "WHERE Status = @Status";
            var parms = string.IsNullOrEmpty(status)
                ? new[] { P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) }
                : new[] { P("@Status", status), P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) };
            return QueryAsync($"""
                SELECT * FROM public_data.RECIPE_SUBMISSIONS {where}
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """, parms, MapSubmission);
        }

        public async Task<int> CountSubmissionsAsync(string? status)
        {
            var where = string.IsNullOrEmpty(status) ? "" : "WHERE Status = @Status";
            var parms = string.IsNullOrEmpty(status) ? null : new[] { P("@Status", status) };
            return await ExecuteScalarAsync<int?>($"SELECT COUNT(1) FROM public_data.RECIPE_SUBMISSIONS {where}", parms) ?? 0;
        }

        public async Task<bool> ReviewSubmissionAsync(Guid id, bool approve, Guid adminUserId,
            decimal? prizeMoney, string? certUrl)
        {
            var status = approve ? "APPROVED" : "REJECTED";
            var rows = await ExecuteAsync("""
                UPDATE public_data.RECIPE_SUBMISSIONS
                SET Status = @Status,
                    ReviewedByUserId = @AdminUserId,
                    ReviewedAt = SYSDATETIME(),
                    PrizeMoney = @PrizeMoney,
                    CertificateUrl = @CertUrl
                WHERE Id = @Id AND Status = 'PENDING'
                """,
                [P("@Id", id), P("@Status", status), P("@AdminUserId", adminUserId),
                 P("@PrizeMoney", prizeMoney), P("@CertUrl", certUrl)]);
            return rows > 0;
        }
    }
}
