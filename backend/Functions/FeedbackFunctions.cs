// =============================================================================
// FeedbackFunctions
// POST /api/feedback             — submit feedback (guest or user)
// GET  /api/admin/feedbacks      — admin list feedback
// =============================================================================
#nullable enable

using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace IScream.Functions
{
    public class FeedbackFunctions
    {
        private readonly IFeedbackService _svc;
        private readonly ILogger<FeedbackFunctions> _log;

        public FeedbackFunctions(IFeedbackService svc, ILogger<FeedbackFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Feedback_Submit")]
        public async Task<HttpResponseData> Submit(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "feedback")] HttpRequestData req)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<CreateFeedbackRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                // If the user is authenticated, override userId from JWT
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims != null) body.UserId = claims.Value.userId;

                var (id, error) = await _svc.SubmitAsync(body);
                if (id == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { feedbackId = id }, "Cảm ơn phản hồi của bạn!");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Submit)); }
        }

        [Function("Admin_Feedbacks_List")]
        public async Task<HttpResponseData> AdminList(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "admin-api/feedbacks")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 20;

                var result = await _svc.ListAsync(page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(AdminList)); }
        }
    }
}
