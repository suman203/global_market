# Global Market — React Frontend Refactor Spec (v1)

Status: **Approved** — we build from this spec. Decisions marked **[DECISION]** are confirmed by the user; the rest are fixed.

---

## 1. Context & Goals

The app today is a **Spring Boot 2.4.5 + Thymeleaf** MVC shop (Java 11, H2 in-memory, session-based Spring Security, server-side session cart). Backend logic is solid: products, countries-as-categories, auth, cart, seed data.

The frontend is Bootstrap 4 with default styling — functional but dated.

**Goals of this refactor**

1. Rebuild the entire frontend in **React** as a premium, modern SPA.
2. Elevate the visual design to a *luxury travel-souvenir* aesthetic (think high-end boutique, not bargain bin).
3. Keep the Spring Boot backend as the API source of truth — **no business logic moves to the frontend**.
4. Preserve every existing feature: browsing, country filtering, product detail, auth, cart, checkout, admin CRUD, user profile.
5. `mvn clean install` stays green; the app remains a **single runnable jar** (`java -jar`).

**Out of scope (v1):** real payments, order history, real image hosting, multi-language UI (see §11 for deferred items).

---

## 2. Architecture

```
┌─────────────────────────────── Single repo: global-market ───────────────────────────────┐
│                                                                                          │
│  backend/  Spring Boot REST API  (existing Maven project, stays at repo root)            │
│    • New REST controllers under /api/**                                                  │
│    • Existing services / entities / seed data reused unchanged                            │
│    • Thymeleaf templates + MVC controllers REMOVED once API parity is complete — confirmed│
│                                                                                          │
│  frontend/  React 18 + TypeScript SPA (Vite)                                             │
│    • Dev:      vite dev server :5173  → proxies /api → :8080                             │
│    • Prod:     vite build  →  emits static bundle into  backend/src/main/resources/static │
│               →  spring boot serves it → single jar                                       │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**[DECISION] Deliverable:** single Spring Boot jar serves both the `/api` and the SPA — **confirmed**. Vite build emits into `backend/src/main/resources/static`; `java -jar` serves everything.

**Dev workflow (recommended):**
- Terminal A: `cd backend && mvn spring-boot:run`  (API on :8080)
- Terminal B: `cd frontend && npm run dev`  (SPA on :5173, proxying `/api`)
- Vite dev server proxies `/api` → `http://localhost:8080` including cookies.

### 2.1 Auth model

Keep **session-cookie auth** (JSESSIONID). No JWT in v1 — **confirmed**.

- Spring Security form-login replaced with JSON endpoints (`POST /api/auth/login`).
- Frontend uses `fetch` with `credentials: "include"` (works same-origin in prod, via proxy in dev).
- CSRF stays **disabled** (already disabled; session cookie + SPA).
- Roles unchanged: `ROLE_ADMIN`, `ROLE_USER` (admin decided by username `admin`, from `UserDetailsServiceImpl`).

### 2.2 Routing map (React Router)

| Path | Page | Access |
|---|---|---|
| `/` | Home (hero + country explorer + grid) | public |
| `/product/:id` | Product detail | public |
| `/login` | Login | public |
| `/register` | Register | public |
| `/cart` | Cart page | public (session cart) |
| `/profile` | User profile | USER |
| `/admin` | Admin dashboard (product table) | ADMIN |
| `/admin/product/new` | Create product | ADMIN |
| `/admin/product/:id/edit` | Edit product | ADMIN |
| `/about` | About | public |
| `*` | 404 + ErrorBoundary | public |

---

## 3. Tech Stack (frontend)

| Concern | Choice |
|---|---|
| Build tool | **Vite 6** |
| Language | **TypeScript** (strict) — **confirmed** |
| UI library | **React 18** |
| Routing | **React Router v6** |
| Styling | **Tailwind CSS v4** + custom design tokens — **confirmed** |
| Server state | **TanStack Query v5** (caching, retry, optimistic cart) |
| Motion | **Framer Motion** (page transitions, card hovers, cart drawer) |
| Icons | **Lucide React** |
| Forms | React Hook Form + Zod — **confirmed** |
| HTTP | native `fetch` wrapper (no axios dependency) |
| Lint/format | ESLint + Prettier |

