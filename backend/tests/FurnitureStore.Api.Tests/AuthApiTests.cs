using System.Net;
using System.Net.Http.Json;
using FurnitureStore.Contracts.Account;

namespace FurnitureStore.Tests;

[Collection(ApiCollection.Name)]
public class AuthApiTests(StoreApiFactory factory)
{
    [Fact]
    public async Task Session_endpoint_rejects_guests()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_then_cookie_login_establishes_a_session()
    {
        var client = factory.CreateClient();
        var credentials = new { email = $"{Guid.NewGuid():N}@example.com", password = "Lovely-Oak-2026" };

        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/register", credentials)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=true", credentials)).StatusCode);

        var session = await client.GetFromJsonAsync<SessionDto>("/api/v1/auth/me", TestJson.Options);
        Assert.Equal(credentials.email, session!.Email);
        Assert.False(session.IsAdmin);

        await client.PostAsJsonAsync("/api/v1/auth/logout", new { });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Weak_passwords_are_rejected()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/api/v1/auth/register", new { email = "weak@example.com", password = "short1A" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Seeded_admin_has_the_admin_role()
    {
        var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/v1/auth/login?useCookies=true", new { email = StoreApiFactory.AdminEmail, password = StoreApiFactory.AdminPassword });

        var session = await client.GetFromJsonAsync<SessionDto>("/api/v1/auth/me", TestJson.Options);
        Assert.True(session!.IsAdmin);
    }
}
