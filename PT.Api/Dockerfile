# Base image for runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["PT.Api/PT.Api.csproj", "PT.Api/"]
COPY ["PT.Shared/PT.Shared.csproj", "PT.Shared/"]
RUN dotnet restore "PT.Api/PT.Api.csproj"
COPY . .
WORKDIR "/src/PT.Api"
RUN dotnet build "PT.Api.csproj" -c Release -o /app/build

# Publish image
FROM build AS publish
RUN dotnet publish "PT.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final production image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Google Cloud Run expects the app to listen on port 8080.
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "PT.Api.dll"]
