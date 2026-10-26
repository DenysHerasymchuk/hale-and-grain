using System.ComponentModel.DataAnnotations;
using FurnitureStore.Api.Domain;

namespace FurnitureStore.Api.Features.Orders;

public record CartLineRequest(
    Guid VariantId,
    [property: Range(1, OrderRules.MaxQuantityPerLine)] int Quantity);

public record QuoteRequest(
    [property: Required, MinLength(1), MaxLength(OrderRules.MaxLines)] List<CartLineRequest> Lines);

public record QuoteLineDto(
    Guid VariantId,
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    string VariantName,
    string Sku,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    int Available);

/// <summary>Why a requested line cannot be ordered as asked.</summary>
public record LineProblem(Guid VariantId, string Code, string Message, int Available);

public record QuoteDto(
    IReadOnlyList<QuoteLineDto> Lines,
    IReadOnlyList<LineProblem> Problems,
    string Currency,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total)
{
    public bool CanCheckout => Problems.Count == 0 && Lines.Count > 0;
}

public record ShippingAddressDto(
    [property: Required, StringLength(150)] string Line1,
    [property: StringLength(150)] string? Line2,
    [property: Required, StringLength(100)] string City,
    [property: Required, StringLength(20)] string PostalCode,
    [property: Required, StringLength(2, MinimumLength = 2)] string Country);

public record CreateOrderRequest(
    [property: Required, EmailAddress, StringLength(254)] string Email,
    [property: Required, StringLength(150, MinimumLength = 2)] string FullName,
    [property: Phone, StringLength(30)] string? Phone,
    [property: Required] ShippingAddressDto ShippingAddress,
    [property: Required, MinLength(1), MaxLength(OrderRules.MaxLines)] List<CartLineRequest> Lines);

public record OrderLineDto(
    Guid? ProductId,
    string ProductName,
    string ProductSlug,
    string VariantName,
    string Sku,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal);

public record OrderDto(
    string OrderNumber,
    OrderStatus Status,
    PaymentStatus PaymentStatus,
    string? PaymentReference,
    string Email,
    string FullName,
    string? Phone,
    ShippingAddressDto ShippingAddress,
    IReadOnlyList<OrderLineDto> Lines,
    string Currency,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total,
    DateTimeOffset CreatedAt);

/// <param name="AccessToken">Shown once. Lets a guest reopen the order; only its hash is stored.</param>
public record CreateOrderResponse(OrderDto Order, string AccessToken);

public static class OrderMapping
{
    public static OrderDto ToDto(this Order order) => new(
        order.OrderNumber,
        order.Status,
        order.PaymentStatus,
        order.PaymentReference,
        order.Email,
        order.FullName,
        order.Phone,
        new ShippingAddressDto(order.ShippingAddress.Line1, order.ShippingAddress.Line2, order.ShippingAddress.City,
            order.ShippingAddress.PostalCode, order.ShippingAddress.Country),
        order.Lines
            .Select(l => new OrderLineDto(l.ProductId, l.ProductName, l.ProductSlug, l.VariantName, l.Sku, l.ImageUrl, l.UnitPrice, l.Quantity, l.LineTotal))
            .ToList(),
        order.Currency,
        order.Subtotal,
        order.ShippingCost,
        order.Total,
        order.CreatedAt);
}
