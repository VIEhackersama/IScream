// =============================================================================
// UserFunctions
// GET  /api/management/users              — admin list users (paged)
// PUT  /api/management/users/{id}/active  — admin suspend/activate user
// =============================================================================
#nullable enable

using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using System.Net;

namespace IScream.Functions
{
    public class UserFunctions
    {
        private readonly IAuthService _auth;
        private readonly ILogger<UserFunctions> _log;

        public UserFunctions(IAuthService auth, ILogger<UserFunctions> log)
        {
            _auth = auth;
            _log = log;
        }

        // GET /api/management/users?page=1&pageSize=10
        [Function("Admin_Users_List")]
        [OpenApiOperation(operationId: "Admin_Users_List", tags: new[] { "Admin — Users" },
            Summary = "List users (Admin)",
            Description = "Returns a paginated list of all users. Requires ADMIN role.")]
        [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (default: 1)")]
        [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page size (default: 10)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
            bodyType: typeof(ApiResponse<PagedResult<UserSummary>>), Description = "Paginated user list")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json",
            bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json",
            bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> ListUsers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/users")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 10;

                var result = await _auth.ListUsersAsync(page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(ListUsers)); }
        }

        // PUT /api/management/users/{id}/active
        [Function("Admin_Users_SetActive")]
        [OpenApiOperation(operationId: "Admin_Users_SetActive", tags: new[] { "Admin — Users" },
            Summary = "Activate / Suspend user (Admin)",
            Description = "Sets a user's IsActive flag. Pass { \"isActive\": false } to suspend. Requires ADMIN role.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "User ID")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(SetUserActiveRequest), Required = true, Description = "Active flag")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
            bodyType: typeof(ApiResponse), Description = "User status updated")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json",
            bodyType: typeof(ApiResponse), Description = "User not found")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json",
            bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json",
            bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> SetUserActive(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "management/users/{id:guid}/active")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<SetUserActiveRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Invalid request body.");

                var (ok, error) = await _auth.SetUserActiveAsync(id, body.IsActive);
                if (!ok) return await FunctionHelper.NotFound(req, error);

                var msg = body.IsActive ? "User activated successfully." : "User suspended successfully.";
                return await FunctionHelper.OkMessage(req, msg);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(SetUserActive)); }
        }
    }
}
