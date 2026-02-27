// =============================================================================
// IScream — Database Repository (ADO.NET)
// Schema: public_data (Azure SQL)
// Pattern: Repository with typed row mappers + generic helpers
// =============================================================================
#nullable enable

using System.Data;
using IScream.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;

namespace IScream.Data
{
    // =========================================================================
    // INTERFACE
    // =========================================================================
    public interface IAppRepository
    {
        // Auth / Users
        Task<AppUser?> FindUserByUsernameAsync(string username);
        Task<AppUser?> FindUserByEmailAsync(string email);
        Task<AppUser?> GetUserByIdAsync(Guid id);
        Task<Guid> CreateUserAsync(AppUser user);
        Task<bool> UpdateUserProfileAsync(Guid id, string? fullName, string? email);
        Task<bool> SetUserActiveAsync(Guid id, bool isActive);
        Task<List<AppUser>> ListUsersAsync(int page, int pageSize);
        Task<int> CountUsersAsync();

        // Recipes
        Task<List<Recipe>> ListRecipesAsync(bool? isActive, int page, int pageSize);
        Task<int> CountRecipesAsync(bool? isActive);
        Task<Recipe?> GetRecipeByIdAsync(Guid id);
        Task<Guid> CreateRecipeAsync(Recipe recipe);
        Task<bool> UpdateRecipeAsync(Recipe recipe);
        Task<bool> DeleteRecipeAsync(Guid id);

        // Items
        Task<List<Item>> ListItemsAsync(string? search, int page, int pageSize);
        Task<int> CountItemsAsync(string? search);
        Task<Item?> GetItemByIdAsync(Guid id);
        Task<Guid> CreateItemAsync(Item item);
        Task<bool> UpdateItemAsync(Item item);
        Task<bool> AdjustStockAsync(Guid itemId, int delta); // negative = deduct

        // Orders
        Task<Guid> CreateItemOrderAsync(ItemOrder order);
        Task<ItemOrder?> GetOrderByIdAsync(Guid id);
        Task<List<ItemOrder>> ListOrdersAsync(string? status, int page, int pageSize);
        Task<int> CountOrdersAsync(string? status);
        Task<bool> UpdateOrderStatusAsync(Guid id, string status, Guid? paymentId = null);
        Task<bool> OrderNoExistsAsync(string orderNo);

        // Payments
        Task<Guid> CreatePaymentAsync(Payment payment);
        Task<Payment?> GetPaymentByIdAsync(Guid id);
        Task<bool> ConfirmPaymentAsync(Guid id); // sets Status = SUCCESS

        // Membership Plans
        Task<List<MembershipPlan>> ListPlansAsync();
        Task<MembershipPlan?> GetPlanByIdAsync(int id);

        // Membership Subscriptions
        Task<Guid> CreateSubscriptionAsync(MembershipSubscription sub);
        Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId);
        Task<List<MembershipSubscription>> ListSubscriptionsAsync(Guid userId);

        // Feedback
        Task<Guid> CreateFeedbackAsync(Feedback fb);
        Task<List<Feedback>> ListFeedbacksAsync(int page, int pageSize);
        Task<int> CountFeedbacksAsync();

