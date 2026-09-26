using PT.Shared.Models.Intake;
using PT.Shared.Models.AutoGen;

namespace PT.Client.Services;

public class AppState
{
    public ClientProfile CurrentProfile { get; set; } = new();
    public GeneratedPlanResult? CurrentPlan { get; set; }

    public event Action? OnChange;

    public void NotifyStateChanged() => OnChange?.Invoke();
}
