# PT Management System - Project Context v1.1

## Architecture & Infrastructure (Zero-Cost Policy)
- **Backend:** C# ASP.NET Core Web API (.NET 10). Containerized via Docker (optimzed for Google Cloud Run).
- **Frontend:** Blazor WebAssembly (Standalone) PWA. Configured for static hosting (e.g., Cloudflare Pages) via GitHub Actions.
- **Architecture:** Modular Monolith.
- **Database/Storage:** Google Sheets API. Data is appended directly to a Google Spreadsheet.
- **AI Engine:** Gemini API (Google) or Groq API (Llama 3).
- **External APIs:** Wger (for exercises) and Edamam/FatSecret (for nutrition/macros).

## Key Implementations in STAGE 2
- **Shared Domain (`PT.Shared`):** Implemented core models for `Intake` (`ClientProfile`, `InbodyMetrics`, `MedicalConditions`, `FitnessGoals`).
- **Infrastructure Module (`PT.Api/Modules/Infrastructure`):** Implemented `IGoogleSheetsService` and `GoogleSheetsService` using `Google.Apis.Sheets.v4` to append client profiles as rows.
- **Intake Module (`PT.Api/Modules/Intake`):** Implemented Minimal API endpoint (`POST /api/intake`) to receive `ClientProfile` and save it to Google Sheets.
- **Deployment Strategy:** Created `Dockerfile` for backend serverless deployment (port 8080) and `.github/workflows/deploy-client.yml` for frontend static host deployment.

## Next Pending Tasks
- Frontend UI development for the Intake module (Tablet-first, minimalist UI).
- AutoGen Module integration with the AI reasoning engine (Gemini/Groq).
