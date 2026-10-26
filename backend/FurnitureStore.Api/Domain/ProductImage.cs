namespace FurnitureStore.Api.Domain;

public class ProductImage
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public required string Url { get; set; }
    public string AltText { get; set; } = "";
    public int DisplayOrder { get; set; }
    public ImageRole Role { get; set; } = ImageRole.Gallery;
}

public enum ImageRole
{
    Primary,
    Gallery,
    Detail,
    Lifestyle,
}
