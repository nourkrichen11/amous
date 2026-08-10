# Amous

Phase 1 implementation of the Amous B2C hardware-store website.

## Prerequisites

- Node.js 24.x, tested locally with `v24.11.0`.
- npm 11.x.
- PostgreSQL 14+.

## Installation

```bash
npm install
```

## PostgreSQL Setup

Create a local database and user, then copy `.env.example` to `.env.local`.

Example connection string:

```text
DATABASE_URI=postgres://amous:amous_password@localhost:5432/amous
```

Payload will create/update its tables when the application or seed command connects.

## Environment Variables

```text
DATABASE_URI=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=fr
```

Do not store real secrets in `.env.example`.

## Development

```bash
npm run dev
```

Open:

- French homepage: `http://localhost:3000/fr`
- Arabic homepage: `http://localhost:3000/ar`
- Payload admin: `http://localhost:3000/admin`

## Seed Data

```bash
npm run seed
npm run seed:categories
```

`npm run seed` keeps the original demo storefront seed.

`npm run seed:categories` is the idempotent category-catalogue seed for the current Amous catalogue phase. It:

- processes 19 parent categories
- creates missing categories by slug
- updates safe predefined fields on existing categories
- avoids duplicate category media records
- attaches local images from `public/images/categories/`
- falls back to `public/images/categories/category-placeholder.webp` when a category image is missing
- prints a final report with created, updated, unchanged, missing-image, and error counts

The legacy demo seed still creates:

- 6 categories
- 4 brands
- 12 products
- Header global content
- 1 published hero slide with local placeholder media
- Homepage global content
- Site settings global content
- Admin user: `admin@amous.local` / `ChangeMe123!`

Change the seeded password after first login.

## Build, Lint, Type Check, Test

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Current Implemented Scope

- Next.js App Router foundation.
- Payload CMS in the same repository.
- PostgreSQL Payload adapter.
- Users, Media, Categories, Brands, Products, Carts, and Orders collections.
- Homepage, Site Settings, and Delivery Config globals.
- French and Arabic locale routes.
- RTL foundation for Arabic.
- CMS-backed header, footer, homepage, category listing, shop listing, product detail, and search.
- CMS-managed two-row responsive storefront header for `/fr` and `/ar`.
- CMS-managed homepage hero with static single-slide mode and lightweight multi-slide carousel support.
- URL-persisted basic filters and sorting.
- Product cards and product detail gallery placeholder.
- Anonymous cart stored in PostgreSQL through Payload with an HTTP-only `amous_cart_id` cookie.
- Cart page, quantity updates, item removal, server-side cart validation, and mini-cart.
- One-page checkout with home delivery and cash on delivery.
- Order creation with immutable item snapshots and secure tokenized confirmation page.
- Customer authentication with Payload-backed secure cookie sessions.
- Customer registration, login, logout, forgot-password, reset-password, and password-change flows.
- Protected customer account area with dashboard, profile, addresses, and order history.
- SEO foundation with metadata, robots, sitemap, product structured data, and noindex search.
- Loading, empty, error, and localized not-found states.
- Category catalogue foundation with 19 French category definitions, homepage category integration, `/[locale]/nos-categories`, and improved category detail pages.

## Authentication

The storefront now uses the existing Payload `users` collection for both customers and administrators.

### User roles

- `customer`
- `admin`

Public registration always creates `customer` users. Administrator creation remains restricted to admin-only Payload operations or seed flows.

### User fields

The `users` collection now includes:

- `firstName`
- `lastName`
- `phone`
- `role`
- `preferredLocale`
- `active`
- `emailVerified`
- `lastLoginAt`
- `passwordChangedAt`
- `addresses[]`

### Customer routes

- `/{locale}/connexion`
- `/{locale}/inscription`
- `/{locale}/deconnexion`
- `/{locale}/mot-de-passe-oublie`
- `/{locale}/reinitialiser-mot-de-passe`
- `/{locale}/mon-compte`
- `/{locale}/mon-compte/profil`
- `/{locale}/mon-compte/adresses`
- `/{locale}/mon-compte/securite`
- `/{locale}/mon-compte/commandes`
- `/{locale}/mon-compte/commandes/[orderId]`

### Authentication API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/customers/me`
- `PATCH /api/customers/me`
- `GET /api/customers/me/orders`
- `GET /api/customers/me/orders/[orderId]`

### Security notes

- Password hashing and auth cookies are handled by Payload auth.
- Storefront sessions use secure HTTP-only cookies.
- Emails are normalized to lowercase before persistence and login.
- Inactive users are blocked during login.
- Login throttling uses Payload auth limits: 5 attempts within 15 minutes.
- Return URLs are validated to reject external URLs and `/admin` redirects.

### Current limitations

- Password reset token generation is implemented, but email delivery is still disabled until a real mail transport is configured.
- “Remember me” is accepted by the UI and API shape, but session duration is still using the current shared Payload auth cookie lifetime.
- Admin login continues to use the Payload admin interface at `/admin`.

## Category Catalogue

### Category collection fields

The `categories` collection now includes:

- `name`
- `slug`
- `shortDescription`
- `longDescription`
- `image`
- `parent`
- `displayOrder`
- `featured`
- `active`
- `showOnHomepage`
- `icon`
- `seo.metaTitle`
- `seo.metaDescription`
- `seo.ogImage`
- `seo.noIndex`

