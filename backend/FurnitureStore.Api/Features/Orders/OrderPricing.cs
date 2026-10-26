using FurnitureStore.Api.Domain;

namespace FurnitureStore.Api.Features.Orders;

public static class OrderRules
{
    public const int MaxQuantityPerLine = 10;
    public const int MaxLines = 50;

    /// <summary>Countries we deliver to (ISO 3166-1 alpha-2).</summary>
    public static readonly IReadOnlySet<string> ShippingCountries =
        new HashSet<string>(["BE", "NL", "LU", "FR", "DE", "AT", "DK", "IE", "ES", "IT", "PT"], StringComparer.OrdinalIgnoreCase);
}

/// <summary>Variant data the pricing rules need, loaded from the database, never from the client.</summary>
public record PricedVariant(
    Guid VariantId,
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    string VariantName,
    string Sku,
    string? ImageUrl,
    decimal BasePrice,
    decimal PriceAdjustment,
    int Stock,
    bool IsPublished);

/// <summary>Pure pricing rules: no I/O, so they are unit-tested directly.</summary>
public static class OrderPricing
{
    /// <summary>Combines repeated variants so one variant can't dodge the per-line limit.</summary>
    public static IReadOnlyList<CartLineRequest> MergeLines(IEnumerable<CartLineRequest> lines) =>
        lines.GroupBy(l => l.VariantId)
            .Select(g => new CartLineRequest(g.Key, g.Sum(l => l.Quantity)))
            .ToList();

    public static QuoteDto Quote(IReadOnlyList<CartLineRequest> requested, IReadOnlyDictionary<Guid, PricedVariant> variants, StoreSettings settings)
    {
        var lines = new List<QuoteLineDto>();
        var problems = new List<LineProblem>();

        foreach (var line in MergeLines(requested))
        {
            if (!variants.TryGetValue(line.VariantId, out var variant) || !variant.IsPublished)
            {
                problems.Add(new LineProblem(line.VariantId, "unavailable", "This item is no longer available.", 0));
                continue;
            }

            if (line.Quantity > OrderRules.MaxQuantityPerLine)
            {
                problems.Add(new LineProblem(line.VariantId, "quantity_limit",
                    $"You can order up to {OrderRules.MaxQuantityPerLine} of {variant.ProductName} at once.", variant.Stock));
            }
            else if (line.Quantity > variant.Stock)
            {
                problems.Add(new LineProblem(line.VariantId, "insufficient_stock",
                    variant.Stock == 0
                        ? $"{variant.ProductName} ({variant.VariantName}) has just sold out."
                        : $"Only {variant.Stock} of {variant.ProductName} ({variant.VariantName}) left.",
                    variant.Stock));
            }

            var unitPrice = variant.BasePrice + variant.PriceAdjustment;
            lines.Add(new QuoteLineDto(variant.VariantId, variant.ProductId, variant.ProductName, variant.ProductSlug,
                variant.VariantName, variant.Sku, variant.ImageUrl, unitPrice, line.Quantity, unitPrice * line.Quantity, variant.Stock));
        }

        var subtotal = lines.Sum(l => l.LineTotal);
        var shipping = ShippingFor(subtotal, settings);
        return new QuoteDto(lines, problems, settings.Currency, subtotal, shipping, subtotal + shipping);
    }

    public static decimal ShippingFor(decimal subtotal, StoreSettings settings) =>
        subtotal == 0 || subtotal >= settings.FreeShippingThreshold ? 0m : settings.FlatShippingCost;
}
