// =============================================================================
// RecipeSubmissionService — RECIPE_SUBMISSIONS table
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IRecipeSubmissionService
    {
        Task<(Guid id, string error)> SubmitAsync(CreateSubmissionRequest req);
        Task<(RecipeSubmission? sub, string error)> GetByIdAsync(Guid id);
        Task<PagedResult<RecipeSubmission>> ListAsync(string? status, int page, int pageSize);
        Task<(bool ok, string error)> ReviewAsync(Guid id, ReviewSubmissionRequest req);
    }

    public class RecipeSubmissionService : IRecipeSubmissionService
    {
        private readonly IAppRepository _repo;

        public RecipeSubmissionService(IAppRepository repo) => _repo = repo;

        public async Task<(Guid id, string error)> SubmitAsync(CreateSubmissionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title) || req.Title.Trim().Length < 3)
                return (Guid.Empty, "Title must be at least 3 characters.");

            // Guest submission requires at least Name or Email
            if (req.UserId == null && string.IsNullOrWhiteSpace(req.Name) && string.IsNullOrWhiteSpace(req.Email))
                return (Guid.Empty, "Guest must provide a Name or Email.");

            var sub = new RecipeSubmission
            {
                UserId = req.UserId,
                Name = req.Name?.Trim(),
                Email = req.Email?.Trim().ToLower(),
                Title = req.Title.Trim(),
                Description = req.Description?.Trim(),
                Ingredients = req.Ingredients?.Trim(),
                Steps = req.Steps?.Trim(),
                ImageUrl = req.ImageUrl?.Trim(),
                Status = "PENDING"
            };

            var id = await _repo.CreateSubmissionAsync(sub);
            return (id, string.Empty);
        }

        public async Task<(RecipeSubmission? sub, string error)> GetByIdAsync(Guid id)
        {
            var sub = await _repo.GetSubmissionByIdAsync(id);
            return sub == null ? (null, "Submission not found.") : (sub, string.Empty);
        }

        public async Task<PagedResult<RecipeSubmission>> ListAsync(string? status, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var items = await _repo.ListSubmissionsAsync(status, page, pageSize);
            var total = await _repo.CountSubmissionsAsync(status);
            return new PagedResult<RecipeSubmission> { Items = items, Page = page, PageSize = pageSize, Total = total };
        }

        public async Task<(bool ok, string error)> ReviewAsync(Guid id, ReviewSubmissionRequest req)
        {
            if (req.AdminUserId == Guid.Empty)
                return (false, "Invalid AdminUserId.");

            var sub = await _repo.GetSubmissionByIdAsync(id);
            if (sub == null) return (false, "Submission not found.");
            if (sub.Status != "PENDING") return (false, $"Submission has already been processed ({sub.Status}).");

            // If approving with prize money, certUrl should be provided
            if (req.Approve && req.PrizeMoney.HasValue && string.IsNullOrWhiteSpace(req.CertificateUrl))
                return (false, "CertificateUrl is required when PrizeMoney is provided.");

            var ok = await _repo.ReviewSubmissionAsync(
                id, req.Approve, req.AdminUserId, req.PrizeMoney, req.CertificateUrl, req.ReviewNote);

            return (ok, ok ? string.Empty : "Review failed. Submission may have already been processed.");
        }
    }
}
