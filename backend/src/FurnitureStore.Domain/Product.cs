namespace FurnitureStore.Domain;

public class Product
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public required string Sku { get; set; }
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public string Currency { get; set; } = "EUR";
    public string? Brand { get; set; }
    public string? Dimensions { get; set; }
    public string? Materials { get; set; }
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public List<ProductImage> Images { get; set; } = [];

    // Inventory lives on variants; every product has at least one (a single-finish
    // product simply has one "Standard" variant). Keeps order lines uniform.
    public List<ProductVariant> Variants { get; set; } = [];

    public ProductModel? Model { get; set; }
}
