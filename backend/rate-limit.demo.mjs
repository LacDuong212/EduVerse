// Demo test rate limit — dùng CHÍNH middleware thật trong src/.
// Chạy:  cd backend && node rate-limit.demo.mjs
// Hạ ngưỡng cho dễ thấy:  RATE_LIMIT_MAX=5 RATE_LIMIT_AUTH_MAX=3 node rate-limit.demo.mjs

import express from "express";
import { apiLimiter, authLimiter } from "./src/middlewares/rateLimit.middleware.js";

const app = express();
app.set("trust proxy", 1);

// giả lập protect: gán req.user nếu có header x-user (để test key theo user)
app.use((req, res, next) => {
  const u = req.headers["x-user"];
  if (u) req.user = { userId: u };
  next();
});

app.get("/api/ping", apiLimiter, (req, res) => res.json({ ok: true }));
app.post("/api/login", authLimiter, (req, res) => {
  // giả lập login SAI (401) để thấy authLimiter đếm lần thất bại
  res.status(401).json({ ok: false, message: "wrong password" });
});

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;

  const fire = async (method, path, headers = {}) => {
    const r = await fetch(base + path, { method, headers });
    const body = await r.json().catch(() => ({}));
    return {
      status: r.status,
      rateLimit: r.headers.get("ratelimit"), // draft-7 gộp: "limit=5, remaining=3, reset=10"
      policy: r.headers.get("ratelimit-policy"),
      retryAfter: r.headers.get("retry-after"),
      msg: body.message,
    };
  };

  const MAX = Number(process.env.RATE_LIMIT_MAX) || 200;
  const AUTH_MAX = Number(process.env.RATE_LIMIT_AUTH_MAX) || 10;

  console.log(`\n=== apiLimiter (max=${MAX} / cửa sổ) — bắn ${MAX + 2} request ===`);
  for (let i = 1; i <= MAX + 2; i++) {
    const r = await fire("GET", "/api/ping");
    console.log(
      `#${String(i).padStart(2)} -> ${r.status}` +
        ` | RateLimit: ${r.rateLimit ?? "-"}` +
        (r.status === 429 ? `  ⛔ Retry-After=${r.retryAfter}s  (${r.msg})` : "")
    );
  }

  console.log(`\n=== authLimiter (max=${AUTH_MAX}, chỉ đếm lần THẤT BẠI) — bắn ${AUTH_MAX + 2} lần login sai ===`);
  for (let i = 1; i <= AUTH_MAX + 2; i++) {
    const r = await fire("POST", "/api/login");
    console.log(
      `#${String(i).padStart(2)} -> ${r.status}` +
        (r.status === 429 ? `  ⛔ Retry-After=${r.retryAfter}s  (${r.msg})` : `  (${r.msg})`)
    );
  }

  server.close();
});
