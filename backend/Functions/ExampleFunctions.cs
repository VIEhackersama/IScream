///=====================================================================
/// Example Azure Functions - How to use DatabaseRepository
/// Các ví dụ thực tế cho các workflows chính
/// =====================================================================

using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using IScream.Data;
using IScream.Core.Entities;

namespace IScream.Functions
{
    // =====================================================================
    // WORKFLOW 1: CREATE ORDER (Bán Kem / Công Thức)
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

                // Step 1: Tạo đơn
                var orderId = await _db.CreateOrderAsync(
                    userId: request.UserId,
                    orderCode: $"ORD-{DateTime.UtcNow.Ticks}",
                    totalAmount: request.TotalAmount,
                    currency: request.Currency ?? "VND"
                );

                _logger.LogInformation("Created order {OrderId}", orderId);

                // Step 2: Thêm items
                foreach (var item in request.Items ?? new List<CreateOrderItemRequest>())
                {
                    var itemId = await _db.AddOrderItemAsync(
                        orderId: orderId,
                        productId: item.ProductId,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice
                    );

                    _logger.LogInformation("Added item {ItemId} to order {OrderId}", itemId, orderId);
                }

                var response = req.CreateResponse(HttpStatusCode.Created);
                await response.WriteAsJsonAsync(new
                {
                    success = true,
                    message = "Order created successfully",
                    data = new { orderId }
                });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }
    }

    // =====================================================================
    // WORKFLOW 2: PAYMENT SUCCESS (Thanh Toán)
    // =====================================================================
    public class PaymentFunctions
    {
        private readonly IDatabaseRepository _db;
        private readonly ILogger<PaymentFunctions> _logger;

        public PaymentFunctions(IDatabaseRepository db, ILogger<PaymentFunctions> logger)
        {
            _db = db;
            _logger = logger;
        }

        [Function("ProcessPayment")]
        public async Task<HttpResponseData> ProcessPayment(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "payments/success")] HttpRequestData req)
        {
            try
            {
                var request = await req.ReadFromJsonAsync<PaymentRequest>();
                if (request is null)
                {
                    var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                    await bad.WriteAsJsonAsync(new { success = false, message = "Invalid JSON body" });
                    return bad;
                }

                await _db.MarkPaymentSuccessAsync(
                    orderId: request.OrderId,
                    provider: request.Provider,
                    amount: request.Amount,
                    transactionRef: request.TransactionRef
                );

                _logger.LogInformation("Payment success for order {OrderId}", request.OrderId);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { success = true, message = "Payment processed successfully" });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }
    }

    // =====================================================================
    // WORKFLOW 3: CREATE SHIPMENT (Giao Hàng)
    // =====================================================================
    public class ShipmentFunctions
    {
        private readonly IDatabaseRepository _db;
        private readonly ILogger<ShipmentFunctions> _logger;

        public ShipmentFunctions(IDatabaseRepository db, ILogger<ShipmentFunctions> logger)
        {
            _db = db;
            _logger = logger;
        }

        private static string? GetString(JsonElement root, string name)
            => root.TryGetProperty(name, out var p) && p.ValueKind != JsonValueKind.Null ? p.GetString() : null;

        private static long GetInt64(JsonElement root, string name)
            => root.TryGetProperty(name, out var p) ? p.GetInt64() : throw new Exception($"Missing field: {name}");

        [Function("CreateShipment")]
        public async Task<HttpResponseData> CreateShipment(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "shipments")] HttpRequestData req)
        {
            try
            {
                // Đọc JSON bằng JsonElement để tránh dynamic lỗi
                var body = await req.ReadFromJsonAsync<JsonElement>();

                // Nếu body không hợp lệ sẽ là default(JsonElement) -> ValueKind = Undefined
                if (body.ValueKind == JsonValueKind.Undefined || body.ValueKind == JsonValueKind.Null)
                {
                    var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                    await bad.WriteAsJsonAsync(new { success = false, message = "Invalid JSON body" });
                    return bad;
                }

                var orderId = GetInt64(body, "orderId");
                var receiverName = GetString(body, "receiverName") ?? throw new Exception("Missing receiverName");
                var phone = GetString(body, "phone") ?? throw new Exception("Missing phone");
                var addressLine = GetString(body, "addressLine") ?? throw new Exception("Missing addressLine");
                var ward = GetString(body, "ward");
                var district = GetString(body, "district");
                var city = GetString(body, "city");

                var shipmentId = await _db.CreateShipmentAsync(
                    orderId: orderId,
                    receiverName: receiverName,
                    phone: phone,
                    addressLine: addressLine,
                    ward: ward,
                    district: district,
                    city: city
                );

                _logger.LogInformation("Created shipment {ShipmentId}", shipmentId);

                var response = req.CreateResponse(HttpStatusCode.Created);
                await response.WriteAsJsonAsync(new
                {
                    success = true,
                    message = "Shipment created",
                    data = new { shipmentId }
                });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating shipment");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }

        [Function("MarkDelivered")]
        public async Task<HttpResponseData> MarkDelivered(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "orders/{orderId:long}/delivered")] HttpRequestData req,
            long orderId)
        {
            try
            {
                await _db.MarkOrderDeliveredAsync(orderId);

                _logger.LogInformation("Order {OrderId} marked as delivered", orderId);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { success = true, message = "Order delivered" });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking delivered");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }
    }

    // =====================================================================
    // WORKFLOW 4: REVIEWS & VERIFICATION
    // =====================================================================
    public class ReviewFunctions
    {
        private readonly IDatabaseRepository _db;
        private readonly ILogger<ReviewFunctions> _logger;

        public ReviewFunctions(IDatabaseRepository db, ILogger<ReviewFunctions> logger)
        {
            _db = db;
            _logger = logger;
        }

        [Function("CreateReview")]
        public async Task<HttpResponseData> CreateReview(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "reviews")] HttpRequestData req)
        {
            try
            {
                var request = await req.ReadFromJsonAsync<CreateReviewRequest>();
                if (request is null)
                {
                    var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                    await bad.WriteAsJsonAsync(new { success = false, message = "Invalid JSON body" });
                    return bad;
                }

                var reviewId = await _db.CreateReviewAsync(
                    userId: request.UserId,
                    targetType: request.TargetType,
                    targetId: request.TargetId,
                    rating: request.Rating,
                    content: request.Content,
                    channel: request.Channel ?? "IN_APP"
                );

                _logger.LogInformation("Review created: {ReviewId}", reviewId);

                var response = req.CreateResponse(HttpStatusCode.Created);
                await response.WriteAsJsonAsync(new
                {
                    success = true,
                    message = "Review created",
                    data = new { reviewId }
                });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }

        [Function("MarkProductUsed")]
        public async Task<HttpResponseData> MarkProductUsed(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "product-usage/{userId:long}/{itemId:long}/used")] HttpRequestData req,
            long userId,
            long itemId)
        {
            try
            {
                await _db.MarkUsedAsync(userId, itemId);

                _logger.LogInformation("Product marked as used by user {UserId}, item {ItemId}", userId, itemId);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { success = true, message = "Product marked as used" });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking used");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }
    }

    // =====================================================================
    // WORKFLOW 5: UGC SUBMISSION & APPROVAL
    // =====================================================================
    public class UGCFunctions
    {
        private readonly IDatabaseRepository _db;
        private readonly ILogger<UGCFunctions> _logger;

        public UGCFunctions(IDatabaseRepository db, ILogger<UGCFunctions> logger)
        {
            _db = db;
            _logger = logger;
        }

        public record ApproveSubmissionBody(long recipeProductId, decimal prizeMoney, string certificateUrl);
        public record RejectSubmissionBody(string adminNote);

        [Function("ApproveSubmission")]
        public async Task<HttpResponseData> ApproveSubmission(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "admin/submissions/{submissionId:long}/approve")] HttpRequestData req,
            long submissionId)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<ApproveSubmissionBody>();
                if (body is null)
                {
                    var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                    await bad.WriteAsJsonAsync(new { success = false, message = "Invalid JSON body" });
                    return bad;
                }

                await _db.ApproveSubmissionAsync(
                    submissionId: submissionId,
                    recipeProductId: body.recipeProductId,
                    prizeMoney: body.prizeMoney,
                    certificateUrl: body.certificateUrl
                );

                _logger.LogInformation("Submission {SubmissionId} approved", submissionId);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { success = true, message = "Submission approved", data = new { submissionId } });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving submission");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }

        [Function("RejectSubmission")]
        public async Task<HttpResponseData> RejectSubmission(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "admin/submissions/{submissionId:long}/reject")] HttpRequestData req,
            long submissionId)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<RejectSubmissionBody>();
                if (body is null)
                {
                    var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                    await bad.WriteAsJsonAsync(new { success = false, message = "Invalid JSON body" });
                    return bad;
                }

                await _db.RejectSubmissionAsync(submissionId: submissionId, adminNote: body.adminNote);

                _logger.LogInformation("Submission {SubmissionId} rejected", submissionId);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { success = true, message = "Submission rejected" });
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting submission");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteAsJsonAsync(new { success = false, message = ex.Message });
                return response;
            }
        }
    }

    // =====================================================================
    // UTILITY FUNCTIONS
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
                    WHERE ra.UserId = @UserId
                ";

                var parameters = new SqlParameter[]
                {
                    new SqlParameter("@UserId", userId)
                };

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
}