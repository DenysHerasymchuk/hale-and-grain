FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Project files first so `dotnet restore` stays cached until a dependency changes.
COPY src/FurnitureStore.Api/FurnitureStore.Api.csproj src/FurnitureStore.Api/
COPY src/FurnitureStore.Application/FurnitureStore.Application.csproj src/FurnitureStore.Application/
COPY src/FurnitureStore.Contracts/FurnitureStore.Contracts.csproj src/FurnitureStore.Contracts/
COPY src/FurnitureStore.Domain/FurnitureStore.Domain.csproj src/FurnitureStore.Domain/
COPY src/FurnitureStore.Infrastructure/FurnitureStore.Infrastructure.csproj src/FurnitureStore.Infrastructure/
RUN dotnet restore src/FurnitureStore.Api/FurnitureStore.Api.csproj
COPY src/ src/
RUN dotnet publish src/FurnitureStore.Api/FurnitureStore.Api.csproj -c Release --no-restore -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "FurnitureStore.Api.dll"]
