using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using PT.Client;
using PT.Client.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// We configure HttpClient to point to the backend server.
// In development, this might be a different port. We'll use a relative URI assuming hosted,
// or set an explicit backend URL via config in a real scenario.
var backendUrl = builder.Configuration["BackendUrl"] ?? builder.HostEnvironment.BaseAddress;

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(backendUrl) });

// Register custom services
builder.Services.AddScoped<AppState>();
builder.Services.AddScoped<PTApiClient>();

await builder.Build().RunAsync();
