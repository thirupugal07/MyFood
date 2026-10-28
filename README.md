# MyFood — React frontend

A complete food-delivery frontend built with **React 18 + Vite + React Router**, converted from the original static HTML/CSS/JS `MyFood` site. All the original restaurant photography, brand strip and cuisine categories were carried over.

The app runs end-to-end today with **no backend**: every call goes through `src/lib/api.js`, which is wired to a mock API (`src/lib/mockApi.js`) that stores data in `localStorage`. When the Spring Boot service is ready you flip one environment variable and the UI code does not change at all.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Build and preview a production bundle:

```bash
npm run build
npm run preview      # http://localhost:4173
```

**Demo account** — `demo@myfood.app` / `demo1234` (the login screen has a "Use demo" button that fills it in). You can also create a fresh account from `/signup`; new accounts start with no saved address, so you get to try the address flow.

---

## What is included

**Shopping**
- Home page with rotating offer carousel, top brands, 12 cuisine categories, popular restaurants and live coupon codes
- Restaurant listing with debounced search, cuisine / rating / price / veg / offer filters, five sort orders, area filter, active-filter chips and "load more" pagination — all reflected in the URL so results are shareable
- Restaurant page with menu sections, in-menu search, veg-only toggle, bestseller and spicy tags, and an add-to-cart that respects the one-restaurant-per-order rule
- Cart drawer and full cart page, quantity steppers, free-delivery progress hint
- Coupons: `WELCOME50`, `MYFOOD20`, `FLAT75`, `FREEDEL` — validated server-side (mock) against the order value

**Checkout & orders**
- Address book: add, edit, delete, set default; validated Indian mobile numbers and 6-digit pincodes
- Payment method selection (UPI / card / net banking / cash), cooking instructions, contactless delivery
- Bill breakdown with item total, delivery, packaging, 5% GST and coupon discount — computed in one place (`src/lib/pricing.js`) and recomputed again on order placement, exactly as a backend should
- Live order tracking: a timeline that advances on its own (every 20 seconds in the mock, so you can actually watch it move), cancel while still cancellable, order history with one-tap reorder

**Account & polish**
- Sign up, sign in, sign out, forgot password, change password, edit profile
- Favourites, dark mode, toast notifications, skeleton loaders, empty states, error boundary, 404 page
- Accessible by default: skip link, focus trapping in modals and drawers, `aria` labelling, keyboard-friendly controls, `prefers-reduced-motion` support
- Responsive down to small phones, with a bottom tab bar on mobile

---

## Project structure

```
public/images/          all the original MyFood photography (URL-safe names)
src/
  data/catalog.js       seed catalogue: 21 restaurants, 126 menu items, categories, brands, coupons
  lib/
    api.js              THE single boundary to the server (mock or real)
    mockApi.js          localStorage-backed fake backend
    pricing.js          bill maths, shared by cart, checkout and order placement
    format.js           currency (₹, Indian grouping), dates, relative time
    validation.js       form validators
    storage.js          namespaced, defensive localStorage wrapper
    orderStatus.js      status metadata used by pills, cards and the tracker
  context/              Auth, Cart, Favourites, Location, Theme, Toast
  hooks/                useDebounce, useMediaQuery, useInterval, useDocumentTitle, useOnClickOutside
  components/
    layout/             Header, Footer, Layout, MobileTabBar
    ui/                 Button, Input/Select/Textarea, Modal, Drawer, Toaster, Skeleton,
                        Rating, Badge, QuantityStepper, EmptyState, ErrorBoundary, AddressForm…
    restaurant/         RestaurantCard, CategoryTile, BrandStrip, MenuItemRow, FilterBar, OfferCard
    cart/               CartDrawer, CartLine, BillSummary
    order/              OrderCard, OrderTracker, StatusPill
    auth/               ProtectedRoute
  pages/                Home, Restaurants, RestaurantDetail, Cart, Checkout, Orders, OrderDetail,
                        Favourites, Offers, Profile, Login, Signup, ForgotPassword, NotFound
  styles/               design tokens + one stylesheet per area (plain CSS, no preprocessor)
scripts/                jsdom smoke tests (see "Verifying" below)
```

State lives in React context with `localStorage` persistence — cart, favourites, theme, location and session all survive a refresh. There is no Redux and no state library to learn.

---

## Connecting the backend later

1. Copy `.env.example` to `.env.local`:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=/api          # or https://api.myfood.example
VITE_PROXY_TARGET=http://localhost:8080
```

2. Start the Spring Boot service on `:8080`. The Vite dev proxy (`vite.config.js`) forwards `/api/*` to it.

The endpoints the frontend expects, with the exact shapes it sends and reads:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/categories`, `/banners`, `/coupons`, `/areas` | catalogue lookups |
| `GET` | `/restaurants?search&cuisines&area&vegOnly&maxPrice&minRating&hasOffer&sort&page&pageSize` | returns `{ items, total, page, pageSize, hasMore }` |
| `GET` | `/restaurants/:id` | one restaurant including its `menu[]` |
| `GET` | `/restaurants/featured?limit=` | home page picks |
| `POST` | `/coupons/validate` | `{ code, subtotal }` → the coupon or a 4xx with `message` |
| `POST` | `/auth/login`, `/auth/register`, `/auth/forgot-password` | returns `{ token, user }` |
| `GET` | `/auth/me` | current user from the bearer token |
| `PATCH` | `/auth/profile`, `POST /auth/change-password` | profile updates |
| `POST`/`PUT` | `/addresses`, `/addresses/:id` | returns the updated user with `addresses[]` |
| `DELETE` | `/addresses/:id` | returns the updated user |
| `GET`/`POST` | `/orders` | list / place. Placement must **recompute the bill server-side** |
| `GET` | `/orders/:id` | one order with its `timeline[]` |
| `POST` | `/orders/:id/cancel` | 409 if it is already out for delivery |

Every error response should be `{ "message": "human readable" }` with a 4xx/5xx status — the UI shows that message in a toast. A `401` clears the stored token and sends the user back to `/login`.

`src/lib/api.js` is the only file that needs touching if your routes differ; nothing else knows about HTTP.

---

## Verifying

```bash
npm run lint          # eslint
npm run verify        # renders all 14 routes in jsdom and fails on any runtime error
npm run verify:flows  # drives the real UI: add to cart, sign in, place an order, reorder, search, 404
```

`verify:flows` is the interesting one — it exercises the actual components against the mock API and asserts on what the user would see.

---

## Deploying

The build output in `dist/` is fully static; the only requirement is that unknown paths fall back to `index.html` (client-side routing).

- **Vercel** — `vercel.json` is included, just import the repo
- **Netlify** — `netlify.toml` and `public/_redirects` are included
- **Docker / any host** — `Dockerfile` + `nginx.conf` (multi-stage build, gzip, immutable asset caching, SPA fallback):
  ```bash
  docker build -t myfood .
  docker run -p 8080:80 myfood
  ```

---

## Notes and known limitations

- This is a frontend-only build. Passwords in the mock API are stored in `localStorage` with a reversible encoding — fine for a demo, **never** for production. Real authentication must hash and validate on the server.
- Payments are simulated. There is no gateway integration; the checkout says so before you place an order.
- The order timeline advances on a timer in the mock so the tracking screen is demonstrable. In production, drive it from rider/delivery webhooks or a socket.
- Restaurant data (names, ratings, prices) is seeded demo content based on the original site; it is not live data.
