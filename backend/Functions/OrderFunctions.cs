// =============================================================================
// OrderFunctions
// POST /api/orders                        — place order (public/authenticated)
// GET  /api/orders/{id}                   — get by id
// GET  /api/admin/orders                  — admin list with status filter
// PUT  /api/admin/orders/{id}/status      — admin update status
// =============================================================================
#nullable enable

using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace IScream.Functions
{
    public class OrderFunctions
    {
        private readonly IOrderService _svc;
        private readonly ILogger<OrderFunctions> _log;

        public OrderFunctions(IOrderService svc, ILogger<OrderFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Orders_Place")]
        public async Task<HttpResponseData> PlaceOrder(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "orders")] HttpRequestData req)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<CreateOrderRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (orderId, error) = await _svc.PlaceOrderAsync(body);
                if (orderId == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { orderId }, "Đặt hàng thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(PlaceOrder)); }
        }

        [Function("Orders_GetById")]
        public async Task<HttpResponseData> GetById(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "orders/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var (order, error) = await _svc.GetByIdAsync(id);
                if (order == null) return await FunctionHelper.NotFound(req, error);
                return await FunctionHelper.Ok(req, order);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetById)); }
        }

        [Function("Admin_Orders_List")]
        public async Task<HttpResponseData> AdminList(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "admin-api/orders")] HttpRequestData req)
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

                var result = await _svc.ListAsync(stat, page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(AdminList)); }
        }

        [Function("Admin_Orders_UpdateStatus")]
        public async Task<HttpResponseData> UpdateStatus(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "admin-api/orders/{id:guid}/status")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<UpdateOrderStatusRequest>();
                if (body == null || string.IsNullOrWhiteSpace(body.Status))
                    return await FunctionHelper.BadRequest(req, "Status không hợp lệ.");

                var (ok, error) = await _svc.UpdateStatusAsync(id, body.Status);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Cập nhật trạng thái đơn hàng thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(UpdateStatus)); }
        }
    }
}
