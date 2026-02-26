// =============================================================================
// ItemFunctions
// GET  /api/items             — public list (with search + pagination)
// GET  /api/items/{id}        — public detail
// POST /api/admin/items       — admin create
// PUT  /api/admin/items/{id}  — admin update
// =============================================================================
#nullable enable

using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace IScream.Functions
{
    public class ItemFunctions
    {
        private readonly IItemService _svc;
        private readonly ILogger<ItemFunctions> _log;

        public ItemFunctions(IItemService svc, ILogger<ItemFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Items_List")]
        public async Task<HttpResponseData> List(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items")] HttpRequestData req)
        {
            try
            {
                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 12;
                string? q = qs["search"];

                var (result, _) = await _svc.ListAsync(q, page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(List)); }
        }

        [Function("Items_GetById")]
        public async Task<HttpResponseData> GetById(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var (item, error) = await _svc.GetByIdAsync(id);
                if (item == null) return await FunctionHelper.NotFound(req, error);
                return await FunctionHelper.Ok(req, item);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetById)); }
        }

        [Function("Admin_Items_Create")]
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "admin-api/items")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<CreateItemRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (id, error) = await _svc.CreateAsync(body);
                if (id == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { id }, "Tạo item thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Create)); }
        }

        [Function("Admin_Items_Update")]
        public async Task<HttpResponseData> Update(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "admin-api/items/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<UpdateItemRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (ok, error) = await _svc.UpdateAsync(id, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Cập nhật item thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Update)); }
        }
    }
}
