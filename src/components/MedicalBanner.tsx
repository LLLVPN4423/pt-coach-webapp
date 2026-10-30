import type { Profile } from "@/lib/types";
import { medicalSummaryChips, requiresClinicianClearance } from "@/lib/medical";

export function MedicalBanner({ profile }: { profile: Profile }) {
  const m = profile.medical;
  const chips = medicalSummaryChips(m);
  if (chips.length === 0 && m.disclaimerAccepted) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-xs text-[var(--muted)]">
        Không khai báo bệnh nền đặc biệt · vẫn dừng nếu đau bất thường. Đây không
        phải tư vấn y tế.
      </div>
    );
  }

  const needsClearance = requiresClinicianClearance(m) && !m.clinicianCleared;

  return (
    <div
      className={`rounded-xl border px-3 py-3 text-sm ${
        needsClearance || m.hasRedFlags
          ? "border-[var(--danger)]/40 bg-[#fde8e4]"
          : "border-[var(--warn)]/30 bg-[#fff6e8]"
      }`}
    >
      <p className="font-semibold text-[var(--ink)]">Ràng buộc sức khỏe</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {chips.map((c) => (
          <span key={c} className="chip !bg-white/80 !text-[var(--ink)]">
            {c}
          </span>
        ))}
      </div>
      {needsClearance && (
        <p className="mt-2 text-xs font-medium text-[var(--danger)]">
          Cần xác nhận đã được bác sĩ/PT cho phép trước khi tăng tải. Plan hiện
          giữ cường độ thận trọng.
        </p>
      )}
      <p className="mt-2 text-xs text-[var(--muted)]">
        PT Desk hỗ trợ lập kế hoạch cho người khỏe mạnh — không chẩn đoán hay
        điều trị bệnh.
      </p>
    </div>
  );
}
