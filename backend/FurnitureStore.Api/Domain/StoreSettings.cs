namespace FurnitureStore.Api.Domain;

/// <summary>Single-row table edited from the admin settings page.</summary>
public class StoreSettings
{
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;
    public string StoreName { get; set; } = "Hale & Grain";
    public string SupportEmail { get; set; } = "studio@haleandgrain.example";
    public string Currency { get; set; } = "EUR";
    public decimal FlatShippingCost { get; set; } = 49m;
    public decimal FreeShippingThreshold { get; set; } = 750m;
    public int LowStockThreshold { get; set; } = 3;
}