Node toolchain present on machine: **Node 26 / npm 11** — verified.

---

## 4. Backend API Contract (new REST controllers under `/api`)

All requests/responses are JSON. Errors use Spring's default `ProblemDetail`-style shape; the client normalizes to `{ message }`.

### 4.1 Auth
| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/auth/login` | public | `{ username, password }` | `200 UserDto` / `401 { message }` |
| POST | `/api/auth/logout` | any | — | `200` |
| GET | `/api/auth/me` | any | — | `200 UserDto` or `204` when anonymous |
| POST | `/api/auth/register` | public | `RegisterRequest` | `201 UserDto` (auto-login, mirroring current behavior) |

`UserDto`: `{ id, username, email, firstName, lastName, age, city, gender, role }` — **never** exposes password.

### 4.2 Catalog
| Method | Path | Auth | Query | Response |
|---|---|---|---|---|
| GET | `/api/products` | public | `categoryId?`, `q?` (name search), `sort?=price_asc\|price_desc\|newest` | `ProductDto[]` |
| GET | `/api/products/:id` | public | — | `ProductDto` / `404` |
| GET | `/api/categories` | public | — | `CategoryDto[]` |

`ProductDto`: `{ id, name, description, imageUrl, price, category: { id, name } }`
`CategoryDto`: `{ id, name }`

### 4.3 Cart (session-scoped, unchanged backend service)
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/cart` | public | `CartDto` |
| POST | `/api/cart/items/:id` | public | `CartDto` (add 1) |
| DELETE | `/api/cart/items/:id` | public | `CartDto` (remove 1) |
| POST | `/api/cart/clear` | public | `CartDto` |
| POST | `/api/cart/checkout` | public | `CartDto` (clears cart) |

`CartDto`: `{ items: [{ product: ProductDto, quantity }], totalPrice, count }`

### 4.4 Admin (product CRUD)
| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/admin/products` | ADMIN | `ProductRequest` | `201 ProductDto` |
| PUT | `/api/admin/products/:id` | ADMIN | `ProductRequest` | `200 ProductDto` |
| DELETE | `/api/admin/products/:id` | ADMIN | — | `204` |

`ProductRequest`: `{ name, description, imageUrl, price, categoryId }` (server-side validation mirrors existing `ProductValidator`; reuse it).

### 4.5 User profile
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/user/me` | USER | `200 UserDto` |

