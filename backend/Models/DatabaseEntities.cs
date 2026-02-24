// =============================================================================
// IScream — Database Entity Models + DTOs
// Schema: public_data (Azure SQL)
// Tables: USERS, MEMBERSHIP_PLANS, PAYMENTS, RECIPES, ITEMS,
//         ITEM_ORDERS, MEMBERSHIP_SUBSCRIPTIONS, FEEDBACKS, RECIPE_SUBMISSIONS
// =============================================================================
#nullable enable

namespace IScream.Models
{
    // =========================================================================
    // ENTITIES — 1-to-1 with SQL tables
    // =========================================================================

    /// <summary>public_data.USERS</summary>
    public class AppUser
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Email { get; set; }
        public string PasswordHash { get; set; } = null!;
        public string? FullName { get; set; }
        public string Role { get; set; } = "USER";   // USER | ADMIN
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

    /// <summary>public_data.MEMBERSHIP_PLANS</summary>
    public class MembershipPlan
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public int DurationDays { get; set; } = 30;
        public bool IsActive { get; set; } = true;
    }

    /// <summary>public_data.PAYMENTS — Type: MEMBERSHIP | ORDER</summary>
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public string Type { get; set; } = null!;
        public string Status { get; set; } = "INIT";  // INIT | SUCCESS | FAILED
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>public_data.RECIPES</summary>
    public class Recipe
    {
        public Guid Id { get; set; }
        public string FlavorName { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>public_data.ITEMS</summary>
    public class Item
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>public_data.ITEM_ORDERS — TotalCost is computed (persisted) in DB</summary>
    public class ItemOrder
    {
        public Guid Id { get; set; }
        public string OrderNo { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public Guid ItemId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalCost { get; set; }   // read-only (computed in DB)
        public Guid? PaymentId { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING | PAID | SHIPPED | DELIVERED | CANCELLED
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Joined fields (optional, for richer responses)
        public string? ItemTitle { get; set; }
        public string? ItemImageUrl { get; set; }
    }

    /// <summary>public_data.MEMBERSHIP_SUBSCRIPTIONS</summary>
    public class MembershipSubscription
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int PlanId { get; set; }
        public Guid? PaymentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE | EXPIRED | CANCELLED
        public DateTime CreatedAt { get; set; }

        // Joined fields
        public string? PlanCode { get; set; }
        public decimal? PlanPrice { get; set; }
    }

    /// <summary>public_data.FEEDBACKS</summary>
    public class Feedback
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRegisteredUser { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>public_data.RECIPE_SUBMISSIONS</summary>
    public class RecipeSubmission
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING | APPROVED | REJECTED
        public decimal? PrizeMoney { get; set; }
        public string? CertificateUrl { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }

    // =========================================================================
    // REQUEST DTOs
    // =========================================================================

    public class RegisterRequest
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Email { get; set; }
        public string? FullName { get; set; }
    }

    public class LoginRequest
    {
        /// <summary>Can be Username or Email</summary>
        public string UsernameOrEmail { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    // --- Item DTOs ---
    public class CreateItemRequest
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "VND";
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
    }

    public class UpdateItemRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? ImageUrl { get; set; }
        public int? Stock { get; set; }
    }

    // --- Recipe DTOs ---
    public class CreateRecipeRequest
    {
        public string FlavorName { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateRecipeRequest
    {
        public string? FlavorName { get; set; }
        public string? ShortDescription { get; set; }
        public string? Ingredients { get; set; }
        public string? Procedure { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }

    // --- Order DTOs ---
    public class CreateOrderRequest
    {
        public string CustomerName { get; set; } = null!;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public Guid ItemId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = null!; // SHIPPED | DELIVERED | CANCELLED
    }

    // --- Payment DTOs ---
    public class CreatePaymentRequest
    {
        public Guid? UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public string Type { get; set; } = null!; // MEMBERSHIP | ORDER
    }

    public class ConfirmPaymentRequest
    {
        /// <summary>Order or Subscription to link after payment SUCCESS</summary>
        public Guid? LinkedEntityId { get; set; }
    }

    // --- Membership DTOs ---
    public class SubscribeRequest
    {
        public Guid UserId { get; set; }
        public int PlanId { get; set; }
        public Guid? PaymentId { get; set; }
    }

    // --- Feedback DTOs ---
    public class CreateFeedbackRequest
    {
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Message { get; set; } = null!;
    }

    // --- RecipeSubmission DTOs ---
    public class CreateSubmissionRequest
    {
        public Guid? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Ingredients { get; set; }
        public string? Steps { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class ReviewSubmissionRequest
    {
        public Guid AdminUserId { get; set; }
        public bool Approve { get; set; }
        public decimal? PrizeMoney { get; set; }
        public string? CertificateUrl { get; set; }
    }

    // =========================================================================
    // RESPONSE DTOs
    // =========================================================================

    public class LoginResponse
    {
        public string Token { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresInSeconds { get; set; } = 28800; // 8 hours
        public UserInfo User { get; set; } = null!;
    }

    public class UserInfo
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string Role { get; set; } = null!;
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> Ok(T data, string? message = null)
            => new() { Success = true, Data = data, Message = message };

        public static ApiResponse<T> Fail(string message)
            => new() { Success = false, Message = message };
    }

    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse OkEmpty(string? message = null)
            => new() { Success = true, Message = message };

        public static new ApiResponse Fail(string message)
            => new() { Success = false, Message = message };
    }
}
