using System.Security.Claims;
using FurnitureStore.Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace FurnitureStore.Api.Features.Account;

public record SessionDto(string Id, string Email, string FirstName, string LastName, bool IsAdmin);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder api)
    {
        var auth = api.MapGroup("/auth").WithTags("Auth").RequireRateLimiting("auth");

        // register, login (?useCookies=true), forgotPassword, resetPassword, manage/info...
        auth.MapIdentityApi<AppUser>();

        auth.MapPost("/logout", async (SignInManager<AppUser> signIn) =>
        {
            await signIn.SignOutAsync();
            return TypedResults.NoContent();
        }).RequireAuthorization();

        auth.MapGet("/me", async Task<Results<Ok<SessionDto>, UnauthorizedHttpResult>> (ClaimsPrincipal principal, UserManager<AppUser> users) =>
        {
            var user = await users.GetUserAsync(principal);
            if (user is null)
            {
                return TypedResults.Unauthorized();
            }

            var isAdmin = await users.IsInRoleAsync(user, Roles.Admin);
            return TypedResults.Ok(new SessionDto(user.Id, user.Email ?? "", user.FirstName, user.LastName, isAdmin));
        }).RequireAuthorization();
    }
}
