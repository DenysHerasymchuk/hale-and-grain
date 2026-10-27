using FurnitureStore.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FurnitureStore.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> category)
    {
        category.Property(c => c.Name).HasMaxLength(100);
        category.Property(c => c.Slug).HasMaxLength(100);
        category.Property(c => c.Description).HasMaxLength(1000);
        category.HasIndex(c => c.Slug).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> product)
    {
        product.Property(p => p.Name).HasMaxLength(150);
        product.Property(p => p.Slug).HasMaxLength(150);
        product.Property(p => p.Sku).HasMaxLength(40);
        product.Property(p => p.Currency).HasMaxLength(3).IsFixedLength();
        product.Property(p => p.Description).HasMaxLength(5000);

        product.HasIndex(p => p.Slug).IsUnique();
        product.HasIndex(p => p.Sku).IsUnique();
        product.HasIndex(p => new { p.CategoryId, p.IsPublished });
        product.HasIndex(p => new { p.IsPublished, p.Price });

        product.ToTable(t => t.HasCheckConstraint("CK_Products_Price", "\"Price\" >= 0"));

        product.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        product.HasMany(p => p.Images).WithOne().HasForeignKey(i => i.ProductId);
        product.HasMany(p => p.Variants).WithOne(v => v.Product).HasForeignKey(v => v.ProductId);

        // Model metadata is read and edited as one unit, so a single jsonb column fits better
        // than a side table.
        product.OwnsOne(p => p.Model, model =>
        {
            model.ToJson();
            model.Property(m => m.Format).HasConversion<string>();
            model.OwnsOne(m => m.Config);
        });
    }
}

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> image)
    {
        image.Property(i => i.Role).HasConversion<string>().HasMaxLength(20);
        image.HasIndex(i => new { i.ProductId, i.DisplayOrder });
    }
}

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> variant)
    {
        variant.Property(v => v.Sku).HasMaxLength(40);
        variant.Property(v => v.Name).HasMaxLength(100);
        variant.Property(v => v.SwatchHex).HasMaxLength(7);
        variant.Property(v => v.ModelTint).HasMaxLength(7);
        variant.Ignore(v => v.UnitPrice);

        variant.HasIndex(v => v.Sku).IsUnique();
        variant.ToTable(t => t.HasCheckConstraint("CK_ProductVariants_Stock", "\"Stock\" >= 0"));
    }
}
