# Implementation Status

## Completed Work

- Initialized a Next.js, React, TypeScript, Tailwind CSS, Payload CMS, and PostgreSQL modular monolith.
- Added environment validation and `.env.example`.
- Implemented Payload collections for Users, Media, Categories, Brands, and Products.
- Implemented Payload globals for Homepage and Site Settings.
- Added basic admin-only catalogue write access and public active-content reads.
- Added idempotent seed data for the first catalogue vertical slice.
- Implemented localized `/fr` and `/ar` route foundation with `lang` and `dir`.
- Built homepage, shop, category, search, and product-detail pages.
- Added responsive header, mobile drawer, footer, breadcrumbs, filters, product grid, product card, and loading/empty/error states.
- Added SEO foundations: metadata, alternate links, robots, sitemap, search noindex, and product structured data.
- Added unit/component tests for localization, URL filter parsing, and product cards.
- Implemented Phase 2 cart persistence using Payload and an HTTP-only anonymous cart cookie.
- Added Carts and Orders Payload collections plus Delivery Config global.
- Implemented add-to-cart, mini-cart, cart page, checkout, cash on delivery, order creation, stock reduction, and secure order confirmation.
- Added server-side money calculation in integer millimes.
- Added tests for money calculation, delivery fees, checkout validation, quantity validation, and product card cart action.
- Added a dedicated `header` global and `hero-slides` collection for the homepage shell.
- Implemented a production-style two-row responsive header for `/fr` and `/ar`, including sticky compact state, large localized search, desktop nav, and mobile drawer.
- Implemented a CMS-managed homepage hero with localized HTML content, optional CTA pair, static single-slide rendering, and lightweight carousel controls for multiple active slides.
- Added tests for homepage header rendering, RTL drawer behavior, mobile menu interaction, accessible search, and hero static/carousel behavior.
- Added the Amous category-catalogue foundation with 19 French category definitions, category hierarchy guards, homepage category cards, `/[locale]/nos-categories`, and richer category detail pages.
- Added the idempotent `npm run seed:categories` workflow with local image lookup, placeholder fallback, and final reporting.
- Implemented Payload-backed customer authentication with role-aware `users`, customer registration/login/logout, password reset/change flows, account pages, and auth API routes.
- Linked authenticated customers to new orders and added customer-scoped order history access.

## Temporary Assumptions

- Product prices are stored in millimes.
- Product images can use local placeholder assets until CMS media is uploaded.
- French is the default locale.
- Search uses basic Payload/PostgreSQL matching only.
- Home delivery is enabled by default with seed governorates and a default fee.
- Store pickup remains disabled until business/store data is confirmed.
- Final Amous brand colours are still placeholders managed through semantic CSS variables.
- Future informational pages such as About or Professionals are not implemented yet, so some seeded header items temporarily route into existing browse/search flows.
- Final original category visuals are still being prepared; missing category files intentionally fall back to a local placeholder image.

## Known Limitations

- No social login, email verification, review, favourite, comparison, online payment, or analytics implementation yet.
- Search has no typo tolerance or autocomplete.
- Product attributes are simple arrays, not a full attribute engine.
- Arabic seed content exists for key catalogue text, but full production Arabic content still needs editorial review.
- Running the app requires a configured PostgreSQL database.
- Order creation reduces stock immediately. Cancelled orders require manual stock restoration during the MVP.
- Full order status-history auditing is postponed; only simple timestamp fields are present.
- The homepage header + hero seed currently persists the data successfully, but `npm run seed` may not exit cleanly on this Windows setup after media processing.
- The current category rollout is French-first inside an existing `/fr` + `/ar` architecture. Full category localization is postponed.
- The repository contains one generic category placeholder image and expects real final `.webp` category assets to be added under `public/images/categories/`.
- Password reset email delivery is still disabled until an SMTP or transactional email provider is configured.
- “Remember me” is wired through the form layer, but session duration is still using the shared Payload auth cookie configuration.

## Category Catalogue Notes

- Source of truth: [src/features/catalogue/categoryContent.ts](/abs/path/C:/Users/USER/amous/src/features/catalogue/categoryContent.ts:1)
- Seed command: `npm run seed:categories`
- Image directory: `public/images/categories/`
- Placeholder fallback: `public/images/categories/category-placeholder.webp`
- Homepage section source: active parent categories with `showOnHomepage = true`, ordered by `displayOrder`
- All-categories route: `/[locale]/nos-categories`
- Category detail route: `/[locale]/c/[categorySlug]`

## Next Recommended Phase

The next recommended phase should complete the catalogue layer around the new categories:

1. Produce and attach the 19 final original Amous category visuals.
2. Assign products across the expanded category tree and add subcategories where useful.
3. Expand category-specific merchandising and filtering.

After that, the next broader commerce phase should deepen customer account and operational workflows:

1. Guest order lookup by order number and phone/email.
2. SMTP or transactional email integration for password reset and order notifications.
3. Admin order status workflow refinements.
4. Email verification.
5. Social login only if business value justifies it.

## Business Decisions Required

- Final Amous visual identity and logo.
- Live phone, WhatsApp, email, and store details.
- VAT display rules.
- Delivery zones and free-delivery threshold.
- Whether store pickup should be enabled.
- Final cash-on-delivery policy and order cancellation process.
