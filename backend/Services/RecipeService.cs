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
        Task<(RecipeDetailResponse? detail, string error)> GetDetailAsync(Guid id, Guid? userId);
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
            return new PagedResult<Recipe> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
        }

        public async Task<(Recipe? recipe, string error)> GetByIdAsync(Guid id)
        {
            var r = await _repo.GetRecipeByIdAsync(id);
            return r == null ? (null, "Recipe not found.") : (r, string.Empty);
        }

        public async Task<(RecipeDetailResponse? detail, string error)> GetDetailAsync(Guid id, Guid? userId)
        {
            var recipe = await _repo.GetRecipeByIdAsync(id);
            if (recipe == null) return (null, "Recipe not found.");

            bool hasActiveMembership = false;
            if (userId.HasValue)
            {
                var sub = await _repo.GetActiveSubscriptionAsync(userId.Value);
                hasActiveMembership = sub != null;
            }

            var response = new RecipeDetailResponse
            {
                Id = recipe.Id,
                FlavorName = recipe.FlavorName,
                ShortDescription = recipe.ShortDescription,
                ImageUrl = recipe.ImageUrl,
                IsActive = recipe.IsActive,
                CreatedAt = recipe.CreatedAt,
                IsLocked = !hasActiveMembership,
                Ingredients = hasActiveMembership ? recipe.Ingredients : null,
                Procedure = hasActiveMembership ? recipe.Procedure : null
            };
            return (response, string.Empty);
        }

        public async Task<(Guid id, string error)> CreateAsync(CreateRecipeRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.FlavorName))
                return (Guid.Empty, "FlavorName is required.");

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
            if (existing == null) return (false, "Recipe not found.");

            existing.FlavorName = req.FlavorName?.Trim() ?? existing.FlavorName;
            existing.ShortDescription = req.ShortDescription?.Trim() ?? existing.ShortDescription;
            existing.Ingredients = req.Ingredients?.Trim() ?? existing.Ingredients;
            existing.Procedure = req.Procedure?.Trim() ?? existing.Procedure;
            existing.ImageUrl = req.ImageUrl?.Trim() ?? existing.ImageUrl;
            existing.IsActive = req.IsActive ?? existing.IsActive;

            var ok = await _repo.UpdateRecipeAsync(existing);
            return (ok, ok ? string.Empty : "Update failed.");
        }

        public async Task<(bool ok, string error)> SoftDeleteAsync(Guid id)
        {
            var existing = await _repo.GetRecipeByIdAsync(id);
            if (existing == null) return (false, "Recipe not found.");

            var ok = await _repo.DeleteRecipeAsync(id);
            return (ok, ok ? string.Empty : "Deletion failed.");
        }
    }
}
