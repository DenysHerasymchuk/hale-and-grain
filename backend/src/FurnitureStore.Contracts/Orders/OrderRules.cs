namespace FurnitureStore.Contracts.Orders;

public static class OrderRules
{
    public const int MaxQuantityPerLine = 10;
    public const int MaxLines = 50;

    /// <summary>Countries we deliver to (ISO 3166-1 alpha-2).</summary>
    public static readonly IReadOnlySet<string> ShippingCountries =
        new HashSet<string>(["BE", "NL", "LU", "FR", "DE", "AT", "DK", "IE", "ES", "IT", "PT"], StringComparer.OrdinalIgnoreCase);
}
