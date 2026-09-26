# PT Management System - FINAL MVP CONTEXT (v1.5)

## Completion Summary
The PT Management System MVP has been fully implemented, adhering to the STRICT SANDBOX and ZERO-COST IMMUTABLE LAWS. The application provides a seamless flow from client intake to AI-driven plan generation, interactive editing, and multi-sheet Google Spreadsheet data sync.

## Architecture & Infrastructure (Zero-Cost Policy)
- **Backend:** C# ASP.NET Core Web API (.NET 10). Containerized via Docker (`PT.Api/Dockerfile`). Optimized to run on Google Cloud Run (listening on port 8080).
- **Frontend:** Blazor WebAssembly (Standalone) PWA. Configured for static hosting. A GitHub Actions workflow (`deploy-client.yml`) is provided for automated deployment to free tiers like Cloudflare Pages or Vercel.
- **Architecture:** Modular Monolith (`Intake`, `AutoGen`, `InteractiveEditor`, `DealClosing`, `Infrastructure`).
- **Database/Storage:** Google Sheets API. Client profiles, workout plans, and nutrition plans are mapped and appended directly to `Clients`, `Workouts`, and `Nutrition` sheets respectively.
- **AI Engine:** Groq API (Llama 3 8B model). Chosen specifically to provide lightning-fast, zero-cost inference while strictly adhering to `json_object` response formats to eliminate markdown parsing errors.

## Final UI / UX Polish
- **Tablet First**: Responsive Bootstrap grids, large touch-friendly buttons (`rounded-pill`), and clear typography.
- **Loading States**: Integrated Bootstrap `spinner-border` elements to provide immediate visual feedback during async LLM generation and Google Sheets sync operations.
- **PWA Meta**: Configured `manifest.webmanifest` with short name "PT Coach", theme colors, and icons.

## Deployment Instructions
1. **Backend (Google Cloud Run)**:
   - Build the Docker container using `PT.Api/Dockerfile`.
   - Push to Google Artifact Registry.
   - Deploy to Cloud Run. Ensure the environment variables `Google:SpreadsheetId`, `Google:CredentialsPath` (or standard GCP service accounts), and `Groq:ApiKey` are configured in the Cloud Run service.
2. **Frontend (Cloudflare Pages)**:
   - The `.github/workflows/deploy-client.yml` file contains the build logic (`dotnet publish PT.Client/PT.Client.csproj -c Release -o output`).
   - Connect the repository to Cloudflare Pages, set the build command to standard .NET publish, and the output directory to `output/wwwroot`. Update `BackendUrl` in configuration if the API is hosted externally.
