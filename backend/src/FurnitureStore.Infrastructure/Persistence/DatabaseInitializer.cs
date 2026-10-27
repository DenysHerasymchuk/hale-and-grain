using FurnitureStore.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FurnitureStore.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    public static async Task MigrateAndSeedAsync(IServiceProvider services, IConfiguration config)
    {
        await using var scope = services.CreateAsyncScope();
        var provider = scope.ServiceProvider;
        var logger = provider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DatabaseInitializer));

        var db = provider.GetRequiredService<StoreDbContext>();
        await db.Database.MigrateAsync();
        await SeedData.SeedCatalogAsync(db);
        await SeedData.SeedAdminAsync(
            provider.GetRequiredService<UserManager<AppUser>>(),
            provider.GetRequiredService<RoleManager<IdentityRole>>(),
            config["Seed:AdminEmail"],
            config["Seed:AdminPassword"],
            logger);

        logger.LogInformation("Database migrated and seeded");
    }
}
