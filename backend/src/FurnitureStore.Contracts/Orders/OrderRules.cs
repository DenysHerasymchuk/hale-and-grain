namespace FurnitureStore.Contracts.Orders;

public static class OrderRules
{
    public const int MaxQuantityPerLine = 10;
    public const int MaxLines = 50;

    public static readonly IReadOnlySet<string> ShippingCountries =
        new HashSet<string>(["BE", "NL", "LU", "FR", "DE", "AT", "DK", "IE", "ES", "IT", "PT"], StringComparer.OrdinalIgnoreCase);
}
