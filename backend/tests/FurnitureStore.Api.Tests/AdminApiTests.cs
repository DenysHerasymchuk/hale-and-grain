using System.Net;
using System.Net.Http.Json;
using FurnitureStore.Contracts.Admin;

namespace FurnitureStore.Tests;

[Collection(ApiCollection.Name)]
public class AdminApiTests(StoreApiFactory factory)
{
    private static readonly Guid OrchardDisplayShelf = Guid.Parse("2b000000-0000-0000-0000-000000000004");

    private async Task<HttpClient> SignInAsync(string email, string password)
    {
        var client = factory.CreateClient();
        (await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=true", new { email, password })).EnsureSuccessStatusCode();
        return client;
    }

    private async Task<HttpClient> CustomerAsync()
    {
        var client = factory.CreateClient();
        var credentials = new { email = $"{Guid.NewGuid():N}@example.com", password = "Lovely-Oak-2026" };
        (await client.PostAsJsonAsync("/api/v1/auth/register", credentials)).EnsureSuccessStatusCode();
        (await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=true", credentials)).EnsureSuccessStatusCode();
        return client;
    }

    [Theory]
    [InlineData("/api/v1/admin/dashboard")]
    [InlineData("/api/v1/admin/products")]
    [InlineData("/api/v1/admin/orders")]
    [InlineData("/api/v1/admin/customers")]
    public async Task Admin_endpoints_reject_guests_and_customers(string url)
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateClient().GetAsync(url)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await (await CustomerAsync()).GetAsync(url)).StatusCode);
    }

    [Fact]
    public async Task Customers_cannot_change_products()
    {
        var customer = await CustomerAsync();

        var response = await customer.DeleteAsync($"/api/v1/admin/products/{OrchardDisplayShelf}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Admin_can_edit_a_product_and_the_change_reaches_the_catalogue()
    {
        var admin = await SignInAsync(StoreApiFactory.AdminEmail, StoreApiFactory.AdminPassword);
        var product = await admin.GetFromJsonAsync<AdminProductDto>($"/api/v1/admin/products/{OrchardDisplayShelf}", TestJson.Options);

        var edited = new AdminProductInput(product!.Name, product.Slug, product.Sku, "Edited by the admin test.", product.Description, product.Price,
            product.CategoryId, product.Brand, product.Dimensions, product.Materials, product.IsPublished, product.IsFeatured,
            product.Images, product.Variants, product.Model);
        var response = await admin.PutAsJsonAsync($"/api/v1/admin/products/{OrchardDisplayShelf}", edited, TestJson.Options);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var detail = await factory.CreateClient().GetFromJsonAsync<FurnitureStore.Contracts.Catalog.ProductDetailDto>(
            "/api/v1/products/slug/orchard-display-shelf", TestJson.Options);
        Assert.Equal("Edited by the admin test.", detail!.ShortDescription);
    }

    [Fact]
    public async Task Admin_cannot_save_a_duplicate_slug()
    {
        var admin = await SignInAsync(StoreApiFactory.AdminEmail, StoreApiFactory.AdminPassword);
        var product = await admin.GetFromJsonAsync<AdminProductDto>($"/api/v1/admin/products/{OrchardDisplayShelf}", TestJson.Options);

        var clash = new AdminProductInput(product!.Name, "lune-console", product.Sku, product.ShortDescription, product.Description, product.Price,
            product.CategoryId, product.Brand, product.Dimensions, product.Materials, product.IsPublished, product.IsFeatured,
            product.Images, product.Variants, product.Model);

        Assert.Equal(HttpStatusCode.Conflict, (await admin.PutAsJsonAsync($"/api/v1/admin/products/{OrchardDisplayShelf}", clash, TestJson.Options)).StatusCode);
    }

    [Fact]
    public async Task Admin_dashboard_summarises_the_store()
    {
        var admin = await SignInAsync(StoreApiFactory.AdminEmail, StoreApiFactory.AdminPassword);

        var dashboard = await admin.GetFromJsonAsync<DashboardDto>("/api/v1/admin/dashboard", TestJson.Options);

        Assert.Equal(5, dashboard!.PublishedProducts);
        Assert.True(dashboard.OutOfStockVariants >= 1); // Orchard "Whitewashed" is seeded with no stock
    }
}
