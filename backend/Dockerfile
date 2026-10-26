FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY FurnitureStore.Api/FurnitureStore.Api.csproj FurnitureStore.Api/
RUN dotnet restore FurnitureStore.Api/FurnitureStore.Api.csproj
COPY FurnitureStore.Api/ FurnitureStore.Api/
RUN dotnet publish FurnitureStore.Api/FurnitureStore.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "FurnitureStore.Api.dll"]
