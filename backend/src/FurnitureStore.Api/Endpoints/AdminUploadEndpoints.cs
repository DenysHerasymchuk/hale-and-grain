using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FurnitureStore.Api.Endpoints;

public record UploadResult(string Url, long FileSizeBytes);

public static class AdminUploadEndpoints
{
    public const long MaxModelBytes = 50 * 1024 * 1024;
    public const long MaxImageBytes = 10 * 1024 * 1024;

    public static void MapAdminUploadEndpoints(this RouteGroupBuilder admin)
    {
        var uploads = admin.MapGroup("/uploads").DisableAntiforgery();

        uploads.MapPost("/models", (IFormFile file, IConfiguration config, IWebHostEnvironment env, CancellationToken ct) =>
                SaveAsync(file, MaxModelBytes, DetectModel, UploadsPath(config, env), ct))
            .WithMetadata(new RequestSizeLimitAttribute(MaxModelBytes + 1024 * 1024));

        uploads.MapPost("/images", (IFormFile file, IConfiguration config, IWebHostEnvironment env, CancellationToken ct) =>
                SaveAsync(file, MaxImageBytes, DetectImage, UploadsPath(config, env), ct))
            .WithMetadata(new RequestSizeLimitAttribute(MaxImageBytes + 1024 * 1024));
    }

    public static string UploadsPath(IConfiguration config, IWebHostEnvironment env) =>
        config["Uploads:Path"] is { Length: > 0 } path ? path : Path.Combine(env.ContentRootPath, "uploads");

    private static async Task<Results<Ok<UploadResult>, ValidationProblem>> SaveAsync(
        IFormFile file, long maxBytes, Func<byte[], string?> detect, string directory, CancellationToken ct)
    {
        if (file.Length == 0 || file.Length > maxBytes)
        {
            return Invalid($"The file must be between 1 byte and {maxBytes / 1024 / 1024} MB.");
        }

        var header = new byte[12];
        await using (var stream = file.OpenReadStream())
        {
            await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, ct);
        }

        if (detect(header) is not { } extension)
        {
            return Invalid("That file type isn't supported.");
        }

        Directory.CreateDirectory(directory);
        var name = $"{Guid.NewGuid():N}{extension}";
        await using (var target = File.Create(Path.Combine(directory, name)))
        {
            await file.CopyToAsync(target, ct);
        }

        return TypedResults.Ok(new UploadResult($"/uploads/{name}", file.Length));
    }

    private static ValidationProblem Invalid(string message) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["file"] = [message] });

    private static string? DetectModel(byte[] h) => h is [0x67, 0x6C, 0x54, 0x46, ..] ? ".glb" : null;

    private static string? DetectImage(byte[] h) => h switch
    {
        [0xFF, 0xD8, 0xFF, ..] => ".jpg",
        [0x89, 0x50, 0x4E, 0x47, ..] => ".png",
        [0x52, 0x49, 0x46, 0x46, _, _, _, _, 0x57, 0x45, 0x42, 0x50] => ".webp",
        _ => null,
    };
}
