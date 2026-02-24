using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using IScream.Data;
using IScream.Core.Entities;

// Sử dụng Alias để fix triệt để lỗi CS1503 (Argument conversion)
using SqlParameter = Microsoft.Data.SqlClient.SqlParameter;
using SqlDbType = System.Data.SqlDbType;

namespace IScream.Functions
{
    // =====================================================================
    // WORKFLOW 1: CREATE ORDER
    // =====================================================================
    public class OrderFunctions
    {
        private readonly IDatabaseRepository _db;
        private readonly ILogger<OrderFunctions> _logger;

        public OrderFunctions(IDatabaseRepository db, ILogger<OrderFunctions> logger)
        {
            _db = db;
            _logger = logger;
        }

        [Function("CreateOrder")]
        public async Task<HttpResponseData> CreateOrder(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "orders")] HttpRequestData req)
        {
            try
            {
                var request = await req.ReadFromJsonAsync<CreateOrderRequest>();

                if (request is null)
                {
                    var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                    await bad.WriteAsJsonAsync(new { success = false, message = "Invalid JSON body" });
                    return bad;
                }

                var orderId = await _db.CreateOrderAsync(
                    userId: request.UserId,
                    orderCode: $"ORD-{DateTime.UtcNow.Ticks}",
                    totalAmount: request.TotalAmount,
                    currency: request.Currency ?? "VND"
                );

                // FIX CS0019: Đồng nhất kiểu list ItemRequest
                foreach (var item in request.Items ?? new List<OrderItemRequest>())
                {
                    await _db.AddOrderItemAsync(
                        orderId: orderId,
                        productId: item.ProductId,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice
                    );
                }

                var response = req.CreateResponse(HttpStatusCode.Created);
                await response.WriteAsJsonAsync(new { success = true, data = new { orderId } });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                var res = req.CreateResponse(HttpStatusCode.BadRequest);
                await res.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return res;
            }
        }
    }

    // =====================================================================
    // WORKFLOW 3 (UTILITY): GET RECIPE ACCESS - FIX LỖI CS1503 DÒNG 170
    // =====================================================================
    public class UtilityFunctions
    {
        private readonly IDatabaseRepository _db;
        private readonly ILogger<UtilityFunctions> _logger;

        public UtilityFunctions(IDatabaseRepository db, ILogger<UtilityFunctions> logger)
        {
            _db = db;
            _logger = logger;
        }

        [Function("GetUserRecipeAccess")]
        public async Task<HttpResponseData> GetUserRecipeAccess(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "users/{userId:long}/recipes")] HttpRequestData req,
            long userId)
        {
            try
            {
                var query = @"
                    SELECT ra.*, r.Title, r.ShortDesc, p.Price
                    FROM content.vw_UserRecipeAccess ra
                    JOIN content.Recipes r ON r.Id = ra.RecipeId
                    JOIN catalog.Products p ON p.Id = r.ProductId
                    WHERE ra.UserId = @UserId";

                // Sử dụng SqlParameter đã alias ở trên để đảm bảo đúng namespace Microsoft.Data.SqlClient
                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@UserId", SqlDbType.BigInt) { Value = userId }
                };

                // Gọi Repository - Đảm bảo tham số truyền vào là SqlParameter[]?
                var data = await _db.ExecuteQueryAsync(query, parameters);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { success = true, data });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recipe access");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }
    }

    // =====================================================================
    // MODELS & DTOS (Fix CS0246)
    // =====================================================================
    public class CreateOrderRequest
    {
        public long UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Currency { get; set; }
        public List<OrderItemRequest>? Items { get; set; }
    }

    public class OrderItemRequest
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class PaymentRequest
    {
        public long OrderId { get; set; }
        public string Provider { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string TransactionRef { get; set; } = string.Empty;
    }
}