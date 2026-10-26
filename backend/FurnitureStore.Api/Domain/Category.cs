namespace FurnitureStore.Api.Domain;

public class Category
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string Description { get; set; } = "";
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }

    public List<Product> Products { get; set; } = [];
}
