// =============================================================================
// AuthFunctions — POST /api/auth/register, POST /api/auth/login
// =============================================================================
#nullable enable

using System.Net;
using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;

namespace IScream.Functions
{
    public class AuthFunctions
    {
        private readonly IAuthService _auth;
        private readonly ILogger<AuthFunctions> _log;

        public AuthFunctions(IAuthService auth, ILogger<AuthFunctions> log)
        {
            _auth = auth;
            _log = log;
        }

        // POST /api/auth/register
        [Function("Auth_Register")]
        [OpenApiOperation(operationId: "Auth_Register", tags: new[] { "Auth" }, Summary = "Register a new user", Description = "Creates a new user account.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(RegisterRequest), Required = true, Description = "Registration payload")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User registered successfully")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        public async Task<HttpResponseData> Register(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/register")] HttpRequestData req)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<RegisterRequest>();
                if (body == null)
                    return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (ok, error, userId) = await _auth.RegisterAsync(body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Created(req, new { userId }, "Đăng ký thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Register)); }
        }

        // POST /api/auth/login
        [Function("Auth_Login")]
        [OpenApiOperation(operationId: "Auth_Login", tags: new[] { "Auth" }, Summary = "Login", Description = "Authenticates a user and returns a JWT token.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(LoginRequest), Required = true, Description = "Login credentials")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<LoginResponse>), Description = "Login successful")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Invalid credentials")]
        public async Task<HttpResponseData> Login(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/login")] HttpRequestData req)
        {
            try
            {
                var body = await req.ReadFromJsonAsync<LoginRequest>();
                if (body == null)
                    return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (ok, error, response) = await _auth.LoginAsync(body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.Ok(req, response, "Đăng nhập thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Login)); }
        }

        // GET /api/auth/me
        [Function("Auth_Me")]
        [OpenApiOperation(operationId: "Auth_Me", tags: new[] { "Auth" }, Summary = "Get current user", Description = "Returns the authenticated user's profile. Requires Bearer token.")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<UserInfo>), Description = "Current user info")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        public async Task<HttpResponseData> Me(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/me")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var (user, error) = await _auth.GetMeAsync(claims.Value.userId);
                if (user == null) return await FunctionHelper.NotFound(req, error);

                return await FunctionHelper.Ok(req, user);
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(Me)); }
        }

        // PUT /api/auth/profile
        [Function("Auth_UpdateProfile")]
        [OpenApiOperation(operationId: "Auth_UpdateProfile", tags: new[] { "Auth" }, Summary = "Update profile", Description = "Updates the authenticated user's profile (FullName, Email). Requires Bearer token.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateProfileRequest), Required = true, Description = "Profile fields to update")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Profile updated")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        public async Task<HttpResponseData> UpdateProfile(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "auth/profile")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var body = await req.ReadFromJsonAsync<UpdateProfileRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (ok, error) = await _auth.UpdateProfileAsync(claims.Value.userId, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Cập nhật hồ sơ thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(UpdateProfile)); }
        }

        // PUT /api/auth/change-password
        [Function("Auth_ChangePassword")]
        [OpenApiOperation(operationId: "Auth_ChangePassword", tags: new[] { "Auth" }, Summary = "Change password", Description = "Changes the authenticated user's password. Requires Bearer token and current password.")]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ChangePasswordRequest), Required = true, Description = "Old and new password")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Password changed")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Validation error (wrong old password, weak new password)")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse), Description = "Missing or invalid token")]
        public async Task<HttpResponseData> ChangePassword(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "auth/change-password")] HttpRequestData req)
        {
            try
            {
                var claims = FunctionHelper.ExtractAuthClaims(req);
                if (claims == null) return await FunctionHelper.Unauthorized(req);

                var body = await req.ReadFromJsonAsync<ChangePasswordRequest>();
                if (body == null) return await FunctionHelper.BadRequest(req, "Body không hợp lệ.");

                var (ok, error) = await _auth.ChangePasswordAsync(claims.Value.userId, body);
                if (!ok) return await FunctionHelper.BadRequest(req, error);

                return await FunctionHelper.OkMessage(req, "Đổi mật khẩu thành công.");
            }
            catch (Exception ex) { return await FunctionHelper.ServerError(req, ex, _log, nameof(ChangePassword)); }
        }
    }
}
