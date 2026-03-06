// =============================================================================
// IScream — Status / Type Constants
// Single source of truth for all status and type string values
// =============================================================================
namespace IScream.Models
{
    public static class PaymentStatus
    {
        public const string Init = "INIT";
        public const string Success = "SUCCESS";
        public const string Failed = "FAILED";
    }

    public static class PaymentType
    {
        public const string Membership = "MEMBERSHIP";
        public const string Order = "ORDER";
    }

    public static class SubscriptionStatus
    {
        public const string Active = "ACTIVE";
        public const string Expired = "EXPIRED";
        public const string Cancelled = "CANCELLED";
    }

    public static class OrderStatus
    {
        public const string Pending = "PENDING";
        public const string Paid = "PAID";
        public const string Shipped = "SHIPPED";
        public const string Delivered = "DELIVERED";
        public const string Completed = "COMPLETED";
        public const string Cancelled = "CANCELLED";
    }

    public static class SubmissionStatus
    {
        public const string Pending = "PENDING";
        public const string Approved = "APPROVED";
        public const string Rejected = "REJECTED";
    }

    public static class UserRole
    {
        public const string User = "USER";
        public const string Admin = "ADMIN";
    }
}
