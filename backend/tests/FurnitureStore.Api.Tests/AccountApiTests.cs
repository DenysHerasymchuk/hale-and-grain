using System.Net;
using System.Net.Http.Json;
using FurnitureStore.Contracts.Account;
using FurnitureStore.Contracts.Orders;
using FurnitureStore.Application.Orders;

namespace FurnitureStore.Tests;

[Collection(ApiCollection.Name)]
public class AccountApiTests(StoreApiFactory factory)
{
    private static readonly Guid ForgeRawSteel = Guid.Parse("3c000000-0000-0000-0003-000000000001");

    private async Task<HttpClient> SignedInClientAsync()
    {
        var client = factory.CreateClient();
        var credentials = new { email = $"{Guid.NewGuid():N}@example.com", password = "Lovely-Oak-2026" };
        (await client.PostAsJsonAsync("/api/v1/auth/register", credentials)).EnsureSuccessStatusCode();
        (await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=true", credentials)).EnsureSuccessStatusCode();
        return client;
    }

    private static SaveAddressRequest Address(bool isDefault = false) =>
        new("Home", "Grace Hopper", "Meir 10", null, "Antwerpen", "2000", "BE", isDefault);

    [Fact]
    public async Task Account_endpoints_require_sign_in()
    {
        var guest = factory.CreateClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await guest.GetAsync("/api/v1/account/profile")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await guest.GetAsync("/api/v1/account/orders")).StatusCode);
    }

    [Fact]
    public async Task Customers_cannot_see_or_change_each_others_addresses()
    {
        var alice = await SignedInClientAsync();
        var bob = await SignedInClientAsync();

        var created = await (await alice.PostAsJsonAsync("/api/v1/account/addresses", Address())).Content.ReadFromJsonAsync<AddressDto>(TestJson.Options);

        Assert.True(created!.IsDefault); // first address becomes the default
        Assert.Empty((await bob.GetFromJsonAsync<List<AddressDto>>("/api/v1/account/addresses", TestJson.Options))!);
        Assert.Equal(HttpStatusCode.NotFound, (await bob.PutAsJsonAsync($"/api/v1/account/addresses/{created.Id}", Address())).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await bob.DeleteAsync($"/api/v1/account/addresses/{created.Id}")).StatusCode);
    }

    [Fact]
    public async Task Only_one_address_is_default()
    {
        var client = await SignedInClientAsync();
        await client.PostAsJsonAsync("/api/v1/account/addresses", Address());
        await client.PostAsJsonAsync("/api/v1/account/addresses", Address(isDefault: true) with { Label = "Studio" });

        var addresses = await client.GetFromJsonAsync<List<AddressDto>>("/api/v1/account/addresses", TestJson.Options);

        Assert.Equal("Studio", Assert.Single(addresses!, a => a.IsDefault).Label);
    }

    [Fact]
    public async Task Order_history_lists_only_the_customers_own_orders()
    {
        var alice = await SignedInClientAsync();
        var bob = await SignedInClientAsync();
        var order = new CreateOrderRequest("alice@example.com", "Alice Liddell", null,
            new ShippingAddressDto("Meir 1", null, "Antwerpen", "2000", "BE"), [new CartLineRequest(ForgeRawSteel, 1)]);

        var created = await (await alice.PostAsJsonAsync("/api/v1/orders", order)).Content.ReadFromJsonAsync<CreateOrderResponse>(TestJson.Options);
        var number = created!.Order.OrderNumber;

        Assert.Contains((await alice.GetFromJsonAsync<List<OrderSummaryDto>>("/api/v1/account/orders", TestJson.Options))!, o => o.OrderNumber == number);
        Assert.Empty((await bob.GetFromJsonAsync<List<OrderSummaryDto>>("/api/v1/account/orders", TestJson.Options))!);
        Assert.Equal(HttpStatusCode.OK, (await alice.GetAsync($"/api/v1/account/orders/{number}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await bob.GetAsync($"/api/v1/account/orders/{number}")).StatusCode);
    }
}
