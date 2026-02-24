///=====================================================================
/// Database Entity Models
/// Mapping các bảng SQL Server sang C# entities
/// =====================================================================

#nullable enable

using System;
using System.Collections.Generic;

namespace IScream.Core.Entities
{
    #region Auth Module

    /// <summary>
    /// Thông tin người dùng cơ bản
    /// </summary>
    public class User
    {
        public long Id { get; set; }
        public string FullName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE/INACTIVE/BLOCKED
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ICollection<AuthAccount> AuthAccounts { get; set; } = new List<AuthAccount>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    }

    /// <summary>
    /// Tài khoản đăng nhập (Facebook/Google/Local)
    /// </summary>
    public class AuthAccount
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string Provider { get; set; } = null!; // facebook/google/local
        public string ProviderUserId { get; set; } = null!; // ID từ provider
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
    }

    #endregion

    #region Catalog Module

    /// <summary>
    /// Sản phẩm (Kem/Công thức/Membership)
    /// </summary>
    public class Product
    {
        public long Id { get; set; }
        public string Type { get; set; } = null!; // ICECREAM/RECIPE/MEMBERSHIP
        public string Name { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string? ShortDesc { get; set; }
        public string? FullDesc { get; set; }
        public decimal Price { get; set; } = 0;
        public string Currency { get; set; } = "VND";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ICollection<ProductMedia> Medias { get; set; } = new List<ProductMedia>();
        public virtual Recipe? Recipe { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    /// <summary>
    /// Media cho sản phẩm (ảnh/video)
    /// </summary>
    public class ProductMedia
    {
        public long Id { get; set; }
        public long ProductId { get; set; }
        public string MediaType { get; set; } = null!; // IMAGE/VIDEO
        public string Url { get; set; } = null!;
        public bool IsCover { get; set; } = false;
        public int Position { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Product Product { get; set; } = null!;
    }

    #endregion

    #region Content Module

    /// <summary>
    /// Công thức
    /// </summary>
    public class Recipe
    {
        public long Id { get; set; }
        public long ProductId { get; set; }
        public string Title { get; set; } = null!;
        public string? ShortDesc { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public string Visibility { get; set; } = "PAID"; // FREE/PAID
        public string Status { get; set; } = "DRAFT"; // DRAFT/PUBLISHED/ARCHIVED
        public long? CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Product Product { get; set; } = null!;
        public virtual User? CreatedByUser { get; set; }
        public virtual ICollection<RecipeMedia> Medias { get; set; } = new List<RecipeMedia>();
        public virtual ICollection<RecipeAccess> Accesses { get; set; } = new List<RecipeAccess>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual TopRecipe? TopRecipe { get; set; }
    }

    /// <summary>
    /// Media cho công thức (ảnh/video)
    /// TRAILER: video preview
    /// REFERENCE: video hướng dẫn (tối thiểu 1)
    /// GALLERY: ảnh/video bổ sung
    /// </summary>
    public class RecipeMedia
    {
        public long Id { get; set; }
        public long RecipeId { get; set; }
        public string MediaType { get; set; } = null!; // IMAGE/VIDEO
        public string MediaRole { get; set; } = null!; // TRAILER/REFERENCE/GALLERY
        public string Url { get; set; } = null!;
        public int Position { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Recipe Recipe { get; set; } = null!;
    }

    /// <summary>
    /// Quyền xem công thức (từ mua order/subscription)
    /// </summary>
    public class RecipeAccess
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long RecipeId { get; set; }
        public string SourceType { get; set; } = null!; // ORDER/SUBSCRIPTION/ADMIN_GRANT
        public long SourceId { get; set; }
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual Recipe Recipe { get; set; } = null!;
    }

    /// <summary>
    /// Đánh giá (review)
    /// IsVerified = true nếu user đã mua + dùng (product) hoặc có access (recipe)
    /// </summary>
    public class Review
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string TargetType { get; set; } = null!; // PRODUCT/RECIPE
        public long TargetId { get; set; }
        public int Rating { get; set; } // 1-5
        public string? Content { get; set; }
        public string Channel { get; set; } = "IN_APP"; // IN_APP/EXTERNAL
        public bool IsVerified { get; set; } = false;
        public DateTime? VerifiedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
    }

    /// <summary>
    /// Top recipes hiển thị trên trang chủ
    /// </summary>
    public class TopRecipe
    {
        public long Id { get; set; }
        public long RecipeId { get; set; }
        public decimal RankScore { get; set; } = 0;
        public DateTime FeaturedFrom { get; set; } = DateTime.UtcNow;
        public DateTime? FeaturedTo { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Recipe Recipe { get; set; } = null!;
    }

    #endregion

    #region Sales Module

    /// <summary>
    /// Đơn hàng
    /// </summary>
    public class Order
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string OrderCode { get; set; } = null!;
        public string Status { get; set; } = "PENDING"; // PENDING/PAID/COMPLETED/CANCELLED
        public decimal TotalAmount { get; set; } = 0;
        public string Currency { get; set; } = "VND";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual Shipment? Shipment { get; set; }
    }

    /// <summary>
    /// Dòng sản phẩm trong đơn
    /// </summary>
    public class OrderItem
    {
        public long Id { get; set; }
        public long OrderId { get; set; }
        public long ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0;
        public string ItemTypeSnapshot { get; set; } = null!; // ICECREAM/RECIPE/MEMBERSHIP
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual ProductUsage? Usage { get; set; }
    }

    /// <summary>
    /// Ghi nhận thanh toán
    /// </summary>
    public class Payment
    {
        public long Id { get; set; }
        public long OrderId { get; set; }
        public string Provider { get; set; } = null!; // MOMO/ZALOPAY/STRIPE/etc
        public decimal Amount { get; set; }
        public string Status { get; set; } = "INIT"; // INIT/SUCCESS/FAILED
        public string? TransactionRef { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Order Order { get; set; } = null!;
    }

    /// <summary>
    /// Thông tin giao hàng
    /// </summary>
    public class Shipment
    {
        public long Id { get; set; }
        public long OrderId { get; set; }
        public string ReceiverName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string AddressLine { get; set; } = null!;
        public string? Ward { get; set; }
        public string? District { get; set; }
        public string? City { get; set; }
        public string ShippingStatus { get; set; } = "READY"; // READY/SHIPPED/DELIVERED/CANCELLED
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Order Order { get; set; } = null!;
    }

    /// <summary>
    /// Quản lý sử dụng sản phẩm (chỉ cho kem)
    /// PURCHASED: đã giao hàng
    /// USED: user xác nhận đã dùng (có quyền review)
    /// </summary>
    public class ProductUsage
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long OrderItemId { get; set; }
        public string Status { get; set; } = "PURCHASED"; // PURCHASED/USED
        public DateTime? UsedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual OrderItem OrderItem { get; set; } = null!;
    }

    /// <summary>
    /// Membership subscription
    /// </summary>
    public class Subscription
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long ProductId { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE/EXPIRED/CANCELLED
        public DateTime StartAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }

    #endregion

    #region UGC Module

    /// <summary>
    /// User gửi công thức (cần admin duyệt)
    /// </summary>
    public class RecipeSubmission
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string Title { get; set; } = null!;
        public string? Desc { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING/APPROVED/REJECTED/PUBLISHED
        public string? AdminNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual ICollection<SubmissionMedia> Medias { get; set; } = new List<SubmissionMedia>();
        public virtual SubmissionReward? Reward { get; set; }
    }

    /// <summary>
    /// Media cho submission
    /// </summary>
    public class SubmissionMedia
    {
        public long Id { get; set; }
        public long SubmissionId { get; set; }
        public string MediaType { get; set; } = null!; // IMAGE/VIDEO
        public string Url { get; set; } = null!;
        public int Position { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual RecipeSubmission Submission { get; set; } = null!;
    }

    /// <summary>
    /// Thưởng cho submission được duyệt
    /// </summary>
    public class SubmissionReward
    {
        public long Id { get; set; }
        public long SubmissionId { get; set; }
        public decimal? PrizeMoney { get; set; }
        public string CertificateUrl { get; set; } = null!;
        public DateTime? SentEmailAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual RecipeSubmission Submission { get; set; } = null!;
    }

    #endregion

    #region DTOs

    /// <summary>
    /// DTO tạo đơn
    /// </summary>
    public class CreateOrderRequest
    {
        public long UserId { get; set; }
        public string OrderCode { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string? Currency { get; set; }
        public List<OrderItemRequest>? Items { get; set; }
    }

    public class OrderItemRequest
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
    }

    /// <summary>
    /// DTO thanh toán
    /// </summary>
    public class PaymentRequest
    {
        public long OrderId { get; set; }
        public string Provider { get; set; } = null!;
        public decimal Amount { get; set; }
        public string? TransactionRef { get; set; }
    }

    /// <summary>
    /// DTO tạo review
    /// </summary>
    public class CreateReviewRequest
    {
        public long UserId { get; set; }
        public string TargetType { get; set; } = null!; // PRODUCT/RECIPE
        public long TargetId { get; set; }
        public int Rating { get; set; }
        public string? Content { get; set; }
        public string? Channel { get; set; }
    }

    /// <summary>
    /// DTO gửi công thức UGC
    /// </summary>
    public class SubmitRecipeRequest
    {
        public long UserId { get; set; }
        public string Title { get; set; } = null!;
        public string? Desc { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public List<string>? MediaUrls { get; set; }
    }

    /// <summary>
    /// DTO response
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    #endregion
}
