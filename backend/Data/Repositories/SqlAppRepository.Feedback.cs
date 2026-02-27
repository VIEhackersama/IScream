// =============================================================================
// SqlAppRepository — Feedback
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
        private static Feedback MapFeedback(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadNullGuid(r, "UserId"),
            Name = ReadNullString(r, "Name"),
            Email = ReadNullString(r, "Email"),
            Message = r["Message"].ToString()!,
            IsRegisteredUser = ReadBool(r, "IsRegisteredUser"),
            CreatedAt = ReadDateTime(r, "CreatedAt")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public async Task<Guid> CreateFeedbackAsync(Feedback fb)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.FEEDBACKS
                    (Id, UserId, Name, Email, Message, IsRegisteredUser)
                VALUES (@Id, @UserId, @Name, @Email, @Message, @IsRegisteredUser)
                """,
                [P("@Id", newId), P("@UserId", fb.UserId), P("@Name", fb.Name),
                 P("@Email", fb.Email), P("@Message", fb.Message),
                 P("@IsRegisteredUser", fb.IsRegisteredUser)]);
            return newId;
        }

        public Task<List<Feedback>> ListFeedbacksAsync(int page, int pageSize)
            => QueryAsync("""
                SELECT * FROM public_data.FEEDBACKS
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """,
                [P("@Skip", (page - 1) * pageSize), P("@Take", pageSize)], MapFeedback);

        public async Task<int> CountFeedbacksAsync()
            => await ExecuteScalarAsync<int?>("SELECT COUNT(1) FROM public_data.FEEDBACKS", null) ?? 0;
    }
}
