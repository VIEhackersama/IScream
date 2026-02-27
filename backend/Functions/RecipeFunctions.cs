// =============================================================================
// RecipeFunctions
// GET  /api/recipes               — public list
// GET  /api/recipes/{id}          — public detail
// POST /api/admin/recipes         — admin create
// PUT  /api/admin/recipes/{id}    — admin update
// DELETE /api/admin/recipes/{id}  — admin soft-delete
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
    public class RecipeFunctions
    {
        private readonly IRecipeService _svc;
        private readonly ILogger<RecipeFunctions> _log;

        public RecipeFunctions(IRecipeService svc, ILogger<RecipeFunctions> log)
        {
            _svc = svc;
            _log = log;
        }

        [Function("Recipes_List")]
        [OpenApiOperation(operationId: "Recipes_List", tags: new[] { "Recipes" }, Summary = "List recipes", Description = "Returns a paginated list of recipes with optional isActive filter.")]
        [OpenApiParameter(name: "isActive", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Filter by active status (default: true)")]
        [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (default: 1)")]
        [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page size (default: 12)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PagedResult<Recipe>>), Description = "Paginated recipe list")]
        public async Task<HttpResponseData> List(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "recipes")] HttpRequestData req)
        {
            try
            {
                var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
                int page = int.TryParse(qs["page"], out var p) ? p : 1;
                int size = int.TryParse(qs["pageSize"], out var s) ? s : 12;
                bool? ia = qs["isActive"] == null ? true : (bool?)bool.Parse(qs["isActive"]!);

                var result = await _svc.ListAsync(ia, page, size);
                return await FunctionHelper.Ok(req, result);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(List)); }
        }

        [Function("Recipes_GetById")]
        [OpenApiOperation(operationId: "Recipes_GetById", tags: new[] { "Recipes" }, Summary = "Get recipe by ID", Description = "Returns a single recipe by its GUID.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Recipe ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<Recipe>), Description = "Recipe detail")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Recipe not found")]
        public async Task<HttpResponseData> GetById(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "recipes/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var (recipe, error) = await _svc.GetByIdAsync(id);
                if (recipe == null) return await FunctionHelper.NotFound(req, error);
                return await FunctionHelper.Ok(req, recipe);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(GetById)); }
        }

        [Function("Admin_Recipes_Create")]
        [OpenApiOperation(operationId: "Admin_Recipes_Create", tags: new[] { "Admin — Recipes" }, Summary = "Create recipe (Admin)", Description = "Creates a new recipe. Requires ADMIN role.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateRecipeRequest), Required = true, Description = "Recipe payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Recipe created")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "management/recipes")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<CreateRecipeRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (id, error) = await _svc.CreateAsync(body);
                if (id == Guid.Empty) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { id }, "Tạo công thức thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Create)); }
        }

        [Function("Admin_Recipes_Update")]
        [OpenApiOperation(operationId: "Admin_Recipes_Update", tags: new[] { "Admin — Recipes" }, Summary = "Update recipe (Admin)", Description = "Updates an existing recipe. Requires ADMIN role.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Recipe ID")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateRecipeRequest), Required = true, Description = "Fields to update")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Recipe updated")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        public async Task<HttpResponseData> Update(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "management/recipes/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var body = await req.ReadFromJsonAsync<UpdateRecipeRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (ok, error) = await _svc.UpdateAsync(id, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Cập nhật công thức thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Update)); }
        }

        [Function("Admin_Recipes_Delete")]
        [OpenApiOperation(operationId: "Admin_Recipes_Delete", tags: new[] { "Admin — Recipes" }, Summary = "Delete recipe (Admin)", Description = "Soft-deletes a recipe. Requires ADMIN role.")]
        [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Recipe ID")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Recipe deleted")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Recipe not found")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Not an admin")]
        public async Task<HttpResponseData> Delete(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "management/recipes/{id:guid}")] HttpRequestData req,
            Guid id)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);
                if (claims.Value.role != "ADMIN") return await FunctionHelper.Forbidden(req);

                var (ok, error) = await _svc.SoftDeleteAsync(id);
                if (!ok) return await FunctionHelper.NotFound(req, error);

                return await FunctionHelper.OkMessage(req, "Xoá công thức thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Delete)); }
        }
    }
}
