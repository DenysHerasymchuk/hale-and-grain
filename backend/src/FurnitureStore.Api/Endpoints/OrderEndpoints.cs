using System.Security.Claims;
using FurnitureStore.Application.Orders;
using FurnitureStore.Contracts.Orders;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FurnitureStore.Api.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapPost("/cart/quote", (QuoteRequest request, OrderService orders, CancellationToken ct) =>
                orders.QuoteAsync(request.Lines, ct))
            .WithTags("Orders")
            .WithSummary("Price a cart with current prices, stock and delivery");

        var group = api.MapGroup("/orders").WithTags("Orders");

        group.MapPost("/", async Task<Results<Created<CreateOrderResponse>, Conflict<QuoteDto>, ValidationProblem, ProblemHttpResult>> (
                CreateOrderRequest request, OrderService orders, ClaimsPrincipal user, CancellationToken ct) =>
            {
                try
                {
                    var result = await orders.CreateOrderAsync(request, UserId(user), ct);
                    return result switch
                    {
                        CreateOrderResult.Created created => TypedResults.Created(
                            $"/api/v1/orders/{created.Response.Order.OrderNumber}", created.Response),
                        CreateOrderResult.Rejected rejected => TypedResults.Conflict(rejected.Quote),
                        CreateOrderResult.InvalidCountry invalid => TypedResults.ValidationProblem(new Dictionary<string, string[]>
                        {
                            ["ShippingAddress.Country"] = [$"We don't deliver to {invalid.Country} yet."],
                        }),
                        _ => throw new InvalidOperationException("Unhandled order result"),
                    };
                }
                catch (PaymentsUnavailableException)
                {
                    return TypedResults.Problem("Checkout is temporarily unavailable. Please try again later.",
                        statusCode: StatusCodes.Status503ServiceUnavailable);
                }
            })
            .RequireRateLimiting("orders");

        group.MapGet("/{orderNumber}", async Task<Results<Ok<OrderDto>, NotFound>> (
                string orderNumber, string? token, OrderService orders, ClaimsPrincipal user, CancellationToken ct) =>
            await orders.GetOrderAsync(orderNumber, token, UserId(user), ct) is { } order
                ? TypedResults.Ok(order)
                : TypedResults.NotFound())
            .RequireRateLimiting("orders");
    }

    private static string? UserId(ClaimsPrincipal user) =>
        user.Identity?.IsAuthenticated == true ? user.FindFirstValue(ClaimTypes.NameIdentifier) : null;
}
