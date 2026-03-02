// =============================================================================
// Program.cs — Azure Functions v4 + .NET 10
// Wires all services and repository via Dependency Injection
// =============================================================================

using IScream.Data;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Azure.Functions.Worker.Extensions.OpenApi.Extensions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Abstractions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Configurations;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Microsoft.Data.SqlClient;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// ── OpenAPI / Swagger ─────────────────────────────────────────────────────────
builder.Services.AddSingleton<IOpenApiConfigurationOptions>(_ =>
{
    var options = new OpenApiConfigurationOptions
    {
        Info = new OpenApiInfo
        {
            Version = "1.0.0",
            Title = "IScream API",
            Description = "IScream Ice Cream Shop — Azure Functions API"
        },
        Servers = DefaultOpenApiConfigurationOptions.GetHostNames(),
        OpenApiVersion = OpenApiVersionType.V3,
        ForceHttps = false,
        ForceHttp = false
    };
    return options;
});

// ── App Insights ──────────────────────────────────────────────────────────────
builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

// ── Repository (ADO.NET — Singleton for connection string reuse) ──────────────
var connectionString = Environment.GetEnvironmentVariable("SqlConnectionString")
    ?? throw new InvalidOperationException("SqlConnectionString is required.");

var raw = Environment.GetEnvironmentVariable("SqlConnectionString");

if (string.IsNullOrWhiteSpace(raw))
{
    Console.WriteLine("❌ SqlConnectionString is NULL");
}
else
{
    var cs = new SqlConnectionStringBuilder(raw);

    Console.WriteLine("=== CONNECTION DEBUG ===");
    Console.WriteLine($"Server: {cs.DataSource}");
    Console.WriteLine($"Database: {cs.InitialCatalog}");
    Console.WriteLine($"User: {cs.UserID}");
    Console.WriteLine("========================");
}
builder.Services.AddAppRepository(connectionString);

// ── Services (Scoped — fresh instance per request) ────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IMembershipService, MembershipService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IRecipeSubmissionService, RecipeSubmissionService>();

builder.Build().Run();
