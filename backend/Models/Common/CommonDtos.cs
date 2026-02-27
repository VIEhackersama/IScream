#nullable enable

namespace IScream.Models
{
    // --- reusable helper types ---
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