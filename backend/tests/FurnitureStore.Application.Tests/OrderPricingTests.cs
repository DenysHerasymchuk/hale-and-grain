using FurnitureStore.Domain;
using FurnitureStore.Contracts.Orders;
using FurnitureStore.Application.Orders;

namespace FurnitureStore.Tests;

public class OrderPricingTests
{
    private static readonly StoreSettings Settings = new() { FlatShippingCost = 49m, FreeShippingThreshold = 750m, Currency = "EUR" };

    private static PricedVariant Variant(Guid id, decimal basePrice, decimal adjustment = 0m, int stock = 5, bool published = true) =>
        new(id, Guid.NewGuid(), "Harrow Dining Table", "harrow-dining-table", "Smoked", "HG-TBL-1", null, basePrice, adjustment, stock, published);

    [Fact]
    public void Prices_lines_from_database_values_including_variant_adjustment()
    {
        var id = Guid.NewGuid();
        var quote = OrderPricing.Quote([new CartLineRequest(id, 2)], new Dictionary<Guid, PricedVariant> { [id] = Variant(id, 1890m, 120m) }, Settings);

        var line = Assert.Single(quote.Lines);
        Assert.Equal(2010m, line.UnitPrice);
        Assert.Equal(4020m, line.LineTotal);
        Assert.Equal(4020m, quote.Subtotal);
        Assert.True(quote.CanCheckout);
    }

    [Fact]
    public void Charges_flat_shipping_below_threshold_and_none_at_or_above_it()
    {
        var id = Guid.NewGuid();
        var variants = new Dictionary<Guid, PricedVariant> { [id] = Variant(id, 375m) };

        var below = OrderPricing.Quote([new CartLineRequest(id, 1)], variants, Settings);
        var atThreshold = OrderPricing.Quote([new CartLineRequest(id, 2)], variants, Settings);

        Assert.Equal(49m, below.ShippingCost);
        Assert.Equal(424m, below.Total);
        Assert.Equal(0m, atThreshold.ShippingCost);
        Assert.Equal(750m, atThreshold.Total);
    }

    [Fact]
    public void Decimal_arithmetic_has_no_floating_point_drift()
    {
        var id = Guid.NewGuid();
        var quote = OrderPricing.Quote([new CartLineRequest(id, 3)], new Dictionary<Guid, PricedVariant> { [id] = Variant(id, 0.1m, 0.2m, stock: 10) }, Settings);

        Assert.Equal(0.9m, quote.Subtotal);
    }

    [Fact]
    public void Flags_unknown_and_unpublished_variants_as_unavailable()
    {
        var unknown = Guid.NewGuid();
        var hidden = Guid.NewGuid();
        var quote = OrderPricing.Quote(
            [new CartLineRequest(unknown, 1), new CartLineRequest(hidden, 1)],
            new Dictionary<Guid, PricedVariant> { [hidden] = Variant(hidden, 100m, published: false) },
            Settings);

        Assert.False(quote.CanCheckout);
        Assert.Empty(quote.Lines);
        Assert.All(quote.Problems, p => Assert.Equal("unavailable", p.Code));
    }

    [Fact]
    public void Flags_quantities_above_stock()
    {
        var id = Guid.NewGuid();
        var quote = OrderPricing.Quote([new CartLineRequest(id, 3)], new Dictionary<Guid, PricedVariant> { [id] = Variant(id, 100m, stock: 2) }, Settings);

        var problem = Assert.Single(quote.Problems);
        Assert.Equal("insufficient_stock", problem.Code);
        Assert.Equal(2, problem.Available);
        Assert.False(quote.CanCheckout);
    }

    [Fact]
    public void Merges_repeated_variants_so_the_per_line_limit_cannot_be_bypassed()
    {
        var id = Guid.NewGuid();
        var quote = OrderPricing.Quote(
            [new CartLineRequest(id, 6), new CartLineRequest(id, 6)],
            new Dictionary<Guid, PricedVariant> { [id] = Variant(id, 100m, stock: 50) },
            Settings);

        Assert.Equal(12, Assert.Single(quote.Lines).Quantity);
        Assert.Equal("quantity_limit", Assert.Single(quote.Problems).Code);
    }
}
