using FurnitureStore.Application.Abstractions;
using FurnitureStore.Application.Orders;
using FurnitureStore.Domain;
using FurnitureStore.Infrastructure.Email;
using FurnitureStore.Infrastructure.Payments;
using FurnitureStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FurnitureStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<StoreDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Store"),
                npgsql => npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));
        services.AddScoped<IStoreDbContext>(provider => provider.GetRequiredService<StoreDbContext>());

        services.AddTransient<IEmailSender<AppUser>, LoggingEmailSender>();

        if (configuration["Payments:Provider"] == "Development")
        {
            services.AddScoped<IPaymentProvider, DevelopmentPaymentProvider>();
        }
        else
        {
            services.AddScoped<IPaymentProvider, UnconfiguredPaymentProvider>();
        }

        return services;
    }
}
