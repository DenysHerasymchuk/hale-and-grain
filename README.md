<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/logo-beige.png" />
    <img src="assets/brand/logo-ink.png" alt="Hale & Grain" width="420" />
  </picture>
</p>

<p align="center"><em>Furniture you can walk around before it arrives.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19.3" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6.0" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8.3" />
  <img src="https://img.shields.io/badge/Three.js-0.186-000000?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js 0.186" />
  <img src="https://img.shields.io/badge/React_Three_Fiber-9.8-000000?style=flat-square&logo=react&logoColor=white" alt="React Three Fiber 9.8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.3" />
  <br />
  <a href="https://github.com/DenysHerasymchuk/hale-and-grain/actions/workflows/ci.yml"><img src="https://github.com/DenysHerasymchuk/hale-and-grain/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt=".NET 10" />
  <img src="https://img.shields.io/badge/EF_Core-10-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt="EF Core 10" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 17" />
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A520.19-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 20.19 or newer" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/tests-xUnit_%7C_Vitest-25A162?style=flat-square" alt="Tests: xUnit and Vitest" />
</p>

## About

A furniture shop where you can spin, zoom and poke at every piece in 3D before buying it. React and React Three Fiber in front, ASP.NET Core and PostgreSQL behind, with real orders, accounts and an admin area.

## Setup

### With Docker

All you need is Docker.

```sh
cp .env.example .env
docker compose up --build
```

Then open <http://localhost:8080>. The first start runs the migrations and loads five demo products.

Want to use `/admin`? Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` before the first start.

### For development

You'll need Node 20.19+, the .NET 10 SDK and Docker.

```sh
# 1. database
docker compose up -d db

# 2. API on http://localhost:5266 (API docs at /scalar)
cd backend/src/FurnitureStore.Api
dotnet run --launch-profile http

# 3. shop on http://localhost:5173
cd frontend
npm install
npm run dev
```

The API migrates and seeds itself on startup in Development. Vite proxies `/api` to it, so there's nothing to configure.

For an admin account, run this once in `backend/src/FurnitureStore.Api` and restart the API:

```sh
dotnet user-secrets init
dotnet user-secrets set "Seed:AdminEmail" "you@example.com"
dotnet user-secrets set "Seed:AdminPassword" "ChooseALongPassw0rd"
```

### Tests

```sh
cd backend && dotnet test          # needs Docker: spins up a throwaway Postgres
cd frontend && npm test            # plus: npm run lint, npm run typecheck, npm run build
```

### Starting over

`docker compose down -v` wipes the database. The next start seeds it again.

## What's inside

- **Shop:** search, filters and sorting; product pages with a 3D viewer where picking a finish re-tints the model; wishlist; a cart that survives a refresh.
- **Checkout:** the server recalculates every price and the delivery charge, and reserves stock in the same transaction, so two people can't both buy the last cabinet. Someone has to lose; the database decides who. Guests get a private link to their order.
- **Accounts:** sign-up, password reset, saved addresses, order history, and an account you can delete.
- **Admin** at `/admin`: products (copy, prices, finishes, photos, 3D settings with a live preview), categories, stock, orders, customers and store settings. The API checks the Admin role on every request; hiding the menu isn't the security.

The five 3D models are CC0 from [Poly Haven](https://polyhaven.com). The product photos are our own Blender renders of them; [ASSETS.md](ASSETS.md) has the scripts.

## How the backend is laid out

Five projects, and dependencies only point inwards. Architecture tests fail the build if one leaks.

| Project | Holds | May use |
| --- | --- | --- |
| `Domain` | entities like Product, Variant, Order | nothing |
| `Contracts` | request and response DTOs | Domain |
| `Application` | catalogue search, pricing, checkout | Domain, Contracts, EF Core (no database provider) |
| `Infrastructure` | PostgreSQL, migrations, seed data, email and payment stand-ins | Application |
| `Api` | endpoints, auth, startup | all of the above |

Every push and pull request runs `.github/workflows/ci.yml`. It checks the frontend (lint, types, tests, build), builds the backend with warnings as errors and runs all three test projects, builds both Docker images and runs a Semgrep scan. A merge gate then requires all of them to pass.

## Good to know

- **Payments are pretend.** Your bank account will never know. Checkout is labelled as a development checkout and orders are marked "development, simulated", never "paid". A real provider goes behind `IPaymentProvider`.
- **Emails go to the API log** locally (`Email:LogLinks`). That includes confirmation and reset links. Password reset only works for confirmed addresses, so confirm via the link in the log first.
- **Settings** live in `appsettings*.json`, user-secrets or environment variables (`ConnectionStrings__Store`, `Seed__AdminEmail`, `Payments__Provider`, `Cors__AllowedOrigins`). `.env.example` lists the Docker ones.
- **Schema changes:** from `backend/`, run `dotnet ef migrations add Name --project src/FurnitureStore.Infrastructure --startup-project src/FurnitureStore.Api -o Persistence/Migrations`.
- **Not done yet:** Dutch/English translation, plus the About and Contact pages the footer links to.

## Deploying

Same `docker-compose.yml`. In Coolify, add the repo as a **Docker Compose** resource, give the `app` service your domain on port 8080, and set:

| Variable | Value |
|---|---|
| `PUBLIC_HOST` / `PUBLIC_URL` | `shop.yourdomain.com` / `https://shop.yourdomain.com` |
| `POSTGRES_PASSWORD` | long and random |
| `SECURE_COOKIES` | `true` |
| `EMAIL_LOG_LINKS` | `false` |
| `PAYMENTS_PROVIDER` | empty, until a real provider exists |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | first admin (10+ chars, an uppercase letter and a digit) |

- The API serves the shop itself, so the whole thing is one container behind Coolify's HTTPS proxy. Turn on HSTS in the proxy.
- `docker-compose.yml` publishes no ports, so nothing clashes on the server and the database is never reachable from outside. Local ports live in `docker-compose.override.yml`, which Docker loads automatically but Coolify ignores. Sign-in keys live in the database, so logins survive redeploys.
- The app applies migrations itself on every start, so there's no separate migration step.
- No mail provider is wired up, so with `EMAIL_LOG_LINKS=false` account emails are dropped. Plug one in behind `IEmailSender<AppUser>` before you open sign-ups. Same for payments behind `IPaymentProvider`.

## Credits

3D models by Poly Haven (CC0). UI from Untitled UI and React Bits (MIT), adapted where the source says so.
