// =============================================================================
// PaymentFunctions
// POST /api/payments               — create a payment record (INIT)
// GET  /api/payments/{id}          — get payment info
// POST /api/payments/{id}/confirm  — confirm payment (SUCCESS) + side-effects
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
    public class PaymentFunctions
    {
        private readonly IPaymentService _svc;
        private readonly ILogger<PaymentFunctions> _log;

        public PaymentFunctions(IPaymentService svc, ILogger<PaymentFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Payments_Create")]
        [OpenApiOperation(operationId: "Payments_Create", tags: new[] { "Payments" }, Summary = "Create payment", Description = "Creates a new payment record with INIT status. Requires authentication.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreatePaymentRequest), Required = true, Description = "Payment payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Payment created")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "payments")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var body = await req.ReadFromJsonAsync<CreatePaymentRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Invalid request body.");

                // Force UserId from JWT to prevent spoofing
                body.UserId = claims.Value.userId;

                var (id, error) = await _svc.CreatePaymentAsync(body);
                if (id == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { paymentId = id }, "Payment created successfully.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Create)); }
        }

        [Function("Payments_GetById")]
        [OpenApiOperation(operationId: "Payments_GetById", tags: new[] { "Payments" }, Summary = "Get payment by ID", Description = "Returns a single payment by its GUID. Requires authentication (owner or admin).")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Payment ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<Payment>), Description = "Payment detail")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Payment not found")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not the payment owner or admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> GetById(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "payments/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var (payment, error) = await _svc.GetByIdAsync(id);
                if (payment == null) return await FunctionHelper.NotFound(req, error);

                // Only owner or admin can view payment details
                if (payment.UserId != claims.Value.userId && claims.Value.role != "ADMIN")
                    return await FunctionHelper.Forbidden(req);

                return await FunctionHelper.Ok(req, payment);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetById)); }
        }

        [Function("Payments_Confirm")]
        [OpenApiOperation(operationId: "Payments_Confirm", tags: new[] { "Payments" }, Summary = "Confirm payment", Description = "Confirms a payment (sets status to SUCCESS) and optionally links to an order or subscription. Requires authentication (owner or admin).")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Payment ID")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ConfirmPaymentRequest), Required = false, Description = "Optional linked entity")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Payment confirmed")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not the payment owner or admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> Confirm(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "payments/{id:guid}/confirm")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                // Verify ownership: fetch payment and check UserId
                var (payment, fetchError) = await _svc.GetByIdAsync(id);
                if (payment == null) return await FunctionHelper.BadRequest(req, fetchError);
                if (payment.UserId != claims.Value.userId && claims.Value.role != "ADMIN")
                    return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<ConfirmPaymentRequest>() ?? new ConfirmPaymentRequest();

                var (ok, error) = await _svc.ConfirmPaymentAsync(id, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Payment confirmed successfully.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Confirm)); }
        }

        [Function("Payments_Fail")]
        [OpenApiOperation(operationId: "Payments_Fail", tags: new[] { "Admin — Payments" }, Summary = "Fail payment (Admin)", Description = "Marks an INIT payment as FAILED. Requires ADMIN role.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Payment ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Payment marked as failed")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> Fail(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/payments/{id:guid}/fail")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var (ok, error) = await _svc.FailPaymentAsync(id);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Payment marked as failed.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Fail)); }
        }

        [Function("Admin_Payments_List")]
        [OpenApiOperation(operationId: "Admin_Payments_List", tags: new[] { "Admin — Payments" }, Summary = "List payments (Admin)", Description = "Returns a paginated list of payments. Optionally filter by userId and status. Requires ADMIN role.")]
        [OpenApiParameter(name: "userId", In = ParameterLocation.Query, Required = false, Type = typeof(Guid), Description = "Filter by user ID")]
        [OpenApiParameter(name: "status", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by status (INIT, SUCCESS, FAILED)")]
        [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (default: 1)")]
        [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page size (default: 20)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PagedResult<Payment>>), Description = "Paginated payment list")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        public async Task<HttpResponseData> AdminList(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/payments")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 20;
                string? stat = qs["status"];
                Guid? userId = Guid.TryParse(qs["userId"], out var uid) ? uid : null;

                var result = await _svc.ListAsync(userId, stat, page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(AdminList)); }
        }
    }
}
