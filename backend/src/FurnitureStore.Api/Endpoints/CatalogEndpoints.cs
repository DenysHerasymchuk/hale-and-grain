using FurnitureStore.Application.Catalog;
using FurnitureStore.Contracts.Catalog;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FurnitureStore.Api.Endpoints;

public static class CatalogEndpoints
{
    public static void MapCatalogEndpoints(this IEndpointRouteBuilder api)
    {
        var products = api.MapGroup("/products").WithTags("Catalog");

        products.MapGet("/", (CatalogService catalog, [AsParameters] ProductQuery query, CancellationToken ct) =>
            catalog.SearchProductsAsync(query, ct));

        products.MapGet("/{id:guid}", async Task<Results<Ok<ProductDetailDto>, NotFound>> (
            Guid id, CatalogService catalog, CancellationToken ct) =>
            await catalog.GetProductAsync(id, ct) is { } product ? TypedResults.Ok(product) : TypedResults.NotFound());

        products.MapGet("/slug/{slug}", async Task<Results<Ok<ProductDetailDto>, NotFound>> (
            string slug, CatalogService catalog, CancellationToken ct) =>
            await catalog.GetProductBySlugAsync(slug, ct) is { } product ? TypedResults.Ok(product) : TypedResults.NotFound());

        products.MapGet("/slug/{slug}/related", (string slug, CatalogService catalog, CancellationToken ct) =>
            catalog.GetRelatedProductsAsync(slug, 4, ct));

        var categories = api.MapGroup("/categories").WithTags("Catalog");

        categories.MapGet("/", (CatalogService catalog, CancellationToken ct) => catalog.GetCategoriesAsync(ct));

        categories.MapGet("/{slug}/products", async Task<Results<Ok<PagedResult<ProductSummaryDto>>, NotFound>> (
            string slug, CatalogService catalog, [AsParameters] ProductQuery query, CancellationToken ct) =>
        {
            if (!await catalog.CategoryExistsAsync(slug, ct))
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(await catalog.SearchProductsAsync(query with { Category = slug }, ct));
        });
    }
}
