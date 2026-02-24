// =============================================================================
// MembershipFunctions
// GET  /api/membership/plans          — list active plans (public)
// GET  /api/membership/me             — get current user's active subscription (auth)
// GET  /api/membership/history        — subscription history (auth)
// POST /api/membership/subscribe      — subscribe to a plan (auth)
// =============================================================================
#nullable enable

using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace IScream.Functions
{
    public class MembershipFunctions
    {
        private readonly IMembershipService _svc;
        private readonly ILogger<MembershipFunctions> _log;

        public MembershipFunctions(IMembershipService svc, ILogger<MembershipFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Membership_Plans")]
        public async Task<HttpResponseData> GetPlans(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "membership/plans")] HttpRequestData req)
        {
            try
            {
                var plans = await _svc.GetPlansAsync();
                return await FunctionHelper.Ok(req, plans);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetPlans)); }
        }

        [Function("Membership_Me")]
        public async Task<HttpResponseData> GetMe(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "membership/me")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var sub = await _svc.GetActiveSubscriptionAsync(claims.Value.userId);
                return await FunctionHelper.Ok(req, sub);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetMe)); }
        }

        [Function("Membership_History")]
        public async Task<HttpResponseData> GetHistory(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "membership/history")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var history = await _svc.GetSubscriptionHistoryAsync(claims.Value.userId);
                return await FunctionHelper.Ok(req, history);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetHistory)); }
        }

        [Function("Membership_Subscribe")]
        public async Task<HttpResponseData> Subscribe(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "membership/subscribe")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var body = await req.ReadFromJsonAsync<SubscribeRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                // Force userId from JWT to prevent spoofing
                body.UserId = claims.Value.userId;

                var (subId, error) = await _svc.SubscribeAsync(body);
                if (subId == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { subscriptionId = subId }, "Đăng ký membership thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Subscribe)); }
        }
    }
}
