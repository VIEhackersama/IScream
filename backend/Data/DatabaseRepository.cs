///=====================================================================
/// Database Access Layer - SQL Server Helper
/// Dùng ADO.NET hoặc Entity Framework Core
/// =====================================================================

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace IScream.Data
{
    /// <summary>
    /// Database configuration
    /// </summary>
    public class DatabaseConfig
    {
        public string ConnectionString { get; set; } = null!;
        public string? ServerName { get; set; }
        public string DatabaseName { get; set; } = "IceCreamRecipeDB";
        public int CommandTimeout { get; set; } = 30;
    }

    /// <summary>
    /// Database repository interface - tất cả database operations đi qua đây
    /// </summary>
    public interface IDatabaseRepository
    {
        // Orders
        Task<long> CreateOrderAsync(long userId, string orderCode, decimal totalAmount, string currency = "VND");
        Task<long> AddOrderItemAsync(long orderId, long productId, int quantity, decimal unitPrice);
        Task<int> MarkPaymentSuccessAsync(long orderId, string provider, decimal amount, string? transactionRef = null);
        Task<int> MarkOrderDeliveredAsync(long orderId, DateTime? deliveredAt = null);

        // Shipments
        Task<long> CreateShipmentAsync(long orderId, string receiverName, string phone, string addressLine, 
            string? ward = null, string? district = null, string? city = null);

        // Products & Recipes
        Task<T> ExecuteScalarAsync<T>(string query, SqlParameter[]? parameters = null);
        Task<DataTable> ExecuteQueryAsync(string query, SqlParameter[]? parameters = null);
        Task<int> ExecuteCommandAsync(string storedProcName, SqlParameter[]? parameters = null);

        // Reviews
        Task<long> CreateReviewAsync(long userId, string targetType, long targetId, int rating, 
            string? content = null, string channel = "IN_APP");

        // UGC
        Task<int> ApproveSubmissionAsync(long submissionId, long recipeProductId, decimal prizeMoney, string certificateUrl);
        Task<int> RejectSubmissionAsync(long submissionId, string? adminNote = null);

        // Product Usage
        Task<int> MarkUsedAsync(long userId, long orderItemId);
    }

    /// <summary>
    /// Implementation with ADO.NET (SQL Server)
    /// </summary>
    public class SqlServerRepository : IDatabaseRepository
    {
        private readonly DatabaseConfig _config;

        public SqlServerRepository(DatabaseConfig config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        #region Database Helpers

        private async Task<T> ExecuteScalarInternalAsync<T>(string query, SqlParameter[]? parameters)
        {
            using (var connection = new SqlConnection(_config.ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = new SqlCommand(query, connection))
                {
                    command.CommandTimeout = _config.CommandTimeout;
                    if (parameters != null)
                        command.Parameters.AddRange(parameters);

                    var result = await command.ExecuteScalarAsync();
                    return result == null || result == DBNull.Value ? default(T)! : (T)Convert.ChangeType(result, typeof(T));
                }
            }
        }

        private async Task<int> ExecuteNonQueryInternalAsync(string query, SqlParameter[]? parameters)
        {
            using (var connection = new SqlConnection(_config.ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = new SqlCommand(query, connection))
                {
                    command.CommandTimeout = _config.CommandTimeout;
                    if (parameters != null)
                        command.Parameters.AddRange(parameters);

                    return await command.ExecuteNonQueryAsync();
                }
            }
        }

        private async Task<DataTable> ExecuteDataTableInternalAsync(string query, SqlParameter[]? parameters)
        {
            var dataTable = new DataTable();
            using (var connection = new SqlConnection(_config.ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = new SqlCommand(query, connection))
                {
                    command.CommandTimeout = _config.CommandTimeout;
                    if (parameters != null)
                        command.Parameters.AddRange(parameters);

                    using (var adapter = new SqlDataAdapter(command))
                    {
                        adapter.Fill(dataTable);
                    }
                }
            }
            return dataTable;
        }

        private async Task<int> ExecuteStoredProcedureAsync(string storedProcName, SqlParameter[]? parameters)
        {
            using (var connection = new SqlConnection(_config.ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = new SqlCommand(storedProcName, connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandTimeout = _config.CommandTimeout;
                    if (parameters != null)
                        command.Parameters.AddRange(parameters);

                    return await command.ExecuteNonQueryAsync();
                }
            }
        }

        #endregion

        #region Orders

        public async Task<long> CreateOrderAsync(long userId, string orderCode, decimal totalAmount, string currency = "VND")
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@OrderCode", orderCode),
                new SqlParameter("@TotalAmount", totalAmount),
                new SqlParameter("@Currency", currency)
            };

            var result = await ExecuteScalarInternalAsync<long>("sales.sp_CreateOrder", parameters);
            return result;
        }

        public async Task<long> AddOrderItemAsync(long orderId, long productId, int quantity, decimal unitPrice)
        {
            var parameters = new[]
            {
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@ProductId", productId),
                new SqlParameter("@Qty", quantity),
                new SqlParameter("@UnitPrice", unitPrice)
            };

            var result = await ExecuteScalarInternalAsync<long>("sales.sp_AddOrderItem", parameters);
            return result;
        }

        public async Task<int> MarkPaymentSuccessAsync(long orderId, string provider, decimal amount, string transactionRef = null)
        {
            var parameters = new[]
            {
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@Provider", provider),
                new SqlParameter("@Amount", amount),
                new SqlParameter("@TransactionRef", (object)transactionRef ?? DBNull.Value)
            };

            return await ExecuteStoredProcedureAsync("sales.sp_MarkPaymentSuccess", parameters);
        }

        public async Task<int> MarkOrderDeliveredAsync(long orderId, DateTime? deliveredAt = null)
        {
            var parameters = new[]
            {
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@DeliveredAt", (object)deliveredAt ?? DBNull.Value)
            };

            return await ExecuteStoredProcedureAsync("sales.sp_MarkOrderDelivered", parameters);
        }

        #endregion

        #region Shipments

        public async Task<long> CreateShipmentAsync(long orderId, string receiverName, string phone, string addressLine,
            string ward = null, string district = null, string city = null)
        {
            var parameters = new[]
            {
                new SqlParameter("@OrderId", orderId),
                new SqlParameter("@ReceiverName", receiverName),
                new SqlParameter("@Phone", phone),
                new SqlParameter("@AddressLine", addressLine),
                new SqlParameter("@Ward", (object)ward ?? DBNull.Value),
                new SqlParameter("@District", (object)district ?? DBNull.Value),
                new SqlParameter("@City", (object)city ?? DBNull.Value)
            };

            return await ExecuteScalarInternalAsync<long>("sales.sp_CreateShipment", parameters);
        }

        #endregion

        #region Reviews

        public async Task<long> CreateReviewAsync(long userId, string targetType, long targetId, int rating,
            string content = null, string channel = "IN_APP")
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@TargetType", targetType),
                new SqlParameter("@TargetId", targetId),
                new SqlParameter("@Rating", rating),
                new SqlParameter("@Content", (object)content ?? DBNull.Value),
                new SqlParameter("@Channel", channel)
            };

            return await ExecuteScalarInternalAsync<long>("content.sp_CreateReview", parameters);
        }

        #endregion

        #region UGC

        public async Task<int> ApproveSubmissionAsync(long submissionId, long recipeProductId, decimal prizeMoney, string certificateUrl)
        {
            var parameters = new[]
            {
                new SqlParameter("@SubmissionId", submissionId),
                new SqlParameter("@RecipeProductId", recipeProductId),
                new SqlParameter("@PrizeMoney", prizeMoney),
                new SqlParameter("@CertificateUrl", certificateUrl)
            };

            return await ExecuteStoredProcedureAsync("ugc.sp_ApproveSubmission", parameters);
        }

        public async Task<int> RejectSubmissionAsync(long submissionId, string adminNote = null)
        {
            var parameters = new[]
            {
                new SqlParameter("@SubmissionId", submissionId),
                new SqlParameter("@AdminNote", (object)adminNote ?? DBNull.Value)
            };

            return await ExecuteStoredProcedureAsync("ugc.sp_RejectSubmission", parameters);
        }

        #endregion

        #region Products & Recipes

        public async Task<T> ExecuteScalarAsync<T>(string query, SqlParameter[] parameters = null)
        {
            return await ExecuteScalarInternalAsync<T>(query, parameters);
        }

        public async Task<DataTable> ExecuteQueryAsync(string query, SqlParameter[] parameters = null)
        {
            return await ExecuteDataTableInternalAsync(query, parameters);
        }

        public async Task<int> ExecuteCommandAsync(string storedProcName, SqlParameter[] parameters = null)
        {
            return await ExecuteStoredProcedureAsync(storedProcName, parameters);
        }

        #endregion

        #region Product Usage

        public async Task<int> MarkUsedAsync(long userId, long orderItemId)
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@OrderItemId", orderItemId)
            };

            return await ExecuteStoredProcedureAsync("sales.sp_MarkUsed", parameters);
        }

        #endregion
    }

    /// <summary>
    /// Extension methods cho dependency injection
    /// Dùng trong Program.cs nếu dùng .NET 6+
    /// </summary>
    public static class DatabaseExtensions
    {
        public static void AddDatabaseRepository(this IServiceCollection services, string connectionString)
        {
            var config = new DatabaseConfig
            {
                ConnectionString = connectionString,
                DatabaseName = "IceCreamRecipeDB"
            };

            services.AddSingleton(config);
            services.AddTransient<IDatabaseRepository, SqlServerRepository>();
        }
    }
}
