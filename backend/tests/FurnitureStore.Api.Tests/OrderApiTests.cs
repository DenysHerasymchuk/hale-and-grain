using System.Net;
using System.Net.Http.Json;
using FurnitureStore.Infrastructure.Persistence;
using FurnitureStore.Domain;
using FurnitureStore.Contracts.Orders;
using FurnitureStore.Application.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FurnitureStore.Tests;

[Collection(ApiCollection.Name)]
public class OrderApiTests(StoreApiFactory factory)
{
    // Seeded variants (see SeedData). Each test uses its own so they don't share stock.
    private static readonly Guid HarrowNatural = Guid.Parse("3c000000-0000-0000-0001-000000000001"); // €1890, stock 6
    private static readonly Guid HarrowEbonised = Guid.Parse("3c000000-0000-0000-0001-000000000003"); // stock 2
    private static readonly Guid AtelierSmoked = Guid.Parse("3c000000-0000-0000-0002-000000000002"); // €1540, stock 2
    private static readonly Guid OrchardNatural = Guid.Parse("3c000000-0000-0000-0004-000000000001"); // €680, stock 7
    private static readonly Guid OrchardWhite = Guid.Parse("3c000000-0000-0000-0004-000000000002"); // stock 0

    private readonly HttpClient _client = factory.CreateClient();

    private static CreateOrderRequest Order(params CartLineRequest[] lines) => new(
        "ada@example.com",
        "Ada Lovelace",
        null,
        new ShippingAddressDto("Grote Markt 1", null, "Antwerpen", "2000", "BE"),
        [.. lines]);

    [Fact]
    public async Task Creates_order_with_server_prices_and_decrements_stock()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/orders", Order(new CartLineRequest(OrchardNatural, 1)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<CreateOrderResponse>(TestJson.Options);
        Assert.NotNull(created);
        Assert.Equal(680m, created.Order.Subtotal);
        Assert.Equal(49m, created.Order.ShippingCost);
        Assert.Equal(729m, created.Order.Total);
        Assert.Equal(PaymentStatus.DevelopmentSimulated, created.Order.PaymentStatus);

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        Assert.Equal(6, await db.ProductVariants.Where(v => v.Id == OrchardNatural).Select(v => v.Stock).SingleAsync());
    }

    [Fact]
    public async Task Rejects_order_exceeding_stock_with_conflict_and_writes_nothing()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/orders", Order(new CartLineRequest(OrchardWhite, 1)));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var quote = await response.Content.ReadFromJsonAsync<QuoteDto>(TestJson.Options);
        Assert.Equal("insufficient_stock", Assert.Single(quote!.Problems).Code);
    }

    [Fact]
    public async Task Unknown_variant_is_rejected()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/orders", Order(new CartLineRequest(Guid.NewGuid(), 1)));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_input_returns_validation_problem()
    {
        var invalid = Order(new CartLineRequest(HarrowNatural, 0)) with { Email = "not-an-email" };

        var response = await _client.PostAsJsonAsync("/api/v1/orders", invalid);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Concurrent_checkouts_cannot_oversell_the_last_items()
    {
        // Stock is 2; five customers each try to buy one at the same moment.
        var attempts = Enumerable.Range(0, 5)
            .Select(_ => factory.CreateClient().PostAsJsonAsync("/api/v1/orders", Order(new CartLineRequest(AtelierSmoked, 1))));
        var responses = await Task.WhenAll(attempts);

        Assert.Equal(2, responses.Count(r => r.StatusCode == HttpStatusCode.Created));
        Assert.Equal(3, responses.Count(r => r.StatusCode == HttpStatusCode.Conflict));

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        Assert.Equal(0, await db.ProductVariants.Where(v => v.Id == AtelierSmoked).Select(v => v.Stock).SingleAsync());
    }

    [Fact]
    public async Task Order_is_only_readable_with_its_access_token()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/orders", Order(new CartLineRequest(HarrowEbonised, 1)));
        var created = (await response.Content.ReadFromJsonAsync<CreateOrderResponse>(TestJson.Options))!;
        var number = created.Order.OrderNumber;

        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/v1/orders/{number}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"/api/v1/orders/{number}?token=guess")).StatusCode);

        var order = await _client.GetFromJsonAsync<OrderDto>($"/api/v1/orders/{number}?token={created.AccessToken}", TestJson.Options);
        Assert.Equal(number, order!.OrderNumber);
    }

    [Fact]
    public async Task Order_keeps_its_price_after_the_product_is_repriced()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/orders", Order(new CartLineRequest(HarrowNatural, 1)));
        var created = (await response.Content.ReadFromJsonAsync<CreateOrderResponse>(TestJson.Options))!;

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        var products = db.Products.Where(p => p.Slug == "harrow-dining-table");
        await products.ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, 2500m));
        try
        {
            var order = await _client.GetFromJsonAsync<OrderDto>($"/api/v1/orders/{created.Order.OrderNumber}?token={created.AccessToken}", TestJson.Options);
            Assert.Equal(1890m, Assert.Single(order!.Lines).UnitPrice);
        }
        finally
        {
            // Other tests in the collection read this product's price.
            await products.ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, 1890m));
        }
    }
}
