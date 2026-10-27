using FurnitureStore.Contracts.Orders;
using FurnitureStore.Domain;

namespace FurnitureStore.Application.Orders;

public record PaymentResult(PaymentStatus Status, string? Reference);

/// <summary>
/// Integration boundary for a real payment provider (Stripe, Adyen, Mollie...). A real
/// implementation would create a payment intent here and confirm it via webhook.
/// </summary>
public interface IPaymentProvider
{
    Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct);
}

public class PaymentsUnavailableException() : Exception("No payment provider is configured.");
