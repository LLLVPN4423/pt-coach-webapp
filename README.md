# PT Desk (pt-coach-webapp)

Công cụ **cá nhân** theo dõi sức khỏe / gym và thiết kế **lộ trình ăn · tập**.

Repo: https://github.com/LLLVPN4423/pt-coach-webapp  
Stack: **Next.js + localStorage** (host frontend Vercel là đủ).

## Phase hiện có

- Onboarding + **ràng buộc y tế rõ** (bệnh nền, khớp, cờ đỏ, disclaimer, clearance)
- InBody nhập tay → TDEE / macro / plan theo nhóm tuổi
- **~367 bài tập** ảnh từ [free-exercise-db](https://github.com/yuhonas/free-exercise-db) + clip form YouTube; **đổi bài** cùng nhóm cơ
- **Meal plan** từ foods-catalog (macro / khẩu phần / allergen) + gợi ý đổi món
- **Thư viện**: tìm bài tập · bảng thực phẩm · tra mã vạch [Open Food Facts](https://world.openfoodfacts.org/)
- Hôm nay: check-in tập / ăn / nước
- Cơ thể: BMI/BMR/TDEE, lịch sử cân
- Export / import JSON backup

## Nguồn dữ liệu mở / free

| Nguồn | Dùng cho |
|-------|----------|
| free-exercise-db | Catalog + ảnh động tác (GitHub raw) |
| Open Food Facts API | Tra barcode kcal/macro client-side |
| Foods catalog (VN/USDA-style) | Meal plan macros trong app |
| Mifflin–St Jeor | BMR / TDEE |

Rebuild catalog sau khi cập nhật `exercises-raw.json`:

```bash
npm run build:data
```

## Cảm hứng UX

| App | Học gì |
|-----|--------|
| Nike Training Club | Demo động tác + cues kỹ thuật |
| Hevy / Strong | Thẻ bài tập rõ sets/reps + media |
| MyFitnessPal | Macro + theo dõi ngày |
| Move With Us | Swap exercise/meal, hỏi y tế onboarding, disclaimer |

## Chạy local

```bash
npm install
npm run dev
```

http://localhost:3000

## Deploy Vercel

1. Import repo `LLLVPN4423/pt-coach-webapp` trên [vercel.com](https://vercel.com)
2. Framework: Next.js · Build: `npm run build` · Output: mặc định
3. Không cần env cho Phase hiện tại

## Lưu ý

Không thay thế tư vấn y tế / PT chuyên nghiệp.
