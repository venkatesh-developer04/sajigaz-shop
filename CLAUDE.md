# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

E-commerce storefront for **Sajigaz Designs** (customized gifts, Pondicherry):

- **`react-app/`** — the **React 18 + Vite** SPA storefront (also hosts the `/admin` panel).
- **`server/`** — an **Express + SQLite + Razorpay** API for payments, orders, and admin.

Checkout takes payment via **Razorpay** (amount computed server-side), then still fires the original **WhatsApp** order confirmation on success. Cart/wishlist state lives in `localStorage`; orders/payments are persisted server-side in SQLite.

The storefront was converted from an earlier plain multi-page HTML/CSS/JS site. That original is gone; the React app reuses the original `style.css` **verbatim**, so the storefront UI is intentionally pixel-identical and the CSS is treated as a fixed contract — match existing class names and DOM structure rather than restyling. (The `/admin` panel is new and has its own `admin.css`.)

## Layout

```
react-app/                 # frontend SPA
├─ index.html              # Vite entry: SEO meta + JSON-LD + global CDN <script>s
│                          # (GSAP, SweetAlert2, Uploadcare, Razorpay checkout.js)
├─ public/assets/          # style.css + img/ — served at /assets/... (root-absolute)
└─ src/
   ├─ main.jsx             # BrowserRouter > CartProvider > WishlistProvider > App
   ├─ App.jsx              # <Routes>, ScrollToTop, app-version (Swal) check
   ├─ data/categories.js   # static category config (icon/color/description) + admin category options
   ├─ context/             # ProductsContext (fetches catalog), CartContext, WishlistContext
   ├─ lib/                 # effects.js, icons.jsx, api.js (backend client), format.js
   ├─ components/          # Header, Footer, AnnouncementBar, WhatsAppFab, ProductCard, Stars, ShopPage
   └─ pages/               # storefront pages + admin/ (AdminLogin, AdminOrders, AdminProducts)

server/                    # backend API (Node >= 22.5)
└─ src/
   ├─ index.js             # Express app + all routes
   ├─ db.js                # node:sqlite (built-in) schema + connection
   ├─ products.js          # DB-backed catalog: seed + CRUD + computeTotals (amount computed here, never trusted from client)
   ├─ razorpay.js          # lazy Razorpay client
   └─ auth.js              # admin JWT sign + requireAdmin middleware
```

Repo root otherwise holds `.github/`, `.vscode/`, and this file.

## Commands

Frontend:
```bash
cd react-app
npm install
npm run dev          # http://localhost:5501  (needs VITE_API_URL -> backend)
npm run build        # -> react-app/dist
npm run preview
```

Backend:
```bash
cd server
cp .env.example .env # fill ADMIN_PASSWORD, JWT_SECRET, Razorpay keys
npm install
npm run dev          # http://localhost:8787  (node --watch)
```

No tests or lint config. The frontend talks to the backend via `VITE_API_URL` (see `react-app/.env*`). Backend config is in `server/.env` (never committed; see `server/.env.example`).

## Architecture

### Routing
`react-app/src/App.jsx` maps routes 1:1 to the original pages. Query params are preserved exactly:

| Route | Page | Notes |
|---|---|---|
| `/` | Home | |
| `/category?cat=...` | Category | `cat` filter via `useSearchParams` |
| `/photo-magnet?cat=...` | PhotoMagnet | Category + PhotoMagnet share `components/ShopPage.jsx` |
| `/product?id=...` | Product | Uploadcare photo upload for `Photomagnet` items |
| `/cart` | CartPage | |
| `/checkout` | Checkout | pincode ETA + confetti + success overlay |
| `/favorites` | Favorites | |
| `/contact` | Contact | |
| `/bulk-order` | BulkOrder | |
| `/admin` | admin/AdminLogin | password gate; stores JWT in `localStorage` `sajigaz_admin_token` |
| `/admin/orders` | admin/AdminOrders | orders table + detail modal + mark fulfilled; redirects to `/admin` if no/expired token |
| `/admin/products` | admin/AdminProducts | product CRUD (create/edit/delete) — the catalog is managed here |

Internal navigation uses `<Link>` / `useNavigate` with these paths — never `*.html`.

### Data
The catalog is **managed in the DB via `/admin/products`** — there is no hardcoded product list anymore. The storefront loads it from `GET /api/products` through **`context/ProductsContext.jsx`** (`useProducts()`), which exposes `products`, `loading`, `error`, `reload`, and the `getProductById` / `getProductsByCategory` / `getFeaturedProducts` helpers. Because products load **async**, components must handle the `loading` state (e.g. Product/ShopPage guard on it before showing "not found"/"no products"). The server seeds the original 8 products into an empty DB (`server/src/products.js` `SEED`). `formatPrice` / `getDiscountPercent` are pure helpers in `lib/format.js`. Categories remain a static config in `data/categories.js` (presentation metadata); product counts are derived from the live products. Image paths can be root-absolute (`/assets/...`) or any URL entered in the admin form.

### State (replaces the old global singletons)
- `context/CartContext.jsx` — `useCart()`. Persists to `localStorage` key **`sajigaz_cart`**. Items: `{ id, name, price, image, qty, customImageB64 }`.
- `context/WishlistContext.jsx` — `useWishlist()`. Persists to **`sajigaz_wishlist`** (array of numeric IDs).
- Header count badges read from these contexts and are reactive.

