# Sajigaz Designs — Backend (Express + SQLite + Razorpay)

Payment + order API for the React storefront. Handles Razorpay order creation,
server-side payment verification, a webhook, and the admin order endpoints.

- **Node ≥ 22.5** (uses the built-in `node:sqlite` — no native build step).
- Data is stored in a SQLite file (`DB_PATH`, default `./sajigaz.db`).

## Setup & run (local)

```bash
cd server
cp .env.example .env     # then fill in values
npm install
npm run dev              # or: npm start  → http://localhost:8787
```

Minimum to boot: `ADMIN_PASSWORD` + `JWT_SECRET`. Payment endpoints return **503**
until `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are set, but health + admin work.

## Environment variables

| Var | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API keys (use **test** keys in dev). Secret is server-only. |
| `RAZORPAY_WEBHOOK_SECRET` | Secret you set when creating the Razorpay webhook. |
| `ADMIN_PASSWORD` | Single shared admin-panel password (no usernames). |
| `JWT_SECRET` | Long random string used to sign admin session tokens. |
| `PORT` | Default `8787`. |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins (e.g. `http://localhost:5501,https://www.sajigazdesigns.com`). |
| `DB_PATH` | SQLite file path. On Render, point at a mounted persistent disk. |

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | liveness + whether Razorpay is configured |
| POST | `/api/orders` | — | create a Razorpay order; **amount is computed server-side** from product ids × qty |
| POST | `/api/payments/verify` | — | verify the Razorpay signature (HMAC) and mark the order `paid` |
| POST | `/api/webhook` | signature | Razorpay webhook (`payment.captured` / `payment.failed`) |
| POST | `/api/admin/login` | password | returns an 8h admin JWT |
| GET | `/api/admin/orders` | admin | list orders (optional `?status=`) |
| GET | `/api/admin/orders/:id` | admin | one order |
| PATCH | `/api/admin/orders/:id` | admin | update status (e.g. `fulfilled`) |

Order lifecycle: `created` → `paid` (verify or webhook) → `fulfilled` (admin). `failed` on verification/webhook failure.

## Razorpay setup

1. Razorpay Dashboard → **Settings → API Keys** → generate **Test** keys → put in `.env`.
2. Razorpay Dashboard → **Settings → Webhooks** → add `https://<your-api-host>/api/webhook`,
   subscribe to `payment.captured` and `payment.failed`, set a secret → put it in `RAZORPAY_WEBHOOK_SECRET`.
3. Test cards: see https://razorpay.com/docs/payments/payments/test-card-details/ (e.g. card `4111 1111 1111 1111`, any future expiry/CVV; UPI `success@razorpay`).
4. For production, complete Razorpay KYC and swap in **Live** keys.

## Deploy (Render)

- New **Web Service** from this repo, **root directory** `server`.
- Build command `npm install`, start command `npm start`.
- Set the env vars above (Node version 22.5+ — a `.node-version` pins 24).
- Add a **persistent disk** and set `DB_PATH` to a path on it (otherwise the SQLite
  file resets on each deploy).
- Set `CORS_ORIGIN` to your frontend origin, and point the frontend's `VITE_API_URL`
  at this service's URL.
