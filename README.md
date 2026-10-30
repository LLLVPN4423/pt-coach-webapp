# PT Desk (pt-coach-webapp)

Công cụ **cá nhân** theo dõi sức khỏe / gym và thiết kế **lộ trình ăn · tập**.

Repo: https://github.com/LLLVPN4423/pt-coach-webapp  
Stack: **Next.js + localStorage** (host frontend Vercel là đủ).

## Phase hiện có

- Onboarding + **ràng buộc y tế rõ** (bệnh nền, khớp, cờ đỏ, disclaimer, clearance)
- InBody nhập tay → TDEE / macro / plan theo nhóm tuổi
- **Bài tập có ảnh** (free-exercise-db) + **link clip form** (YouTube)
- **Meal plan** có emoji, tag, allergen, món thay thế
- Hôm nay: check-in tập / ăn / nước
- Cơ thể: BMI/BMR/TDEE, lịch sử cân
- Export / import JSON backup

## Cảm hứng UX

| App | Học gì |
|-----|--------|
| Nike Training Club | Demo động tác + cues kỹ thuật |
| Hevy / Strong | Thẻ bài tập rõ sets/reps + media |
| MyFitnessPal | Macro + theo dõi ngày |
| Move With Us | Swap meal, hỏi y tế onboarding, disclaimer |

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
