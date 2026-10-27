using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FurnitureStore.Api.Endpoints;
using FurnitureStore.Application;
using FurnitureStore.Domain;
using FurnitureStore.Infrastructure;
using FurnitureStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.StaticFiles;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services
    .AddIdentityApiEndpoints<AppUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 10;
        options.Password.RequireNonAlphanumeric = false;
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<StoreDbContext>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "hg_session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    // Production sits behind TLS; Development (and the local compose stack's http) do not.
    options.Cookie.SecurePolicy = builder.Configuration.GetValue<bool>("Auth:SecureCookies")
        ? CookieSecurePolicy.Always
        : CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
    options.SlidingExpiration = true;
    // This is an API: answer 401/403 instead of redirecting to a login page.
    options.Events.OnRedirectToLogin = context => Results.Unauthorized().ExecuteAsync(context.HttpContext);
    options.Events.OnRedirectToAccessDenied = context => Results.Forbid().ExecuteAsync(context.HttpContext);
});

builder.Services.AddDataProtection()
    .SetApplicationName("FurnitureStore")
    // Keys in the database: sessions survive restarts and are shared by every API replica.
    .PersistKeysToDbContext<StoreDbContext>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Roles.Admin, policy => policy.RequireRole(Roles.Admin));

var authPermitsPerMinute = builder.Configuration.GetValue("RateLimits:AuthPerMinute", 20);
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("orders", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1) }));
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = authPermitsPerMinute, Window = TimeSpan.FromMinutes(1) }));
});

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase)));
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
builder.Services.AddResponseCompression();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks().AddDbContextCheck<StoreDbContext>("database");

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

if (builder.Configuration.GetValue<bool>("ForwardedHeaders:TrustAllProxies"))
{
    // Only safe when the API is not directly reachable (e.g. behind the compose nginx).
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
    });
}

var app = builder.Build();

app.UseForwardedHeaders();

// `dotnet run -- --seed` migrates and seeds explicitly; Development does it on startup.
if (args.Contains("--seed") || (app.Environment.IsDevelopment() && app.Configuration.GetValue("Database:MigrateOnStartup", true)))
{
    try
    {
        await DatabaseInitializer.MigrateAndSeedAsync(app.Services, app.Configuration);
    }
    catch (InvalidOperationException ex) when (args.Contains("--seed"))
    {
        // Bad seed config (e.g. a weak admin password): one readable line, not a stack trace.
        app.Logger.LogCritical("Seeding failed: {Reason}", ex.Message);
        Environment.ExitCode = 1;
        return;
    }

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

if (!app.Environment.IsDevelopment())
{
    app.Use((context, next) =>
    {
        var headers = context.Response.Headers;
        headers.XContentTypeOptions = "nosniff";
        headers.XFrameOptions = "DENY";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        headers.ContentSecurityPolicy = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; " +
            "font-src 'self' data:; connect-src 'self' blob: data:; worker-src 'self' blob:; script-src 'self' 'wasm-unsafe-eval'; " +
            "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
        return next();
    });
}

app.UseResponseCompression();

// The built shop (wwwroot, filled by the Docker image) is served from the same origin as the API.
var contentTypes = new FileExtensionContentTypeProvider();
contentTypes.Mappings[".glb"] = "model/gltf-binary";
contentTypes.Mappings[".gltf"] = "model/gltf+json";
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = contentTypes,
    OnPrepareResponse = context =>
    {
        // Vite fingerprints everything under /assets, so those never change.
        if (context.Context.Request.Path.StartsWithSegments("/assets"))
        {
            context.Context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        }
    },
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

var api = app.MapGroup("/api/v1");
api.MapCatalogEndpoints();
api.MapOrderEndpoints();
api.MapAuthEndpoints();
api.MapAccountEndpoints();
api.MapAdminEndpoints();

// Unknown API routes stay 404s; every other path is a client-side route for React Router.
app.MapFallback("/api/{**path}", () => Results.NotFound());
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
