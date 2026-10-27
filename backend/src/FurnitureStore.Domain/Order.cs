namespace FurnitureStore.Domain;

public class Order
{
    public Guid Id { get; set; }
    public required string OrderNumber { get; set; }

    public required string AccessTokenHash { get; set; }

    public string? UserId { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public string? Phone { get; set; }
    public required ShippingAddress ShippingAddress { get; set; }

    public string Currency { get; set; } = "EUR";
    public decimal Subtotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Total { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? PaymentReference { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<OrderLine> Lines { get; set; } = [];
}

public class OrderLine
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }

    public Guid? ProductId { get; set; }
    public Guid? VariantId { get; set; }

    public required string ProductName { get; set; }
    public required string ProductSlug { get; set; }
    public required string VariantName { get; set; }
    public required string Sku { get; set; }
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class ShippingAddress
{
    public required string Line1 { get; set; }
    public string? Line2 { get; set; }
    public required string City { get; set; }
    public required string PostalCode { get; set; }
    public required string Country { get; set; }
}

public enum OrderStatus
{
    Pending,
    Confirmed,
    Shipped,
    Delivered,
    Cancelled,
}

public enum PaymentStatus
{
    Pending,

    DevelopmentSimulated,
    Paid,
    Failed,
    Refunded,
}
