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
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using System.Net;

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
        [OpenApiOperation(operationId: "Feedback_Submit", tags: new[] { "Feedback" }, Summary = "Submit feedback", Description = "Submits a feedback message. Works for both guests and authenticated users.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateFeedbackRequest), Required = true, Description = "Feedback payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Feedback submitted")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
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
        [OpenApiOperation(operationId: "Admin_Feedbacks_List", tags: new[] { "Admin — Feedback" }, Summary = "List feedbacks (Admin)", Description = "Returns a paginated list of feedbacks. Requires ADMIN role.")]
        [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (default: 1)")]
        [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page size (default: 20)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PagedResult<Feedback>>), Description = "Paginated feedback list")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        public async Task<HttpResponseData> AdminList(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/feedbacks")] HttpRequestData req)
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