### 4.6 Security rules (updated `WebSecurityConfig`)
- `permitAll`: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/products/**`, `/api/categories/**`, `/api/cart/**`, SPA static assets, `/` (SPA fallback)
- `hasRole('USER')`: `/api/user/**`
- `hasRole('ADMIN')`: `/api/admin/**`
- SPA history fallback: forward non-`/api` routes to `index.html` (via controller or `ResourceResolver`).

### 4.7 Backend changes required
- New package `com.globalmarket.rest` with `AuthRestController`, `CatalogRestController`, `CartRestController`, `AdminProductRestController`, `UserRestController`.
- New DTO records + a small mapper (Product ↔ DTO; Category ↔ DTO; User ↔ DTO).
- Repository additions: `ProductRepository.searchByName` (case-insensitive contains).
- `ProductServiceImpl.edit` currently has a bug: it mutates `found` then calls `save(newProduct)` — fix to save the mutated `found` (keeps category intact).
- Registration currently stores the **raw** `passwordConfirm` in the entity; fix to store confirm as the encoded password copy or mark `@Transient` (hygiene, behavior unchanged).

---

## 5. Design System — “Global Market” Premium Identity

### 5.1 Brand
- **Name:** Global Market — tagline *“Souvenirs from around the world.”*
- **Mark:** a globe/location-pin glyph in gold on ink.
- **Tone:** boutique travel atelier — dark, elegant, editorial.

### 5.2 Color tokens (Tailwind theme)

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0A0E1A` | page background (primary) |
| `ink-900` | `#111827` | nav / surfaces |
| `ink-800` | `#1F2937` | cards / panels |
| `gold-400` | `#E8C47A` | accents, CTAs, hover |
| `gold-500` | `#C9A961` | brand gold |
| `cream` | `#F7F3EC` | text on dark, secondary bg |
| `mist` | `#94A3B8` | muted text |
| `danger` | `#E5484D` | errors, remove |

Dark-first design: **ink-950 background**, cream text, gold accents. Cards on `ink-800` with subtle borders and soft shadows.

### 5.3 Per-country accent palette

Each of the 10 countries gets an accent color + gradient used on its badge, product card wash, and filter pill (from official-flag-inspired hues):

| Country | Accent | Gradient (from → to) |
|---|---|---|
| France | `#2E5FA3` | `#2E5FA3 → #C9A961` |
| Japan | `#C0392B` | `#C0392B → #F7F3EC` |
| Italy | `#1E8449` | `#1E8449 → #E8C47A` |
| India | `#E67E22` | `#E67E22 → #2E86C1` |
| Mexico | `#27AE60` | `#27AE60 → #E74C3C` |
| Morocco | `#A0522D` | `#A0522D → #1ABC9C` |
| Vietnam | `#D32F2F` | `#D32F2F → #F1C40F` |
| Turkey | `#C0392B` | `#C0392B → #16A085` |
| Brazil | `#1E8449` | `#1E8449 → #F1C40F` |
| Spain | `#D32F2F` | `#D32F2F → #F1C40F` |

The accent follows the data — a `country` map in the frontend (country name → accent). Unknown countries fall back to gold.

### 5.4 Typography
- **Display:** `Cormorant Garamond` or `Playfair Display` (serif, editorial luxury) — headings, hero, product names.
- **Body/UI:** `Inter` (clean sans) — paragraphs, buttons, forms, nav.
- Loaded via Google Fonts `@import` in CSS (network at runtime; offline fallback stacks provided).

### 5.5 Shape, elevation, motion
- Corner radius: `rounded-xl` (12px) cards, `rounded-full` pills/buttons.
- Shadows: soft ambient + gold glow on primary CTA hover.
- Motion: Framer Motion — fade/slide page transitions (150–250ms), card hover lift (+2px + glow), cart drawer slide-in, count badge pop.
- Micro-interactions: nav link underline slide, image zoom on hover, button press scale.

### 5.6 Premium details
- Hero: full-bleed gradient + subtle world-map pattern (inline SVG), serif headline, CTA row.
- Country explorer: horizontal pill row or draggable strip of 10 country chips with flag emoji + accent.
- Product cards: image with hover zoom, country badge (accent), name in serif, price in gold, “Add to cart” that animates.
- Sticky translucent navbar (backdrop-blur) + sticky “mini-cart” with live count.
- Empty states, loading skeletons, error banners — all styled, never raw.

---

## 6. Pages & Components

### 6.1 App shell
- `Navbar`: brand mark + wordmark, nav links (Home, Explore, About), search input (functional, navigates to filtered home), auth-aware right side (Log in/Register OR username → Profile/Admin + Logout), cart icon with live badge.
- `Footer`: brand, tagline, copyright `© 2026 Global Market`, country chips.
- Layout uses React Router `<Outlet/>`.

### 6.2 Home (`/`)
1. **Hero** — serif headline *“The world’s finest souvenirs, curated.”*, subcopy, CTAs (`Explore the collection`, `Our story`), world-map backdrop.
2. **Country Explorer** — 10 accent-colored chips (emoji + name); active chip filters grid (client query `categoryId`).
3. **Product Grid** — responsive 1/2/3/4-col grid; each card: image, country badge, serif name, description (2-line clamp), gold price, Add to cart (animates + toast). Skeleton loaders.
4. Sort control (price asc/desc, newest) + product count.
5. Featured section (reuses 3 highest-priced or a curated subset) — optional v1.
6. CTA band → Register.

### 6.3 Product detail (`/product/:id`)
- Two-column: large image (hover zoom) + info (country badge, serif title, gold price, description, quantity selector, Add to cart, “Back to collection”).
- Related items: same-country products (up to 4) via `?categoryId=`.
- 404 state if product missing.

### 6.4 Login (`/login`)
- Split screen: left premium panel (brand + tagline + world pattern), right form card.
- Fields: username, password; show/hide password; inline errors; `401` → “Invalid username or password.” Redirect to `from` or `/`.
- Demo hint: `admin / admin`, `user / user` (matches seed data).

### 6.5 Register (`/register`)
- Same split-screen shell.
- Fields: username (4–32), email, password (8–32), confirm password, first/last name, city, gender (select), age (>13).
- Client-side Zod validation mirrors the server rules (§ UserValidator). Server errors surface inline.
- On success → auto-login → redirect `/`.

### 6.6 Cart (`/cart`) + cart drawer
- Nav cart icon opens a **right slide-over drawer** (adds don’t navigate away).
- Cart page: line items (image, name, unit price, qty stepper, remove), total, Clear, Checkout (clears + success toast/empty state).
- All mutations via TanStack Query with optimistic updates; session-backed server is source of truth.

### 6.7 Profile (`/profile`)
- Card with avatar-initial, username, role badge, first/last name, age, city, gender, email. (Read-only in v1.)

### 6.8 Admin (`/admin` + product form)
- Dashboard: table of all products (image thumb, name, country, price, actions edit/delete). Delete → confirm modal.
- `Create/Edit product` form: name (2–32), description, image URL (with preview), price, category select. Reuses server `ProductValidator` rules; Zod mirrors client-side.

### 6.9 About (`/about`) & errors
- About: brand story, the 10 countries as a grid, contact CTA.
- 404 page (stylized) + React `ErrorBoundary` fallback with reload.

---

## 7. State & Data Flow

- **Auth**: `AuthProvider` context — on mount calls `GET /api/auth/me`; exposes `{ user, isLoading, login, logout, register }`. Guards: `<RequireAuth role="ADMIN|USER">` wrapper redirecting to `/login?from=…`.
- **Server state** (TanStack Query):
  - `['products', {categoryId, q, sort}]` → catalog grid + product detail.
  - `['categories']` → country explorer + filters.
  - `['cart']` → drawer + cart page (refetch after any mutation; optimistic local updates).
  - `['user', username]` → profile.
- **Mutations**: `useAddToCart`, `useRemoveFromCart`, `useClearCart`, `useCheckout`, `useLogin`, `useLogout`, `useRegister`, admin `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`. Invalidate/update relevant query keys on success.
- **Toasts**: minimal custom toast system (add-to-cart, errors, checkout success).
- **Error handling**: central API client normalizes fetch errors → `{ message }`; Query retry policy 1–2 for idempotent GETs, 0 for mutations.

### Frontend structure
```
frontend/
  index.html
  vite.config.ts        (dev proxy /api → :8080; build outDir → ../src/main/resources/static)
  src/
    main.tsx  App.tsx  (router + providers)
    api/       client.ts, endpoints.ts
    auth/      AuthProvider, RequireAuth
    components/ Navbar, Footer, ProductCard, CountryChip, CartDrawer, Toast, Skeletons, ErrorBoundary, Badge, ...
    pages/     Home, ProductDetail, Login, Register, Cart, Profile, AdminDashboard, AdminProductForm, About, NotFound
    hooks/     useProducts, useCart, useAuthQuery, useToast ...
    lib/       format.ts (currency/price), country.ts (accent map), constants.ts
    types/     api.ts (TS mirrors of DTOs)
    styles/    index.css (Tailwind v4 theme + fonts)
```

---

## 8. TypeScript models (mirror DTOs)

```ts
type Role = 'ADMIN' | 'USER'
interface User { id:number; username:string; email:string; firstName?:string; lastName?:string;
                 age:number; city?:string; gender:string; role:Role }
interface Category { id:number; name:string }
interface Product { id:number; name:string; description:string; imageUrl:string; price:number; category:Category|null }
interface CartItem { product:Product; quantity:number }
interface Cart { items:CartItem[]; totalPrice:number; count:number }
interface RegisterPayload { username; email; password; passwordConfirm; firstName?; lastName?; city?; gender; age }
interface ProductPayload { name; description; imageUrl; price; categoryId }
```

---

## 9. Build, Run & Quality Gates

**Backend** (repo root): `mvn clean install` → jar at `target/global-market-0.0.1-SNAPSHOT.jar`. Tests: existing 66 must pass; **new REST-layer tests added** (login flow, products, cart) so total grows.

**Frontend**: `cd frontend && npm install && npm run dev` (dev) / `npm run build` (prod, emits to Spring static).

**Quality gates (definition of done per phase):**
1. `mvn clean install` BUILD SUCCESS, all tests green.
2. `npm run build` clean (TS strict, ESLint clean).
3. Manual smoke: browse → filter country → login admin/user → cart add/remove/checkout → admin CRUD.
4. Screenshot each page for design review.

---

## 10. Implementation Phases (build order)

**Phase 0 — Backend API (no UI)**
- Add DTOs, REST controllers, mapper, repository search, security updates, SPA fallback.
- Fix `ProductServiceImpl.edit` bug + passwordConfirm hygiene.
- Add REST integration tests. Gate: `mvn clean install` green; curl all endpoints.

**Phase 1 — SPA scaffold**
- Vite + React + TS + Tailwind + Router + Query + motion; design tokens; app shell (navbar/footer/drawer/toast).
- Gate: `/` renders shell against live API.

**Phase 2 — Catalog experience**
- Home (hero, country explorer, grid, sort), Product detail, search. Gate: browse + filter + detail.

**Phase 3 — Auth**
- Login, Register, AuthProvider, guards, profile. Gate: full auth flows incl. errors.

**Phase 4 — Cart & checkout**
- Drawer, cart page, optimistic mutations, checkout. Gate: add/remove/clear/checkout.

**Phase 5 — Admin**
- Dashboard, product form, delete modal. Gate: full CRUD as `admin`.

**Phase 6 — Polish & cutover**
- Animations pass, empty/error/loading states, responsive audit, remove Thymeleaf + obsolete tests, 404/about, final screenshots.
- Gate: single `java -jar` serves SPA + API; quality gates above.

---

## 11. Deferred / Open items
- i18n EN/PL → add after v1 (structure leaves room; no UI framework lock-in).
- Real checkout/payments, order history.
- Uploaded product images (keep URL-based, mirror existing `@URL`).
- Auth hardening (refresh, remember-me) — keep session model.

---

## 12. Risks
- **Session cookie vs dev proxy**: mitigated by Vite proxy + `credentials: include`.
- **Spring Security + SPA fallback conflicts**: mitigated by scoping fallback to non-`/api`, non-static paths; verified in Phase 0.
- **`ProductServiceImpl.edit` bug**: currently drops category on edit — fixed in Phase 0 to avoid data loss in admin UI.
- **Tailwind v4 vs Vite**: use official `@tailwindcss/vite` plugin; pins version.
- **Image hotlinks (placehold.co)**: reachable (verified); offline dev shows broken images — skeleton/`onError` fallback included.
```

---

**[DECISION] items — all confirmed by user:**

1. **Deliverable:** single jar (SPA bundled into Spring Boot) — **confirmed**.
2. **Remove Thymeleaf/MVC once API parity exists** (and update/remove the affected tests) — **confirmed**.
3. **TypeScript** — **confirmed**.
4. **Tailwind CSS v4** for styling — **confirmed**.
5. **React Hook Form + Zod** for forms — **confirmed**.
6. **Keep session-cookie auth** (no JWT) — **confirmed**.
```
