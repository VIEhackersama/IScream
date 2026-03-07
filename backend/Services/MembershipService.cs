// =============================================================================
// MembershipService — Plans + Subscriptions
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;
using System.Text.Json;

namespace IScream.Services
{
    public interface IMembershipService
    {
        Task<List<MembershipPlan>> GetPlansAsync();
        Task<List<MembershipPlan>> GetAllPlansAsync();
        Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId);
        Task<List<MembershipSubscription>> GetSubscriptionHistoryAsync(Guid userId);
        Task<(Guid subId, Guid paymentId, string error)> SubscribeAsync(SubscribeRequest req);
        Task<(bool ok, string error)> CancelSubscriptionAsync(Guid subscriptionId, Guid userId);
        Task<(int planId, string error)> CreatePlanAsync(CreatePlanRequest req);
        Task<(bool ok, string error)> UpdatePlanAsync(int planId, UpdatePlanRequest req);
        Task<PagedResult<AppUser>> ListActiveMembersAsync(int page, int pageSize);
    }

    public class MembershipService : IMembershipService
    {
        private readonly IAppRepository _repo;

        public MembershipService(IAppRepository repo) => _repo = repo;

        public Task<List<MembershipPlan>> GetPlansAsync()
            => _repo.ListPlansAsync();

        public Task<List<MembershipPlan>> GetAllPlansAsync()
            => _repo.ListAllPlansAsync();

        public Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId)
            => _repo.GetActiveSubscriptionAsync(userId);

        public Task<List<MembershipSubscription>> GetSubscriptionHistoryAsync(Guid userId)
            => _repo.ListSubscriptionsAsync(userId);

        public async Task<(Guid subId, Guid paymentId, string error)> SubscribeAsync(SubscribeRequest req)
        {
            if (req.UserId == Guid.Empty)
                return (Guid.Empty, Guid.Empty, "Invalid UserId.");

            var plan = await _repo.GetPlanByIdAsync(req.PlanId);
            if (plan == null)
                return (Guid.Empty, Guid.Empty, "Plan not found or is no longer active.");

            // Check existing active subscription
            var existing = await _repo.GetActiveSubscriptionAsync(req.UserId);
            if (existing != null)
            {
                if (existing.PlanId == req.PlanId)
                    return (Guid.Empty, Guid.Empty, "You already have an active subscription for this plan.");

                // Cancel existing active subscription before subscribing to a new plan (upgrade/downgrade)
                await CancelSubscriptionAsync(existing.Id, req.UserId);
            }

            var now = DateTime.UtcNow;

            // --- Create a real PAYMENTS record first to satisfy the FK constraint ---
            var metaJson = JsonSerializer.Serialize(new
            {
                planCode = plan.Code,
                planId = plan.Id,
                source = "mock-checkout"
            });
            var payment = new Payment
            {
                UserId = req.UserId,
                Amount = plan.Price,
                Currency = plan.Currency,
                Type = "MEMBERSHIP",
                MetaJson = metaJson
            };
            var paymentId = await _repo.CreatePaymentAsync(payment);
            await _repo.ConfirmPaymentAsync(paymentId);
            // ---------------------------------------------------------------------------

            var sub = new MembershipSubscription
            {
                UserId = req.UserId,
                PlanId = req.PlanId,
                PaymentId = paymentId,
                StartDate = now,
                EndDate = now.AddDays(plan.DurationDays),
                Status = "ACTIVE"
            };

            var id = await _repo.CreateSubscriptionAsync(sub);
            return (id, paymentId, string.Empty);
        }

        public async Task<(bool ok, string error)> CancelSubscriptionAsync(Guid subscriptionId, Guid userId)
        {
            var ok = await _repo.CancelSubscriptionAsync(subscriptionId, userId);
            return (ok, ok ? string.Empty : "Subscription not found, already cancelled, or expired.");
        }

        public async Task<(int planId, string error)> CreatePlanAsync(CreatePlanRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Code))
                return (0, "Code is required.");
            if (req.Price < 0)
                return (0, "Price must be non-negative.");
            if (req.DurationDays <= 0)
                return (0, "DurationDays must be greater than 0.");

            var plan = new MembershipPlan
            {
                Code = req.Code.Trim().ToUpper(),
                Price = req.Price,
                Currency = string.IsNullOrWhiteSpace(req.Currency) ? "VND" : req.Currency.ToUpper(),
                DurationDays = req.DurationDays,
                IsActive = true
            };

            var id = await _repo.CreatePlanAsync(plan);
            return id > 0 ? (id, string.Empty) : (0, "Failed to create plan.");
        }

        public async Task<(bool ok, string error)> UpdatePlanAsync(int planId, UpdatePlanRequest req)
        {
            var existing = await _repo.GetPlanByIdAdminAsync(planId);
            if (existing == null) return (false, "Plan not found.");

            existing.Code = req.Code?.Trim().ToUpper() ?? existing.Code;
            existing.Price = req.Price ?? existing.Price;
            existing.Currency = !string.IsNullOrWhiteSpace(req.Currency) ? req.Currency.ToUpper() : existing.Currency;
            existing.DurationDays = req.DurationDays ?? existing.DurationDays;
            existing.IsActive = req.IsActive ?? existing.IsActive;

            var ok = await _repo.UpdatePlanAsync(existing);
            return (ok, ok ? string.Empty : "Update failed.");
        }

        public async Task<PagedResult<AppUser>> ListActiveMembersAsync(int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var (users, total) = await _repo.ListActiveMembersAsync(page, pageSize);
            return new PagedResult<AppUser> { Items = users, Page = page, PageSize = pageSize, TotalCount = total };
        }
    }
}
