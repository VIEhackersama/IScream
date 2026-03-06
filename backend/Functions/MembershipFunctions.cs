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
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using System.Net;

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
        [OpenApiOperation(operationId: "Membership_Plans", tags: new[] { "Membership" }, Summary = "List membership plans", Description = "Returns all active membership plans.")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<MembershipPlan>>), Description = "List of plans")]
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
        [OpenApiOperation(operationId: "Membership_Me", tags: new[] { "Membership" }, Summary = "Get my subscription", Description = "Returns the current user's active membership subscription. Requires authentication.")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<MembershipSubscription>), Description = "Active subscription")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
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
        [OpenApiOperation(operationId: "Membership_History", tags: new[] { "Membership" }, Summary = "Subscription history", Description = "Returns the current user's subscription history. Requires authentication.")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<MembershipSubscription>>), Description = "Subscription history")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
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
        [OpenApiOperation(operationId: "Membership_Subscribe", tags: new[] { "Membership" }, Summary = "Subscribe to a plan", Description = "Subscribes the authenticated user to a membership plan. Requires authentication.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(SubscribeRequest), Required = true, Description = "Subscription payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Subscription created")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> Subscribe(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "membership/subscribe")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var body = await req.ReadFromJsonAsync<SubscribeRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Invalid request body.");

                // Force userId from JWT to prevent spoofing
                body.UserId = claims.Value.userId;

                var (subId, error) = await _svc.SubscribeAsync(body);
                if (subId == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { subscriptionId = subId }, "Membership subscription created successfully.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Subscribe)); }
        }

        [Function("Membership_Cancel")]
        [OpenApiOperation(operationId: "Membership_Cancel", tags: new[] { "Membership" }, Summary = "Cancel subscription", Description = "Cancels the authenticated user's active subscription. Requires authentication.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Subscription ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Subscription cancelled")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Subscription not found or already inactive")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> CancelSubscription(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "membership/{id:guid}/cancel")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var (ok, error) = await _svc.CancelSubscriptionAsync(id, claims.Value.userId);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Subscription cancelled.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(CancelSubscription)); }
        }

        [Function("Admin_Membership_ListAllPlans")]
        [OpenApiOperation(operationId: "Admin_Membership_ListAllPlans", tags: new[] { "Admin — Membership" }, Summary = "List all plans (Admin)", Description = "Returns all membership plans including inactive ones. Requires ADMIN role.")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<MembershipPlan>>), Description = "All plans")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> AdminListPlans(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/membership/plans")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var plans = await _svc.GetAllPlansAsync();
                return await FunctionHelper.Ok(req, plans);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(AdminListPlans)); }
        }

        [Function("Admin_Membership_CreatePlan")]
        [OpenApiOperation(operationId: "Admin_Membership_CreatePlan", tags: new[] { "Admin — Membership" }, Summary = "Create plan (Admin)", Description = "Creates a new membership plan. Requires ADMIN role.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreatePlanRequest), Required = true, Description = "Plan payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Plan created")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> CreatePlan(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/membership/plans")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<CreatePlanRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Invalid request body.");

                var (planId, error) = await _svc.CreatePlanAsync(body);
                if (planId == 0) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { planId }, "Plan created successfully.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(CreatePlan)); }
        }

        [Function("Admin_Membership_UpdatePlan")]
        [OpenApiOperation(operationId: "Admin_Membership_UpdatePlan", tags: new[] { "Admin — Membership" }, Summary = "Update plan (Admin)", Description = "Updates an existing membership plan. Requires ADMIN role.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(int), Description = "Plan ID")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdatePlanRequest), Required = true, Description = "Fields to update")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Plan updated")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> UpdatePlan(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "management/membership/plans/{id:int}")] HttpRequestData req,
            int id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<UpdatePlanRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Invalid request body.");

                var (ok, error) = await _svc.UpdatePlanAsync(id, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Plan updated successfully.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(UpdatePlan)); }
        }

        [Function("Admin_Members_List")]
        [OpenApiOperation(operationId: "Admin_Members_List", tags: new[] { "Admin — Membership" }, Summary = "List active members (Admin)", Description = "Returns a paginated list of users who have an active membership subscription. Requires ADMIN role.")]
        [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (default: 1)")]
        [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page size (default: 20)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PagedResult<AppUser>>), Description = "Paginated active member list")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> AdminListMembers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/members")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 20;

                var result = await _svc.ListActiveMembersAsync(page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(AdminListMembers)); }
        }
    }
}
