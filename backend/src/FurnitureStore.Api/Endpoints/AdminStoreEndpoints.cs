using FurnitureStore.Application.Abstractions;
using FurnitureStore.Application.Orders;
using FurnitureStore.Contracts.Admin;
using FurnitureStore.Contracts.Orders;
using FurnitureStore.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace FurnitureStore.Api.Endpoints;

public static class AdminStoreEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder api)
    {
        var admin = api.MapGroup("/admin").WithTags("Admin").RequireAuthorization(Roles.Admin);

        admin.MapAdminProductEndpoints();
        MapCategories(admin);
        MapInventory(admin);
        MapOrders(admin);
        MapCustomers(admin);
        MapSettings(admin);
        MapDashboard(admin);
    }

    private static void MapCategories(RouteGroupBuilder admin)
    {
        var categories = admin.MapGroup("/categories");

        categories.MapGet("/", (IStoreDbContext db, CancellationToken ct) =>
            db.Categories.AsNoTracking()
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new AdminCategoryDto(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.DisplayOrder, c.Products.Count))
                .ToListAsync(ct));

        categories.MapPost("/", async Task<Results<Created<AdminCategoryDto>, Conflict<string>>> (AdminCategoryInput input, IStoreDbContext db, CancellationToken ct) =>
        {
            if (await db.Categories.AnyAsync(c => c.Slug == input.Slug, ct))
            {
                return TypedResults.Conflict("Another category already uses this slug.");
            }

            var category = new Category { Id = Guid.NewGuid(), Name = input.Name.Trim(), Slug = input.Slug };
            Apply(category, input);
            db.Categories.Add(category);
            await db.SaveChangesAsync(ct);
            return TypedResults.Created($"/api/v1/admin/categories/{category.Id}", ToDto(category, 0));
        });

        categories.MapPut("/{id:guid}", async Task<Results<Ok<AdminCategoryDto>, NotFound, Conflict<string>>> (
            Guid id, AdminCategoryInput input, IStoreDbContext db, CancellationToken ct) =>
        {
            var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (category is null)
            {
                return TypedResults.NotFound();
            }

            if (await db.Categories.AnyAsync(c => c.Id != id && c.Slug == input.Slug, ct))
            {
                return TypedResults.Conflict("Another category already uses this slug.");
            }

            Apply(category, input);
            await db.SaveChangesAsync(ct);
            return TypedResults.Ok(ToDto(category, await db.Products.CountAsync(p => p.CategoryId == id, ct)));
        });

        categories.MapDelete("/{id:guid}", async Task<Results<NoContent, NotFound, Conflict<string>>> (Guid id, IStoreDbContext db, CancellationToken ct) =>
        {
            if (await db.Products.AnyAsync(p => p.CategoryId == id, ct))
            {
                return TypedResults.Conflict("Move or delete this category's products first.");
            }

            return await db.Categories.Where(c => c.Id == id).ExecuteDeleteAsync(ct) == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
        });
    }

    private static void MapInventory(RouteGroupBuilder admin)
    {
        admin.MapGet("/inventory", (IStoreDbContext db, CancellationToken ct) =>
            db.ProductVariants.AsNoTracking()
                .OrderBy(v => v.Stock).ThenBy(v => v.Product.Name)
                .Select(v => new InventoryItemDto(v.Id, v.ProductId, v.Product.Name, v.Name, v.Sku, v.Stock, v.Product.IsPublished))
                .ToListAsync(ct));

        admin.MapPut("/inventory/{variantId:guid}", async Task<Results<NoContent, NotFound>> (
            Guid variantId, UpdateStockRequest request, IStoreDbContext db, CancellationToken ct) =>
            await db.ProductVariants.Where(v => v.Id == variantId).ExecuteUpdateAsync(s => s.SetProperty(v => v.Stock, request.Stock), ct) == 0
                ? TypedResults.NotFound()
                : TypedResults.NoContent());
    }

    private static void MapOrders(RouteGroupBuilder admin)
    {
        admin.MapGet("/orders", (OrderStatus? status, IStoreDbContext db, CancellationToken ct) =>
        {
            var orders = db.Orders.AsNoTracking();
            if (status is { } filter)
            {
                orders = orders.Where(o => o.Status == filter);
            }

            return orders.OrderByDescending(o => o.CreatedAt).Take(200).Select(ToListItem).ToListAsync(ct);
        });

        admin.MapGet("/orders/{id:guid}", async Task<Results<Ok<OrderDto>, NotFound>> (Guid id, IStoreDbContext db, CancellationToken ct) =>
            await db.Orders.AsNoTracking().Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id, ct) is { } order
                ? TypedResults.Ok(order.ToDto())
                : TypedResults.NotFound());

        admin.MapPut("/orders/{id:guid}/status", async Task<Results<NoContent, NotFound>> (
            Guid id, UpdateOrderStatusRequest request, IStoreDbContext db, TimeProvider clock, CancellationToken ct) =>
            await db.Orders.Where(o => o.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, request.Status).SetProperty(o => o.UpdatedAt, clock.GetUtcNow()), ct) == 0
                ? TypedResults.NotFound()
                : TypedResults.NoContent());
    }

    private static void MapCustomers(RouteGroupBuilder admin) =>
        admin.MapGet("/customers", (string? q, IStoreDbContext db, CancellationToken ct) =>
        {
            var users = db.Users.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToUpperInvariant();
                users = users.Where(u => u.NormalizedEmail!.Contains(term) || (u.FirstName + " " + u.LastName).ToUpper().Contains(term));
            }

            return users
                .OrderByDescending(u => u.CreatedAt)
                .Take(200)
                .Select(u => new CustomerDto(u.Id, u.Email ?? "", u.FirstName, u.LastName, u.EmailConfirmed,
                    db.Orders.Count(o => o.UserId == u.Id),
                    db.Orders.Where(o => o.UserId == u.Id && o.Status != OrderStatus.Cancelled).Sum(o => (decimal?)o.Total) ?? 0,
                    u.CreatedAt))
                .ToListAsync(ct);
        });

    private static void MapSettings(RouteGroupBuilder admin)
    {
        admin.MapGet("/settings", async (IStoreDbContext db, CancellationToken ct) =>
        {
            var s = await db.StoreSettings.AsNoTracking().FirstAsync(ct);
            return new StoreSettingsDto(s.StoreName, s.SupportEmail, s.FlatShippingCost, s.FreeShippingThreshold, s.LowStockThreshold);
        });

        admin.MapPut("/settings", async (StoreSettingsDto input, IStoreDbContext db, CancellationToken ct) =>
        {
            await db.StoreSettings.ExecuteUpdateAsync(s => s
                .SetProperty(x => x.StoreName, input.StoreName.Trim())
                .SetProperty(x => x.SupportEmail, input.SupportEmail.Trim())
                .SetProperty(x => x.FlatShippingCost, input.FlatShippingCost)
                .SetProperty(x => x.FreeShippingThreshold, input.FreeShippingThreshold)
                .SetProperty(x => x.LowStockThreshold, input.LowStockThreshold), ct);
            return TypedResults.Ok(input);
        });
    }

    private static void MapDashboard(RouteGroupBuilder admin) =>
        admin.MapGet("/dashboard", async (IStoreDbContext db, TimeProvider clock, CancellationToken ct) =>
        {
            var now = clock.GetUtcNow();
            var today = new DateTimeOffset(now.UtcDateTime.Date, TimeSpan.Zero);
            var monthAgo = now.AddDays(-30);
            var settings = await db.StoreSettings.AsNoTracking().FirstAsync(ct);
            var counted = db.Orders.Where(o => o.Status != OrderStatus.Cancelled);

            return new DashboardDto(
                await db.Orders.CountAsync(o => o.CreatedAt >= today, ct),
                await db.Orders.CountAsync(o => o.CreatedAt >= monthAgo, ct),
                await counted.Where(o => o.CreatedAt >= monthAgo).SumAsync(o => (decimal?)o.Total, ct) ?? 0,
                settings.Currency,
                await db.ProductVariants.CountAsync(v => v.Stock > 0 && v.Stock <= settings.LowStockThreshold, ct),
                await db.ProductVariants.CountAsync(v => v.Stock == 0, ct),
                await db.Products.CountAsync(p => p.IsPublished, ct),
                await db.Users.CountAsync(ct),
                await db.Orders.AsNoTracking().OrderByDescending(o => o.CreatedAt).Take(5).Select(ToListItem).ToListAsync(ct));
        });

    private static readonly System.Linq.Expressions.Expression<Func<Order, AdminOrderListItem>> ToListItem = o => new AdminOrderListItem(
        o.Id, o.OrderNumber, o.FullName, o.Email, o.Lines.Sum(l => l.Quantity), o.Total, o.Currency, o.Status, o.PaymentStatus, o.CreatedAt);

    private static void Apply(Category category, AdminCategoryInput input)
    {
        category.Name = input.Name.Trim();
        category.Slug = input.Slug;
        category.Description = input.Description.Trim();
        category.ImageUrl = string.IsNullOrWhiteSpace(input.ImageUrl) ? null : input.ImageUrl;
        category.DisplayOrder = input.DisplayOrder;
    }

    private static AdminCategoryDto ToDto(Category c, int productCount) =>
        new(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.DisplayOrder, productCount);
}
