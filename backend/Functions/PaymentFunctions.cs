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
        [OpenApiOperation(operationId: "Payments_Create", tags: new[] { "Payments" }, Summary = "Create payment", Description = "Creates a new payment record with INIT status.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreatePaymentRequest), Required = true, Description = "Payment payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Payment created")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "payments")] HttpRequestData req)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<CreatePaymentRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (id, error) = await _svc.CreatePaymentAsync(body);
                if (id == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { paymentId = id }, "Tạo payment thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Create)); }
        }

        [Function("Payments_GetById")]
        [OpenApiOperation(operationId: "Payments_GetById", tags: new[] { "Payments" }, Summary = "Get payment by ID", Description = "Returns a single payment by its GUID.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Payment ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<Payment>), Description = "Payment detail")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Payment not found")]
        public async Task<HttpResponseData> GetById(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "payments/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var (payment, error) = await _svc.GetByIdAsync(id);
                if (payment == null) return await FunctionHelper.NotFound(req, error);
                return await FunctionHelper.Ok(req, payment);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetById)); }
        }

        [Function("Payments_Confirm")]
        [OpenApiOperation(operationId: "Payments_Confirm", tags: new[] { "Payments" }, Summary = "Confirm payment", Description = "Confirms a payment (sets status to SUCCESS) and optionally links to an order or subscription.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Payment ID")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ConfirmPaymentRequest), Required = false, Description = "Optional linked entity")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Payment confirmed")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        public async Task<HttpResponseData> Confirm(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "payments/{id:guid}/confirm")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<ConfirmPaymentRequest>();
                var linkedEntityId = body?.LinkedEntityId;

                var (ok, error) = await _svc.ConfirmPaymentAsync(id, linkedEntityId);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Xác nhận thanh toán thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Confirm)); }
        }
    }
}