The hierarchy validator prevents:

- self-parenting
- circular parent chains
- public depth beyond three levels

### Category image requirements

Store category images in:

```text
public/images/categories/
```

Expected format and style:

- WebP
- 4:3 landscape ratio
- white or very light grey background
- blue Amous accents
- no embedded logo
- no watermark
- no text inside the image
- no visible third-party trademarks

When a category image is not available yet, the seed uses the local placeholder image and reports the category for replacement.

### Homepage category ordering

Homepage categories come from the `showOnHomepage` flag and `displayOrder`.

Initial homepage categories:

1. `outillage-a-main`
2. `quincaillerie`
3. `outillage-electroportatif`
4. `jardinage`
5. `protection-et-securite`
6. `electricite`
7. `boulonnerie-visserie`
8. `peinture`

### How to add a category

1. Add the category definition in [src/features/catalogue/categoryContent.ts](/abs/path/C:/Users/USER/amous/src/features/catalogue/categoryContent.ts:1).
2. Add the matching image file under `public/images/categories/`.
3. Run `npm run seed:categories`.

### How to create a subcategory

1. Create the category in Payload admin or through a follow-up seed entry.
2. Set its `parent` field to an existing parent category.
3. Keep the nesting depth within three public levels.

### How to replace an image

1. Put the replacement `.webp` file in `public/images/categories/` with the expected filename.
2. Run `npm run seed:categories` again.
3. Confirm the category no longer appears in the missing-image report.

### How to mark a category as featured

- `featured` controls merchandising intent.
- `showOnHomepage` controls homepage visibility.
- `displayOrder` controls sort order.

## French-Only Scope For This Phase

- The new category catalogue content is authored in French only.
- The repository still keeps the existing `/fr` and `/ar` route architecture so current storefront routing is not broken.
- Full category localization is postponed to a future phase.

## Cart, Money, Delivery, and Stock

- Cart persistence uses the `amous_cart_id` HTTP-only SameSite cookie. The authoritative cart lives in the `carts` Payload collection.
- Money is stored as integer millimes. Example: `12500` means `12.500 TND`.
- Browser totals are never trusted. Cart and order totals are recalculated server-side from current product records.
- Delivery settings are managed in the `delivery-config` Payload global.
- MVP stock strategy: stock is validated on add-to-cart, cart display, and order creation. Stock is reduced when a cash-on-delivery order is created. Cancelled orders require manual stock restoration in Payload admin for now.

## Development Order Test

1. Run PostgreSQL and configure `.env.local`.
2. Run `npm run seed`.
3. Run `npm run dev`.
4. Open `http://localhost:3000/fr`.
5. Open a product, add it to cart, open `/fr/panier`, then `/fr/commande`.
6. Use one supported governorate from the seed, such as `Tunis`.
7. Confirm the order and view the confirmation page.

## Explicitly Postponed

- Payment gateway.
- Product variants engine.
- Reviews.
- Product Q&A.
- Favourites.
- Comparison.
- Saved lists.
- Meilisearch.
- Medusa.
- Email sending for customer notifications and password-reset delivery.
- Analytics integrations.
- AI assistant.
- Full category localization beyond French content.

## Homepage Header And Hero

This repository now includes a dedicated Payload `header` global and a `hero-slides` collection for the homepage shell on:

- `/{locale}`
- `/fr`
- `/ar`

### Payload fields added

- `header` global:
  `logo`, `announcementText`, `searchPlaceholder`, `navigationItems`, `showAccount`, `showWishlist`, `showCart`, `stickyHeaderEnabled`
- `hero-slides` collection:
  `internalName`, `active`, `displayOrder`, localized `eyebrow`, localized `title`, localized `subtitle`, `desktopImage`, `mobileImage`, localized CTA labels, CTA URLs, `textAlignment`, `contentPosition`, `textTheme`, `overlayStrength`, `startDate`, `endDate`

### Editor workflow

1. Open Payload admin at `/admin`.
2. Edit the `Header` global for announcement text, localized search placeholder, and main navigation.
3. Create or publish up to three active `Hero Slides`.
4. Use start and end dates for scheduled visibility.
5. Upload replacement brand and hero media through the `Media` collection.

Only active, published, in-range hero slides are rendered. A single slide renders without carousel JavaScript.

### Brand colours

Temporary storefront colours live in [src/app/globals.css](/abs/path/C:/Users/USER/amous/src/app/globals.css:3) as semantic CSS variables:

- `--color-primary`
- `--color-accent`
- `--color-secondary`
- `--color-background`
- `--color-surface`
- `--color-text`
- `--color-text-muted`
- `--color-border`
- `--color-focus`

Replace those variables once the final Amous brand palette is approved.

### Known header and hero limitations

- Navigation items that point to future informational sections currently route to existing browse/search URLs until those dedicated pages are implemented.
- The seed command writes the header and hero content successfully on this Windows setup, but the process may not exit cleanly afterward.

## Category Catalogue Limitations

- The repository currently includes one reusable local placeholder category image, not 19 final production visuals.
- Real original Amous category images still need to be produced and dropped into `public/images/categories/`.
- The original demo seed still exists for broader storefront data and has not been redesigned into a single unified catalogue bootstrap flow yet.