`customImageB64` is a **misnomer** — it holds comma-joined Uploadcare CDN URLs, not base64. Preserve the `join(',')` / `split(',')` contract between `Product.jsx`, `CartContext`, and `Checkout.jsx`.

### Checkout / payment flow
`pages/Checkout.jsx`: validate form → `POST /api/orders` (backend recomputes the amount from product ids × qty — the client's prices are **not** trusted) → open Razorpay Checkout (`window.Razorpay`, loaded via CDN in `index.html`) → on success `POST /api/payments/verify` → only then fire the WhatsApp confirmation (`buildWhatsAppUrl`), confetti, success overlay, and clear the cart. Delivery is free over ₹999, else ₹80 — this rule is duplicated in `server/src/products.js` (`computeTotals`) and must stay in sync with the frontend.

The WhatsApp number **`OWNER_WHATSAPP = '919944466434'`** is hardcoded in several components (Footer, WhatsAppFab, Checkout, Contact, BulkOrder) — grep `919944466434` to change it everywhere. Prices now live only in the DB (the server is the single source of truth; the frontend renders whatever `/api/products` returns), so there is no longer a price list to keep in sync.

### Backend API & admin
`server/src/index.js` exposes order/payment/admin routes (see `server/README.md` for the full table). Key points:
- **Amount is authoritative on the server** (`computeTotals`); never trust client-sent prices.
- **Payment verification** is HMAC-SHA256 of `order_id|payment_id` with the Razorpay key secret; a Razorpay **webhook** (`/api/webhook`, raw-body signature check) is the reliable backstop. The webhook route is registered *before* `express.json()` so the raw body survives for signature verification.
- **Admin auth** = single shared `ADMIN_PASSWORD` → 8h JWT (no usernames). `requireAdmin` middleware guards `/api/admin/*`. The frontend admin pages store the token in `localStorage` and send it as `Authorization: Bearer`.
- DB is **`node:sqlite`** (built-in, Node ≥ 22.5) — no native build. `lastInsertRowid` can be a BigInt; wrap with `Number()` before JSON.

### Imperative effects
`src/lib/effects.js` ports the original DOM/GSAP feedback verbatim (cart/wishlist bursts, toast, checkout confetti, desktop WhatsApp-link rewrite). These create transient nodes on `document.body` and use the global `window.gsap`. Context methods call them via `requestAnimationFrame` so the target button exists in the DOM first.

### Third-party libraries (global CDN `<script>`s in `index.html`, not npm)
Kept as CDN globals for behavior parity with the original. Always guard usage:
- **GSAP + ScrollTrigger** — `if (window.gsap)`. Animations are cosmetic; the app must work without them.
- **SweetAlert2** — `window.Swal`, guarded with `typeof window.Swal !== 'undefined'`.
- **Razorpay Checkout** — `window.Razorpay`, used in `Checkout.jsx`. Guarded (shows an error if it failed to load).
- **Uploadcare** — `window.uploadcare`, used in `Product.jsx` for `Photomagnet` photo uploads. Public key is the `demopublickey` placeholder in `index.html` (replace for production). The widget init is guarded with an `input.dataset.ucInited` flag to survive React StrictMode's double-effect.
- **zippopotam.us** — `fetch`ed in `Checkout.jsx` for pincode → Pondicherry distance (Haversine) → delivery ETA, with a prefix-heuristic fallback.
- **Remix Icon** (CDN CSS) + Google **Material Symbols** (`@import` inside `style.css`).

### Styling
Single global stylesheet `public/assets/css/style.css` (reused unchanged from the original). Brand palette is CSS custom properties (`--purple` `#5C2D91`, `--magenta` `#E1173F`, gold `#F5A623`) — reference these vars, don't hardcode colors. Inline `style={{...}}` objects are used heavily to mirror the original inline styles; keep them when they match the source.

## Conventions & gotchas

- **Don't restyle.** The conversion goal is pixel-parity; preserve class names, DOM nesting, and the existing CSS.
- Currency is INR — always format via `formatPrice()`.
- `ProductCard` has variants (`default`, `category`, `photomagnet`, `related`, `favorite`) that reproduce the per-page card differences (e.g. Photomagnet items show an Upload button on the photo-magnet page, no action on the shop page).
- `AnnouncementBar` has 4 text variants (`home`, `shop`, `compact`, `checkout`) matching the original per-page bars.
- The Footer's white circular logo wrapper (injected at runtime by the old `main.js`) is baked directly into `Footer.jsx`.
- **Deployment is two pieces:** the frontend SPA deploys to GitHub Pages via `.github/workflows/static.yml` (`npm ci && npm run build` in `react-app/`, publishes `dist/` with a `404.html` SPA fallback — set `VITE_API_URL` as a build-time env there to point at the live backend). The backend deploys separately (Render web service, root dir `server/`) — see `server/README.md`. GitHub Pages cannot host the Node backend.
- The **delivery rule** (free over ₹999, else ₹80) is duplicated: client-side for display (`Checkout.jsx` / `CartPage.jsx`) and server-side as the authoritative charge (`server/src/products.js` `computeTotals`). Keep those in sync. Product **prices** live only in the DB.
