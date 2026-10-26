using System.Net;
using System.Net.Http.Json;
using FurnitureStore.Api.Features.Catalog;

namespace FurnitureStore.Tests;

[Collection(ApiCollection.Name)]
public class CatalogApiTests(StoreApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Lists_published_products_with_paging_metadata()
    {
        var page = await _client.GetFromJsonAsync<PagedResult<ProductSummaryDto>>("/api/v1/products?pageSize=2&page=2", TestJson.Options);

        Assert.Equal(5, page!.TotalCount);
        Assert.Equal(3, page.TotalPages);
        Assert.Equal(2, page.Items.Count);
    }

    [Fact]
    public async Task Filters_by_category_and_sorts_by_price()
    {
        var page = await _client.GetFromJsonAsync<PagedResult<ProductSummaryDto>>("/api/v1/categories/shelving/products?sort=price-desc", TestJson.Options);

        Assert.Equal(["forge-shelving-unit", "orchard-display-shelf"], page!.Items.Select(p => p.Slug));
    }

    [Fact]
    public async Task Searches_names_case_insensitively_and_treats_wildcards_literally()
    {
        var match = await _client.GetFromJsonAsync<PagedResult<ProductSummaryDto>>("/api/v1/products?q=CONSOLE", TestJson.Options);
        var wildcard = await _client.GetFromJsonAsync<PagedResult<ProductSummaryDto>>("/api/v1/products?q=%25", TestJson.Options);

        Assert.Equal("lune-console", Assert.Single(match!.Items).Slug);
        Assert.Empty(wildcard!.Items);
    }

    [Fact]
    public async Task Filters_by_price_range()
    {
        var page = await _client.GetFromJsonAsync<PagedResult<ProductSummaryDto>>("/api/v1/products?minPrice=700&maxPrice=1300", TestJson.Options);

        Assert.Equal(["forge-shelving-unit", "lune-console"], page!.Items.Select(p => p.Slug).Order());
    }

    [Theory]
    [InlineData("/api/v1/products?pageSize=500")]
    [InlineData("/api/v1/products?page=0")]
    [InlineData("/api/v1/products?sort=random")]
    [InlineData("/api/v1/products?minPrice=abc")]
    public async Task Rejects_invalid_query_parameters(string url)
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await _client.GetAsync(url)).StatusCode);
    }

    [Fact]
    public async Task Returns_404_for_unknown_product_and_category()
    {
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync("/api/v1/products/slug/no-such-thing")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync("/api/v1/categories/no-such-thing/products")).StatusCode);
    }

    [Fact]
    public async Task Product_detail_includes_variants_with_computed_prices_and_model()
    {
        var product = await _client.GetFromJsonAsync<ProductDetailDto>("/api/v1/products/slug/harrow-dining-table", TestJson.Options);

        Assert.Equal([1890m, 2010m, 2070m], product!.Variants.Select(v => v.Price));
        Assert.Equal("/models/harrow-dining-table.glb", product.Model!.Url);
        Assert.Contains("wooden_table_02", product.Model.Config.MaterialTargets);
    }
}
