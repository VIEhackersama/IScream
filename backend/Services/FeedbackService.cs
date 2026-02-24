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
    }

    public class FeedbackService : IFeedbackService
    {
        private readonly IAppRepository _repo;

        public FeedbackService(IAppRepository repo) => _repo = repo;

        public async Task<(Guid id, string error)> SubmitAsync(CreateFeedbackRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Message) || req.Message.Trim().Length < 5)
                return (Guid.Empty, "Message phải có ít nhất 5 ký tự.");

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
            return new PagedResult<Feedback> { Items = items, Page = page, PageSize = pageSize, Total = total };
        }
    }
}
