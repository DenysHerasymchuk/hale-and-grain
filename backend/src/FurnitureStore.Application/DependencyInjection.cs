using FurnitureStore.Application.Catalog;
using FurnitureStore.Application.Orders;
using Microsoft.Extensions.DependencyInjection;

namespace FurnitureStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<CatalogService>();
        services.AddScoped<OrderService>();
        return services;
    }
}
