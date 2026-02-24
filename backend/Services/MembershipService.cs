// =============================================================================
// MembershipService — Plans + Subscriptions
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IMembershipService
    {
        Task<List<MembershipPlan>> GetPlansAsync();
        Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId);
        Task<List<MembershipSubscription>> GetSubscriptionHistoryAsync(Guid userId);
        Task<(Guid subId, string error)> SubscribeAsync(SubscribeRequest req);
    }

    public class MembershipService : IMembershipService
    {
        private readonly IAppRepository _repo;

        public MembershipService(IAppRepository repo) => _repo = repo;

        public Task<List<MembershipPlan>> GetPlansAsync()
            => _repo.ListPlansAsync();

        public Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId)
            => _repo.GetActiveSubscriptionAsync(userId);

        public Task<List<MembershipSubscription>> GetSubscriptionHistoryAsync(Guid userId)
            => _repo.ListSubscriptionsAsync(userId);

        public async Task<(Guid subId, string error)> SubscribeAsync(SubscribeRequest req)
        {
            if (req.UserId == Guid.Empty)
                return (Guid.Empty, "UserId không hợp lệ.");

            var plan = await _repo.GetPlanByIdAsync(req.PlanId);
            if (plan == null)
                return (Guid.Empty, "Plan không tồn tại hoặc đã ngừng hoạt động.");

            // Check existing active subscription for same plan
            var existing = await _repo.GetActiveSubscriptionAsync(req.UserId);
            if (existing != null && existing.PlanId == req.PlanId)
                return (Guid.Empty, "Bạn đang có subscription đang hoạt động cho plan này.");

            var now = DateTime.UtcNow;
            var sub = new MembershipSubscription
            {
                UserId = req.UserId,
                PlanId = req.PlanId,
                PaymentId = req.PaymentId,
                StartDate = now,
                EndDate = now.AddDays(plan.DurationDays),
                Status = req.PaymentId.HasValue ? "ACTIVE" : "PENDING"
            };

            var id = await _repo.CreateSubscriptionAsync(sub);
            return (id, string.Empty);
        }
    }
}
