using System.Security.Claims;
using FurnitureStore.Contracts.Account;
using FurnitureStore.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace FurnitureStore.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder api)
    {
        var auth = api.MapGroup("/auth").WithTags("Auth").RequireRateLimiting("auth");

        auth.MapIdentityApi<AppUser>();

        auth.MapPost("/logout", async (SignInManager<AppUser> signIn) =>
        {
            await signIn.SignOutAsync();
            return TypedResults.NoContent();
        }).RequireAuthorization().DisableRateLimiting();

        auth.MapGet("/me", async Task<Results<Ok<SessionDto>, UnauthorizedHttpResult>> (ClaimsPrincipal principal, UserManager<AppUser> users) =>
        {
            var user = await users.GetUserAsync(principal);
            if (user is null)
            {
                return TypedResults.Unauthorized();
            }

            var isAdmin = await users.IsInRoleAsync(user, Roles.Admin);
            return TypedResults.Ok(new SessionDto(user.Id, user.Email ?? "", user.FirstName, user.LastName, isAdmin));
        }).RequireAuthorization().DisableRateLimiting();
    }
}
