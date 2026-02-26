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
using Microsoft.Extensions.Logging;

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
