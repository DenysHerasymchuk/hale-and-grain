using System.ComponentModel.DataAnnotations;
using FurnitureStore.Domain;

namespace FurnitureStore.Contracts.Account;

public record ProfileDto(string Email, string FirstName, string LastName, bool MarketingEmails, DateTimeOffset CreatedAt);

public record UpdateProfileRequest(
    [property: StringLength(100)] string FirstName,
    [property: StringLength(100)] string LastName,
    bool MarketingEmails);

public record AddressDto(Guid Id, string Label, string FullName, string Line1, string? Line2, string City, string PostalCode, string Country, bool IsDefault);

public record SaveAddressRequest(
    [property: Required, StringLength(50)] string Label,
    [property: Required, StringLength(150)] string FullName,
    [property: Required, StringLength(150)] string Line1,
    [property: StringLength(150)] string? Line2,
    [property: Required, StringLength(100)] string City,
    [property: Required, StringLength(20)] string PostalCode,
    [property: Required, StringLength(2, MinimumLength = 2)] string Country,
    bool IsDefault);

public record OrderSummaryDto(string OrderNumber, OrderStatus Status, PaymentStatus PaymentStatus, int ItemCount, decimal Total, string Currency, DateTimeOffset CreatedAt);

public record WishlistItemDto(Guid ProductId, string Slug, string Name, string CategoryName, string? ImageUrl, decimal Price, string Currency);

public record ReplaceWishlistRequest([property: MaxLength(200)] List<Guid> ProductIds);

public record DeleteAccountRequest([property: Required] string Password);

public record SessionDto(string Id, string Email, string FirstName, string LastName, bool IsAdmin);
