// =============================================================================
// SubmissionFunctions
// POST /api/submissions                      — submit recipe (guest or user)
// GET  /api/submissions/{id}                 — get submission detail
// GET  /api/admin/submissions                — admin list with status filter
// PUT  /api/admin/submissions/{id}/review    — admin approve or reject
// =============================================================================
#nullable enable

using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace IScream.Functions
{
    public class SubmissionFunctions
    {
        private readonly IRecipeSubmissionService _svc;
        private readonly ILogger<SubmissionFunctions> _log;

        public SubmissionFunctions(IRecipeSubmissionService svc, ILogger<SubmissionFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Submissions_Create")]
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "submissions")] HttpRequestData req)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<CreateSubmissionRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                // If authenticated, bind userId from JWT
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims != null) body.UserId = claims.Value.userId;

                var (id, error) = await _svc.SubmitAsync(body);
                if (id == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req,
                    new { submissionId = id },
                    "Gửi công thức thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Create)); }
        }

        [Function("Submissions_GetById")]
        public async Task<HttpResponseData> GetById(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "submissions/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var (sub, error) = await _svc.GetByIdAsync(id);
                if (sub == null) return await FunctionHelper.NotFound(req, error);
                return await FunctionHelper.Ok(req, sub);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetById)); }
        }

        [Function("Admin_Submissions_List")]
        public async Task<HttpResponseData> AdminList(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "admin/submissions")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 20;
                string? stat = qs["status"]; // PENDING | APPROVED | REJECTED

                var result = await _svc.ListAsync(stat, page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(AdminList)); }
        }

        [Function("Admin_Submissions_Review")]
        public async Task<HttpResponseData> Review(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "admin/submissions/{id:guid}/review")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<ReviewSubmissionRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                // Override AdminUserId from JWT claims
                body.AdminUserId = claims.Value.userId;

                var (ok, error) = await _svc.ReviewAsync(id, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                var action = body.Approve ? "duyệt" : "từ chối";
                return await FunctionHelper.OkMessage(req, $"Đã {action} submission thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Review)); }
        }
    }
}
