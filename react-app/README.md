# Sajigaz Designs — React

The original plain HTML/CSS/JS site converted to a React 18 + Vite SPA. The UI,
CSS, DOM structure, class names, and behavior are preserved 1:1 — the original
`assets/css/style.css` is reused untouched.

## Run

```bash
cd react-app
npm install      # already run once
npm run dev      # dev server at http://localhost:5501
```

Other scripts:

```bash
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## Route map (was → now)

| Original page            | Route                       |
| ------------------------ | --------------------------- |
| index.html               | `/`                         |
| category.html            | `/category?cat=...`         |
| photo-magnet.html        | `/photo-magnet?cat=...`     |
| product.html?id=         | `/product?id=...`           |
| cart.html                | `/cart`                     |
| checkout.html            | `/checkout`                 |
| favorites.html           | `/favorites`                |
| contact.html             | `/contact`                  |
| bulk-order.html          | `/bulk-order`               |

## Structure

```
react-app/
├─ index.html                 # Vite entry: SEO meta + JSON-LD + CDN scripts
│                             # (GSAP, ScrollTrigger, SweetAlert2, Uploadcare)
├─ public/assets/             # style.css + images, served at /assets/... (untouched)
├─ src/
│  ├─ main.jsx                # Router + Cart/Wishlist providers
│  ├─ App.jsx                 # Routes, scroll-to-top, app-version (Swal) check
│  ├─ data/categories.js      # static category config (products come from the API)
│  ├─ context/
│  │  ├─ CartContext.jsx      # replaces the Cart singleton (localStorage: sajigaz_cart)
│  │  └─ WishlistContext.jsx  # replaces the Wishlist singleton (sajigaz_wishlist)
│  ├─ lib/
│  │  ├─ effects.js           # toast, cart/wishlist bursts, confetti, WA desktop fix
│  │  └─ icons.jsx            # shared WhatsApp / Instagram / Facebook SVGs
│  ├─ components/
│  │  ├─ Header.jsx           # scroll state, hamburger, active nav, live badges
│  │  ├─ Footer.jsx           # logo circle wrapper baked in (was injected by main.js)
│  │  ├─ AnnouncementBar.jsx  # 4 text variants
│  │  ├─ WhatsAppFab.jsx
│  │  ├─ ProductCard.jsx      # variants: default / category / photomagnet / related / favorite
│  │  ├─ Stars.jsx
│  │  └─ ShopPage.jsx         # shared by Category + PhotoMagnet
│  └─ pages/                  # Home, Category, PhotoMagnet, Product, CartPage,
│                             # Checkout, Favorites, Contact, BulkOrder
```

## Notes

- **Static hosting:** this is a client-side SPA, so configure your host with an
  SPA fallback (serve `index.html` for unknown paths). Vite `dev`/`preview`
  already do this.
- External libraries (GSAP, SweetAlert2, Uploadcare) are loaded via the same CDN
  `<script>` tags as the original, kept global for behavior parity. Uploadcare
  still uses the `demopublickey` placeholder — set a real key in `index.html`.
- The original multi-page files remain in the repo root, untouched, as reference.
