# PT Management System - Project Context v1.0

## Architecture
- **Backend:** C# ASP.NET Core Web API (.NET 10).
- **Frontend:** Blazor WebAssembly (Standalone) configured as a PWA (Progressive Web App).
- **Architecture:** Modular Monolith.
- **Database/Storage:** Google Sheets API. No relational database. Data is appended directly to a Google Spreadsheet.
- **AI Engine:** Gemini API (Google) or Groq API (Llama 3).
- **External APIs:** Wger (for exercises) and Edamam/FatSecret (for nutrition/macros).

## Folder Structure
- `PT.Api`: Backend ASP.NET Core Web API project.
  - `Modules`:
    - `Intake`: Minimalist, tablet-first UI data collected.
    - `AutoGen`: Zero-Cost LLM reasoning engine to generate plans.
    - `InteractiveEditor`: Drag & Drop UI for PT to swap exercises/adjust.
    - `DealClosing`: Dashboard summarizing plan, "Close Deal" button.
    - `Infrastructure`: External API integrations (Google Sheets, AI, etc).
- `PT.Client`: Frontend Blazor WebAssembly PWA project.
- `PT.Shared`: Shared class library for DTOs/Models.
- `_Docs`: Project context logging.

## Key Technical Decisions
- SDK Pinned to 10.0.100 via global.json.
- Solution and projects scaffolded. Frontend scaffolded as PWA.

## Next Pending Tasks
- Implement the Intake Module data collection models in `PT.Shared`.
- Integrate Google Sheets API in `PT.Api/Modules/Infrastructure`.