        // Recipe Submissions
        Task<Guid> CreateSubmissionAsync(RecipeSubmission sub);
        Task<RecipeSubmission?> GetSubmissionByIdAsync(Guid id);
        Task<List<RecipeSubmission>> ListSubmissionsAsync(string? status, int page, int pageSize);
        Task<int> CountSubmissionsAsync(string? status);
        Task<bool> ReviewSubmissionAsync(Guid id, bool approve, Guid adminUserId,
            decimal? prizeMoney, string? certUrl);
    }

    // =========================================================================
    // IMPLEMENTATION
    // =========================================================================
    public class SqlAppRepository : IAppRepository
    {
        private readonly string _connStr;
        private const int DefaultTimeout = 30;

        public SqlAppRepository(string connectionString)
        {
            _connStr = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        // -----------------------------------------------------------------
        // Generic helpers
        // -----------------------------------------------------------------
        private SqlConnection OpenConn() => new(_connStr);

        private static SqlParameter P(string name, object? value)
            => new(name, value ?? DBNull.Value);

        private static Guid ReadGuid(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? Guid.Empty : (Guid)r[col];

        private static Guid? ReadNullGuid(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? null : (Guid)r[col];

        private static DateTime ReadDateTime(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? DateTime.UtcNow : Convert.ToDateTime(r[col]);

        private static DateTime? ReadNullDateTime(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? null : Convert.ToDateTime(r[col]);

        private static string? ReadNullString(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? null : r[col].ToString();

        private static decimal ReadDecimal(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? 0m : Convert.ToDecimal(r[col]);

        private static decimal? ReadNullDecimal(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? null : Convert.ToDecimal(r[col]);

        private static int ReadInt(SqlDataReader r, string col)
            => r[col] == DBNull.Value ? 0 : Convert.ToInt32(r[col]);

        private static bool ReadBool(SqlDataReader r, string col)
            => r[col] != DBNull.Value && Convert.ToBoolean(r[col]);

        private async Task<List<T>> QueryAsync<T>(string sql, SqlParameter[]? parms, Func<SqlDataReader, T> map,
            CommandType cmdType = CommandType.Text)
        {
            var result = new List<T>();
            await using var conn = OpenConn();
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn) { CommandTimeout = DefaultTimeout, CommandType = cmdType };
            if (parms != null) cmd.Parameters.AddRange(parms);
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync()) result.Add(map(r));
            return result;
        }

        private async Task<T?> QueryFirstAsync<T>(string sql, SqlParameter[]? parms, Func<SqlDataReader, T> map,
            CommandType cmdType = CommandType.Text) where T : class
        {
            await using var conn = OpenConn();
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn) { CommandTimeout = DefaultTimeout, CommandType = cmdType };
            if (parms != null) cmd.Parameters.AddRange(parms);
            await using var r = await cmd.ExecuteReaderAsync();
            return await r.ReadAsync() ? map(r) : null;
        }

        private async Task<int> ExecuteAsync(string sql, SqlParameter[]? parms,
            CommandType cmdType = CommandType.Text)
        {
            await using var conn = OpenConn();
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn) { CommandTimeout = DefaultTimeout, CommandType = cmdType };
            if (parms != null) cmd.Parameters.AddRange(parms);
            return await cmd.ExecuteNonQueryAsync();
        }

        private async Task<TVal?> ExecuteScalarAsync<TVal>(string sql, SqlParameter[]? parms,
            CommandType cmdType = CommandType.Text)
        {
            await using var conn = OpenConn();
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn) { CommandTimeout = DefaultTimeout, CommandType = cmdType };
            if (parms != null) cmd.Parameters.AddRange(parms);
            var raw = await cmd.ExecuteScalarAsync();
            if (raw == null || raw == DBNull.Value) return default;
            return (TVal)Convert.ChangeType(raw, typeof(TVal));
        }

        // -----------------------------------------------------------------
        // ROW MAPPERS
        // -----------------------------------------------------------------
        private static AppUser MapUser(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            Username = r["Username"].ToString()!,
            Email = ReadNullString(r, "Email"),
            PasswordHash = r["PasswordHash"].ToString()!,
            FullName = ReadNullString(r, "FullName"),
            Role = r["Role"].ToString()!,
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            IsActive = ReadBool(r, "IsActive")
        };

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

        private static ItemOrder MapOrder(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            OrderNo = r["OrderNo"].ToString()!,
            CustomerName = r["CustomerName"].ToString()!,
            Email = ReadNullString(r, "Email"),
            Phone = ReadNullString(r, "Phone"),
            Address = ReadNullString(r, "Address"),
            ItemId = ReadGuid(r, "ItemId"),
            Quantity = ReadInt(r, "Quantity"),
            UnitPrice = ReadDecimal(r, "UnitPrice"),
            TotalCost = ReadDecimal(r, "TotalCost"),
            PaymentId = ReadNullGuid(r, "PaymentId"),
            Status = r["Status"].ToString()!,
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            UpdatedAt = ReadDateTime(r, "UpdatedAt"),
            ItemTitle = ReadNullString(r, "ItemTitle"),
            ItemImageUrl = ReadNullString(r, "ItemImageUrl")
        };

        private static Payment MapPayment(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadNullGuid(r, "UserId"),
            Amount = ReadDecimal(r, "Amount"),
            Currency = r["Currency"].ToString()!,
            Type = r["Type"].ToString()!,
            Status = r["Status"].ToString()!,
            CreatedAt = ReadDateTime(r, "CreatedAt")
        };

        private static MembershipPlan MapPlan(SqlDataReader r) => new()
        {
            Id = ReadInt(r, "Id"),
            Code = r["Code"].ToString()!,
            Price = ReadDecimal(r, "Price"),
            Currency = r["Currency"].ToString()!,
            DurationDays = ReadInt(r, "DurationDays"),
            IsActive = ReadBool(r, "IsActive")
        };

        private static MembershipSubscription MapSubscription(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadGuid(r, "UserId"),
            PlanId = ReadInt(r, "PlanId"),
            PaymentId = ReadNullGuid(r, "PaymentId"),
            StartDate = ReadDateTime(r, "StartDate"),
            EndDate = ReadDateTime(r, "EndDate"),
            Status = r["Status"].ToString()!,
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            PlanCode = ReadNullString(r, "PlanCode"),
            PlanPrice = ReadNullDecimal(r, "PlanPrice")
        };

        private static Feedback MapFeedback(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadNullGuid(r, "UserId"),
            Name = ReadNullString(r, "Name"),
            Email = ReadNullString(r, "Email"),
            Message = r["Message"].ToString()!,
            IsRegisteredUser = ReadBool(r, "IsRegisteredUser"),
            CreatedAt = ReadDateTime(r, "CreatedAt")
        };

        private static RecipeSubmission MapSubmission(SqlDataReader r) => new()
        {
            Id = ReadGuid(r, "Id"),
            UserId = ReadNullGuid(r, "UserId"),
            Name = ReadNullString(r, "Name"),
            Email = ReadNullString(r, "Email"),
            Title = r["Title"].ToString()!,
            Description = ReadNullString(r, "Description"),
            Ingredients = ReadNullString(r, "Ingredients"),
            Steps = ReadNullString(r, "Steps"),
            ImageUrl = ReadNullString(r, "ImageUrl"),
            Status = r["Status"].ToString()!,
            PrizeMoney = ReadNullDecimal(r, "PrizeMoney"),
            CertificateUrl = ReadNullString(r, "CertificateUrl"),
            ReviewedByUserId = ReadNullGuid(r, "ReviewedByUserId"),
            CreatedAt = ReadDateTime(r, "CreatedAt"),
            ReviewedAt = ReadNullDateTime(r, "ReviewedAt")
        };

        // =================================================================
        // AUTH / USERS
        // =================================================================
        public Task<AppUser?> FindUserByUsernameAsync(string username)
            => QueryFirstAsync(
                "SELECT * FROM public_data.USERS WHERE Username = @Username",
                [P("@Username", username)], MapUser);

        public Task<AppUser?> FindUserByEmailAsync(string email)
            => QueryFirstAsync(
                "SELECT * FROM public_data.USERS WHERE Email = @Email",
                [P("@Email", email)], MapUser);

        public Task<AppUser?> GetUserByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.USERS WHERE Id = @Id",
                [P("@Id", id)], MapUser);

        public async Task<Guid> CreateUserAsync(AppUser user)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.USERS (Id, Username, Email, PasswordHash, FullName, Role, IsActive)
                VALUES (@Id, @Username, @Email, @PasswordHash, @FullName, @Role, 1)
                """,
                [P("@Id", newId), P("@Username", user.Username), P("@Email", user.Email),
                 P("@PasswordHash", user.PasswordHash), P("@FullName", user.FullName),
                 P("@Role", user.Role)]);
            return newId;
        }

        public async Task<bool> UpdateUserProfileAsync(Guid id, string? fullName, string? email)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.USERS SET FullName = @FullName, Email = @Email
                WHERE Id = @Id
                """,
                [P("@Id", id), P("@FullName", fullName), P("@Email", email)]);
            return rows > 0;
        }

        public async Task<bool> SetUserActiveAsync(Guid id, bool isActive)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.USERS SET IsActive = @IsActive WHERE Id = @Id",
                [P("@Id", id), P("@IsActive", isActive)]);
            return rows > 0;
        }

        public Task<List<AppUser>> ListUsersAsync(int page, int pageSize)
            => QueryAsync("""
                SELECT * FROM public_data.USERS
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """,
                [P("@Skip", (page - 1) * pageSize), P("@Take", pageSize)], MapUser);

        public async Task<int> CountUsersAsync()
            => await ExecuteScalarAsync<int?>("SELECT COUNT(1) FROM public_data.USERS", null) ?? 0;

        // =================================================================
        // RECIPES
        // =================================================================
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

        // =================================================================
        // ITEMS
        // =================================================================
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

        // =================================================================
        // ORDERS
        // =================================================================
        public async Task<Guid> CreateItemOrderAsync(ItemOrder order)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.ITEM_ORDERS
                    (Id, OrderNo, CustomerName, Email, Phone, Address,
                     ItemId, Quantity, UnitPrice, PaymentId, Status)
                VALUES (@Id, @OrderNo, @CustomerName, @Email, @Phone, @Address,
                        @ItemId, @Quantity, @UnitPrice, @PaymentId, @Status)
                """,
                [P("@Id", newId), P("@OrderNo", order.OrderNo), P("@CustomerName", order.CustomerName),
                 P("@Email", order.Email), P("@Phone", order.Phone), P("@Address", order.Address),
                 P("@ItemId", order.ItemId), P("@Quantity", order.Quantity), P("@UnitPrice", order.UnitPrice),
                 P("@PaymentId", order.PaymentId), P("@Status", order.Status)]);
            return newId;
        }

        public Task<ItemOrder?> GetOrderByIdAsync(Guid id)
            => QueryFirstAsync("""
                SELECT o.*, i.Title AS ItemTitle, i.ImageUrl AS ItemImageUrl
                FROM public_data.ITEM_ORDERS o
                JOIN public_data.ITEMS i ON i.Id = o.ItemId
                WHERE o.Id = @Id
                """,
                [P("@Id", id)], MapOrder);

        public Task<List<ItemOrder>> ListOrdersAsync(string? status, int page, int pageSize)
        {
            var where = string.IsNullOrEmpty(status) ? "" : "WHERE o.Status = @Status";
            var parms = string.IsNullOrEmpty(status)
                ? new[] { P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) }
                : new[] { P("@Status", status), P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) };
            return QueryAsync($"""
                SELECT o.*, i.Title AS ItemTitle, i.ImageUrl AS ItemImageUrl
                FROM public_data.ITEM_ORDERS o
                JOIN public_data.ITEMS i ON i.Id = o.ItemId {where}
                ORDER BY o.CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """, parms, MapOrder);
        }

        public async Task<int> CountOrdersAsync(string? status)
        {
            var where = string.IsNullOrEmpty(status) ? "" : "WHERE Status = @Status";
            var parms = string.IsNullOrEmpty(status) ? null : new[] { P("@Status", status) };
            return await ExecuteScalarAsync<int?>($"SELECT COUNT(1) FROM public_data.ITEM_ORDERS {where}", parms) ?? 0;
        }

        public async Task<bool> UpdateOrderStatusAsync(Guid id, string status, Guid? paymentId = null)
        {
            var rows = await ExecuteAsync("""
                UPDATE public_data.ITEM_ORDERS
                SET Status = @Status, PaymentId = COALESCE(@PaymentId, PaymentId)
                WHERE Id = @Id
                """,
                [P("@Id", id), P("@Status", status), P("@PaymentId", paymentId)]);
            return rows > 0;
        }

        public async Task<bool> OrderNoExistsAsync(string orderNo)
        {
            var count = await ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM public_data.ITEM_ORDERS WHERE OrderNo = @OrderNo",
                [P("@OrderNo", orderNo)]);
            return count > 0;
        }

        // =================================================================
        // PAYMENTS
        // =================================================================
        public async Task<Guid> CreatePaymentAsync(Payment payment)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.PAYMENTS (Id, UserId, Amount, Currency, Type, Status)
                VALUES (@Id, @UserId, @Amount, @Currency, @Type, 'INIT')
                """,
                [P("@Id", newId), P("@UserId", payment.UserId), P("@Amount", payment.Amount),
                 P("@Currency", payment.Currency), P("@Type", payment.Type)]);
            return newId;
        }

        public Task<Payment?> GetPaymentByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.PAYMENTS WHERE Id = @Id",
                [P("@Id", id)], MapPayment);

        public async Task<bool> ConfirmPaymentAsync(Guid id)
        {
            var rows = await ExecuteAsync(
                "UPDATE public_data.PAYMENTS SET Status = 'SUCCESS' WHERE Id = @Id AND Status = 'INIT'",
                [P("@Id", id)]);
            return rows > 0;
        }

        // =================================================================
        // MEMBERSHIP PLANS
        // =================================================================
        public Task<List<MembershipPlan>> ListPlansAsync()
            => QueryAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS WHERE IsActive = 1 ORDER BY Price",
                null, MapPlan);

        public Task<MembershipPlan?> GetPlanByIdAsync(int id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.MEMBERSHIP_PLANS WHERE Id = @Id AND IsActive = 1",
                [P("@Id", id)], MapPlan);

        // =================================================================
        // MEMBERSHIP SUBSCRIPTIONS
        // =================================================================
        public async Task<Guid> CreateSubscriptionAsync(MembershipSubscription sub)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.MEMBERSHIP_SUBSCRIPTIONS
                    (Id, UserId, PlanId, PaymentId, StartDate, EndDate, Status)
                VALUES (@Id, @UserId, @PlanId, @PaymentId, @StartDate, @EndDate, @Status)
                """,
                [P("@Id", newId), P("@UserId", sub.UserId), P("@PlanId", sub.PlanId),
                 P("@PaymentId", sub.PaymentId), P("@StartDate", sub.StartDate),
                 P("@EndDate", sub.EndDate), P("@Status", sub.Status)]);
            return newId;
        }

        public Task<MembershipSubscription?> GetActiveSubscriptionAsync(Guid userId)
            => QueryFirstAsync("""
                SELECT s.*, p.Code AS PlanCode, p.Price AS PlanPrice
                FROM public_data.MEMBERSHIP_SUBSCRIPTIONS s
                JOIN public_data.MEMBERSHIP_PLANS p ON p.Id = s.PlanId
                WHERE s.UserId = @UserId AND s.Status = 'ACTIVE' AND s.EndDate > SYSDATETIME()
                ORDER BY s.EndDate DESC
                """,
                [P("@UserId", userId)], MapSubscription);

        public Task<List<MembershipSubscription>> ListSubscriptionsAsync(Guid userId)
            => QueryAsync("""
                SELECT s.*, p.Code AS PlanCode, p.Price AS PlanPrice
                FROM public_data.MEMBERSHIP_SUBSCRIPTIONS s
                JOIN public_data.MEMBERSHIP_PLANS p ON p.Id = s.PlanId
                WHERE s.UserId = @UserId
                ORDER BY s.CreatedAt DESC
                """,
                [P("@UserId", userId)], MapSubscription);

        // =================================================================
        // FEEDBACK
        // =================================================================
        public async Task<Guid> CreateFeedbackAsync(Feedback fb)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.FEEDBACKS
                    (Id, UserId, Name, Email, Message, IsRegisteredUser)
                VALUES (@Id, @UserId, @Name, @Email, @Message, @IsRegisteredUser)
                """,
                [P("@Id", newId), P("@UserId", fb.UserId), P("@Name", fb.Name),
                 P("@Email", fb.Email), P("@Message", fb.Message),
                 P("@IsRegisteredUser", fb.IsRegisteredUser)]);
            return newId;
        }

        public Task<List<Feedback>> ListFeedbacksAsync(int page, int pageSize)
            => QueryAsync("""
                SELECT * FROM public_data.FEEDBACKS
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """,
                [P("@Skip", (page - 1) * pageSize), P("@Take", pageSize)], MapFeedback);

        public async Task<int> CountFeedbacksAsync()
            => await ExecuteScalarAsync<int?>("SELECT COUNT(1) FROM public_data.FEEDBACKS", null) ?? 0;

        // =================================================================
        // RECIPE SUBMISSIONS
        // =================================================================
        public async Task<Guid> CreateSubmissionAsync(RecipeSubmission sub)
        {
            var newId = Guid.NewGuid();
            await ExecuteAsync("""
                INSERT INTO public_data.RECIPE_SUBMISSIONS
                    (Id, UserId, Name, Email, Title, [Description], Ingredients, Steps, ImageUrl, Status)
                VALUES (@Id, @UserId, @Name, @Email, @Title, @Description, @Ingredients, @Steps, @ImageUrl, 'PENDING')
                """,
                [P("@Id", newId), P("@UserId", sub.UserId), P("@Name", sub.Name),
                 P("@Email", sub.Email), P("@Title", sub.Title), P("@Description", sub.Description),
                 P("@Ingredients", sub.Ingredients), P("@Steps", sub.Steps), P("@ImageUrl", sub.ImageUrl)]);
            return newId;
        }

        public Task<RecipeSubmission?> GetSubmissionByIdAsync(Guid id)
            => QueryFirstAsync(
                "SELECT * FROM public_data.RECIPE_SUBMISSIONS WHERE Id = @Id",
                [P("@Id", id)], MapSubmission);

        public Task<List<RecipeSubmission>> ListSubmissionsAsync(string? status, int page, int pageSize)
        {
            var where = string.IsNullOrEmpty(status) ? "" : "WHERE Status = @Status";
            var parms = string.IsNullOrEmpty(status)
                ? new[] { P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) }
                : new[] { P("@Status", status), P("@Skip", (page - 1) * pageSize), P("@Take", pageSize) };
            return QueryAsync($"""
                SELECT * FROM public_data.RECIPE_SUBMISSIONS {where}
                ORDER BY CreatedAt DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY
                """, parms, MapSubmission);
        }

        public async Task<int> CountSubmissionsAsync(string? status)
        {
            var where = string.IsNullOrEmpty(status) ? "" : "WHERE Status = @Status";
            var parms = string.IsNullOrEmpty(status) ? null : new[] { P("@Status", status) };
            return await ExecuteScalarAsync<int?>($"SELECT COUNT(1) FROM public_data.RECIPE_SUBMISSIONS {where}", parms) ?? 0;
        }

        public async Task<bool> ReviewSubmissionAsync(Guid id, bool approve, Guid adminUserId,
            decimal? prizeMoney, string? certUrl)
        {
            var status = approve ? "APPROVED" : "REJECTED";
            var rows = await ExecuteAsync("""
                UPDATE public_data.RECIPE_SUBMISSIONS
                SET Status = @Status,
                    ReviewedByUserId = @AdminUserId,
                    ReviewedAt = SYSDATETIME(),
                    PrizeMoney = @PrizeMoney,
                    CertificateUrl = @CertUrl
                WHERE Id = @Id AND Status = 'PENDING'
                """,
                [P("@Id", id), P("@Status", status), P("@AdminUserId", adminUserId),
                 P("@PrizeMoney", prizeMoney), P("@CertUrl", certUrl)]);
            return rows > 0;
        }
    }

    // =========================================================================
    // DI EXTENSION
    // =========================================================================
    public static class RepositoryExtensions
    {
        public static IServiceCollection AddAppRepository(this IServiceCollection services, string connectionString)
        {
            services.AddSingleton<IAppRepository>(_ => new SqlAppRepository(connectionString));
            return services;
        }
    }
}
