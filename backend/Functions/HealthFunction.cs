// =============================================================================
// HealthFunction — GET /api/health
// =============================================================================
#nullable enable

using IScream.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.OpenApi.Models;
using System.Net;

namespace IScream.Functions
{
    public class HealthFunction
    {
        [Function("Health_Check")]
        [OpenApiOperation(operationId: "Health_Check", tags: new[] { "Health" }, Summary = "Health check", Description = "Returns the current health status and server timestamp. No authentication required.")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Service is healthy")]
        public async Task<HttpResponseData> Check(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequestData req)
        {
            var payload = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow
            };
            return await FunctionHelper.Ok(req, payload);
        }
    }
}
