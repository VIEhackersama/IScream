using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Data.SqlClient;
using System.Net;
namespace IScream.Functions
{
    public class DbPing
    {
        [Function("DbPing")]
        [OpenApiOperation(operationId: "DbPing", tags: new[] { "Azure DB connection test" }, Summary = "Database ping", Description = "Checks connectivity to the SQL database.")]
        [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.OK, Description = "Connected successfully")]
        [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.InternalServerError, Description = "SQL connection failed")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "db/ping")] HttpRequestData req)
        {
            var cs = Environment.GetEnvironmentVariable("SqlConnectionString")!;
            var res = req.CreateResponse(HttpStatusCode.OK);

            try
            {
                await using var conn = new SqlConnection(cs);
                await conn.OpenAsync();

                await res.WriteStringAsync("OK: connected");
                return res;
            }
            catch (SqlException ex)
            {
                res.StatusCode = HttpStatusCode.InternalServerError;
                await res.WriteStringAsync($"SQL ERROR: {ex.Number} / State={ex.State} / Class={ex.Class} / {ex.Message}");
                return res;
            }
        }
    }
}
