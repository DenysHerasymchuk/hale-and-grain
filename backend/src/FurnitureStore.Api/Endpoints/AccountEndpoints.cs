using System.Security.Claims;
using FurnitureStore.Application.Abstractions;
using FurnitureStore.Application.Orders;
using FurnitureStore.Contracts.Account;
using FurnitureStore.Contracts.Orders;
using FurnitureStore.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FurnitureStore.Api.Endpoints;

/// <summary>
/// Signed-in customer's own data. Every query is scoped by the user id from the auth cookie,
/// never by an id from the request, so one customer can't read another's records.
/// </summary>
public static class AccountEndpoints
{
    private const int MaxAddresses = 10;

    public static void MapAccountEndpoints(this IEndpointRouteBuilder api)
    {
        var account = api.MapGroup("/account").WithTags("Account").RequireAuthorization();

        account.MapGet("/profile", async Task<Results<Ok<ProfileDto>, UnauthorizedHttpResult>> (ClaimsPrincipal principal, UserManager<AppUser> users) =>
            await users.GetUserAsync(principal) is { } user
                ? TypedResults.Ok(new ProfileDto(user.Email ?? "", user.FirstName, user.LastName, user.MarketingEmails, user.CreatedAt))
                : TypedResults.Unauthorized());

        account.MapPut("/profile", async Task<Results<Ok<ProfileDto>, UnauthorizedHttpResult>> (
            UpdateProfileRequest request, ClaimsPrincipal principal, UserManager<AppUser> users) =>
        {
            if (await users.GetUserAsync(principal) is not { } user)
            {
                return TypedResults.Unauthorized();
            }

            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.MarketingEmails = request.MarketingEmails;
            await users.UpdateAsync(user);
            return TypedResults.Ok(new ProfileDto(user.Email ?? "", user.FirstName, user.LastName, user.MarketingEmails, user.CreatedAt));
        });

        account.MapGet("/addresses", (ClaimsPrincipal principal, IStoreDbContext db, CancellationToken ct) =>
            db.CustomerAddresses.AsNoTracking()
                .Where(a => a.UserId == UserId(principal))
                .OrderByDescending(a => a.IsDefault).ThenBy(a => a.Label)
                .Select(a => ToDto(a))
                .ToListAsync(ct));

        account.MapPost("/addresses", async Task<Results<Created<AddressDto>, ValidationProblem>> (
            SaveAddressRequest request, ClaimsPrincipal principal, IStoreDbContext db, CancellationToken ct) =>
        {
            var userId = UserId(principal);
            if (InvalidCountry(request) is { } invalid)
            {
                return invalid;
            }

            if (await db.CustomerAddresses.CountAsync(a => a.UserId == userId, ct) >= MaxAddresses)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]> { [""] = [$"You can save up to {MaxAddresses} addresses."] });
            }

