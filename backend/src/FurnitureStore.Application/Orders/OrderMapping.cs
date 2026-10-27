using FurnitureStore.Contracts.Orders;
using FurnitureStore.Domain;

namespace FurnitureStore.Application.Orders;

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
