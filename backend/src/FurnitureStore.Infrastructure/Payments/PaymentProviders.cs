using System.Security.Cryptography;
using FurnitureStore.Application.Orders;
using FurnitureStore.Domain;
using Microsoft.Extensions.Logging;

namespace FurnitureStore.Infrastructure.Payments;

public class DevelopmentPaymentProvider(ILogger<DevelopmentPaymentProvider> logger) : IPaymentProvider
{
    public Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct)
    {
        var reference = $"DEV-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4))}";
        logger.LogWarning("Order {OrderNumber} placed with the development payment provider; no money was taken", order.OrderNumber);
        return Task.FromResult(new PaymentResult(PaymentStatus.DevelopmentSimulated, reference));
    }
}

public class UnconfiguredPaymentProvider : IPaymentProvider
{
    public Task<PaymentResult> AuthorizeAsync(Order order, CancellationToken ct) =>
        throw new PaymentsUnavailableException();
}
