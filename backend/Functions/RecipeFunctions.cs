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
using Microsoft.Extensions.Logging;

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
        public async Task<HttpResponseData> Create(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "admin-api/recipes")] HttpRequestData req)
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
        public async Task<HttpResponseData> Update(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "admin-api/recipes/{id:guid}")] HttpRequestData req,
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
        public async Task<HttpResponseData> Delete(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "admin-api/recipes/{id:guid}")] HttpRequestData req,
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
