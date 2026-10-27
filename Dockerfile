FROM node:24-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api
WORKDIR /src
COPY backend/src/FurnitureStore.Api/FurnitureStore.Api.csproj src/FurnitureStore.Api/
COPY backend/src/FurnitureStore.Application/FurnitureStore.Application.csproj src/FurnitureStore.Application/
COPY backend/src/FurnitureStore.Contracts/FurnitureStore.Contracts.csproj src/FurnitureStore.Contracts/
COPY backend/src/FurnitureStore.Domain/FurnitureStore.Domain.csproj src/FurnitureStore.Domain/
COPY backend/src/FurnitureStore.Infrastructure/FurnitureStore.Infrastructure.csproj src/FurnitureStore.Infrastructure/
RUN dotnet restore src/FurnitureStore.Api/FurnitureStore.Api.csproj
COPY backend/src/ src/
RUN dotnet publish src/FurnitureStore.Api/FurnitureStore.Api.csproj -c Release --no-restore -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api /app .
COPY --from=web /web/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "FurnitureStore.Api.dll"]
