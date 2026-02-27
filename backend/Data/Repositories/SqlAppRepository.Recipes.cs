// =============================================================================
// SqlAppRepository — Recipes
// =============================================================================
#nullable enable

using IScream.Models;
using Microsoft.Data.SqlClient;

namespace IScream.Data
{
    public partial class SqlAppRepository
    {
        // -----------------------------------------------------------------
        // Row Mapper
        // -----------------------------------------------------------------
        private static Recipe MapRecipe(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            FlavorName = r["FlavorName"].ToString()!,
            ShortDescription = ReadNullString(r, "ShortDescription"),
            Ingredients = ReadNullString(r, "Ingredients"),
            Procedure = ReadNullString(r, "Procedure"),
            ImageUrl = ReadNullString(r, "ImageUrl"),
            IsActive = ReadBool(r, "IsActive"),
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            UpdatedAt = ReadDateTime(r, "UpdatedAt")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public Task<List<Recipe>> ListRecipesAsync(bool? isActive, int page, int pageSize)
        {
            var where = isActive.HasValue ? "WHERE IsActive = @IsActive" : "";
            var parms = isActive.HasValue
                ? new[] { P("@IsActive", isActive.Value), P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) }
                : new[] { P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) };
            return QueryAsync($"""
                SELECT * FROM public_data.RECIPES {where}
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """, parms, MapRecipe);
        }

        public async Task<int> CountRecipesAsync(bool? isActive)
        {
            var where = isActive.HasValue ? "WHERE IsActive = @IsActive" : "";
            var parms = isActive.HasValue ? new[] { P("@IsActive", isActive.Value) } : null;
            return await ExecuteScalarAsync<int?>($"SELECT COUNT(1) FROM public_data.RECIPES {where}", parms) ?? 0;
        }

        public Task<Recipe?> GetRecipeByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.RECIPES WHERE Id = @Id",
                [P("@Id", id)], MapRecipe);

        public async Task<Guid> CreateRecipeAsync(Recipe recipe)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.RECIPES
                    (Id, FlavorName, ShortDescription, Ingredients, [Procedure], ImageUrl, IsActive)
                VALUES (@Id, @FlavorName, @ShortDescription, @Ingredients, @Procedure, @ImageUrl, 1)
                """,
                [P("@Id", newId), P("@FlavorName", recipe.FlavorName),
                 P("@ShortDescription", recipe.ShortDescription), P("@Ingredients", recipe.Ingredients),
                 P("@Procedure", recipe.Procedure), P("@ImageUrl", recipe.ImageUrl)]);
            return newId;
        }

        public async Task<bool> UpdateRecipeAsync(Recipe recipe)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.RECIPES
                SET FlavorName = @FlavorName, ShortDescription = @ShortDescription,
                    Ingredients = @Ingredients, [Procedure] = @Procedure,
                    ImageUrl = @ImageUrl, IsActive = @IsActive
                WHERE Id = @Id
                """,
                [P("@Id", recipe.Id), P("@FlavorName", recipe.FlavorName),
                 P("@ShortDescription", recipe.ShortDescription), P("@Ingredients", recipe.Ingredients),
                 P("@Procedure", recipe.Procedure), P("@ImageUrl", recipe.ImageUrl),
                 P("@IsActive", recipe.IsActive)]);
            return rows > 0;
        }

        public async Task<bool> DeleteRecipeAsync(Guid id)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.RECIPES SET IsActive = 0 WHERE Id = @Id",
                [P("@Id", id)]);
            return rows > 0;
        }
    }
}
