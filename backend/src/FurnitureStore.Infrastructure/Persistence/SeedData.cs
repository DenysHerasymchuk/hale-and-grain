using FurnitureStore.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FurnitureStore.Infrastructure.Persistence;

public static class SeedData
{
    private const string PolyHavenLicense = "CC0 1.0";
    private static readonly DateTimeOffset SeededAt = new(2026, 10, 1, 9, 0, 0, TimeSpan.Zero);

    public static async Task SeedCatalogAsync(StoreDbContext db, CancellationToken ct = default)
    {
        if (await db.Categories.AnyAsync(ct))
        {
            return;
        }

        var tables = Category("1a000000-0000-0000-0000-000000000001", "Tables", "tables", 1,
            "Dining and work tables built around solid timber tops and honest joinery.");
        var storage = Category("1a000000-0000-0000-0000-000000000002", "Storage", "storage", 2,
            "Cabinets and chests that keep the everyday out of sight and the room calm.");
        var shelving = Category("1a000000-0000-0000-0000-000000000003", "Shelving", "shelving", 3,
            "Open shelving for books, ceramics and the things worth looking at.");
        var consoles = Category("1a000000-0000-0000-0000-000000000004", "Consoles", "consoles", 4,
            "Slim consoles for hallways, behind sofas and beneath a favourite print.");

        db.Categories.AddRange(tables, storage, shelving, consoles);
        db.Products.AddRange(
            HarrowDiningTable(tables.Id),
            AtelierDrawerCabinet(storage.Id),
            ForgeShelvingUnit(shelving.Id),
            OrchardDisplayShelf(shelving.Id),
            LuneConsole(consoles.Id));

        await db.SaveChangesAsync(ct);
    }

    public static async Task SeedAdminAsync(UserManager<AppUser> users, RoleManager<IdentityRole> roles,
        string? email, string? password, ILogger logger)
    {
        if (!await roles.RoleExistsAsync(Roles.Admin))
        {
            await roles.CreateAsync(new IdentityRole(Roles.Admin));
        }

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogInformation("Seed:AdminEmail/Seed:AdminPassword not set; skipping admin account seed");
            return;
        }

        if (await users.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var admin = new AppUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = "Studio",
            LastName = "Admin",
            CreatedAt = DateTimeOffset.UtcNow,
        };
        var result = await users.CreateAsync(admin, password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                "Could not seed admin account: " + string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        await users.AddToRoleAsync(admin, Roles.Admin);
        logger.LogInformation("Seeded admin account {Email}", email);
    }

    private static Product HarrowDiningTable(Guid categoryId) => new()
    {
        Id = Guid.Parse("2b000000-0000-0000-0000-000000000001"),
        Name = "Harrow Dining Table",
        Slug = "harrow-dining-table",
        Sku = "HG-TBL-HARROW",
        ShortDescription = "A compact solid-timber table with a framed plank top and tapered legs. Seats four.",
        Description = """
            Harrow is the table we built for long dinners. The top is edge-glued from wide, straight-grained
            boards and finished with a hard-wax oil that takes everyday wear and repairs with a cloth.

            At 113 cm it suits a kitchen or a small dining room, and doubles as a generous writing desk. The
            legs taper towards the floor so four chairs tuck in without anyone straddling a leg.
            """,
        Price = 1890m,
        CategoryId = categoryId,
        Brand = "Hale & Grain Studio",
        Dimensions = "W 113 × D 71 × H 80 cm",
        Materials = "Solid timber, hard-wax oil finish",
        IsPublished = true,
        IsFeatured = true,
        CreatedAt = SeededAt,
        UpdatedAt = SeededAt,
        Images = Images("harrow-dining-table", "Harrow dining table"),
        Model = PolyHavenModel("harrow-dining-table", "wooden_table_02", "Wooden Table 02"),
        Variants =
        [
            Variant("3c000000-0000-0000-0001-000000000001", "HG-TBL-HARROW-NAT", "Natural", "#c49a6c", null, 0m, 6, 0),
            Variant("3c000000-0000-0000-0001-000000000002", "HG-TBL-HARROW-SMK", "Smoked", "#7a5a43", "#9b7b66", 120m, 3, 1),
            Variant("3c000000-0000-0000-0001-000000000003", "HG-TBL-HARROW-EBN", "Ebonised", "#3a302b", "#6b5f59", 180m, 2, 2),
        ],
    };