            var address = new CustomerAddress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = request.FullName.Trim(),
                Line1 = request.Line1.Trim(),
                City = request.City.Trim(),
                PostalCode = request.PostalCode.Trim(),
                Country = request.Country.ToUpperInvariant(),
            };
            Apply(address, request);
            await EnsureSingleDefaultAsync(db, userId, address, ct);
            db.CustomerAddresses.Add(address);
            await db.SaveChangesAsync(ct);
            return TypedResults.Created($"/api/v1/account/addresses/{address.Id}", ToDto(address));
        });

        account.MapPut("/addresses/{id:guid}", async Task<Results<Ok<AddressDto>, NotFound, ValidationProblem>> (
            Guid id, SaveAddressRequest request, ClaimsPrincipal principal, IStoreDbContext db, CancellationToken ct) =>
        {
            var userId = UserId(principal);
            if (InvalidCountry(request) is { } invalid)
            {
                return invalid;
            }

            var address = await db.CustomerAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, ct);
            if (address is null)
            {
                return TypedResults.NotFound();
            }

            Apply(address, request);
            await EnsureSingleDefaultAsync(db, userId, address, ct);
            await db.SaveChangesAsync(ct);
            return TypedResults.Ok(ToDto(address));
        });

        account.MapDelete("/addresses/{id:guid}", async Task<Results<NoContent, NotFound>> (
            Guid id, ClaimsPrincipal principal, IStoreDbContext db, CancellationToken ct) =>
        {
            var deleted = await db.CustomerAddresses.Where(a => a.Id == id && a.UserId == UserId(principal)).ExecuteDeleteAsync(ct);
            return deleted == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
        });

        account.MapGet("/orders", (ClaimsPrincipal principal, IStoreDbContext db, CancellationToken ct) =>
            db.Orders.AsNoTracking()
                .Where(o => o.UserId == UserId(principal))
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderSummaryDto(o.OrderNumber, o.Status, o.PaymentStatus, o.Lines.Sum(l => l.Quantity), o.Total, o.Currency, o.CreatedAt))
                .ToListAsync(ct));

        account.MapGet("/orders/{orderNumber}", async Task<Results<Ok<OrderDto>, NotFound>> (
            string orderNumber, ClaimsPrincipal principal, OrderService orders, CancellationToken ct) =>
            await orders.GetOrderAsync(orderNumber, accessToken: null, UserId(principal), ct) is { } order
                ? TypedResults.Ok(order)
                : TypedResults.NotFound());

        account.MapGet("/wishlist", (ClaimsPrincipal principal, IStoreDbContext db, CancellationToken ct) => GetWishlistAsync(db, UserId(principal), ct));

        // The client merges its local wishlist with the server's and sends the full set back.
        account.MapPut("/wishlist", async (ReplaceWishlistRequest request, ClaimsPrincipal principal, IStoreDbContext db, TimeProvider clock, CancellationToken ct) =>
        {
            var userId = UserId(principal);
            var wanted = request.ProductIds.Distinct().ToList();
            var existing = await db.Products.Where(p => wanted.Contains(p.Id) && p.IsPublished).Select(p => p.Id).ToListAsync(ct);

            await db.WishlistItems.Where(w => w.UserId == userId && !existing.Contains(w.ProductId)).ExecuteDeleteAsync(ct);
            var saved = await db.WishlistItems.Where(w => w.UserId == userId).Select(w => w.ProductId).ToListAsync(ct);
            db.WishlistItems.AddRange(existing.Except(saved).Select(id => new WishlistItem { UserId = userId, ProductId = id, AddedAt = clock.GetUtcNow() }));
            await db.SaveChangesAsync(ct);

            return await GetWishlistAsync(db, userId, ct);
        });

        // Erases the account and personal data. Orders are kept for accounting but unlinked.
        account.MapPost("/delete", async Task<Results<NoContent, ValidationProblem, UnauthorizedHttpResult>> (
            DeleteAccountRequest request, ClaimsPrincipal principal, UserManager<AppUser> users, SignInManager<AppUser> signIn) =>
        {
            if (await users.GetUserAsync(principal) is not { } user)
            {
                return TypedResults.Unauthorized();
            }

            if (!await users.CheckPasswordAsync(user, request.Password))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["Password"] = ["That password is not correct."] });
            }

            await users.DeleteAsync(user);
            await signIn.SignOutAsync();
            return TypedResults.NoContent();
        });
    }

    private static string UserId(ClaimsPrincipal principal) =>
        principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new InvalidOperationException("Authenticated user has no id claim.");

    private static ValidationProblem? InvalidCountry(SaveAddressRequest request) =>
        OrderRules.ShippingCountries.Contains(request.Country)
            ? null
            : TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["Country"] = [$"We don't deliver to {request.Country} yet."] });

    private static void Apply(CustomerAddress address, SaveAddressRequest request)
    {
        address.Label = request.Label.Trim();
        address.FullName = request.FullName.Trim();
        address.Line1 = request.Line1.Trim();
        address.Line2 = string.IsNullOrWhiteSpace(request.Line2) ? null : request.Line2.Trim();
        address.City = request.City.Trim();
        address.PostalCode = request.PostalCode.Trim();
        address.Country = request.Country.ToUpperInvariant();
        address.IsDefault = request.IsDefault;
    }

    private static async Task EnsureSingleDefaultAsync(IStoreDbContext db, string userId, CustomerAddress address, CancellationToken ct)
    {
        if (address.IsDefault)
        {
            await db.CustomerAddresses.Where(a => a.UserId == userId && a.Id != address.Id && a.IsDefault)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false), ct);
        }
        else if (!await db.CustomerAddresses.AnyAsync(a => a.UserId == userId && a.Id != address.Id, ct))
        {
            address.IsDefault = true; // The first address is always the default.
        }
    }

    private static AddressDto ToDto(CustomerAddress a) =>
        new(a.Id, a.Label, a.FullName, a.Line1, a.Line2, a.City, a.PostalCode, a.Country, a.IsDefault);

    private static Task<List<WishlistItemDto>> GetWishlistAsync(IStoreDbContext db, string userId, CancellationToken ct) =>
        db.WishlistItems.AsNoTracking()
            .Where(w => w.UserId == userId && w.Product.IsPublished)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WishlistItemDto(w.ProductId, w.Product.Slug, w.Product.Name, w.Product.Category.Name,
                w.Product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault(), w.Product.Price, w.Product.Currency))
            .ToListAsync(ct);
}
