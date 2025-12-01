FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app 
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://0.0.0.0:5159
EXPOSE 5159
ENTRYPOINT ["dotnet", "Library.Api.dll"]