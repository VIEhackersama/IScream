// =============================================================================
// Shared Helper — Extract JWT claims from HttpRequestData + HTTP response helpers
// =============================================================================
#nullable enable

using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;
using IScream.Models;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace IScream.Functions
{
    internal static class FunctionHelper
    {
        private static readonly string JwtSecret =
            Environment.GetEnvironmentVariable("JwtSecretKey") ?? "CHANGE_ME_32_CHARS_MIN_SECRET!!";
        private static readonly string JwtIssuer =
            Environment.GetEnvironmentVariable("JwtIssuer") ?? "iscream-api";
        private static readonly string JwtAudience =
            Environment.GetEnvironmentVariable("JwtAudience") ?? "iscream-client";

        /// <summary>
        /// Validates Bearer token and returns (userId, role), or null if invalid/missing.
        /// </summary>
        internal static (Guid userId, string role)? ExtractAuthClaims(HttpRequestData req)
        {
            if (!req.Headers.TryGetValues("Authorization", out var values))
                return null;

            var bearer = values.FirstOrDefault();
            if (string.IsNullOrWhiteSpace(bearer) || !bearer.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return null;

            var token = bearer["Bearer ".Length..].Trim();
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = JwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = JwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1)
                }, out _);

                var sub = principal.FindFirst("sub")?.Value
                        ?? principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var role = principal.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "USER";

                if (sub == null || !Guid.TryParse(sub, out var userId)) return null;
                return (userId, role);
            }
            catch { return null; }
        }

        // ── Typed HTTP helpers ────────────────────────────────────────────────

        internal static async Task<HttpResponseData> Unauthorized(HttpRequestData req, string msg = "Unauthorized")
        {
            var r = req.CreateResponse(HttpStatusCode.Unauthorized);
            await r.WriteAsJsonAsync(ApiResponse.Fail(msg));
            return r;
        }

        internal static async Task<HttpResponseData> Forbidden(HttpRequestData req)
        {
            var r = req.CreateResponse(HttpStatusCode.Forbidden);
            await r.WriteAsJsonAsync(ApiResponse.Fail("Bạn không có quyền truy cập."));
            return r;
        }

        internal static async Task<HttpResponseData> NotFound(HttpRequestData req, string msg)
        {
            var r = req.CreateResponse(HttpStatusCode.NotFound);
            await r.WriteAsJsonAsync(ApiResponse.Fail(msg));
            return r;
        }

        internal static async Task<HttpResponseData> BadRequest(HttpRequestData req, string msg)
        {
            var r = req.CreateResponse(HttpStatusCode.BadRequest);
            await r.WriteAsJsonAsync(ApiResponse.Fail(msg));
            return r;
        }

        internal static async Task<HttpResponseData> Ok<T>(HttpRequestData req, T data, string? msg = null)
        {
            var r = req.CreateResponse(HttpStatusCode.OK);
            await r.WriteAsJsonAsync(ApiResponse<T>.Ok(data, msg));
            return r;
        }

        internal static async Task<HttpResponseData> Created<T>(HttpRequestData req, T data, string? msg = null)
        {
            var r = req.CreateResponse(HttpStatusCode.Created);
            await r.WriteAsJsonAsync(ApiResponse<T>.Ok(data, msg));
            return r;
        }

        internal static async Task<HttpResponseData> OkMessage(HttpRequestData req, string msg)
        {
            var r = req.CreateResponse(HttpStatusCode.OK);
            await r.WriteAsJsonAsync(ApiResponse.OkEmpty(msg));
            return r;
        }

        internal static async Task<HttpResponseData> ServerError(
            HttpRequestData req, Exception ex, ILogger logger, string context)
        {
            logger.LogError(ex, "[{Context}] Unhandled exception", context);
            var r = req.CreateResponse(HttpStatusCode.InternalServerError);
            await r.WriteAsJsonAsync(ApiResponse.Fail("Lỗi hệ thống. Vui lòng thử lại."));
            return r;
        }
    }
}
