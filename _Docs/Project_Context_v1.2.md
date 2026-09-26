# PT Management System - Project Context v1.2

## Architecture & Infrastructure (Zero-Cost Policy)
- **Backend:** C# ASP.NET Core Web API (.NET 10). Containerized via Docker (optimzed for Google Cloud Run).
- **Frontend:** Blazor WebAssembly (Standalone) PWA. Configured for static hosting (e.g., Cloudflare Pages) via GitHub Actions.
- **Architecture:** Modular Monolith.
- **Database/Storage:** Google Sheets API. Data is appended directly to a Google Spreadsheet.
- **AI Engine:** Groq API (Llama 3 8B model used for fast, zero-cost inference).
- **External APIs:** Wger (for exercises) and Edamam/FatSecret (for nutrition/macros).

## Key Implementations in STAGE 3 (LLM Reasoning Engine)
- **Shared Domain Models (`PT.Shared`):**
  - Created `WorkoutPlan`, `WorkoutDay`, `Exercise`.
  - Created `NutritionPlan`, `Meal`.
  - Created `GeneratedPlanResult` to hold both plans.
- **AutoGen Module (`PT.Api/Modules/AutoGen`):**
  - **`PromptBuilderService`**: Takes the `ClientProfile` and strict logic constraints (zero cost nutrition, flow state workouts) to build a precise system prompt that enforces a JSON response format.
  - **`ILLMReasoningService` & `GroqReasoningService`**: Implements the Groq API via `HttpClient`. It sends the constructed prompt using `response_format = { type = "json_object" }` to ensure valid JSON, cleans any residual markdown, and deserializes directly into `GeneratedPlanResult`.
  - **Endpoints**: Added `POST /api/autogen/generate-plan` which orchestrates the prompt building and LLM service.

## Next Pending Tasks
- Frontend UI development for the Intake module (Tablet-first, minimalist UI).
- Frontend UI development for the Interactive Editor to consume and modify the generated `WorkoutPlan` and `NutritionPlan`.