    private static Product AtelierDrawerCabinet(Guid categoryId) => new()
    {
        Id = Guid.Parse("2b000000-0000-0000-0000-000000000002"),
        Name = "Atelier Drawer Cabinet",
        Slug = "atelier-drawer-cabinet",
        Sku = "HG-STO-ATELIER",
        ShortDescription = "Four oak drawers beneath two open shelves, held in a slim blackened frame.",
        Description = """
            Inspired by the cabinets in old print studios, Atelier pairs open display space with a bank of
            four full-width drawers. Each drawer runs on timber guides, waxed so it glides without hardware.

            There are no handles to catch a sleeve: a recessed finger groove runs under every drawer front.
            The carcass is finished on all four sides, so it can stand away from the wall as a room divider.
            """,
        Price = 1450m,
        CategoryId = categoryId,
        Brand = "Hale & Grain Studio",
        Dimensions = "W 114 × D 49 × H 188 cm",
        Materials = "Oak drawers and shelves, blackened ash frame",
        IsPublished = true,
        IsFeatured = true,
        CreatedAt = SeededAt.AddDays(1),
        UpdatedAt = SeededAt.AddDays(1),
        Images = Images("atelier-drawer-cabinet", "Atelier drawer cabinet"),
        Model = PolyHavenModel("atelier-drawer-cabinet", "drawer_cabinet", "Drawer Cabinet"),
        Variants =
        [
            Variant("3c000000-0000-0000-0002-000000000001", "HG-STO-ATELIER-NAT", "Natural", "#b98d62", null, 0m, 4, 0),
            Variant("3c000000-0000-0000-0002-000000000002", "HG-STO-ATELIER-SMK", "Smoked", "#6f513d", "#9b7b66", 90m, 2, 1),
        ],
    };

    private static Product ForgeShelvingUnit(Guid categoryId) => new()
    {
        Id = Guid.Parse("2b000000-0000-0000-0000-000000000003"),
        Name = "Forge Shelving Unit",
        Slug = "forge-shelving-unit",
        Sku = "HG-SHL-FORGE",
        ShortDescription = "Powder-coated steel uprights with timber shelves. Workshop-built, home-ready.",
        Description = """
            Forge borrows its frame from workshop racking: welded steel uprights, cross-braced so the unit
            stands true without being fixed to a wall. The shelves drop into the frame and lift out for cleaning.

            It is deliberately plain. Load it with books and records, or leave it half-empty in a hallway as a
            place for keys, post and plants.
            """,
        Price = 790m,
        CategoryId = categoryId,
        Brand = "Hale & Grain Studio",
        Dimensions = "W 110 × D 50 × H 214 cm",
        Materials = "Powder-coated steel, oak shelves",
        IsPublished = true,
        IsFeatured = false,
        CreatedAt = SeededAt.AddDays(2),
        UpdatedAt = SeededAt.AddDays(2),
        Images = Images("forge-shelving-unit", "Forge shelving unit"),
        Model = PolyHavenModel("forge-shelving-unit", "steel_frame_shelves_01", "Steel Frame Shelves 01"),
        Variants =
        [
            Variant("3c000000-0000-0000-0003-000000000001", "HG-SHL-FORGE-STD", "Raw steel", "#5d6063", null, 0m, 9, 0),
        ],
    };

    private static Product OrchardDisplayShelf(Guid categoryId) => new()
    {
        Id = Guid.Parse("2b000000-0000-0000-0000-000000000004"),
        Name = "Orchard Display Shelf",
        Slug = "orchard-display-shelf",
        Sku = "HG-SHL-ORCHARD",
        ShortDescription = "An open timber shelf with three pull-out drawers beneath, for ceramics, books and plants.",
        Description = """
            Orchard is all timber: no metal brackets, no visible fixings. The shelves are housed into the
            side panels so the joinery itself carries the load.

            Three small drawers sit along the base for the things you'd rather not display. The shelves above
            are sized for real objects: oversized art books below, a row of cups or a trailing plant on top.
            """,
        Price = 680m,
        CategoryId = categoryId,
        Brand = "Hale & Grain Studio",
        Dimensions = "W 108 × D 37 × H 156 cm",
        Materials = "Solid timber, oil finish",
        IsPublished = true,
        IsFeatured = true,
        CreatedAt = SeededAt.AddDays(3),
        UpdatedAt = SeededAt.AddDays(3),
        Images = Images("orchard-display-shelf", "Orchard display shelf"),
        Model = PolyHavenModel("orchard-display-shelf", "wooden_display_shelves_01", "Wooden Display Shelves 01"),
        Variants =
        [
            Variant("3c000000-0000-0000-0004-000000000001", "HG-SHL-ORCHARD-NAT", "Natural", "#c9a27a", null, 0m, 7, 0),
            Variant("3c000000-0000-0000-0004-000000000002", "HG-SHL-ORCHARD-WHT", "Whitewashed", "#e2d8c8", "#f2ece2", 60m, 0, 1),
        ],
    };

