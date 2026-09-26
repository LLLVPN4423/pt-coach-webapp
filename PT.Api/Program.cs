using PT.Api.Modules.Infrastructure;
using PT.Api.Modules.Intake;
using PT.Api.Modules.AutoGen;
using PT.Api.Modules.DealClosing;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IGoogleSheetsService, GoogleSheetsService>();

// LLM Services
builder.Services.AddHttpClient<ILLMReasoningService, GroqReasoningService>();
builder.Services.AddScoped<PromptBuilderService>();

// Add CORS for Blazor Client
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();

app.MapIntakeEndpoints();
app.MapAutoGenEndpoints();
app.MapDealClosingEndpoints();

app.Run();
