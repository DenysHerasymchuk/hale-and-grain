using System.Net;
using System.Net.Http.Json;
using FurnitureStore.Api.Endpoints;
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

    private static MultipartFormDataContent FileForm(byte[] bytes, string fileName) =>
        new() { { new ByteArrayContent(bytes), "file", fileName } };

    [Fact]
    public async Task Admin_can_upload_a_glb_and_it_is_served_back()
    {
        var admin = await SignInAsync(StoreApiFactory.AdminEmail, StoreApiFactory.AdminPassword);
        byte[] glb = [0x67, 0x6C, 0x54, 0x46, 2, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        var response = await admin.PostAsync("/api/v1/admin/uploads/models", FileForm(glb, "chair.glb"));
        response.EnsureSuccessStatusCode();
        var upload = await response.Content.ReadFromJsonAsync<UploadResult>();

        Assert.Matches("^/uploads/[0-9a-f]{32}\\.glb$", upload!.Url);
        var served = await factory.CreateClient().GetAsync(upload.Url);
        Assert.Equal("model/gltf-binary", served.Content.Headers.ContentType?.MediaType);
        Assert.Equal(glb, await served.Content.ReadAsByteArrayAsync());
    }

    [Theory]
    [InlineData("/api/v1/admin/uploads/models", "fake.glb")]
    [InlineData("/api/v1/admin/uploads/images", "fake.png")]
    public async Task Uploads_reject_files_that_are_not_what_they_claim(string url, string fileName)
    {
        var admin = await SignInAsync(StoreApiFactory.AdminEmail, StoreApiFactory.AdminPassword);

        var response = await admin.PostAsync(url, FileForm("<script>alert(1)</script>"u8.ToArray(), fileName));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Customers_cannot_upload()
    {
        var customer = await CustomerAsync();

        var response = await customer.PostAsync("/api/v1/admin/uploads/images", FileForm([0x89, 0x50, 0x4E, 0x47], "a.png"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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
        Assert.True(dashboard.OutOfStockVariants >= 1);
    }
}
