using FurnitureStore.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace FurnitureStore.Application.Abstractions;

/// <summary>
/// The persistence surface the application layer works against. Implemented by the EF Core
/// context in Infrastructure, so Application never references a database provider. Queries
/// stay provider-neutral (no Npgsql-only functions) for the same reason.
/// </summary>
public interface IStoreDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<Order> Orders { get; }
    DbSet<CustomerAddress> CustomerAddresses { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<StoreSettings> StoreSettings { get; }
    DbSet<AppUser> Users { get; }

    /// <summary>Transactions, needed for the reserve-stock-then-save order flow.</summary>
    DatabaseFacade Database { get; }

    ChangeTracker ChangeTracker { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
