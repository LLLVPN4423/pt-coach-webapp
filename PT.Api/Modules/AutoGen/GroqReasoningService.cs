using PT.Shared.Models.AutoGen;
using PT.Shared.Models.Intake;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace PT.Api.Modules.AutoGen;

public class GroqReasoningService : ILLMReasoningService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GroqReasoningService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<GeneratedPlanResult> GeneratePlanAsync(ClientProfile clientProfile, string systemPrompt)
    {
        var apiKey = _configuration["Groq:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Groq API Key is not configured.");
        }

        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model = "llama3-8b-8192", // Using a fast, free tier model
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = "Generate the plan based on the provided profile constraints." }
            },
            response_format = new { type = "json_object" },
            temperature = 0.2 // Lower temperature for more deterministic, constrained output
        };

        var response = await _httpClient.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);

        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadFromJsonAsync<GroqResponse>();

        if (responseJson?.Choices == null || responseJson.Choices.Count == 0)
        {
            throw new Exception("Invalid response from Groq API.");
        }

        var content = responseJson.Choices[0].Message.Content;

        // Clean up markdown code block syntax if the LLM leaked it despite instructions
        if (content.StartsWith("```json"))
        {
            content = content.Substring(7);
            if (content.EndsWith("```"))
            {
                content = content.Substring(0, content.Length - 3);
            }
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var result = JsonSerializer.Deserialize<GeneratedPlanResult>(content, options);

        return result ?? new GeneratedPlanResult();
    }

    private class GroqResponse
    {
        public List<Choice> Choices { get; set; } = new();
    }

    private class Choice
    {
        public Message Message { get; set; } = new();
    }

    private class Message
    {
        public string Content { get; set; } = string.Empty;
    }
}
