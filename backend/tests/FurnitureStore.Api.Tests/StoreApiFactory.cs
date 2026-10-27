using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;

namespace FurnitureStore.Tests;

/// <summary>
/// Boots the real API against a throwaway Postgres container. Development environment means
/// migrations and the deterministic seed run on startup, and the development payment provider
/// is active, exactly as on a developer machine. Requires Docker.
/// </summary>
public class StoreApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "Admin-Passw0rd!";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17-alpine").Build();

    public Task InitializeAsync() => _postgres.StartAsync();

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:Store", _postgres.GetConnectionString());
        builder.UseSetting("Seed:AdminEmail", AdminEmail);
        builder.UseSetting("Seed:AdminPassword", AdminPassword);
        // Every test client shares one address; the production limit would trip mid-suite.
        builder.UseSetting("RateLimits:AuthPerMinute", "1000");
    }
}

[CollectionDefinition(Name)]
public class ApiCollection : ICollectionFixture<StoreApiFactory>
{
    public const string Name = "api";
}
