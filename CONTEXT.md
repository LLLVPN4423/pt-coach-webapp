# PT Desk — Project Context

> **Agents: đọc file này trước khi sửa code.** Sau mỗi thay đổi có ý nghĩa, **append** vào mục [Changelog](#changelog) (mới nhất trên cùng). Không cần đọc toàn bộ repo nếu đủ context ở đây.

## Sản phẩm

- **Tên:** PT Desk (`pt-coach-webapp`)
- **Repo:** https://github.com/LLLVPN4423/pt-coach-webapp
- **Mục đích:** App cá nhân lộ trình **ăn · tập**, theo dõi InBody / tiến độ; FE-only trên Vercel.
- **Ngôn ngữ UI:** tiếng Việt.
- **Không có backend** — state trong `localStorage` (`pt-desk:v3`).

## Stack

| Layer | Tech |
|-------|------|
| App | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind 4, dark Premium Athletic tokens |
| Font | Space Grotesk (display) + DM Sans (body), `latin-ext` |
| Data | `src/data/exercises-catalog.json`, `foods-catalog.json` |
| Media | Gym Visual 3D GIF (jsDelivr / dataset), personal use — xem `NOTICE-exercises.md` |

## Kiến trúc nhanh

```
onboarding → Profile + metrics → generatePlan() → TrainingPlan
                ↓
         localStorage (usePtStore)
                ↓
   today / plan / library / progress / body / settings
```

- **Plan generation:** `src/lib/plan-generator.ts`
- **Chọn bài thông minh:** `src/lib/exercise-select.ts` (venue, thiết bị, y tế, style, pattern)
- **Phong cách tập:** `src/lib/training-styles.ts`
- **Volume theo BMI:** `volumeCapacity()` trong `src/lib/calc.ts`
- **Tracking ngày:** `DayLog` + `exerciseProgress` / `mealProgress` (`src/lib/log-progress.ts`)
- **Normalize / migrate:** `src/lib/storage.ts`
- **Types & versions:** `src/lib/types.ts` → `SCHEMA_VERSION`, `MEDIA_VERSION`, `STORAGE_KEY`

### Versions hiện tại

- `SCHEMA_VERSION = 3`
- `MEDIA_VERSION = 5` — bump khi logic plan/media cần user **Sinh lại plan**
- `STORAGE_KEY = "pt-desk:v3"`

## Routes / UI chính

| Path | Vai trò |
|------|---------|
| `/onboarding` | Hồ sơ, mục tiêu, **trainingStyle**, venue, **equipmentTags**, y tế, InBody |
| `/today` | Check-in hoàn cảnh; tick **từng hiệp** + **từng bữa**; nước |
| `/plan` | Stats + dinh dưỡng + `WeekWorkout` (tab ngày, compact cards) |
| `/library` | Catalog bài / thực phẩm / Open Food Facts |
| `/progress` | Charts adherence / RPE / cân |
| `/body` | Số đo, BMI trend |
| `/settings` | Style, venue, thiết bị, lịch, backup JSON |

### UI conventions

- Tokens CSS: `--background`, `--surface`, `--accent` (lime), … trong `globals.css`
- Titles: `.page-title`, `.section-title`, `.brand-mark`, `.font-display`
- Exercise RX hiển thị: `X hiệp` · `Y cái/hiệp` · `Nghỉ Zs` (`ExerciseCard`)

## Domain model (rút gọn)

- **Profile:** goal, `trainingStyle`, days/sessions/minutes, `life` (venue, equipmentTags, stress…), medical, sex prefs
- **TrainingStyle:** balanced, hypertrophy, strength, to_failure, science, gorilla, full_body, athletic, bro_split, minimalist
- **Exercise selection:** nhà/outdoor/hotel → **strict** bodyweight/band/(DB nếu tag); gym → soft prefer
- **Rest days:** `distributeTrainDays()` — xen đều trong tuần
- **DayLog:** `workoutDone` / `nutritionOnTrack` suy ra từ tick chi tiết khi đủ

## Scripts hữu ích

```bash
npm run dev
npm run build
npm run build:data          # rebuild catalogs
# scripts/fetch-gymvisual.mjs — nguồn GIF
```

## Quy ước cho agent

1. **Đọc `CONTEXT.md` trước** (và rule `.cursor/rules/project-context.mdc`).
2. Chỉ đọc thêm file liên quan task — tránh quét cả `exercises-catalog.json` trừ khi cần.
3. Giữ FE-only / localStorage; không thêm backend trừ khi user yêu cầu.
4. Thay đổi logic plan/media → cân nhắc bump `MEDIA_VERSION` + banner “Sinh lại”.
5. **Sau khi xong task:** append Changelog bên dưới (ngày, 1–3 bullet, files/modules chạm tới).
6. Commit/push chỉ khi user yêu cầu (trừ khi user đã bảo push trong cùng câu).

## Changelog

<!-- NEWEST FIRST. Format:
### YYYY-MM-DD — short title
- bullet
- Files: path1, path2
-->

### 2026-11-05 — Add CONTEXT.md + Cursor rule for agents
- Tạo `CONTEXT.md` (bản đồ dự án + changelog) và rule always-apply bắt agent đọc/cập nhật file này để giảm token.
- Files: `CONTEXT.md`, `.cursor/rules/project-context.mdc`, `README.md`

### 2026-11-02 — Smart exercise pick by venue/gear
- `exercise-select.ts`: score/filter theo venue, equipmentTags, medical, style, movement pattern; session builder compound-first.
- Onboarding/Settings: chọn thiết bị; `MEDIA_VERSION = 5`.
- Files: `src/lib/exercise-select.ts`, `plan-generator.ts`, onboarding/settings/today/plan, `ExerciseCard`, `WeekWorkout`

### 2026-11-02 — BMI volume + per-set / per-meal tracking
- RX rõ hiệp/rep/nghỉ; volume theo BMI; tick H1…Hn và từng bữa trên `/today`.
- Files: `calc.ts`, `log-progress.ts`, `ExerciseCard`, `today/page.tsx`, `plan-generator.ts`

### 2026-10-30 — Training styles + even rest days
- 10 phong cách tập; `distributeTrainDays`; UI onboarding/settings/plan.
- Files: `training-styles.ts`, `plan-generator.ts`, onboarding, settings, plan

### 2026-10-30 — Tuần tập tabs + compact rows
- `WeekWorkout` tab ngày; ExerciseCard compact + expand sơ đồ cơ/GIF.
- Files: `WeekWorkout.tsx`, `ExerciseCard.tsx`, `plan/page.tsx`, `globals.css`

### 2026-10-30 — Typography Space Grotesk + DM Sans
- Display/body fonts site-wide; `.page-title` / `.section-title` / `.brand-mark`.
- Files: `layout.tsx`, `globals.css`, pages/components titles

### 2026-10-30 — Premium Athletic dark UI
- Design tokens dark + lime accent; AppShell.
- Files: `globals.css`, `AppShell.tsx`, pages

### Earlier — Open data, Gym Visual GIFs, life/sex context, progress
- Catalog GIF 3D; LifeContext + female/male prefs; progress charts; localStorage schema v3.
