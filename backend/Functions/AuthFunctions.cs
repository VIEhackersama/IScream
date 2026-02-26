// =============================================================================
// AuthFunctions — POST /api/auth/register, POST /api/auth/login
// =============================================================================
#nullable enable

using System.Net;
using IScream.Models;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
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
    }
}