    private static Product LuneConsole(Guid categoryId) => new()
    {
        Id = Guid.Parse("2b000000-0000-0000-0000-000000000005"),
        Name = "Lune Console",
        Slug = "lune-console",
        Sku = "HG-CON-LUNE",
        ShortDescription = "A long hardwood console with carved spandrels and pierced roundels, after a Chinese altar table.",
        Description = """
            Lune takes its proportions from the traditional Chinese altar table: a long, narrow top with
            upturned ends, carried on two panel legs with hand-carved roundels and scrolling spandrels.

            The oil finish is built up in thin coats and hand-rubbed between each one, giving a soft sheen
            that deepens with age. Use it in an entrance, behind a sofa, or along a wall as a display table.
            """,
        Price = 1290m,
        CategoryId = categoryId,
        Brand = "Hale & Grain Studio",
        Dimensions = "W 172 × D 34 × H 66 cm",
        Materials = "Solid hardwood, hand-rubbed oil",
        IsPublished = true,
        IsFeatured = true,
        CreatedAt = SeededAt.AddDays(4),
        UpdatedAt = SeededAt.AddDays(4),
        Images = Images("lune-console", "Lune console"),
        Model = PolyHavenModel("lune-console", "chinese_console_table", "Chinese Console Table"),
        Variants =
        [
            Variant("3c000000-0000-0000-0005-000000000001", "HG-CON-LUNE-NAT", "Natural", "#8a5a3c", null, 0m, 3, 0),
            Variant("3c000000-0000-0000-0005-000000000002", "HG-CON-LUNE-BLK", "Ebonised", "#231f1d", "#6b5f59", 150m, 1, 1),
        ],
    };

    private static Category Category(string id, string name, string slug, int order, string description) => new()
    {
        Id = Guid.Parse(id),
        Name = name,
        Slug = slug,
        DisplayOrder = order,
        Description = description,
        ImageUrl = $"/images/categories/{slug}.webp",
    };

    private static ProductVariant Variant(string id, string sku, string name, string swatch, string? tint,
        decimal priceAdjustment, int stock, int order) => new()
    {
        Id = Guid.Parse(id),
        Sku = sku,
        Name = name,
        Material = name,
        SwatchHex = swatch,
        ModelTint = tint,
        PriceAdjustment = priceAdjustment,
        Stock = stock,
        DisplayOrder = order,
    };

    private static List<ProductImage> Images(string slug, string name) =>
    [
        new() { Url = $"/images/products/{slug}-1.webp", AltText = $"{name}, three-quarter view", DisplayOrder = 0, Role = ImageRole.Primary },
        new() { Url = $"/images/products/{slug}-2.webp", AltText = $"{name}, front view", DisplayOrder = 1 },
        new() { Url = $"/images/products/{slug}-3.webp", AltText = $"{name}, side view", DisplayOrder = 2 },
        new() { Url = $"/images/products/{slug}-4.webp", AltText = $"{name}, detail", DisplayOrder = 3, Role = ImageRole.Detail },
    ];

    private static ProductModel PolyHavenModel(string slug, string assetId, string assetName) => new()
    {
        Url = $"/models/{slug}.glb",
        Format = ModelFormat.Glb,
        Attribution = $"\"{assetName}\" from Poly Haven",
        AttributionUrl = $"https://polyhaven.com/a/{assetId}",
        License = PolyHavenLicense,
        Config = new ModelConfig { MaterialTargets = [assetId] },
    };
}
