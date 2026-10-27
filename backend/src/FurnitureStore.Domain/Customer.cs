using Microsoft.AspNetCore.Identity;

namespace FurnitureStore.Domain;

public class AppUser : IdentityUser
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public bool MarketingEmails { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public List<CustomerAddress> Addresses { get; set; } = [];
}

public class CustomerAddress
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public string Label { get; set; } = "Home";
    public required string FullName { get; set; }
    public required string Line1 { get; set; }
    public string? Line2 { get; set; }
    public required string City { get; set; }
    public required string PostalCode { get; set; }
    public required string Country { get; set; }
    public bool IsDefault { get; set; }
}

public class WishlistItem
{
    public required string UserId { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTimeOffset AddedAt { get; set; }
}

public static class Roles
{
    public const string Admin = "Admin";
}
