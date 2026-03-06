// =============================================================================
// IScream — Repository Interface
// Composite interface grouping all domain-specific repository contracts
// =============================================================================
#nullable enable

using IScream.Models;

namespace IScream.Data
{
    // =========================================================================
    // DOMAIN-SPECIFIC INTERFACES
    // =========================================================================

    public interface IAuthRepository
    {
        Task<AppUser?> FindUserByUsernameAsync(string username);
        Task<AppUser?> FindUserByEmailAsync(string email);
        Task<AppUser?> GetUserByIdAsync(Guid id);
        Task<Guid> CreateUserAsync(AppUser user);
        Task<bool> UpdateUserProfileAsync(Guid id, string? fullName, string? email);
        Task<bool> UpdatePasswordHashAsync(Guid id, string newPasswordHash);
        Task<bool> SetUserActiveAsync(Guid id, bool isActive);
        Task<List<AppUser>> ListUsersAsync(int page, int pageSize);
        Task<int> CountUsersAsync();
    }

    public interface IRecipeRepository
    {
        Task<List<Recipe>> ListRecipesAsync(bool? isActive, int page, int pageSize);
        Task<int> CountRecipesAsync(bool? isActive);
        Task<Recipe?> GetRecipeByIdAsync(Guid id);
        Task<Guid> CreateRecipeAsync(Recipe recipe);
        Task<bool> UpdateRecipeAsync(Recipe recipe);
        Task<bool> DeleteRecipeAsync(Guid id);
    }

    public interface IItemRepository
    {
        Task<List<Item>> ListItemsAsync(string? search, int page, int pageSize);
        Task<int> CountItemsAsync(string? search);
        Task<Item?> GetItemByIdAsync(Guid id);
        Task<Guid> CreateItemAsync(Item item);
        Task<bool> UpdateItemAsync(Item item);
        Task<bool> AdjustStockAsync(Guid itemId, int delta);
        Task<bool> SoftDeleteItemAsync(Guid id);
    }

    public interface IOrderRepository
    {
        Task<Guid> CreateItemOrderAsync(ItemOrder order);
        Task<ItemOrder?> GetOrderByIdAsync(Guid id);
        Task<ItemOrder?> GetOrderByNoAndEmailAsync(string orderNo, string email);
        Task<List<ItemOrder>> ListOrdersAsync(string? status, int page, int pageSize);
        Task<int> CountOrdersAsync(string? status);
        Task<bool> UpdateOrderStatusAsync(Guid id, string status, Guid? paymentId = null);
        Task<bool> OrderNoExistsAsync(string orderNo);
    }

    public interface IPaymentRepository
    {
        Task<Guid> CreatePaymentAsync(Payment payment);
        Task<Payment?> GetPaymentByIdAsync(Guid id);
        Task<bool> ConfirmPaymentAsync(Guid id);
        Task<bool> FailPaymentAsync(Guid id);
        Task<bool> UpdatePaymentMetaAsync(Guid id, string metaJson);
        Task<List<Payment>> ListPaymentsAsync(Guid? userId, string? status, int page, int pageSize);
        Task<int> CountPaymentsAsync(Guid? userId, string? status);
    }

    public interface IMembershipRepository
    {
        Task<List<MembershipPlan>> ListPlansAsync();
        Task<List<MembershipPlan>> ListAllPlansAsync();
        Task<MembershipPlan?> GetPlanByIdAsync(int id);
        Task<MembershipPlan?> GetPlanByIdAdminAsync(int id);
        Task<int> CreatePlanAsync(MembershipPlan plan);
        Task<bool> UpdatePlanAsync(MembershipPlan plan);
        Task<Guid> CreateSubscriptionAsync(MembershipSubscription sub);
        Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId);
        Task<List<MembershipSubscription>> ListSubscriptionsAsync(Guid userId);
        Task<bool> UpdateSubscriptionStatusAsync(Guid id, string status, Guid? paymentId = null);
        Task<bool> CancelSubscriptionAsync(Guid id, Guid userId);
        Task<(List<AppUser> users, int total)> ListActiveMembersAsync(int page, int pageSize);
    }

    public interface IFeedbackRepository
    {
        Task<Guid> CreateFeedbackAsync(Feedback fb);
        Task<Feedback?> GetFeedbackByIdAsync(Guid id);
        Task<List<Feedback>> ListFeedbacksAsync(int page, int pageSize);
        Task<int> CountFeedbacksAsync();
        Task<bool> MarkFeedbackReadAsync(Guid id);
    }

    public interface ISubmissionRepository
    {
        Task<Guid> CreateSubmissionAsync(RecipeSubmission sub);
        Task<RecipeSubmission?> GetSubmissionByIdAsync(Guid id);
        Task<List<RecipeSubmission>> ListSubmissionsAsync(string? status, int page, int pageSize);
        Task<int> CountSubmissionsAsync(string? status);
        Task<bool> ReviewSubmissionAsync(Guid id, bool approve, Guid adminUserId,
            decimal? prizeMoney, string? certUrl, string? reviewNote);
    }

    // =========================================================================
    // COMPOSITE INTERFACE
    // =========================================================================
    public interface IAppRepository :
        IAuthRepository,
        IRecipeRepository,
        IItemRepository,
        IOrderRepository,
        IPaymentRepository,
        IMembershipRepository,
        IFeedbackRepository,
        ISubmissionRepository
    {
    }
}
