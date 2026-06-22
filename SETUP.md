# Local Setup & Testing Guide

How to run Sajigaz Designs (React storefront + Express/SQLite/Razorpay backend)
on a new machine, and how to open it from another device on the same Wi‑Fi.

## Prerequisites

- **Node.js ≥ 22.5** — required (the backend uses the built-in `node:sqlite`).
  Check with `node -v`. Install from https://nodejs.org if needed.
- **npm** (ships with Node) and **Git** (or just copy the project folder).

> Not copied between machines (recreate them): `node_modules/` (run `npm install`),
> `server/.env`, and the SQLite DB file (auto-created + seeded on first backend start).

## 1. Get the project

```bash
git clone <your-repo-url> sajigaz_gifts
cd sajigaz_gifts
# …or copy the whole folder, but DELETE any copied node_modules first.
```

## 2. Backend (`server/`)

```bash
cd server
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm install
npm run dev                 # http://localhost:8787
```

Edit `server/.env` and set at least:

```
RAZORPAY_KEY_ID=rzp_test_T4bCL1YA4UVOcF
RAZORPAY_KEY_SECRET=<your test key secret from the Razorpay dashboard>
ADMIN_PASSWORD=<choose a password>
JWT_SECRET=<any long random string>
PORT=8787
CORS_ORIGIN=http://localhost:5501
```

On first start the DB is created and **seeded with the 8 products** automatically.
Verify: open http://localhost:8787/api/health → `razorpayConfigured: true`.

## 3. Frontend (`react-app/`)

In a second terminal:

```bash
cd react-app
npm install
npm run dev                 # http://localhost:5501
```

The frontend reads the backend URL from `VITE_API_URL` (already set to
`http://localhost:8787` in `react-app/.env.development`).

## 4. Use it

- Storefront: **http://localhost:5501**
- Admin panel: **http://localhost:5501/admin** (log in with `ADMIN_PASSWORD`)
  - Orders: `/admin/orders` · Products: `/admin/products`

### Test a payment (Razorpay test mode — no real money)
Checkout → fill details → **Pay** → in the popup use:
- Card `4111 1111 1111 1111`, any future expiry, any CVV, or
- UPI `success@razorpay`

Paid orders appear in `/admin/orders`. (Wallet is hidden in the popup by config;
cards/UPI/netbanking are shown.)

---

## Open it from ANOTHER device on the same Wi‑Fi (phone / second laptop)

`localhost` on the other device points to *that* device, so you must use the
**host PC's LAN IP** everywhere.

1. **Find the host PC's IP.** On the PC running the servers:
   - Windows: `ipconfig` → look at **IPv4 Address** (e.g. `192.168.1.50`).
   - Use that value as `<HOST_IP>` below.

2. **Frontend — bind to the network and point it at the backend's LAN IP.**
   - Create `react-app/.env.local`:
     ```
     VITE_API_URL=http://<HOST_IP>:8787
     ```
   - Start it exposed:
     ```bash
     cd react-app
     npm run dev -- --host
     ```
   - On the other device, open **http://&lt;HOST_IP&gt;:5501**.

3. **Backend — allow the other device's origin (CORS).**
   In `server/.env` set:
   ```
   CORS_ORIGIN=http://localhost:5501,http://<HOST_IP>:5501
   ```
   Then restart the backend (`Ctrl+C`, `npm run dev`). Express already listens on
   all interfaces, so `http://<HOST_IP>:8787` is reachable.

4. **Windows Firewall.** The first time Node serves on the network, allow it
   through the firewall for **Private networks** (accept the popup), or manually
   allow inbound TCP ports **5501** and **8787**. If the other device can't
   connect, this is almost always the cause.

5. Razorpay **test** checkout works over plain `http` on the LAN. (Live mode and
   some browsers require `https`; for that, deploy or use a tunnel like ngrok.)

---

## Troubleshooting

- **`node:sqlite` / `ERR_UNKNOWN_BUILTIN_MODULE` error** → Node is older than 22.5. Upgrade Node.
- **`razorpayConfigured: false`** → keys missing in `server/.env`, or backend not restarted after editing `.env` (it does not auto-reload env changes).
- **CORS error in the browser console** → the frontend origin isn't in `CORS_ORIGIN`; add it and restart the backend.
- **Products don't load / "Loading…" forever** → backend not running or `VITE_API_URL` wrong; check http://&lt;HOST_IP&gt;:8787/api/health.
- **Editing `server/.env` had no effect** → restart the backend process.

## Production note
This dev guide uses plain HTTP and a dev `.env`. For production, deploy the
frontend (GitHub Pages) and backend (Render) per the project README, use live
Razorpay keys after KYC, serve over HTTPS, and rotate `ADMIN_PASSWORD` / `JWT_SECRET`.
