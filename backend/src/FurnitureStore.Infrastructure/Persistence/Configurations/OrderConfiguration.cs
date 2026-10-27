using FurnitureStore.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FurnitureStore.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> order)
    {
        order.Property(o => o.OrderNumber).HasMaxLength(20);
        order.Property(o => o.AccessTokenHash).HasMaxLength(64);
        order.Property(o => o.Email).HasMaxLength(254);
        order.Property(o => o.FullName).HasMaxLength(150);
        order.Property(o => o.Phone).HasMaxLength(30);
        order.Property(o => o.Currency).HasMaxLength(3).IsFixedLength();
        order.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        order.Property(o => o.PaymentStatus).HasConversion<string>().HasMaxLength(30);

        order.HasIndex(o => o.OrderNumber).IsUnique();
        order.HasIndex(o => new { o.UserId, o.CreatedAt });
        order.HasIndex(o => o.CreatedAt);

        order.OwnsOne(o => o.ShippingAddress);

        order.HasOne<AppUser>().WithMany().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.SetNull);
        order.HasMany(o => o.Lines).WithOne().HasForeignKey(l => l.OrderId).OnDelete(DeleteBehavior.Cascade);

        order.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Orders_Totals", "\"Subtotal\" >= 0 AND \"ShippingCost\" >= 0 AND \"Total\" = \"Subtotal\" + \"ShippingCost\"");
        });
    }
}

public class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> line)
    {
        line.HasOne<Product>().WithMany().HasForeignKey(l => l.ProductId).OnDelete(DeleteBehavior.SetNull);
        line.HasOne<ProductVariant>().WithMany().HasForeignKey(l => l.VariantId).OnDelete(DeleteBehavior.SetNull);

        line.ToTable(t =>
        {
            t.HasCheckConstraint("CK_OrderLines_Quantity", "\"Quantity\" > 0");
            t.HasCheckConstraint("CK_OrderLines_LineTotal", "\"LineTotal\" = \"UnitPrice\" * \"Quantity\"");
        });
    }
}

public class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> address)
    {
        address.HasOne<AppUser>().WithMany(u => u.Addresses).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        address.HasIndex(a => a.UserId);
    }
}

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> item)
    {
        item.HasKey(w => new { w.UserId, w.ProductId });
        item.HasOne<AppUser>().WithMany().HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
        item.HasOne(w => w.Product).WithMany().HasForeignKey(w => w.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> settings)
    {
        settings.Property(s => s.Id).ValueGeneratedNever();
        settings.Property(s => s.Currency).HasMaxLength(3).IsFixedLength();
        settings.ToTable(t => t.HasCheckConstraint("CK_StoreSettings_Singleton", "\"Id\" = 1"));
        settings.HasData(new StoreSettings());
    }
}
