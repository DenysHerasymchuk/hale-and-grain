using System.Linq.Expressions;
using FurnitureStore.Application.Abstractions;
using FurnitureStore.Contracts.Catalog;
using FurnitureStore.Domain;
using Microsoft.EntityFrameworkCore;

namespace FurnitureStore.Application.Catalog;

public class CatalogService(IStoreDbContext db)
{
    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct) =>
        await db.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl,
                c.Products.Count(p => p.IsPublished)))
            .ToListAsync(ct);

    public Task<bool> CategoryExistsAsync(string slug, CancellationToken ct) =>
        db.Categories.AnyAsync(c => c.Slug == slug, ct);

    public async Task<PagedResult<ProductSummaryDto>> SearchProductsAsync(ProductQuery query, CancellationToken ct)
    {
        var products = db.Products.AsNoTracking().Where(p => p.IsPublished);

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            // Lower-cased Contains: provider-neutral and case-insensitive; EF Core escapes % and _.
            var term = query.Q.Trim().ToLower();
            products = products.Where(p =>
                p.Name.ToLower().Contains(term) ||
                p.ShortDescription.ToLower().Contains(term) ||
                p.Category.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            products = products.Where(p => p.Category.Slug == query.Category);
        }

        if (query.MinPrice is { } min)
        {
            products = products.Where(p => p.Price >= min);
        }

        if (query.MaxPrice is { } max)
        {
            products = products.Where(p => p.Price <= max);
        }

        if (query.InStock == true)
        {
            products = products.Where(p => p.Variants.Any(v => v.Stock > 0));
        }

        if (query.Featured == true)
        {
            products = products.Where(p => p.IsFeatured);
        }

        var totalCount = await products.CountAsync(ct);

        var items = await Sort(products, query.Sort)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(ToSummary)
            .ToListAsync(ct);

        return new PagedResult<ProductSummaryDto>(items, query.Page, query.PageSize, totalCount);
    }

    public Task<ProductDetailDto?> GetProductAsync(Guid id, CancellationToken ct) =>
        db.Products.AsNoTracking()
            .Where(p => p.IsPublished && p.Id == id)
            .Select(ToDetail)
            .FirstOrDefaultAsync(ct);

    public Task<ProductDetailDto?> GetProductBySlugAsync(string slug, CancellationToken ct) =>
        db.Products.AsNoTracking()
            .Where(p => p.IsPublished && p.Slug == slug)
            .Select(ToDetail)
            .FirstOrDefaultAsync(ct);

    public async Task<IReadOnlyList<ProductSummaryDto>> GetRelatedProductsAsync(string slug, int count, CancellationToken ct)
    {
        var source = await db.Products
            .Where(p => p.Slug == slug)
            .Select(p => new { p.Id, p.CategoryId })
            .FirstOrDefaultAsync(ct);
        if (source is null)
        {
            return [];
        }

        // Same category first, then the rest of the catalogue to fill the row.
        return await db.Products.AsNoTracking()
            .Where(p => p.IsPublished && p.Id != source.Id)
            .OrderByDescending(p => p.CategoryId == source.CategoryId)
            .ThenByDescending(p => p.IsFeatured)
            .ThenBy(p => p.Name)
            .Take(count)
            .Select(ToSummary)
            .ToListAsync(ct);
    }

    private static IQueryable<Product> Sort(IQueryable<Product> products, string? sort) => sort switch
    {
        "newest" => products.OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id),
        "price-asc" => products.OrderBy(p => p.Price).ThenBy(p => p.Id),
        "price-desc" => products.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
        "name" => products.OrderBy(p => p.Name).ThenBy(p => p.Id),
        _ => products.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt).ThenBy(p => p.Id),
    };

    private static readonly Expression<Func<Product, ProductSummaryDto>> ToSummary = p => new ProductSummaryDto(
        p.Id,
        p.Name,
        p.Slug,
        p.ShortDescription,
        p.Price,
        p.Currency,
        p.Category.Name,
        p.Category.Slug,
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault(),
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.AltText).FirstOrDefault(),
        p.Variants.Sum(v => v.Stock),
        p.IsFeatured,
        p.Model != null,
        p.Variants.OrderBy(v => v.DisplayOrder).Select(v => new SwatchDto(v.Name, v.SwatchHex)).ToList());

    private static readonly Expression<Func<Product, ProductDetailDto>> ToDetail = p => new ProductDetailDto(
        p.Id,
        p.Name,
        p.Slug,
        p.Sku,
        p.ShortDescription,
        p.Description,
        p.Price,
        p.Currency,
        p.Brand,
        p.Dimensions,
        p.Materials,
        p.Category.Name,
        p.Category.Slug,
        p.Variants.Sum(v => v.Stock),
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto(i.Url, i.AltText, i.Role)).ToList(),
        p.Variants.OrderBy(v => v.DisplayOrder)
            .Select(v => new ProductVariantDto(v.Id, v.Sku, v.Name, v.Material, v.Size, v.SwatchHex,
                p.Price + v.PriceAdjustment, v.Stock, v.ModelTint))
            .ToList(),
        p.Model == null
            ? null
            : new ProductModelDto(p.Model.Url, p.Model.Format, p.Model.FileSizeBytes, p.Model.Attribution,
                p.Model.AttributionUrl, p.Model.License, p.Model.Config));
}
