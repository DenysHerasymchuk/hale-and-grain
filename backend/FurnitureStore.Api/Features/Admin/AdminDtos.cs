using System.ComponentModel.DataAnnotations;
using FurnitureStore.Api.Domain;

namespace FurnitureStore.Api.Features.Admin;

internal static class Patterns
{
    public const string Slug = "^[a-z0-9]+(-[a-z0-9]+)*$";
    public const string Sku = "^[A-Z0-9]+(-[A-Z0-9]+)*$";
    public const string Hex = "^#[0-9a-fA-F]{6}$";

    /// <summary>Site-relative paths or https URLs only; rejects javascript:, data: and friends.</summary>
    public const string AssetUrl = @"^(/[A-Za-z0-9._~/-]+|https://[^\s""'<>]+)$";
}

public record AdminImageInput(
    [property: Required, StringLength(500), RegularExpression(Patterns.AssetUrl)] string Url,
    [property: StringLength(300)] string AltText,
    ImageRole Role);

public record AdminVariantInput(
    Guid? Id,
    [property: Required, StringLength(40), RegularExpression(Patterns.Sku)] string Sku,
    [property: Required, StringLength(100)] string Name,
    [property: StringLength(100)] string? Material,
    [property: StringLength(100)] string? Size,
    [property: Required, RegularExpression(Patterns.Hex)] string SwatchHex,
    [property: Range(-100_000, 100_000)] decimal PriceAdjustment,
    [property: Range(0, 100_000)] int Stock,
    [property: RegularExpression(Patterns.Hex)] string? ModelTint);

public record AdminModelConfigInput(
    [property: Range(0.001, 1000)] double Scale,
    [property: Required, Length(3, 3)] double[] Rotation,
    [property: Required, Length(3, 3)] double[] Offset,
    [property: Length(3, 3)] double[]? CameraPosition,
    [property: MaxLength(20)] List<string> MaterialTargets);

public record AdminModelInput(
    [property: Required, StringLength(500), RegularExpression(Patterns.AssetUrl)] string Url,
    ModelFormat Format,
    [property: Range(0, long.MaxValue)] long? FileSizeBytes,
    [property: StringLength(300)] string? Attribution,
    [property: StringLength(500), RegularExpression(Patterns.AssetUrl)] string? AttributionUrl,
    [property: StringLength(100)] string? License,
    [property: Required] AdminModelConfigInput Config);

/// <summary>Full product document; PUT replaces images, variants and model metadata wholesale.</summary>
public record AdminProductInput(
    [property: Required, StringLength(150)] string Name,
    [property: Required, StringLength(150), RegularExpression(Patterns.Slug)] string Slug,
    [property: Required, StringLength(40), RegularExpression(Patterns.Sku)] string Sku,
    [property: StringLength(500)] string ShortDescription,
    [property: StringLength(5000)] string Description,
    [property: Range(0, 1_000_000)] decimal Price,
    Guid CategoryId,
    [property: StringLength(100)] string? Brand,
    [property: StringLength(100)] string? Dimensions,
    [property: StringLength(200)] string? Materials,
    bool IsPublished,
    bool IsFeatured,
    [property: Required, MaxLength(20)] List<AdminImageInput> Images,
    [property: Required, MinLength(1), MaxLength(20)] List<AdminVariantInput> Variants,
    AdminModelInput? Model);

public record AdminProductListItem(Guid Id, string Name, string Slug, string Sku, string CategoryName, decimal Price, int TotalStock, int VariantCount,
    bool IsPublished, bool IsFeatured, bool HasModel, string? ImageUrl, DateTimeOffset UpdatedAt);

public record AdminProductDto(Guid Id, string Name, string Slug, string Sku, string ShortDescription, string Description, decimal Price, string Currency,
    Guid CategoryId, string? Brand, string? Dimensions, string? Materials, bool IsPublished, bool IsFeatured,
    List<AdminImageInput> Images, List<AdminVariantInput> Variants, AdminModelInput? Model, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);

public record AdminCategoryInput(
    [property: Required, StringLength(100)] string Name,
    [property: Required, StringLength(100), RegularExpression(Patterns.Slug)] string Slug,
    [property: StringLength(1000)] string Description,
    [property: StringLength(500), RegularExpression(Patterns.AssetUrl)] string? ImageUrl,
    [property: Range(0, 1000)] int DisplayOrder);

public record AdminCategoryDto(Guid Id, string Name, string Slug, string Description, string? ImageUrl, int DisplayOrder, int ProductCount);

public record InventoryItemDto(Guid VariantId, Guid ProductId, string ProductName, string VariantName, string Sku, int Stock, bool IsPublished);

public record UpdateStockRequest([property: Range(0, 100_000)] int Stock);

public record AdminOrderListItem(Guid Id, string OrderNumber, string FullName, string Email, int ItemCount, decimal Total, string Currency,
    OrderStatus Status, PaymentStatus PaymentStatus, DateTimeOffset CreatedAt);

public record UpdateOrderStatusRequest(OrderStatus Status);

public record CustomerDto(string Id, string Email, string FirstName, string LastName, bool EmailConfirmed, int OrderCount, decimal TotalSpent, DateTimeOffset CreatedAt);

public record StoreSettingsDto(
    [property: Required, StringLength(100)] string StoreName,
    [property: Required, EmailAddress, StringLength(254)] string SupportEmail,
    [property: Range(0, 10_000)] decimal FlatShippingCost,
    [property: Range(0, 1_000_000)] decimal FreeShippingThreshold,
    [property: Range(0, 1000)] int LowStockThreshold);

public record DashboardDto(int OrdersToday, int OrdersLast30Days, decimal RevenueLast30Days, string Currency, int LowStockVariants, int OutOfStockVariants,
    int PublishedProducts, int Customers, List<AdminOrderListItem> RecentOrders);
