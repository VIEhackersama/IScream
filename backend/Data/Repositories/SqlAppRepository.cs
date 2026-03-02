// =============================================================================
// IScream — SqlAppRepository (Base)
// Generic ADO.NET helpers shared by all domain-specific partial classes
// =============================================================================
#nullable enable

using System.Data;
using Microsoft.Data.SqlClient;

namespace IScream.Data
{
    public partial class SqlAppRepository : IAppRepository
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
    }
}
