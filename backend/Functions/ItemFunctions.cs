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
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using System.Net;

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
        [OpenApiOperation(operationId: "Items_List", tags: new[] { "Items" }, Summary = "List items", Description = "Returns a paginated list of items. Supports search and pagination.")]
        [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search keyword")]
        [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (default: 1)")]
        [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page size (default: 12)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PagedResult<Item>>), Description = "Paginated item list")]
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
        [OpenApiOperation(operationId: "Items_GetById", tags: new[] { "Items" }, Summary = "Get item by ID", Description = "Returns a single item by its GUID.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Item ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<Item>), Description = "Item detail")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Item not found")]
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
        [OpenApiOperation(operationId: "Admin_Items_Create", tags: new[] { "Admin — Items" }, Summary = "Create item (Admin)", Description = "Creates a new item. Requires ADMIN role.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateItemRequest), Required = true, Description = "Item payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Item created")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/items")] HttpRequestData req)
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
        [OpenApiOperation(operationId: "Admin_Items_Update", tags: new[] { "Admin — Items" }, Summary = "Update item (Admin)", Description = "Updates an existing item. Requires ADMIN role.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Item ID")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateItemRequest), Required = true, Description = "Fields to update")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Item updated")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        public async Task<HttpResponseData> Update(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "management/items/{id:guid}")] HttpRequestData req,
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
