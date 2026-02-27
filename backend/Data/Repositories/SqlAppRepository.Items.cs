// =============================================================================
// SqlAppRepository — Items
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
        private static Item MapItem(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            Title = r["Title"].ToString()!,
            Description = ReadNullString(r, "Description"),
            Price = ReadDecimal(r, "Price"),
            Currency = r["Currency"].ToString()!,
            ImageUrl = ReadNullString(r, "ImageUrl"),
            Stock = ReadInt(r, "Stock"),
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            UpdatedAt = ReadDateTime(r, "UpdatedAt")
        };

        // -----------------------------------------------------------------
        // Queries
        // -----------------------------------------------------------------
        public Task<List<Item>> ListItemsAsync(string? search, int page, int pageSize)
        {
            var where = string.IsNullOrEmpty(search) ? "" : "WHERE Title LIKE @Search";
            var parms = string.IsNullOrEmpty(search)
                ? new[] { P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) }
                : new[] { P("@Search", $"%{search}%"), P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) };
            return QueryAsync($"""
                SELECT * FROM public_data.ITEMS {where}
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """, parms, MapItem);
        }

        public async Task<int> CountItemsAsync(string? search)
        {
            var where = string.IsNullOrEmpty(search) ? "" : "WHERE Title LIKE @Search";
            var parms = string.IsNullOrEmpty(search) ? null : new[] { P("@Search", $"%{search}%") };
            return await ExecuteScalarAsync<int?>($"SELECT COUNT(1) FROM public_data.ITEMS {where}", parms) ?? 0;
        }

        public Task<Item?> GetItemByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.ITEMS WHERE Id = @Id",
                [P("@Id", id)], MapItem);

        public async Task<Guid> CreateItemAsync(Item item)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.ITEMS (Id, Title, [Description], Price, Currency, ImageUrl, Stock)
                VALUES (@Id, @Title, @Description, @Price, @Currency, @ImageUrl, @Stock)
                """,
                [P("@Id", newId), P("@Title", item.Title), P("@Description", item.Description),
                 P("@Price", item.Price), P("@Currency", item.Currency),
                 P("@ImageUrl", item.ImageUrl), P("@Stock", item.Stock)]);
            return newId;
        }

        public async Task<bool> UpdateItemAsync(Item item)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.ITEMS
                SET Title = @Title, [Description] = @Description, Price = @Price,
                    ImageUrl = @ImageUrl, Stock = @Stock
                WHERE Id = @Id
                """,
                [P("@Id", item.Id), P("@Title", item.Title), P("@Description", item.Description),
                 P("@Price", item.Price), P("@ImageUrl", item.ImageUrl), P("@Stock", item.Stock)]);
            return rows > 0;
        }

        public async Task<bool> AdjustStockAsync(Guid itemId, int delta)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.ITEMS SET Stock = Stock + @Delta
                WHERE Id = @Id AND (Stock + @Delta) >= 0
                """,
                [P("@Id", itemId), P("@Delta", delta)]);
            return rows > 0;
        }
    }
}
