namespace FurnitureStore.Domain;

/// <summary>Reference to a 3D asset served as a static file; binaries never go in the database.</summary>
public class ProductModel
{
    public required string Url { get; set; }
    public ModelFormat Format { get; set; } = ModelFormat.Glb;
    public long? FileSizeBytes { get; set; }
    public string? Attribution { get; set; }
    public string? AttributionUrl { get; set; }
    public string? License { get; set; }
    public ModelConfig Config { get; set; } = new();
}

public class ModelConfig
{
    public double Scale { get; set; } = 1;
    public double[] Rotation { get; set; } = [0, 0, 0];
    public double[] Offset { get; set; } = [0, 0, 0];
    public double[]? CameraPosition { get; set; }

    /// <summary>Material names in the asset that variant tints apply to. Model-specific.</summary>
    public List<string> MaterialTargets { get; set; } = [];
}

public enum ModelFormat
{
    Glb,
    Gltf,
}
