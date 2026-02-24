// =============================================================================
// ItemService — Business logic for ITEMS table
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IItemService
    {
        Task<(PagedResult<Item> result, string error)> ListAsync(string? search, int page, int pageSize);
        Task<(Item? item, string error)> GetByIdAsync(Guid id);
        Task<(Guid id, string error)> CreateAsync(CreateItemRequest req);
        Task<(bool ok, string error)> UpdateAsync(Guid id, UpdateItemRequest req);
    }

    public class ItemService : IItemService
    {
        private readonly IAppRepository _repo;

        public ItemService(IAppRepository repo) => _repo = repo;

        public async Task<(PagedResult<Item> result, string error)> ListAsync(
            string? search, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var items = await _repo.ListItemsAsync(search, page, pageSize);
            var total = await _repo.CountItemsAsync(search);

            return (new PagedResult<Item>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = total
            }, string.Empty);
        }

        public async Task<(Item? item, string error)> GetByIdAsync(Guid id)
        {
            var item = await _repo.GetItemByIdAsync(id);
            return item == null
                ? (null, "Item không tồn tại.")
                : (item, string.Empty);
        }

        public async Task<(Guid id, string error)> CreateAsync(CreateItemRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title))
                return (Guid.Empty, "Title không được để trống.");
            if (req.Price < 0)
                return (Guid.Empty, "Price không hợp lệ.");
            if (req.Stock < 0)
                return (Guid.Empty, "Stock không hợp lệ.");

            var item = new Item
            {
                Title = req.Title.Trim(),
                Description = req.Description?.Trim(),
                Price = req.Price,
                Currency = string.IsNullOrWhiteSpace(req.Currency) ? "VND" : req.Currency.ToUpper(),
                ImageUrl = req.ImageUrl?.Trim(),
                Stock = req.Stock
            };

            var id = await _repo.CreateItemAsync(item);
            return (id, string.Empty);
        }

        public async Task<(bool ok, string error)> UpdateAsync(Guid id, UpdateItemRequest req)
        {
            var existing = await _repo.GetItemByIdAsync(id);
            if (existing == null)
                return (false, "Item không tồn tại.");

            // Patch only provided fields
            existing.Title = req.Title?.Trim() ?? existing.Title;
            existing.Description = req.Description?.Trim() ?? existing.Description;
            existing.Price = req.Price ?? existing.Price;
            existing.ImageUrl = req.ImageUrl?.Trim() ?? existing.ImageUrl;
            existing.Stock = req.Stock ?? existing.Stock;

            var ok = await _repo.UpdateItemAsync(existing);
            return (ok, ok ? string.Empty : "Cập nhật thất bại.");
        }
    }
}
