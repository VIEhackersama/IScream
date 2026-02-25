// =============================================================================
// OrderService — Business logic for ITEM_ORDERS
// =============================================================================
#nullable enable

using IScream.Data;
using IScream.Models;

namespace IScream.Services
{
    public interface IOrderService
    {
        Task<(Guid orderId, string error)> PlaceOrderAsync(CreateOrderRequest req);
        Task<(ItemOrder? order, string error)> GetByIdAsync(Guid id);
        Task<PagedResult<ItemOrder>> ListAsync(string? status, int page, int pageSize);
        Task<(bool ok, string error)> UpdateStatusAsync(Guid id, string status, Guid? paymentId = null);
    }

    public class OrderService : IOrderService
    {
        private readonly IAppRepository _repo;
        private static readonly string[] AllowedStatuses = ["SHIPPED", "DELIVERED", "CANCELLED", "PAID"];

        public OrderService(IAppRepository repo) => _repo = repo;

        public async Task<(Guid orderId, string error)> PlaceOrderAsync(CreateOrderRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.CustomerName))
                return (Guid.Empty, "CustomerName không được để trống.");
            if (req.Quantity <= 0)
                return (Guid.Empty, "Quantity phải lớn hơn 0.");

            // Check item exists and has enough stock
            var item = await _repo.GetItemByIdAsync(req.ItemId);
            if (item == null)
                return (Guid.Empty, "Item không tồn tại.");
            if (item.Stock < req.Quantity)
                return (Guid.Empty, $"Không đủ hàng. Còn lại: {item.Stock}.");

            // Deduct stock atomically (SQL WHERE Stock - delta >= 0)
            var stockOk = await _repo.AdjustStockAsync(req.ItemId, -req.Quantity);
            if (!stockOk)
                return (Guid.Empty, "Lỗi trừ tồn kho. Vui lòng thử lại.");

            // Generate unique OrderNo: ORD-YYYYMMDD-XXXXXX
            string orderNo;
            int attempt = 0;
            do
            {
                var rand = new Random();
                orderNo = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{rand.Next(100000, 999999)}";
                attempt++;
                if (attempt > 10) return (Guid.Empty, "Không thể tạo OrderNo. Thử lại.");
            } while (await _repo.OrderNoExistsAsync(orderNo));

            var order = new ItemOrder
            {
                OrderNo = orderNo,
                CustomerName = req.CustomerName.Trim(),
                Email = req.Email?.Trim(),
                Phone = req.Phone?.Trim(),
                Address = req.Address?.Trim(),
                ItemId = req.ItemId,
                Quantity = req.Quantity,
                UnitPrice = item.Price,   // Snapshot price at time of order
                Status = "PENDING"
            };

            var orderId = await _repo.CreateItemOrderAsync(order);
            return (orderId, string.Empty);
        }

        public async Task<(ItemOrder? order, string error)> GetByIdAsync(Guid id)
        {
            var order = await _repo.GetOrderByIdAsync(id);
            return order == null ? (null, "Đơn hàng không tồn tại.") : (order, string.Empty);
        }

        public async Task<PagedResult<ItemOrder>> ListAsync(string? status, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var items = await _repo.ListOrdersAsync(status, page, pageSize);
            var total = await _repo.CountOrdersAsync(status);
            return new PagedResult<ItemOrder> { Items = items, Page = page, PageSize = pageSize, Total = total };
        }

        public async Task<(bool ok, string error)> UpdateStatusAsync(Guid id, string status, Guid? paymentId = null)
        {
            if (!AllowedStatuses.Contains(status.ToUpper()))
                return (false, $"Status không hợp lệ. Cho phép: {string.Join(", ", AllowedStatuses)}");

            var order = await _repo.GetOrderByIdAsync(id);
            if (order == null) return (false, "Đơn hàng không tồn tại.");

            // Restore stock if CANCELLED
            if (status.ToUpper() == "CANCELLED" && order.Status == "PENDING")
                await _repo.AdjustStockAsync(order.ItemId, order.Quantity);

            var ok = await _repo.UpdateOrderStatusAsync(id, status.ToUpper(), paymentId);
            return (ok, ok ? string.Empty : "Cập nhật trạng thái thất bại.");
        }
    }
}
