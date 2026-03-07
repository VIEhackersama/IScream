// =============================================================================
// FeedbackService — FEEDBACKS table
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IFeedbackService
    {
        Task<(Guid id, string error)> SubmitAsync(CreateFeedbackRequest req);
        Task<PagedResult<Feedback>> ListAsync(int page, int pageSize);
        Task<(Feedback? feedback, string error)> GetByIdAsync(Guid id);
        Task<(bool ok, string error)> MarkReadAsync(Guid id);
    }

    public class FeedbackService : IFeedbackService
    {
        private readonly IAppRepository _repo;

        public FeedbackService(IAppRepository repo) => _repo = repo;

        public async Task<(Guid id, string error)> SubmitAsync(CreateFeedbackRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Message) || req.Message.Trim().Length < 5)
                return (Guid.Empty, "Message must be at least 5 characters.");

            var fb = new Feedback
            {
                UserId = req.UserId,
                Name = req.Name?.Trim(),
                Email = req.Email?.Trim().ToLower(),
                Message = req.Message.Trim(),
                IsRegisteredUser = req.UserId.HasValue
            };

            var id = await _repo.CreateFeedbackAsync(fb);
            return (id, string.Empty);
        }

        public async Task<PagedResult<Feedback>> ListAsync(int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var items = await _repo.ListFeedbacksAsync(page, pageSize);
            var total = await _repo.CountFeedbacksAsync();
            return new PagedResult<Feedback> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
        }

        public async Task<(Feedback? feedback, string error)> GetByIdAsync(Guid id)
        {
            var fb = await _repo.GetFeedbackByIdAsync(id);
            return fb == null ? (null, "Feedback not found.") : (fb, string.Empty);
        }

        public async Task<(bool ok, string error)> MarkReadAsync(Guid id)
        {
            var fb = await _repo.GetFeedbackByIdAsync(id);
            if (fb == null) return (false, "Feedback not found.");
            var ok = await _repo.MarkFeedbackReadAsync(id);
            return (ok, ok ? string.Empty : "Failed to mark feedback as read.");
        }
    }
}
