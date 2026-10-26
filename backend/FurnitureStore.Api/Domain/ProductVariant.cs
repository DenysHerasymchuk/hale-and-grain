namespace FurnitureStore.Api.Domain;

public class ProductVariant
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public required string Sku { get; set; }
    public required string Name { get; set; }
    public string? Material { get; set; }
    public string? Size { get; set; }
    public string SwatchHex { get; set; } = "#c8b49a";
    public decimal PriceAdjustment { get; set; }
    public int Stock { get; set; }
    public int DisplayOrder { get; set; }

    /// <summary>Colour multiplied into the model's target materials; null leaves textures untouched.</summary>
    public string? ModelTint { get; set; }

    public decimal UnitPrice => Product.Price + PriceAdjustment;
}
