// =============================================================================
// Program.cs — Azure Functions v4 + .NET 10
// Wires all services and repository via Dependency Injection
// =============================================================================

using IScream.Data;
using IScream.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// ── App Insights ──────────────────────────────────────────────────────────────
builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

// ── Repository (ADO.NET — Singleton for connection string reuse) ──────────────
var connectionString = Environment.GetEnvironmentVariable("SqlConnectionString")
    ?? throw new InvalidOperationException("SqlConnectionString is required.");

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
