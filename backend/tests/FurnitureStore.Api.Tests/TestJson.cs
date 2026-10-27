using System.Text.Json;
using System.Text.Json.Serialization;

namespace FurnitureStore.Tests;

/// <summary>Matches the API's JSON settings (camelCase enums as strings).</summary>
public static class TestJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };
}
