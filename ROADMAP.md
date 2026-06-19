# EduVerse — Product Roadmap

> Quality target: **90%** (main cases pass, edge cases acceptable). Estimates assume AI-assisted development (Claude Code). 1 day = 6h productive.

---

## Phase 1 — Production Safety & Core Completeness (~2 weeks)

Must-have trước khi launch thực tế.

| Feature | Backend | Frontend | Total | Notes |
|---|---|---|---|---|
| 🔒 Rate Limiting + Helmet.js | 3–4h | — | **½ day** | express-rate-limit + helmet. Dễ nhất, không có risk. |
| 📧 Transactional Emails | 1–2 days | — | **1.5–2 days** | Nodemailer + 5 templates: welcome, enrollment confirm, payment receipt, instructor approval, refund. External: SMTP setup. |
| 🎓 Certificate Verification URL | 3–4h | 3–4h | **1 day** | certId trên CourseProgress. Public `GET /certificates/:id`. Simple verify page + LinkedIn share. |
| 🔐 2FA / OTP cho sensitive actions | 3–4h | 3–4h | **1 day** | OTP infra đã có → extend thêm: đổi password, đổi email, deactivate account. |
| 🔎 Enhanced Search & Filtering | 4–6h | 4–6h | **1.5–2 days** | MongoDB text index, filter by rating/level/price/duration, sort by relevance/popularity/newest. |
| 💰 Instructor Payout — Request Flow (manual) | 1 day | 1 day | **2 days** | Instructor request, Admin mark "paid" manually. Bank API integration để Phase 2. |
| ⚡ Fix Streak 365+ Edge Cases | 3–5h | — | **½ day** | Handle năm mới, timezone, gap detection. Cần mock dates trong test. |

**Phase 1 Total: ~8–11 days (~1.5–2 weeks)**

---

## Phase 2 — Engagement & Revenue Optimization (~5–6 weeks)

Tăng retention, revenue, instructor satisfaction.

| Feature | Backend | Frontend | Total | Bottleneck |
|---|---|---|---|---|
| 💳 Refund System | 3–4 days | 1 day | **4–5 days** | MoMo/VNPay refund API sandbox có undocumented quirks. |
| 📝 Note-Taking trong Video Player | 1 day | 2–3 days | **3–4 days** | Note model + CRUD + timestamp capture + PDF export (jsPDF). |
| ⏱️ Flash Sales / Time-limited Deals | 1 day | 1–2 days | **2–3 days** | `salePrice` + `saleExpiry` trên Course + cron restore + countdown UI. Edge case: expire trong checkout. |
| 🏆 Badges & Achievements | 1.5 days | 1.5 days | **3–4 days** | Trigger inject vào nhiều services (streak, quiz, enrollment). Retroactive award cần migration. |
| 📣 Referral System | 2 days | 1.5 days | **3–5 days** | `referralCode` trên User + commission tracking trên Order. Cần define rules rõ. |
| 📱 PWA + Web Push Notifications | 1.5 days | 1.5 days | **3–4 days** | vite-plugin-pwa + Workbox. HTTPS required. Safari iOS có limitations. |
| 🗺️ Learning Paths / Course Bundles | 2–3 days | 2–3 days | **4–6 days** | Model phức tạp nhất P2. Prerequisite ordering + bundle/coupon interaction cần QA. |
| 🔴 Live Office Hours (embed-based) | 1.5 days | 2 days | **3–4 days** | Booking model + Whereby/Daily.co embed. Whereby free tier có limits. |

**Phase 2 Total: ~25–32 days (~5–6 weeks)**

---

## Phase 3 — Differentiation & Scale (~4–6 months)

AI differentiators + infrastructure.

| Feature | Backend | Frontend | Total | Risk |
|---|---|---|---|---|
| ⚡ Redis Caching Layer | 4–6 days | — | **1–1.5 weeks** | Cache invalidation là phần khó. Redis server cần provision. |
| 🧠 AI Personalized Study Schedule | 1.5 weeks | 1 week | **2–3 weeks** | ML service đã có → extend. Schedule algorithm cần tune từ historic data. |
| 📈 Skill Gap Analyzer (Career-linked) | 2 weeks | 1 week | **3–4 weeks** | Curate job requirements dataset (~50 roles) là bottleneck lớn nhất. |
| 🎙️ AI Transcript Search (within course) | 3 weeks | 1 week | **3–5 weeks** | Whisper API pipeline + queue (BullMQ) + Atlas Search setup. Cost + latency cần evaluate. |
| 🎯 Adaptive Quiz Engine (IRT) | 4–5 weeks | 1 week | **5–7 weeks** | Algorithmically hardest. Cold start problem thực sự. IRT cần đủ data để calibrate. |
| 🤝 Peer Learning Groups | 4–5 weeks | 2 weeks | **5–8 weeks** | Socket.io là infra mới. Chicken-and-egg problem với user base. |
| 🌐 i18n Foundation (EN + VI) | 1 week | 3–4 weeks | **4–5 weeks** | Tedious nhất. ~500–1000+ strings phải touch. Dễ miss → text lẫn lộn. |

**Phase 3 Total: ~23–34 days (~4–6 months)**

---

## Grand Total

| Phase | Calendar Time | Milestone |
|---|---|---|
| Phase 1 | ~2 weeks | Đủ an toàn để launch thực tế |
| Phase 2 | +5–6 weeks | Cạnh tranh được thị trường |
| Phase 3 | +4–6 months | Genuine USP vs Udemy/Coursera |

---

## UI/UX Priority Improvements

Quick wins không cần backend:

- **Search autocomplete** — debounced dropdown suggestions (300ms, min 3 chars)
- **Cart upsell** — "Students also bought" dùng recommendations API đã có
- **Video player controls** — playback speed (0.5x–2x), keyboard shortcuts (space/←/→)
- **Dashboard hero CTA** — "Continue Learning" card với last-watched lecture ở top
- **Empty states** — Illustrated với actionable CTA thay vì blank area
- **Loading consistency** — tất cả async actions phải disable button + spinner
- **Course creation preview** — live preview panel bên phải wizard
- **Accessibility audit** — axe-core: aria-labels, focus trap trong modals, skip-to-content
