using System.ComponentModel.DataAnnotations;
using FurnitureStore.Domain;

namespace FurnitureStore.Contracts.Catalog;

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public record CategoryDto(Guid Id, string Name, string Slug, string Description, string? ImageUrl, int ProductCount);

public record SwatchDto(string Name, string Hex);

public record ProductSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    string ShortDescription,
    decimal Price,
    string Currency,
    string CategoryName,
    string CategorySlug,
    string? ImageUrl,
    string? ImageAlt,
    int TotalStock,
    bool IsFeatured,
    bool HasModel,
    IReadOnlyList<SwatchDto> Swatches);

public record ProductImageDto(string Url, string AltText, ImageRole Role);

public record ProductVariantDto(
    Guid Id,
    string Sku,
    string Name,
    string? Material,
    string? Size,
    string SwatchHex,
    decimal Price,
    int Stock,
    string? ModelTint);

public record ProductModelDto(
    string Url,
    ModelFormat Format,
    long? FileSizeBytes,
    string? Attribution,
    string? AttributionUrl,
    string? License,
    ModelConfig Config);

public record ProductDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string Sku,
    string ShortDescription,
    string Description,
    decimal Price,
    string Currency,
    string? Brand,
    string? Dimensions,
    string? Materials,
    string CategoryName,
    string CategorySlug,
    int TotalStock,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductVariantDto> Variants,
    ProductModelDto? Model);

public record ProductQuery(
    [property: Range(1, 10_000)] int Page = 1,
    [property: Range(1, ProductQuery.MaxPageSize)] int PageSize = 12,
    [property: StringLength(100)] string? Q = null,
    [property: StringLength(100)] string? Category = null,
    [property: Range(0, 1_000_000)] decimal? MinPrice = null,
    [property: Range(0, 1_000_000)] decimal? MaxPrice = null,
    bool? InStock = null,
    bool? Featured = null,
    [property: AllowedValues(null, "featured", "newest", "price-asc", "price-desc", "name")] string? Sort = null)
{
    public const int MaxPageSize = 48;
}
