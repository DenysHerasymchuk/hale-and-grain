using FurnitureStore.Application.Abstractions;
using FurnitureStore.Contracts.Admin;
using FurnitureStore.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace FurnitureStore.Api.Endpoints;

public static class AdminProductEndpoints
{
    public static void MapAdminProductEndpoints(this RouteGroupBuilder admin)
    {
        var products = admin.MapGroup("/products");

        products.MapGet("/", (string? q, IStoreDbContext db, CancellationToken ct) =>
        {
            var query = db.Products.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(term) || p.Sku.ToLower().Contains(term));
            }

            return query
                .OrderBy(p => p.Name)
                .Select(p => new AdminProductListItem(p.Id, p.Name, p.Slug, p.Sku, p.Category.Name, p.Price, p.Variants.Sum(v => v.Stock), p.Variants.Count,
                    p.IsPublished, p.IsFeatured, p.Model != null, p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault(), p.UpdatedAt))
                .ToListAsync(ct);
        });

        products.MapGet("/{id:guid}", async Task<Results<Ok<AdminProductDto>, NotFound>> (Guid id, IStoreDbContext db, CancellationToken ct) =>
            await LoadAsync(db, id, ct) is { } product ? TypedResults.Ok(ToDto(product)) : TypedResults.NotFound());

        products.MapPost("/", async Task<IResult> (
            AdminProductInput input, IStoreDbContext db, TimeProvider clock, CancellationToken ct) =>
        {
            if (await FindProblemAsync(db, input, productId: null, ct) is { } problem)
            {
                return problem;
            }

            var now = clock.GetUtcNow();
            var product = new Product { Id = Guid.NewGuid(), Name = input.Name, Slug = input.Slug, Sku = input.Sku, CreatedAt = now };
            Apply(product, input, now);
            db.Products.Add(product);
            await db.SaveChangesAsync(ct);
            return TypedResults.Created($"/api/v1/admin/products/{product.Id}", ToDto(product));
        });

        products.MapPut("/{id:guid}", async Task<IResult> (
            Guid id, AdminProductInput input, IStoreDbContext db, TimeProvider clock, CancellationToken ct) =>
        {
            var product = await LoadAsync(db, id, ct, track: true);
            if (product is null)
            {
                return TypedResults.NotFound();
            }

            if (await FindProblemAsync(db, input, id, ct) is { } problem)
            {
                return problem;
            }

            Apply(product, input, clock.GetUtcNow());
            await db.SaveChangesAsync(ct);
            return TypedResults.Ok(ToDto(product));
        });

        // Past orders keep their snapshots; their product/variant references become null.
        products.MapDelete("/{id:guid}", async Task<Results<NoContent, NotFound>> (Guid id, IStoreDbContext db, CancellationToken ct) =>
            await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync(ct) == 0 ? TypedResults.NotFound() : TypedResults.NoContent());
    }

    private static Task<Product?> LoadAsync(IStoreDbContext db, Guid id, CancellationToken ct, bool track = false)
    {
        var query = db.Products.Include(p => p.Images).Include(p => p.Variants).Where(p => p.Id == id);
        return (track ? query : query.AsNoTracking()).FirstOrDefaultAsync(ct);
    }

    /// <summary>Unique slugs and SKUs are also enforced by indexes; this turns clashes into readable errors.</summary>
    private static async Task<IResult?> FindProblemAsync(
        IStoreDbContext db, AdminProductInput input, Guid? productId, CancellationToken ct)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == input.CategoryId, ct))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["CategoryId"] = ["Choose an existing category."] });
        }

        var variantSkus = input.Variants.Select(v => v.Sku).ToList();
        if (variantSkus.Distinct().Count() != variantSkus.Count)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["Variants"] = ["Each variant needs its own SKU."] });
        }

        var errors = new Dictionary<string, string[]>();
        if (await db.Products.AnyAsync(p => p.Id != productId && p.Slug == input.Slug, ct))
        {
            errors["Slug"] = ["Another product already uses this slug."];
        }

        if (await db.Products.AnyAsync(p => p.Id != productId && p.Sku == input.Sku, ct))
        {
            errors["Sku"] = ["Another product already uses this SKU."];
        }

        if (await db.ProductVariants.AnyAsync(v => v.ProductId != productId && variantSkus.Contains(v.Sku), ct))
        {
            errors["Variants"] = ["A variant SKU is already used by another product."];
        }

        return errors.Count == 0 ? null : TypedResults.Conflict(new HttpValidationProblemDetails(errors) { Status = StatusCodes.Status409Conflict });
    }

    private static void Apply(Product product, AdminProductInput input, DateTimeOffset now)
    {
        product.Name = input.Name.Trim();
        product.Slug = input.Slug;
        product.Sku = input.Sku;
        product.ShortDescription = input.ShortDescription.Trim();
        product.Description = input.Description.Trim();
        product.Price = input.Price;
        product.CategoryId = input.CategoryId;
        product.Brand = input.Brand;
        product.Dimensions = input.Dimensions;
        product.Materials = input.Materials;
        product.IsPublished = input.IsPublished;
        product.IsFeatured = input.IsFeatured;
        product.UpdatedAt = now;

        product.Images.Clear();
        product.Images.AddRange(input.Images.Select((image, index) => new ProductImage
        {
            Url = image.Url, AltText = image.AltText, Role = image.Role, DisplayOrder = index,
        }));

        // Keep variant ids stable where possible so carts holding them keep working.
        var keep = input.Variants.Where(v => v.Id is not null).Select(v => v.Id).ToHashSet();
        product.Variants.RemoveAll(v => !keep.Contains(v.Id));
        foreach (var (variantInput, index) in input.Variants.Select((v, i) => (v, i)))
        {
            var variant = product.Variants.FirstOrDefault(v => v.Id == variantInput.Id);
            if (variant is null)
            {
                // No explicit Id: a preset key makes EF treat the row as existing and UPDATE it.
                variant = new ProductVariant { Sku = variantInput.Sku, Name = variantInput.Name };
                product.Variants.Add(variant);
            }

            variant.Sku = variantInput.Sku;
            variant.Name = variantInput.Name.Trim();
            variant.Material = variantInput.Material;
            variant.Size = variantInput.Size;
            variant.SwatchHex = variantInput.SwatchHex;
            variant.PriceAdjustment = variantInput.PriceAdjustment;
            variant.Stock = variantInput.Stock;
            variant.ModelTint = variantInput.ModelTint;
            variant.DisplayOrder = index;
        }

        product.Model = input.Model is null
            ? null
            : new ProductModel
            {
                Url = input.Model.Url,
                Format = input.Model.Format,
                FileSizeBytes = input.Model.FileSizeBytes,
                Attribution = input.Model.Attribution,
                AttributionUrl = input.Model.AttributionUrl,
                License = input.Model.License,
                Config = new ModelConfig
                {
                    Scale = input.Model.Config.Scale,
                    Rotation = input.Model.Config.Rotation,
                    Offset = input.Model.Config.Offset,
                    CameraPosition = input.Model.Config.CameraPosition,
                    MaterialTargets = input.Model.Config.MaterialTargets,
                },
            };
    }

    private static AdminProductDto ToDto(Product p) => new(
        p.Id, p.Name, p.Slug, p.Sku, p.ShortDescription, p.Description, p.Price, p.Currency, p.CategoryId, p.Brand, p.Dimensions, p.Materials,
        p.IsPublished, p.IsFeatured,
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => new AdminImageInput(i.Url, i.AltText, i.Role)).ToList(),
        p.Variants.OrderBy(v => v.DisplayOrder)
            .Select(v => new AdminVariantInput(v.Id, v.Sku, v.Name, v.Material, v.Size, v.SwatchHex, v.PriceAdjustment, v.Stock, v.ModelTint))
            .ToList(),
        p.Model is null
            ? null
            : new AdminModelInput(p.Model.Url, p.Model.Format, p.Model.FileSizeBytes, p.Model.Attribution, p.Model.AttributionUrl, p.Model.License,
                new AdminModelConfigInput(p.Model.Config.Scale, p.Model.Config.Rotation, p.Model.Config.Offset, p.Model.Config.CameraPosition,
                    p.Model.Config.MaterialTargets)),
        p.CreatedAt, p.UpdatedAt);
}
