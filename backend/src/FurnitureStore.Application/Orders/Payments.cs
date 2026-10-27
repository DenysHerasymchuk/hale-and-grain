using FurnitureStore.Contracts.Orders;
using FurnitureStore.Domain;

namespace FurnitureStore.Application.Orders;

public record PaymentResult(PaymentStatus Status, string? Reference);

public interface IPaymentProvider
{
    Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct);
}

public class PaymentsUnavailableException() : Exception("No payment provider is configured.");
