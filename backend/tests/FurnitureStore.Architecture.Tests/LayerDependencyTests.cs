using System.Reflection;
using NetArchTest.Rules;

namespace FurnitureStore.Architecture.Tests;

/// <summary>
/// The dependency rule: each layer may only point inwards.
/// Api -> Infrastructure -> Application -> Contracts -> Domain.
/// </summary>
public class LayerDependencyTests
{
    private const string DomainNs = "FurnitureStore.Domain";
    private const string ContractsNs = "FurnitureStore.Contracts";
    private const string ApplicationNs = "FurnitureStore.Application";
    private const string InfrastructureNs = "FurnitureStore.Infrastructure";
    private const string ApiNs = "FurnitureStore.Api";

    private static readonly Assembly Domain = typeof(FurnitureStore.Domain.Product).Assembly;
    private static readonly Assembly Contracts = typeof(FurnitureStore.Contracts.Orders.OrderDto).Assembly;
    private static readonly Assembly Application = typeof(FurnitureStore.Application.DependencyInjection).Assembly;
    private static readonly Assembly Infrastructure = typeof(FurnitureStore.Infrastructure.DependencyInjection).Assembly;

    private static void AssertNoDependency(Assembly assembly, params string[] forbidden)
    {
        var result = Types.InAssembly(assembly).ShouldNot().HaveDependencyOnAny(forbidden).GetResult();
        var offenders = string.Join(", ", result.FailingTypeNames ?? []);
        Assert.True(result.IsSuccessful, $"{assembly.GetName().Name} must not depend on [{string.Join(", ", forbidden)}]; offending types: {offenders}");
    }

    [Fact]
    public void Domain_depends_on_no_other_layer_and_no_database() =>
        AssertNoDependency(Domain, ContractsNs, ApplicationNs, InfrastructureNs, ApiNs, "Microsoft.EntityFrameworkCore");

    [Fact]
    public void Contracts_only_know_the_domain() =>
        AssertNoDependency(Contracts, ApplicationNs, InfrastructureNs, ApiNs, "Microsoft.EntityFrameworkCore");

    [Fact]
    public void Application_does_not_depend_on_infrastructure_api_or_a_database_provider() =>
        AssertNoDependency(Application, InfrastructureNs, ApiNs, "Npgsql", "Microsoft.AspNetCore");

    [Fact]
    public void Infrastructure_does_not_depend_on_the_api() =>
        AssertNoDependency(Infrastructure, ApiNs);
}
