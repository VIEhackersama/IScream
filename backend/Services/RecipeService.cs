// =============================================================================
// RecipeService — Business logic for RECIPES table
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IRecipeService
    {
        Task<PagedResult<Recipe>> ListAsync(bool? isActive, int page, int pageSize);
        Task<(Recipe? recipe, string error)> GetByIdAsync(Guid id);
        Task<(Guid id, string error)> CreateAsync(CreateRecipeRequest req);
        Task<(bool ok, string error)> UpdateAsync(Guid id, UpdateRecipeRequest req);
        Task<(bool ok, string error)> SoftDeleteAsync(Guid id);
    }

    public class RecipeService : IRecipeService
    {
        private readonly IAppRepository _repo;

        public RecipeService(IAppRepository repo) => _repo = repo;

        public async Task<PagedResult<Recipe>> ListAsync(bool? isActive, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var items = await _repo.ListRecipesAsync(isActive, page, pageSize);
            var total = await _repo.CountRecipesAsync(isActive);
            return new PagedResult<Recipe> { Items = items, Page = page, PageSize = pageSize, Total = total };
        }

        public async Task<(Recipe? recipe, string error)> GetByIdAsync(Guid id)
        {
            var r = await _repo.GetRecipeByIdAsync(id);
            return r == null ? (null, "Công thức không tồn tại.") : (r, string.Empty);
        }

        public async Task<(Guid id, string error)> CreateAsync(CreateRecipeRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.FlavorName))
                return (Guid.Empty, "FlavorName không được để trống.");

            var recipe = new Recipe
            {
                FlavorName = req.FlavorName.Trim(),
                ShortDescription = req.ShortDescription?.Trim(),
                Ingredients = req.Ingredients?.Trim(),
                Procedure = req.Procedure?.Trim(),
                ImageUrl = req.ImageUrl?.Trim(),
                IsActive = true
            };

            var id = await _repo.CreateRecipeAsync(recipe);
            return (id, string.Empty);
        }

        public async Task<(bool ok, string error)> UpdateAsync(Guid id, UpdateRecipeRequest req)
        {
            var existing = await _repo.GetRecipeByIdAsync(id);
            if (existing == null) return (false, "Công thức không tồn tại.");

            existing.FlavorName = req.FlavorName?.Trim() ?? existing.FlavorName;
            existing.ShortDescription = req.ShortDescription?.Trim() ?? existing.ShortDescription;
            existing.Ingredients = req.Ingredients?.Trim() ?? existing.Ingredients;
            existing.Procedure = req.Procedure?.Trim() ?? existing.Procedure;
            existing.ImageUrl = req.ImageUrl?.Trim() ?? existing.ImageUrl;
            existing.IsActive = req.IsActive ?? existing.IsActive;

            var ok = await _repo.UpdateRecipeAsync(existing);
            return (ok, ok ? string.Empty : "Cập nhật thất bại.");
        }

        public async Task<(bool ok, string error)> SoftDeleteAsync(Guid id)
        {
            var existing = await _repo.GetRecipeByIdAsync(id);
            if (existing == null) return (false, "Công thức không tồn tại.");

            var ok = await _repo.DeleteRecipeAsync(id);
            return (ok, ok ? string.Empty : "Xoá thất bại.");
        }
    }
}
