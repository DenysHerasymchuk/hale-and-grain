using System.Security.Cryptography;
using FurnitureStore.Api.Domain;

namespace FurnitureStore.Api.Features.Orders;

public record PaymentResult(PaymentStatus Status, string? Reference);

/// <summary>
/// Integration boundary for a real payment provider (Stripe, Adyen, Mollie...). A real
/// implementation would create a payment intent here and confirm it via webhook.
/// </summary>
public interface IPaymentProvider
{
    Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct);
}

/// <summary>
/// Development checkout. Marks the order as simulated; it never reports a payment as Paid.
/// Only registered when Payments:Provider is "Development".
/// </summary>
public class DevelopmentPaymentProvider(ILogger<DevelopmentPaymentProvider> logger) : IPaymentProvider
{
    public Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct)
    {
        var reference = $"DEV-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4))}";
        logger.LogWarning("Order {OrderNumber} placed with the development payment provider; no money was taken", order.OrderNumber);
        return Task.FromResult(new PaymentResult(PaymentStatus.DevelopmentSimulated, reference));
    }
}

/// <summary>Default when no provider is configured: refuses to take orders rather than pretend.</summary>
public class UnconfiguredPaymentProvider : IPaymentProvider
{
    public Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct) =>
        throw new PaymentsUnavailableException();
}

public class PaymentsUnavailableException() : Exception("No payment provider is configured.");
