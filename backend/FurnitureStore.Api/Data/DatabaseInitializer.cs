using FurnitureStore.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FurnitureStore.Api.Data;

public static class DatabaseInitializer
{
    /// <summary>Applies pending migrations, then seeds the catalogue and the optional admin account.</summary>
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
