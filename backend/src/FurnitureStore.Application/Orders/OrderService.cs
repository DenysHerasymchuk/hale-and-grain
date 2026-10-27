using System.Security.Cryptography;
using System.Text;
using FurnitureStore.Application.Abstractions;
using FurnitureStore.Contracts.Orders;
using FurnitureStore.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FurnitureStore.Application.Orders;

public abstract record CreateOrderResult
{
    public record Created(CreateOrderResponse Response) : CreateOrderResult;

    /// <summary>Prices or stock changed since the customer's last quote; nothing was written.</summary>
    public record Rejected(QuoteDto Quote) : CreateOrderResult;

    public record InvalidCountry(string Country) : CreateOrderResult;
}

public class OrderService(IStoreDbContext db, IPaymentProvider payments, TimeProvider clock, ILogger<OrderService> logger)
{
    public async Task<QuoteDto> QuoteAsync(IReadOnlyList<CartLineRequest> lines, CancellationToken ct)
    {
        var variants = await LoadVariantsAsync(lines, ct);
        var settings = await GetSettingsAsync(ct);
        return OrderPricing.Quote(lines, variants, settings);
    }

    public async Task<CreateOrderResult> CreateOrderAsync(CreateOrderRequest request, string? userId, CancellationToken ct)
    {
        var country = request.ShippingAddress.Country.ToUpperInvariant();
        if (!OrderRules.ShippingCountries.Contains(country))
        {
            return new CreateOrderResult.InvalidCountry(country);
        }

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var quote = await QuoteAsync(request.Lines, ct);
        if (!quote.CanCheckout)
        {
            return new CreateOrderResult.Rejected(quote);
        }

        // Conditional decrement: Postgres re-checks `Stock >= qty` on the locked row, so two
        // concurrent checkouts for the last item cannot both succeed.
        foreach (var line in quote.Lines)
        {
            var reserved = await db.ProductVariants
                .Where(v => v.Id == line.VariantId && v.Stock >= line.Quantity)
                .ExecuteUpdateAsync(s => s.SetProperty(v => v.Stock, v => v.Stock - line.Quantity), ct);

            if (reserved == 0)
            {
                await transaction.RollbackAsync(ct);
                db.ChangeTracker.Clear();
                return new CreateOrderResult.Rejected(await QuoteAsync(request.Lines, ct));
            }
        }

        var now = clock.GetUtcNow();
        var accessToken = NewAccessToken();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = NewOrderNumber(now),
            AccessTokenHash = HashToken(accessToken),
            UserId = userId,
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            ShippingAddress = new ShippingAddress
            {
                Line1 = request.ShippingAddress.Line1.Trim(),
                Line2 = string.IsNullOrWhiteSpace(request.ShippingAddress.Line2) ? null : request.ShippingAddress.Line2.Trim(),
                City = request.ShippingAddress.City.Trim(),
                PostalCode = request.ShippingAddress.PostalCode.Trim(),
                Country = country,
            },
            Currency = quote.Currency,
            Subtotal = quote.Subtotal,
            ShippingCost = quote.ShippingCost,
            Total = quote.Total,
            CreatedAt = now,
            UpdatedAt = now,
            Lines = quote.Lines.Select(l => new OrderLine
            {
                Id = Guid.NewGuid(),
                ProductId = l.ProductId,
                VariantId = l.VariantId,
                ProductName = l.ProductName,
                ProductSlug = l.ProductSlug,
                VariantName = l.VariantName,
                Sku = l.Sku,
                ImageUrl = l.ImageUrl,
                UnitPrice = l.UnitPrice,
                Quantity = l.Quantity,
                LineTotal = l.LineTotal,
            }).ToList(),
        };

        var payment = await payments.AuthorizeAsync(order, ct);
        order.PaymentStatus = payment.Status;
        order.PaymentReference = payment.Reference;

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        logger.LogInformation("Order {OrderNumber} created: {LineCount} lines, total {Total} {Currency}",
            order.OrderNumber, order.Lines.Count, order.Total, order.Currency);

        return new CreateOrderResult.Created(new CreateOrderResponse(order.ToDto(), accessToken));
    }

    /// <summary>
    /// Returns the order only to its signed-in owner or to someone holding its access token.
    /// Anything else is indistinguishable from "not found", so order numbers can't be probed.
    /// </summary>
    public async Task<OrderDto?> GetOrderAsync(string orderNumber, string? accessToken, string? userId, CancellationToken ct)
    {
        var order = await db.Orders.AsNoTracking()
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        if (order is null)
        {
            return null;
        }

        var ownedByUser = userId is not null && order.UserId == userId;
        var tokenMatches = accessToken is not null && CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(HashToken(accessToken)), Encoding.ASCII.GetBytes(order.AccessTokenHash));

        return ownedByUser || tokenMatches ? order.ToDto() : null;
    }

    private async Task<Dictionary<Guid, PricedVariant>> LoadVariantsAsync(IReadOnlyList<CartLineRequest> lines, CancellationToken ct)
    {
        var ids = lines.Select(l => l.VariantId).Distinct().ToList();
        return await db.ProductVariants.AsNoTracking()
            .Where(v => ids.Contains(v.Id))
            .Select(v => new PricedVariant(
                v.Id,
                v.ProductId,
                v.Product.Name,
                v.Product.Slug,
                v.Name,
                v.Sku,
                v.Product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault(),
                v.Product.Price,
                v.PriceAdjustment,
                v.Stock,
                v.Product.IsPublished))
            .ToDictionaryAsync(v => v.VariantId, ct);
    }

    private async Task<StoreSettings> GetSettingsAsync(CancellationToken ct) =>
        await db.StoreSettings.AsNoTracking().FirstOrDefaultAsync(ct) ?? new StoreSettings();

    // Crockford-style alphabet: no 0/O or 1/I/L to misread over the phone.
    private const string OrderNumberAlphabet = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

    // ponytail: 30^6 random suffix per day; a collision hits the unique index and the request
    // fails with a 500. Retry on DbUpdateException if order volume ever makes that plausible.
    private static string NewOrderNumber(DateTimeOffset now) =>
        $"HG-{now:yyMMdd}-{RandomNumberGenerator.GetString(OrderNumberAlphabet, 6)}";

    private static string NewAccessToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(24)).Replace('+', '-').Replace('/', '_');

    public static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
