using System.Text.Json.Serialization;
using FurnitureStore.Api.Data;
using FurnitureStore.Api.Domain;
using FurnitureStore.Api.Features.Catalog;
using FurnitureStore.Api.Features.Orders;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<StoreDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Store"),
        npgsql => npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

builder.Services
    .AddIdentityCore<AppUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<StoreDbContext>();

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<CatalogService>();
builder.Services.AddScoped<OrderService>();

// Without a configured provider, checkout refuses orders instead of pretending to take payment.
if (builder.Configuration["Payments:Provider"] == "Development")
{
    builder.Services.AddScoped<IPaymentProvider, DevelopmentPaymentProvider>();
}
else
{
    builder.Services.AddScoped<IPaymentProvider, UnconfiguredPaymentProvider>();
}

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("orders", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1) }));
});

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase)));
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks().AddDbContextCheck<StoreDbContext>("database");

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// `dotnet run -- --seed` migrates and seeds explicitly; Development does it on startup.
if (args.Contains("--seed") || (app.Environment.IsDevelopment() && app.Configuration.GetValue("Database:MigrateOnStartup", true)))
{
    await DatabaseInitializer.MigrateAndSeedAsync(app.Services, app.Configuration);
    if (args.Contains("--seed"))
    {
        return;
    }
}

// Unhandled exceptions become a bare RFC 7807 500; details stay in the logs.
app.UseExceptionHandler(new ExceptionHandlerOptions
{
    // Malformed query strings and bodies are the client's fault, not ours.
    StatusCodeSelector = exception => exception is BadHttpRequestException bad ? bad.StatusCode : StatusCodes.Status500InternalServerError,
});
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors();
app.UseRateLimiter();

app.MapHealthChecks("/health");

var api = app.MapGroup("/api/v1");
api.MapCatalogEndpoints();
api.MapOrderEndpoints();

app.Run();

public partial class Program;
