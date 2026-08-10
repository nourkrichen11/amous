# Amous Frontend Product Specifications

Version: 2.0  
Scope: B2C hardware and home-improvement e-commerce frontend specifications  
Prepared for: Product, UX/UI, frontend, backend, QA, SEO, analytics, and content teams  
Implementation note: This document defines product and frontend requirements only. It does not include application code.

---

## 1. Product Overview

Amous is a modern hardware store and home-improvement e-commerce platform for individual customers. The storefront must help customers discover the right product, evaluate specifications, understand price and stock, choose delivery or store pickup, complete checkout, and manage orders after purchase.

Primary objectives:

- Make product discovery fast through categories, search, filters, brands, promotions, and buying guides.
- Support reliable online purchasing with clear stock, delivery, pickup, payment, cart, checkout, and order tracking.
- Support French and Arabic from launch, with architecture ready for English later.
- Give content teams control over merchandising, CMS pages, promotions, banners, buying guides, FAQs, legal pages, and SEO metadata.
- Maintain strong accessibility, performance, SEO, and mobile usability.

Recommended technical stack:

- Next.js with App Router.
- React and TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Payload CMS or equivalent headless CMS.
- PostgreSQL-backed commerce data.
- Cloudflare R2 or another S3-compatible storage solution.
- Meilisearch for product search.
- Medusa or equivalent custom commerce API.

Currency: Tunisian dinar, TND.

Backend-agnostic rule: API paths in this document are suggested contracts, not confirmed final endpoint names.

---

## 2. User Types

### Visitor

Needs: browse products, search quickly, understand price/stock/delivery, save temporary preferences, and start checkout with minimal friction.

Can:

- Browse products, categories, brands, promotions, stores, guides, FAQs, and CMS pages.
- Search and filter.
- View product details.
- Add products to cart.
- Compare products.
- Save temporary favourites.
- Contact support through phone, contact forms, or WhatsApp.
- Start checkout.
- Register or log in.

### Customer

Needs: account convenience, order visibility, invoices, saved addresses, favourites, returns/support, and communication preferences.

Can:

- Manage personal details.
- Manage addresses.
- Place orders.
- Track orders.
- Download invoices when available.
- Reorder previous purchases.
- Manage favourites.
- Submit reviews.
- Ask product questions if enabled.
- Request returns or support.
- Receive eligible promotions.

### Content Administrator

Works through the CMS. The frontend must consume, preview, and render CMS-managed content.

Manages:

- Homepage content.
- Products and product content.
- Categories.
- Brands.
- Promotions.
- Banners.
- Landing pages.
- Blog posts.
- Buying guides.
- FAQs.
- SEO content.
- Store information.
- Delivery/payment/legal content.
- Redirects.

---

## 3. Information Architecture

Top-level areas:

- Product discovery: homepage, shop, categories, subcategories, brands, promotions, new products, best sellers, search.
- Product decision: product details, comparison, reviews, Q&A, documents, delivery, pickup, related products.
- Transaction: cart, checkout, payment states, order confirmation.
- Customer account: profile, addresses, orders, tracking, invoices, returns, favourites, saved carts/lists, reviews, notifications, password/security, preferences, account deletion.
- Content: stores, delivery information, payment information, about, contact, FAQs, blog, guides, services, warranty, returns, legal pages.
- Operational pages: 404, maintenance, session expired, checkout failure, payment pending.

URL principles:

- Locale prefix required: `/fr/...`, `/ar/...`; future `/en/...`.
- Slugs localized where useful.
- Product entity IDs remain language-independent.
- Product URL proposal: `/{locale}/p/{productSlug}-{productId}`.
- Category URL proposal: `/{locale}/c/{categorySlug}`.
- Search URL proposal: `/{locale}/recherche?q={query}`.
- Filter state persists in query parameters.

---

## 4. Complete Sitemap

### Public Pages

| Page | URL Proposal |
|---|---|
| Homepage | `/{locale}` |
| Shop | `/{locale}/boutique` |
| Categories | `/{locale}/categories` |
| Category | `/{locale}/c/{categorySlug}` |
| Subcategory | `/{locale}/c/{parentSlug}/{categorySlug}` |
| Product listing | `/{locale}/produits` |
| Product details | `/{locale}/p/{productSlug}-{productId}` |
| Brands | `/{locale}/marques` |
| Brand details | `/{locale}/marques/{brandSlug}` |
| Promotions | `/{locale}/promotions` |
| New products | `/{locale}/nouveautes` |
| Best sellers | `/{locale}/meilleures-ventes` |
| Product comparison | `/{locale}/comparateur` |
| Search results | `/{locale}/recherche` |
| Stores | `/{locale}/magasins` |
| Store details | `/{locale}/magasins/{storeSlug}` |
| Delivery information | `/{locale}/livraison` |
| Payment information | `/{locale}/paiement` |
| About Amous | `/{locale}/a-propos` |
| Contact | `/{locale}/contact` |
| FAQs | `/{locale}/faq` |
| Blog | `/{locale}/blog` |
| Blog category | `/{locale}/blog/c/{categorySlug}` |
| Blog article | `/{locale}/blog/{articleSlug}` |
| Buying guides | `/{locale}/guides` |
| Services | `/{locale}/services` |
| Warranty information | `/{locale}/garantie` |
| Returns policy | `/{locale}/retours` |
| Terms and conditions | `/{locale}/conditions-generales` |
| Privacy policy | `/{locale}/confidentialite` |
| Cookie policy | `/{locale}/cookies` |
| Legal notice | `/{locale}/mentions-legales` |
| 404 page | `/{locale}/404` |
| Maintenance page | `/{locale}/maintenance` |

### Authentication Pages

| Page | URL Proposal |
|---|---|
| Login | `/{locale}/connexion` |
| Registration | `/{locale}/inscription` |
| Email verification | `/{locale}/verification-email` |
| Phone verification if required | `/{locale}/verification-telephone` |
| Forgot password | `/{locale}/mot-de-passe-oublie` |
| Reset password | `/{locale}/reinitialiser-mot-de-passe` |
| Session expired | `/{locale}/session-expiree` |

### Shopping Pages

| Page | URL Proposal |
|---|---|
| Cart | `/{locale}/panier` |
| Saved cart | `/{locale}/compte/paniers-enregistres/{id}` |
| Checkout | `/{locale}/commande` |
| Checkout success | `/{locale}/commande/succes` |
| Checkout failure | `/{locale}/commande/echec` |
| Payment pending | `/{locale}/commande/paiement-en-attente` |
| Order confirmation | `/{locale}/commande/confirmation/{orderNumber}` |

### Customer Account

| Page | URL Proposal |
|---|---|
| Account dashboard | `/{locale}/compte` |
| Profile | `/{locale}/compte/profil` |
| Addresses | `/{locale}/compte/adresses` |
| Orders | `/{locale}/compte/commandes` |
| Order details | `/{locale}/compte/commandes/{orderNumber}` |
| Order tracking | `/{locale}/compte/commandes/{orderNumber}/suivi` |
| Invoices | `/{locale}/compte/factures` |
| Returns | `/{locale}/compte/retours` |
| Favourites | `/{locale}/compte/favoris` |
| Product comparison | `/{locale}/compte/comparaisons` |
| Reviews | `/{locale}/compte/avis` |
| Notifications | `/{locale}/compte/notifications` |
| Saved carts | `/{locale}/compte/paniers-enregistres` |
| Saved product lists | `/{locale}/compte/listes` |
| Password and security | `/{locale}/compte/securite` |
| Communication preferences | `/{locale}/compte/preferences` |
| Delete account | `/{locale}/compte/suppression` |

---

## 5. Navigation System

### Desktop Header

The header should include:

- Amous logo.
- Product-category navigation.
- Prominent search bar.
- Store selector when applicable.
- Delivery-location selector.
- Language switcher.
- Contact or WhatsApp shortcut.
- Account access.
- Favourites.
- Product comparison.
- Cart.

Rules:

- Prioritize product discovery, search, account, and cart.
- Avoid overcrowding the header.
- Use a compact sticky header after scroll with logo, category trigger, search, account, and cart.
- Checkout uses a simplified header: logo, support, language switcher.

### Desktop Mega Menu

- Shows major departments, top subcategories, featured brands, and one CMS-controlled promotional slot.
- Maximum 3 visible hierarchy levels.
- Includes "View all" links.
- Keyboard accessible with Enter, Space, Tab, arrow keys where appropriate, and Escape close.

### Mobile Navigation

- Use a drawer with search, account summary, language switcher, categories, promotions, stores, support, and legal/help links.
- Category drill-down uses one level per panel with Back control.
- Recommended bottom navigation: Home, Categories, Search, Account, Cart.
- Hide bottom navigation during checkout and full-screen forms.

### Search Autocomplete

Autocomplete includes:

- Recent searches.
- Popular searches.
- Suggested queries.
- Product suggestions.
- Category suggestions.
- Brand suggestions.

Keyboard behavior:

- `/` focuses search on desktop when focus is not in an input.
- Arrow keys navigate suggestions.
- Enter submits selected suggestion or query.
- Escape closes suggestions.

### Breadcrumbs

- Required on product, category, brand, blog, guide, account detail, order detail, and store pages.
- Use structured data on public pages.
- Mirror separators and directional icons in Arabic.

### Footer

Columns:

- Shop: categories, promotions, brands, new products, best sellers.
- Help: delivery, payment, warranty, returns, FAQ, contact.
- Amous: about, stores, services, careers if applicable.
- Legal: terms, privacy, cookies, legal notice.
- Contact: phone, WhatsApp, email, opening hours, social networks.

---

## 6. Page-by-Page Specifications

### Homepage

#### Purpose

Introduce Amous, guide product discovery, promote key categories and offers, and build trust.

#### Target users

Visitors, customers, content administrators indirectly through CMS.

#### Entry points

Direct traffic, search engines, campaigns, logo, localized root route.

#### URL proposal

`/{locale}`

#### Main user actions

Search, browse category, view promotion, view product, register/log in, contact WhatsApp, select delivery location/store.

#### Page sections

Announcement bar, header/search, main promotional hero, primary categories, featured products, current promotions, best sellers, new products, featured brands, service benefits, delivery information, store pickup information, buying guides, blog articles, newsletter, support CTA, trust indicators, footer.

#### Components

Header, mega menu, search autocomplete, hero banner, category card, product carousel/grid, promotion banner, brand card, service strip, article card, newsletter form, WhatsApp button, footer.

#### Data requirements

CMS homepage configuration, banners, category highlights, product collections, promotions, brands, articles, guides, store/service content, SEO metadata.

#### API requirements

Suggested: `GET /cms/homepage?locale`, `GET /commerce/products/collections`, `GET /commerce/promotions/active`, `GET /commerce/categories/tree`, `GET /cms/articles?featured=true`.

#### Business rules

Hide optional sections that have no eligible content. Limit homepage product rows to curated collections; do not turn the homepage into a full catalogue. Promotions must respect start/end dates.

#### Permissions

Public.

#### Desktop behaviour

Hero and main categories appear high on the page. Product collections use 4 to 5 columns depending on width.

#### Mobile behaviour

Hero is concise. Categories use a horizontal scroller or 2-column grid. Product carousels show 1.2 to 2 cards.

#### Arabic RTL behaviour

Layout direction mirrors. Category scrolling starts from the right. SKUs remain LTR.

#### Loading state

Header shell, hero skeleton, category skeletons, product card skeletons.

#### Empty state

Hide optional empty sections. If commerce data is unavailable, show search, categories, and support.

#### Error states

CMS failure shows resilient default structure. Product collection failure hides that section and logs the issue.

#### Success states

Newsletter success, add-to-cart toast, favourite/compare confirmation.

#### Validation

Newsletter requires valid email and consent if required.

#### SEO requirements

Localized title/description, canonical, `hreflang`, Organization schema, WebSite search action, LocalBusiness summary, Open Graph image.

#### Analytics events

`homepage_viewed`, `hero_clicked`, `category_clicked`, `promotion_clicked`, `product_clicked`, `newsletter_submitted`, `whatsapp_clicked`.

#### Accessibility requirements

One H1, semantic sections, accessible carousel controls, keyboard search, alt text for banners, reduced-motion support.

#### Acceptance criteria

Given active homepage CMS content, when a user visits `/{locale}`, then the configured sections render in the selected language.  
Given a homepage section has no eligible items, when the page loads, then that section is hidden without blank space.

### Catalogue and Category Listing Page

#### Purpose

Let users browse a large hardware inventory by category, subcategory, brand, promotion, and attributes.

#### Target users

Visitors and customers.

#### Entry points

Mega menu, homepage categories, SEO, footer, internal links.

#### URL proposal

`/{locale}/boutique`, `/{locale}/categories`, `/{locale}/c/{categorySlug}`, `/{locale}/c/{parentSlug}/{categorySlug}`, `/{locale}/produits`

#### Main user actions

Filter, sort, switch grid/list, open product, add to cart, compare, favourite, navigate subcategory.

#### Page sections

Breadcrumb, page header, category description, subcategories, product count, sorting, filters, active-filter display, product grid/list, pagination or load more, SEO content, related categories, recently viewed products.

#### Components

Breadcrumbs, category header, filter sidebar, mobile filter drawer, sorting control, active filter chips, product card, pagination, empty state, loading skeleton.

#### Data requirements

Category tree, category metadata, product hits, available filters, counts, public pricing, stock summaries, SEO copy.

#### API requirements

Suggested: `GET /commerce/categories/{slug}`, `GET /search/products?category&filters&sort&page`, `GET /pricing/batch`, `GET /stock/batch`.

#### Business rules

Filters are category-specific. Filtered URLs are shareable. Invalid filters from URL are ignored. Listing pages must never hardcode product attributes.

#### Permissions

Public.

#### Desktop behaviour

Persistent left filter sidebar, 3 to 5 product columns, sticky sort/result bar optional.

#### Mobile behaviour

Filter drawer, compact sort control, 2-column grid, active filters in a horizontal scroller, no horizontal page overflow.

#### Arabic RTL behaviour

Filter drawer opens from the right. Breadcrumbs and pagination mirror. Technical units remain readable.

#### Loading state

Listing skeleton with stable product-card dimensions and filter skeletons.

#### Empty state

Show no-result message, reset filters, related categories, popular products, and support link.

#### Error states

Search unavailable, category missing, pricing unavailable, stock unavailable.

#### Success states

Filter applied, item added to cart, favourite saved, comparison updated.

#### Validation

Numeric ranges reject invalid min/max. URL filter values are sanitized.

#### SEO requirements

Unique metadata for base category pages. Most filtered URLs canonicalize to the base category. CMS-approved filter landing pages may be indexable.

#### Analytics events

`category_viewed`, `filter_applied`, `filter_removed`, `sort_changed`, `pagination_clicked`, `product_selected`, `add_to_cart`.

#### Accessibility requirements

Filters use fieldsets and legends. Result count updates are announced politely. Product cards have clear accessible names.

#### Acceptance criteria

Given a category has category-specific attributes, when the user opens filters, then only relevant filters appear.  
Given filters are applied, when the URL is shared, then the same result state can be restored.

### Search Results Page

#### Purpose

Return relevant product, category, brand, and content results for typed queries, SKUs, technical attributes, French, and Arabic.

#### Target users

Visitors and customers.

#### Entry points

Header search, autocomplete, no-result suggestions, browser URL.

#### URL proposal

`/{locale}/recherche?q={query}&sort={sort}&filters...`

#### Main user actions

Submit search, refine with filters, sort, select result, correct query, browse recommendations.

#### Page sections

Search header, query field, result count, suggested correction, product results, category/brand suggestions, filters, sort, no-results recommendations, search examples.

#### Components

Search box, autocomplete, filter sidebar/drawer, product grid, suggestion cards, empty state.

#### Data requirements

Search hits, facets, typo/synonym metadata, highlighted terms, popular searches, recent searches, localized synonyms.

#### API requirements

Suggested: `GET /search/products?q`, `GET /search/suggestions?q`, `POST /analytics/search-event`.

#### Business rules

Support examples such as `perceuse Bosch`, `disque 115`, `peinture blanche 5L`, `vis inox 6x40`, `clé 13`, `cle 13`, `marteau`, and partial product references.

#### Permissions

Public.

#### Desktop behaviour

Search field remains prominent above results; filters left; results in grid/list.

#### Mobile behaviour

Search field sticky while focused; filters in drawer; suggestions full-screen during input.

#### Arabic RTL behaviour

Search input supports RTL text. SKUs and product references remain LTR.

#### Loading state

Autocomplete skeleton and full page result skeleton.

#### Empty state

Show spelling alternatives, category suggestions, popular searches, contact CTA, and examples.

#### Error states

Search service unavailable; show retry and category fallback.

#### Success states

Results rendered; query saved to recent searches if allowed.

#### Validation

Trim query, reject abusive length, encode URL safely.

#### SEO requirements

Noindex internal search result pages by default.

#### Analytics events

`search_submitted`, `search_result_selected`, `search_no_results`, `search_suggestion_clicked`, `filter_applied`.

#### Accessibility requirements

Combobox pattern for autocomplete, live region for result count, keyboard navigation.

#### Acceptance criteria

Given a user searches by partial SKU, when matching products exist, then product results appear with matching references highlighted.  
Given no results exist, when the page loads, then recovery recommendations and support actions are visible.

### Product Details Page

#### Purpose

Enable confident purchase decisions for simple products, variant products, measured products, packaged products, temporarily unavailable products, and discontinued products.

#### Target users

Visitors and customers.

#### Entry points

Listings, search, brand pages, recommendations, direct SEO, shared links.

#### URL proposal

`/{locale}/p/{productSlug}-{productId}`

#### Main user actions

Select variant, choose quantity, check stock/delivery/pickup, add to cart, buy now, WhatsApp, add to favourites, compare, read specs/documents/reviews/Q&A.

#### Page sections

Breadcrumb, image gallery, video, zoom, product title, brand, SKU/reference, rating, badges, short description, price, VAT display, unit price, variant selectors, quantity selector, minimum quantity, quantity increment, stock status, store availability, delivery estimate, pickup availability, add to cart, buy now, WhatsApp action, favourites, compare, technical characteristics, full description, documents/manuals, warranty, delivery, returns, related products, compatible products, accessories, frequently bought together, reviews, questions and answers, recently viewed.

#### Components

Gallery, price display, stock badge, variant selector, quantity selector, add-to-cart button, WhatsApp button, tabs/accordion, document list, review summary, related product carousel, sticky purchase bar.

#### Data requirements

Product, variants, images, videos, attributes, public pricing, stock by warehouse/store, delivery eligibility, pickup availability, documents, related products, reviews, Q&A, SEO metadata.

#### API requirements

Suggested: `GET /commerce/products/{id}`, `GET /pricing/products/{id}`, `GET /stock/products/{id}`, `GET /delivery/estimate`, `POST /cart/items`, `POST /favourites`, `POST /compare`.

#### Business rules

Respect minimum order quantity and quantity increments. Discontinued products show alternatives and no add-to-cart. Temporarily unavailable products show restock/support actions if enabled. Products with variants require valid variant selection before purchase.

#### Permissions

Public content. Favourites, reviews, and saved comparisons may require authentication.

#### Desktop behaviour

Two-column top layout: gallery left, purchase panel right. Purchase panel can be sticky within viewport.

#### Mobile behaviour

Gallery first, then essential info. Sticky bottom purchase controls when purchasable.

#### Arabic RTL behaviour

Tabs/order mirror. Measurements and SKUs remain LTR. Gallery thumbnail direction mirrors.

#### Loading state

Product shell skeleton with stable gallery and purchase-panel dimensions.

#### Empty state

Optional docs, reviews, and Q&A sections show compact prompts only where useful.

#### Error states

Product not found, product unavailable, pricing unavailable, stock unavailable, delivery unavailable, add-to-cart failure.

#### Success states

Added to cart, favourite saved, comparison updated, review submitted.

#### Validation

Variant required before purchase. Quantity must meet min/max/increment and stock rules. Measurement input validates decimal precision and unit.

#### SEO requirements

Product schema, Offer schema, canonical product URL, `hreflang`, Breadcrumb schema, image Open Graph, out-of-stock/discontinued strategy.

#### Analytics events

`product_viewed`, `variant_selected`, `quantity_changed`, `delivery_estimate_requested`, `add_to_cart`, `product_favourited`, `product_compared`, `document_downloaded`.

#### Accessibility requirements

Gallery controls labelled. Zoom keyboard accessible. Accordions semantic. Sticky controls do not trap focus.

#### Acceptance criteria

Given a product has variants, when no variant is selected, then add-to-cart is disabled with a clear validation message.  
Given a product is discontinued, when the product page loads, then purchase actions are unavailable and alternatives are shown.

### Cart Page and Mini-Cart

#### Purpose

Review, validate, and adjust intended purchases before checkout.

#### Target users

Visitors and customers.

#### Entry points

Header cart, add-to-cart toast, checkout back navigation.

#### URL proposal

`/{locale}/panier`

#### Main user actions

Change quantity, remove item, save for later, move to favourites, apply coupon, estimate shipping, checkout, continue shopping.

#### Page sections

Cart items, issue messages, promotion code, delivery estimate, order summary, subtotal, tax, discounts, total, checkout CTA, continue-shopping CTA, recommendations.

#### Components

Cart line item, quantity selector, price display, coupon field, shipping estimator, order summary, mini-cart drawer, recommendation card.

#### Data requirements

Cart, cart items, product snapshots, current prices, discounts, VAT, stock, delivery eligibility, user session.

#### API requirements

Suggested: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{id}`, `DELETE /cart/items/{id}`, `POST /cart/coupons`, `POST /cart/merge`, `POST /delivery/estimate`.

#### Business rules

Guest cart persists by anonymous ID. Authenticated cart persists server-side. Login merges carts with conflict resolution. Out-of-stock, insufficient quantity, price changes, deactivated products, min/max quantities, and delivery/pickup incompatibilities must be surfaced before checkout.

#### Permissions

Public cart. Checkout may continue as guest if enabled.

#### Desktop behaviour

Items left, sticky order summary right.

#### Mobile behaviour

Line items as cards; sticky checkout summary; mini-cart as drawer.

#### Arabic RTL behaviour

Summary/order alignments mirror. Numbers and currency localized.

#### Loading state

Line item skeletons and summary skeleton.

#### Empty state

Empty cart message with category, promotions, and saved-list actions.

#### Error states

Coupon invalid, stock changed, price changed, item removed, delivery unavailable, cart expired.

#### Success states

Coupon applied, item updated, item removed, cart saved, checkout started.

#### Validation

Quantity step/min/max, coupon length/format, delivery postal/zone inputs if used.

#### SEO requirements

Noindex cart.

#### Analytics events

`cart_viewed`, `quantity_changed`, `remove_from_cart`, `coupon_applied`, `begin_checkout`.

#### Accessibility requirements

Quantity buttons labelled. Cart updates announced. Destructive actions provide confirmation or undo.

#### Acceptance criteria

Given a cart item price changed since it was added, when the cart opens, then the new price is shown with a clear change notice before checkout.

### Checkout Page

#### Purpose

Complete order creation with clear steps, validation, delivery/pickup selection, payment, review, and confirmation.

#### Target users

Visitors if guest checkout is enabled, and customers.

#### Entry points

Cart and buy-now action.

#### URL proposal

`/{locale}/commande`

#### Main user actions

Enter customer information, log in/register, choose delivery or pickup, enter address, choose payment, review, accept terms, place order.

#### Page sections

Stepper, customer information, delivery/pickup, address, payment, review, final summary, terms acceptance, support.

#### Components

Checkout stepper, address form, delivery selector, store selector, payment method list, order summary, validation summary, secure header.

#### Data requirements

Cart validation, customer, addresses, delivery methods, stores, payment methods, order totals, terms content.

#### API requirements

Suggested: `POST /checkout/session`, `PATCH /checkout/session`, `GET /delivery/methods`, `GET /payments/methods`, `POST /orders`, `POST /payments/initiate`.

#### Business rules

Payment methods are configurable. Steps persist through refresh while session is valid. Payment redirects return to success, failure, or pending. Order creation requires idempotency to prevent duplicate orders.

#### Permissions

Guest checkout configurable. Account checkout requires authentication.

#### Desktop behaviour

Main form left, sticky summary right, compact secure header.

#### Mobile behaviour

Single-column stepper, collapsible summary, bottom action button, mobile-optimized input types.

#### Arabic RTL behaviour

Stepper direction mirrors. Address labels and field order localize appropriately.

#### Loading state

Step skeleton or button spinner; duplicate submission blocked.

#### Empty state

If cart is empty, redirect to cart empty state.

#### Error states

Validation errors, session timeout, payment failure, delivery unavailable, stock changed, duplicate order prevented, backend unavailable.

#### Success states

Order created, payment initiated, confirmation email sent, account created if guest converts.

#### Validation

Required fields by step. Email, phone, address, terms acceptance, selected delivery/pickup method, selected payment method.

#### SEO requirements

Noindex checkout.

#### Analytics events

`begin_checkout`, `checkout_step_completed`, `delivery_method_selected`, `payment_method_selected`, `purchase_completed`, `purchase_failed`.

#### Accessibility requirements

Step headings semantic. Errors linked to fields. Payment redirects announced. Focus moves to first error.

#### Acceptance criteria

Given payment fails after redirect, when the user returns, then the failure page explains the issue and offers retry/change payment without duplicating the order.

### Checkout Result and Order Tracking Pages

#### Purpose

Communicate success, failure, pending payment, confirmed order details, and fulfillment status.

#### Target users

Visitors and customers.

#### Entry points

Checkout submission, payment redirect, order email links, account orders.

#### URL proposal

`/{locale}/commande/succes`, `/{locale}/commande/echec`, `/{locale}/commande/paiement-en-attente`, `/{locale}/commande/confirmation/{orderNumber}`, `/{locale}/compte/commandes/{orderNumber}/suivi`

#### Main user actions

View order, retry payment, change payment, download documents, contact support, continue shopping.

#### Page sections

Status header, order number, order status, payment status, product summary, totals, delivery/pickup details, addresses, documents, support actions, next steps, status timeline.

#### Components

Status banner, order summary, status timeline, document download, support CTA.

#### Data requirements

Order, payment, delivery/pickup, customer, documents, support contact.

#### API requirements

Suggested: `GET /orders/{orderNumber}`, `POST /payments/{paymentId}/retry`.

#### Business rules

Statuses are configurable: order received, payment pending, payment confirmed, preparing, ready for pickup, shipped, out for delivery, delivered, cancelled, returned, refunded.

#### Permissions

Guest confirmation requires secure token. Account order pages require owner authentication.

#### Desktop behaviour

Status content centered with detail panels.

#### Mobile behaviour

Compact summary and large support/retry actions.

#### Arabic RTL behaviour

Timeline mirrors with localized statuses.

#### Loading state

Order skeleton.

#### Empty state

Unknown order token shows support and login prompt.

#### Error states

Order not found, payment still processing, document unavailable.

#### Success states

Payment retry initialized, document downloaded.

#### Validation

Retry payment requires active payable order.

#### SEO requirements

Noindex.

#### Analytics events

`order_confirmation_viewed`, `payment_retry_clicked`, `document_downloaded`, `contact_support_clicked`.

#### Accessibility requirements

Status not conveyed by color alone. Timeline is a semantic list.

#### Acceptance criteria

Given payment is pending, when the page loads, then the user sees payment status, next step, and support action without seeing a false success message.

### Authentication Pages

#### Purpose

Authenticate customers, register accounts, verify contact methods, recover passwords, and handle expired sessions.

#### Target users

Visitors and customers.

#### Entry points

Account icon, checkout, favourites, saved lists, reviews.

#### URL proposal

`/{locale}/connexion`, `/{locale}/inscription`, `/{locale}/verification-email`, `/{locale}/verification-telephone`, `/{locale}/mot-de-passe-oublie`, `/{locale}/reinitialiser-mot-de-passe`, `/{locale}/session-expiree`

#### Main user actions

Log in, register, verify email/phone, reset password, resume intended action.

#### Page sections

Auth form, trust/support copy, verification status, resend controls, password rules.

#### Components

Form field, password field, verification code input, alert, toast.

#### Data requirements

User credentials, registration fields, verification token/state, auth session, redirect target.

#### API requirements

Suggested: `POST /auth/login`, `POST /auth/logout`, `POST /auth/register`, `POST /auth/verify-email`, `POST /auth/verify-phone`, `POST /auth/password/forgot`, `POST /auth/password/reset`, `GET /auth/session`.

#### Business rules

Registration requests name, email, phone if required, password, consent, and communication preferences. Protected routes redirect to login and resume intended action after success.

#### Permissions

Public except logout/session check.

#### Desktop behaviour

Centered form with support side content if useful.

#### Mobile behaviour

Single-column; inputs use proper keyboard types.

#### Arabic RTL behaviour

Forms mirror. Email and password fields can remain LTR where appropriate.

#### Loading state

Button loading and form disabled on submit.

#### Empty state

Expired/invalid token pages explain recovery actions.

#### Error states

Invalid credentials, unverified email, locked account, expired token, session expired, rate limit.

#### Success states

Logged in, registered, verification sent, password reset.

#### Validation

Email, phone, password strength, required fields, consent.

#### SEO requirements

Noindex auth pages.

#### Analytics events

`login_completed`, `login_failed`, `registration_started`, `registration_completed`.

#### Accessibility requirements

Labels required. Errors announced. Focus moves to first error. Password requirements are available to screen readers.

#### Acceptance criteria

Given a user session expires during checkout, when they log in again, then they are returned to the checkout step if the cart is still valid.

### Customer Account Pages

#### Purpose

Let customers manage profile, addresses, orders, invoices, returns, favourites, reviews, saved carts/lists, notifications, security, preferences, and deletion.

#### Target users

Authenticated customers.

#### Entry points

Account menu, order confirmation, email links.

#### URL proposal

`/{locale}/compte`, plus account child routes listed in the sitemap.

#### Main user actions

Update profile, manage addresses, track orders, download invoices, reorder, request return/support, manage favourites/lists, change password, update preferences.

#### Page sections

Dashboard summary, account side navigation, page-specific table/list/form, support shortcuts.

#### Components

Account layout, data table, responsive cards, address form, status timeline, product list, form fields, empty states.

#### Data requirements

Customer, addresses, orders, invoices, returns, favourites, saved carts/lists, notifications, reviews, preferences.

#### API requirements

Suggested: `GET/PATCH /account/profile`, `GET/POST/PATCH/DELETE /account/addresses`, `GET /orders`, `GET /orders/{id}`, `GET /invoices`, `POST /returns`, `GET/POST/DELETE /favourites`, `GET/PATCH /account/preferences`.

#### Business rules

Default address rules. Invoice downloads only for owner. Returns depend on order status/window. Account deletion requires confirmation and backend privacy process.

#### Permissions

Authenticated owner.

#### Desktop behaviour

Left account navigation; tables for orders/invoices; dashboard cards not nested.

#### Mobile behaviour

Account menu as drawer/select; tables become cards or priority rows.

#### Arabic RTL behaviour

Navigation and tables mirror. Numbers/currency localized.

#### Loading state

Page skeletons and table row skeletons.

#### Empty state

Context-specific: no orders, invoices, favourites, saved lists, or notifications.

#### Error states

Unauthorized, session expired, data fetch failure, update failure.

#### Success states

Profile saved, address saved, reorder added to cart, return requested.

#### Validation

Profile, address, password, preferences, return reason/attachments.

#### SEO requirements

Noindex account area.

#### Analytics events

`account_dashboard_viewed`, `order_details_viewed`, `invoice_downloaded`, `reorder_clicked`, `favourite_removed`.

#### Accessibility requirements

Account navigation landmark. Tables labelled. Mobile cards preserve data labels.

#### Acceptance criteria

Given a customer has no orders, when they open orders, then an empty state offers shopping and support actions.

### Store and Store Detail Pages

#### Purpose

Help users choose pickup location, view store hours/contact, and understand pickup availability.

#### Target users

Visitors and customers.

#### Entry points

Header store selector, footer, delivery/pickup pages, product availability.

#### URL proposal

`/{locale}/magasins`, `/{locale}/magasins/{storeSlug}`

#### Main user actions

Find store, set preferred store, view hours, call/WhatsApp, get directions, check pickup information.

#### Page sections

Store search/list/map, store cards, detail header, hours, services, pickup instructions, contact, nearby stores.

#### Components

Store card, map placeholder/integration, store selector, hours table, contact actions.

#### Data requirements

Stores, localized addresses, coordinates, hours, exceptional closures, services, contact info, pickup eligibility.

#### API requirements

Suggested: `GET /stores`, `GET /stores/{slug}`, `POST /user/preferences/store`.

#### Business rules

Opening hours and pickup readiness are configurable. If geolocation is used, request consent.

#### Permissions

Public. Preferred store saved to account when authenticated or local state as guest.

#### Desktop behaviour

List and map side by side if map provider enabled.

#### Mobile behaviour

List first; map collapsible; call/directions buttons prominent.

#### Arabic RTL behaviour

Address formatting localized. Maps remain provider-native.

#### Loading state

Store card skeleton.

#### Empty state

No store in zone: show delivery/contact options.

#### Error states

Map unavailable, store not found.

#### Success states

Preferred store selected.

#### Validation

Location search sanitized.

#### SEO requirements

LocalBusiness schema per store, canonical, localized metadata.

#### Analytics events

`stores_viewed`, `store_selected`, `directions_clicked`, `store_contact_clicked`.

#### Accessibility requirements

Map has text alternative list. Hours table labelled.

#### Acceptance criteria

Given a user selects a store, when they return to a product page, then pickup availability uses that store where stock data exists.

### CMS Content Pages

#### Purpose

Present non-transactional content: delivery, payment, about, contact, FAQs, blog, guides, services, warranty, returns, legal policies, cookie policy, maintenance.

#### Target users

Visitors, customers, content administrators indirectly.

#### Entry points

Footer, SEO, internal links, support flows.

#### URL proposal

Routes listed in public sitemap.

#### Main user actions

Read content, contact support, submit form, browse articles/guides, navigate related content.

#### Page sections

CMS hero/title, rich content, FAQ accordions, related articles/guides, contact form where applicable, support CTAs.

#### Components

CMS renderer, FAQ accordion, article card, contact form, breadcrumb, table of contents, cookie banner/preferences.

#### Data requirements

CMS page, localized content blocks, SEO metadata, related content, contact categories, legal publication dates.

#### API requirements

Suggested: `GET /cms/pages/{slug}`, `GET /cms/faqs`, `GET /cms/articles`, `POST /contact-requests`, `POST /cookie-consent`.

#### Business rules

Legal pages require version/date. Contact form categories route to correct support team. Maintenance page can be static fallback.

#### Permissions

Public.

#### Desktop behaviour

Readable content width; related content aside only when useful.

#### Mobile behaviour

Single-column; long content gets table of contents if article/guide.

#### Arabic RTL behaviour

Rich content mirrors. Mixed technical content uses explicit direction spans.

#### Loading state

Content skeleton.

#### Empty state

Article/category with no content shows search/category fallback.

#### Error states

Page not found, form submission failure.

#### Success states

Contact form submitted, cookie preferences saved, newsletter subscribed.

#### Validation

Contact fields, consent, newsletter email, FAQ search.

#### SEO requirements

Page-specific metadata, Article/FAQ schema where valid, canonical, `hreflang`, Open Graph.

#### Analytics events

`cms_page_viewed`, `blog_article_viewed`, `guide_viewed`, `contact_form_submitted`, `faq_searched`.

#### Accessibility requirements

CMS output sanitized and semantic. Headings ordered. Accordions accessible.

#### Acceptance criteria

Given a content admin publishes localized French and Arabic legal content, when users open each locale route, then localized metadata and content render with correct direction.

### Error and Operational Pages

#### Purpose

Handle 404, maintenance, permission denied, authentication required, session expired, checkout failure, and payment pending without dead ends.

#### Target users

All users.

#### Entry points

Invalid routes, protected route access, downtime, auth/session expiry, payment redirects.

#### URL proposal

`/{locale}/404`, `/{locale}/maintenance`, `/{locale}/session-expiree`, checkout result routes above.

#### Main user actions

Search, go home, retry, log in, contact support, retry payment.

#### Page sections

Clear status heading, concise explanation, recovery actions, support contact, optional category/search fallback.

#### Components

Error state, search box, support CTA, status badge.

#### Data requirements

Localized error copy, support contact, optional recommended categories.

#### API requirements

Suggested: none for static 404/maintenance; `GET /auth/session` for session expired; relevant payment/order endpoints as above.

#### Business rules

Do not reveal restricted resource details to unauthorized users. Maintenance page must be lightweight and independent of commerce APIs.

#### Permissions

Public or context-specific.

#### Desktop behaviour

Centered content with search and support.

#### Mobile behaviour

Large touch actions; bottom nav hidden on critical states if distracting.

#### Arabic RTL behaviour

Layout mirrors.

#### Loading state

Not applicable except session/payment checks.

#### Empty state

Not applicable.

#### Error states

This page type is itself an error surface.

#### Success states

Recovery action succeeds: login, retry, search, support contact.

#### Validation

Recovery form validation where present.

#### SEO requirements

404 returns correct status. Maintenance returns 503 with retry metadata. Operational pages noindex.

#### Analytics events

`error_page_viewed`, `session_expired_viewed`, `maintenance_viewed`, `payment_failed_viewed`.

#### Accessibility requirements

Status title as H1. Actions keyboard accessible. Error meaning not color-only.

#### Acceptance criteria

Given an invalid product URL, when the page returns 404, then the user can search, browse categories, or contact support.

---

## 7. Customer User Journeys

### Browse to Checkout

1. Visitor lands on homepage.
2. Searches or browses category.
3. Filters by brand, price, stock, and category-specific attributes.
4. Opens product detail.
5. Selects variant and quantity.
6. Adds to cart.
7. Reviews cart, coupon, and delivery estimate.
8. Checks out as guest or logs/registers.
9. Chooses delivery/pickup and payment.
10. Confirms order and receives order number.

### Reorder

1. Customer logs in.
2. Opens account orders.
3. Opens previous order.
4. Selects reorder.
5. Cart validates active products, prices, stock, and quantity rules.
6. Customer checks out.

### Support or Return

1. Customer opens order detail.
2. Selects return/support request.
3. Chooses items and reason.
4. Adds notes/photos if enabled.
5. Submits request.
6. Tracks status in account.

---

## 8. Reusable Components

| Component | Purpose | Props/Data | Variants | States | Accessibility | Mobile |
|---|---|---|---|---|---|---|
| Header | Global discovery/actions | locale, nav, user, cart count | default, sticky, checkout | loading, signed out/in | landmarks, keyboard menus | compact |
| Mega menu | Category discovery | category tree, promos | desktop | open, focused, empty | ARIA navigation | drawer replaces |
| Mobile menu | Drill-down navigation | categories, account | drawer | nested, loading | focus trap, Escape | full-height |
| Search box | Query input | query, suggestions | header, page | focus, loading, error | combobox | full-screen suggestions |
| Search autocomplete | Suggestions | products, categories, brands | desktop/mobile | recent, popular, no result | arrow keys | overlay |
| Breadcrumbs | Location context | trail | public/account | collapsed | nav label | truncated |
| Product card | Product selection | product, price, stock | standard, list, carousel, search, recommendation, related | out of stock, hidden price, variant required | named article/buttons | fixed dimensions |
| Product grid/list | Results | products, layout | grid/list | loading, empty | list semantics | 2-column/cards |
| Price display | Pricing clarity | price model | retail, promo, unit | changed, expired | not color-only | wraps cleanly |
| Stock badge | Availability | stock status | in stock, low, out, by store | unknown | text label | compact |
| Product gallery | Media browsing | images/video | PDP | zoom, loading | keyboard, alt text | swipe |
| Variant selector | Product options | variants | buttons, select, swatch | disabled, error | fieldset | stacked |
| Quantity selector | Unit quantity | min,max,step,unit | stepper, measurement | invalid, stock limit | labelled buttons | large touch |
| Add-to-cart button | Purchase action | product/cart state | normal, buy now | loading, disabled, success | status announced | sticky |
| Favourite button | Save product | productId | icon, text | saved, loading | aria-pressed | icon |
| Compare button | Compare product | productId,count | icon, tray | limit reached | aria-pressed | tray |
| Filter sidebar/drawer | Refine listings | facets | desktop, mobile | applied, loading | fieldsets | drawer |
| Sorting control | Sort results | options | select/menu | changed | labelled | full width |
| Pagination | Navigate pages | page info | numbered, load more | disabled | nav label | load more |
| Carousel | Merchandising | items | product, brand, article | loading, empty | accessible controls | swipe + buttons |
| Category card | Category entry | image,name,count | primary, subcategory | loading | alt text | grid/scroller |
| Brand card | Brand entry | logo,name | standard | loading | alt text | grid |
| Promotion banner | Campaign | image, copy, CTA | hero, strip | expired | alt/copy | responsive image |
| Store card | Store choice | store | list, selector | selected, closed | address text | call/directions |
| Delivery selector | Fulfillment | methods,zones | cart, checkout | unavailable | radio group | stacked |
| Address form | Address data | fields,country | shipping,billing | validation | autocomplete attrs | mobile inputs |
| Checkout stepper | Progress | steps,current | full, compact | complete,error | semantic current | vertical/compact |
| Order summary | Totals | cart/order | cart,checkout,confirmation | changed | totals labelled | collapsible |
| Status timeline | Order state | statuses | order, payment, return | current,error | list semantics | vertical |
| Modal/Drawer | Overlays | title, content | modal, drawer | open, loading | focus trap | drawer preferred |
| Toast/Alert | Feedback | message,type | success,error,warning | timed/persistent | live region | bottom/top |
| Form field | Input standard | label,value,error | text,select,textarea | invalid,disabled | label association | correct keyboard |
| File upload | Return/support files | file rules | single,multiple | progress,error | button/input label | camera/files |
| Data table | Account data | columns,rows | table,cards | loading,empty | headers | cards/priority |
| Tabs/Accordion | Dense content | panels | PDP/CMS/account | selected | ARIA pattern | accordion |
| Empty/Error/Skeleton | State clarity | copy/actions | page,component | applicable | status text | stable size |
| Cookie banner | Consent | categories | banner,panel | accepted | keyboard | bottom sheet |
| Language switcher | Locale | locales,current | menu | selected | labelled | compact |
| WhatsApp button | Support | phone,message | header,floating,CTA | clicked | descriptive label | visible but unobtrusive |

Component-wide requirements:

- Define loading, empty, disabled, validation, API-error, permission-denied, and success states where relevant.
- Expose keyboard behavior, focus order, screen-reader labels, and reduced-motion behavior.
- Prevent unexpected resizing when badges, hover states, long labels, or loading text appear.
- Design mobile behavior intentionally.

### Product Card Standards

Required variants:

- Standard product card.
- Compact list card.
- Carousel card.
- Search-suggestion card.
- Cart recommendation card.
- Related-product card.

Standard card content:

- Image, product name, brand, SKU/reference, rating, main price, previous price, discount, VAT information, unit price, stock status, delivery estimate, quantity selector, add-to-cart button, favourite button, compare button, promotion badge, new-product badge, variant indicator.

Behavior rules:

- Out of stock: disable purchase, show stock message, allow favourite/compare/notify if enabled.
- Hidden price: show "Price on request" only if product data supports it; otherwise show current public price.
- Variants: action opens variant selector drawer or product page depending complexity.
- Minimum order quantity: quantity selector starts at minimum and shows unit/increment.
- Sold by unit, metre, litre, kilogram, pack, or box: unit label appears near quantity and price.

---

## 9. Product Catalogue Architecture

Category examples:

- Hand tools.
- Power tools.
- Construction equipment.
- Paint.
- Plumbing.
- Electricity.
- Lighting.
- Screws and fasteners.
- Adhesives.
- Safety equipment.
- Gardening.
- Storage.
- Automotive tools.
- Welding equipment.
- Measuring tools.
- Cleaning products.

Catalogue rules:

- Categories support localized name, slug, description, image, icon, parent, display order, SEO metadata, attribute set, and visibility.
- Products can belong to multiple categories but need one primary category for breadcrumbs/SEO.
- Attributes are schema-driven per category, not hardcoded in the frontend.
- Product data supports simple, variant, measured, packaged, temporarily unavailable, and discontinued products.
- Product images require predictable aspect ratios and alt text.
- Product documents include manual, datasheet, warranty, safety sheet, certificate, installation guide.

Listing pages include header, description, subcategories, product count, sorting, filters, active filters, grid/list, pagination or load more, SEO content, related categories, recently viewed, skeletons, empty result, and error states.

Recommended pagination: traditional page pagination for SEO category pages; load-more enhancement after the first server-rendered page.

---

## 10. Search and Filtering Specifications

### Global Filters

- Category/subcategory.
- Brand.
- Price range.
- Availability.
- Promotion.
- Rating.
- New products.
- Best sellers.

### Category-Specific Filters

- Power, voltage, battery type.
- Diameter, length, width, height, weight.
- Material, colour, finish.
- Capacity, volume.
- Usage, indoor/outdoor.
- Packaging quantity.
- Compatibility.
- Protection rating.
- Warranty.
- Product unit.

### Filter Behavior

- Checkbox filters for multi-select values.
- Radio filters for mutually exclusive choices.
- Numeric ranges for price and dimensions.
- Searchable filter options for long lists.
- Colour swatches with text labels.
- Hierarchical category filters.
- Mobile filter drawer with Apply and Reset.
- Active filters above results.
- Reset all returns to base listing.
- Result count updates after changes.
- URL persistence for shareability.
- Unsupported URL filters are ignored.

SEO rules:

- Base category pages indexable.
- Filter combinations noindex by default unless CMS creates approved landing pages.
- Canonical to base category or approved landing URL.

Search behavior:

- Header autocomplete with debounce.
- Full results page integrates filters and sorting.
- Support typo tolerance, synonyms, French/Arabic search, accent-insensitive matching, SKU/reference partial matching, and technical attributes.
- No-results page offers corrected query, categories, popular products, and support.

---

## 11. Pricing and Promotions

Pricing types:

- Public retail price.
- Promotional price.
- Pack price.
- Unit price.
- Tax-inclusive price.
- Tax-exclusive label if needed for legal clarity.
- Price available on request for selected items only if business supports it.

Promotion types:

- Percentage discounts.
- Fixed discounts.
- Product promotions.
- Category promotions.
- Brand promotions.
- Coupon codes.
- Free delivery.
- Bundle promotions.
- Flash sales.
- Date-based campaigns.

Display rules:

- Show current public price clearly.
- Show original price only when a valid discount exists.
- Show VAT label consistently.
- Show unit price for products sold in packs, boxes, litres, kilograms, or metres.
- Show promotion dates and terms where relevant.
- Cart detects price changes and expired promotions before checkout.
- Avoid manipulative countdowns; use remaining time only for genuine time-limited campaigns.

---

## 12. Cart Specifications

Cart content:

- Product image.
- Product title.
- SKU.
- Selected variant.
- Unit.
- Unit price.
- Quantity.
- Quantity step.
- Available stock.
- Line subtotal.
- Discount.
- VAT.
- Delivery estimate.
- Remove.
- Save for later.
- Move to favourites.
- Promotion code.
- Estimated shipping.
- Subtotal, tax, total.
- Checkout and continue-shopping CTAs.

Rules:

- Guest carts persist by anonymous cart ID and local fallback.
- Authenticated carts persist server-side.
- Login merges guest and account carts.
- Duplicate items combine quantities unless max/stock rules block it.
- Out-of-stock items block checkout until removed or saved for later.
- Insufficient quantity shows available quantity and nearest valid quantity.
- Price changes require notice before checkout.
- Product deactivation removes purchase action and offers alternatives.
- Min/max quantities and quantity increments enforced client and server side.
- Delivery and pickup incompatibility must be resolved before checkout.

Mini-cart:

- Opens after add-to-cart or header click.
- Shows latest 3 to 5 items, subtotal, cart/checkout CTAs.
- Displays blocking cart issues.

---

## 13. Checkout Specifications

Recommended steps:

1. Customer information.
2. Delivery or pickup.
3. Address.
4. Payment.
5. Review.
6. Confirmation.

Supported modes:

- Guest checkout if enabled.
- Authenticated checkout.

Fields:

- Email, phone, name.
- Saved addresses.
- Billing address.
- Delivery address.
- Store pickup selection.
- Delivery instructions.
- Coupon.
- Payment method.
- Terms acceptance.

Payment methods are configurable:

- Cash on delivery.
- Card payment.
- Bank transfer.
- Payment in store.

Checkout rules:

- Validate each step before progress.
- Back navigation preserves data.
- Checkout session survives refresh until timeout.
- Idempotency required for order creation.
- Payment redirect supports success, failure, and pending states.
- Retry payment does not create duplicate order.
- Confirmation notifications depend on backend configuration.
- Analytics events fire once per step/order through idempotent tracking.

---

## 14. Account Area Specifications

Account dashboard shows:

- Welcome message.
- Recent orders.
- Current order status.
- Saved addresses.
- Favourites.
- Saved carts.
- Recently viewed products.
- Recommended products.
- Support shortcuts.
- Account completion.

Account rules:

- Each page defines data, actions, empty, loading, error, mobile behavior, and permissions.
- Tables become responsive cards or priority-column tables on mobile.
- Reorder validates active products, price, stock, and quantity rules before cart insertion.
- Sensitive actions such as password change and account deletion require reauthentication where backend supports it.

### Favourites and Saved Lists

Support:

- Guest favourites.
- Authenticated favourites.
- Favourites synchronization after login.
- Saved product lists.
- List naming.
- Add all items to cart.
- Export list if enabled.
- Reorder list.

Rules:

- Removed, discontinued, or restricted products remain visible with current valid actions.
- List-level actions report per-item issues.

### Reviews and Questions

Reviews:

- Star rating, title, content, verified-purchase badge, images if supported, moderation, sorting, filtering, helpful vote, report review, merchant response.

Questions and answers:

- Ask question, merchant response, search questions, helpful vote, moderation, notification when answered.

Rules:

- Pending reviews/questions are visible to submitter only until approved.
- Merchant responses are clearly identified.
- Abuse/report actions require rate limiting and moderation backend.

---

## 15. Delivery and Pickup

Fulfillment modes:

- Home delivery.
- Store pickup.
- Zone-based delivery.
- Product-specific delivery restrictions.
- Heavy or oversized product handling.
- Scheduled delivery if supported.

Display:

- Estimated cost.
- Estimated delivery date.
- Eligible delivery zones.
- Selected store.
- Store opening hours.
- Stock by store.
- Pickup readiness.
- Delivery restrictions.
- Free-delivery thresholds.

Rules:

- Product-specific restrictions override generic delivery options.
- Heavy/oversized products may require special delivery messaging.
- Delivery unavailable messages must explain why and provide recovery: change address, choose pickup, or contact support.
- Store pickup depends on selected store stock or transfer availability.

---

## 16. CMS Requirements

CMS-managed elements:

- Header announcement.
- Navigation.
- Homepage sections.
- Promotional banners.
- Categories.
- Brands.
- Products.
- Product attributes.
- Product documents.
- Landing pages.
- Blog.
- Buying guides.
- FAQs.
- Store locations.
- Delivery content.
- Payment content.
- Legal pages.
- SEO metadata.
- Redirects.
- Footer.
- Contact details.
- Social networks.

Content type standards:

| Type | Required Fields | Optional Fields | Workflow | Localization |
|---|---|---|---|---|
| Page | title, slug, locale, content, status | hero, related content, SEO | draft/published/scheduled | French and Arabic |
| Category | name, slug, parent, status | image, icon, SEO, attributes | draft/published | French and Arabic |
| Product | name, SKU, category, status | media, docs, attributes, SEO | draft/published | Translatable fields |
| Brand | name, slug, logo | description, SEO | draft/published | Description localized |
| Banner | title, media, CTA, placement, dates | audience, priority | scheduled | Localized copy/media |
| Promotion | name, type, eligibility, dates | coupon, terms | scheduled | Localized terms |
| Article/Guide | title, slug, body, author/status | products, categories | draft/published | French and Arabic |
| FAQ | question, answer, category | order | published | French and Arabic |
| Store | name, address, hours, contact | services, map coords | published | Address localized |
| Redirect | source, destination, status | locale | published | Locale-aware |

Preview:

- CMS preview must support draft product/category/page/banner rendering through secure preview tokens.

---

## 17. Authentication

Flows:

- Login.
- Logout.
- Registration.
- Email verification.
- Phone verification if required.
- Password reset.
- Session expiration.
- Protected routes.
- Social login later if introduced.

Security requirements:

- Prefer HTTP-only secure cookies managed by backend.
- Do not store tokens or sensitive account data in local storage.
- Session expiry should preserve non-sensitive intended destination.
- Protected routes should server-check authentication where possible.

---

## 18. Forms and Validation

All forms must define:

- Visible labels.
- Required indicators.
- Helpful placeholders only for examples.
- Help text.
- Validation rules.
- Inline errors.
- Form-level errors.
- Success feedback.
- Loading state.
- Disabled state.
- Keyboard navigation.
- Autocomplete attributes.
- Mobile input type.
- Server-error mapping.
- Unsaved-changes warning for multi-step/profile forms.

Validation examples:

- Email format.
- Phone format.
- Password policy.
- Quantity min/max/step/unit.
- Address required fields.
- File upload type/size/count for returns or support.
- Consent where required.

---

## 19. Global UI States

For every page and component:

- Initial state.
- Loading state.
- Skeleton state.
- Empty state.
- Partial-data state.
- Success state.
- Validation error.
- API error.
- Offline state.
- Permission-denied state.
- Authentication-required state.
- Maintenance state.

Messages should be direct, localized, helpful, and include a recovery action.

---

## 20. Responsive Design

Breakpoints:

- Small mobile: 320-374px.
- Standard mobile: 375-767px.
- Tablet: 768-1023px.
- Laptop: 1024-1279px.
- Desktop: 1280-1535px.
- Large desktop: 1536px+.

Rules:

- No horizontal scrolling.
- Product grid: 2 columns mobile where possible, 3 tablet, 4 laptop, 5 large desktop if readable.
- Category grid: 2 mobile, 3 tablet, 4-6 desktop.
- Account tables become cards, priority-column tables, expandable rows, or mobile-friendly lists.
- Touch targets at least 44x44px.
- Sticky elements must not cover form errors or primary actions.
- Modals become drawers on mobile unless content is small.
- Checkout summary collapses on mobile.
- Product imagery uses stable aspect ratios.

---

## 21. Accessibility

Target: WCAG 2.2 AA.

Requirements:

- Semantic HTML and landmarks.
- Logical heading hierarchy.
- Full keyboard navigation.
- Visible focus indicators.
- Screen-reader labels for icon buttons.
- Accessible forms with labels/errors/help text.
- Error announcements through live regions.
- Accessible modals, drawers, menus, carousels, tables, tabs, and accordions.
- Alternative text for meaningful images.
- Color contrast AA or better.
- Reduced-motion support.
- Touch targets 44px minimum.
- State not conveyed by color alone.
- Language and direction attributes per locale/content block.

---

## 22. SEO

Requirements by page type:

- Homepage: Organization, WebSite, LocalBusiness, localized metadata.
- Categories/subcategories: unique titles/descriptions, Breadcrumb schema, indexable base pages.
- Products: Product schema, Offer schema, availability, brand, SKU, images, reviews if approved.
- Brands: brand metadata and product list.
- Store pages: LocalBusiness schema, address, hours, phone, geo if available.
- Blog/guides: Article schema, author/date, FAQ schema only for actual FAQ content.
- Campaign pages: index only evergreen or active CMS-approved campaigns.

Technical SEO:

- Canonical URLs.
- `hreflang` for French and Arabic, future English.
- Open Graph metadata.
- XML sitemap by locale and entity type.
- Robots directives.
- Redirect management through CMS.
- Crawlable paginated category URLs.
- Filtered URL noindex by default unless approved.
- Out-of-stock pages remain indexable with alternatives if product returns.
- Discontinued pages show alternatives or redirect to replacement/category if approved.
- Search/cart/checkout/account pages noindex.

---

## 23. Performance

Targets:

- LCP: <= 2.5s on product/category/home pages under realistic mobile conditions.
- INP: <= 200ms.
- CLS: <= 0.1.
- TTFB: <= 800ms for cacheable public pages.
- Product listing first meaningful results: <= 1.5s after navigation where cached/search available.
- Autocomplete perceived response: <= 200ms after debounce for common queries.

Strategies:

- Server rendering for public SEO pages.
- Static generation/revalidation for CMS/category content.
- CDN caching for images/CMS.
- API caching for category trees and product summaries.
- Lazy load below-fold sections.
- Stable skeleton dimensions.
- Font optimization with limited weights and `font-display: swap`.
- Third-party scripts audited, deferred, and consent-aware.

---

## 24. Security-Related Frontend Requirements

Security is shared with backend/platform; frontend is not the security boundary.

Requirements:

- Secure authentication handling.
- HTTP-only cookie recommendation.
- CSRF protection support for cookie-auth mutations.
- XSS prevention and sanitized CMS rich text.
- Secure file upload UI for returns/support; backend validation/scanning required.
- Rate-limit error handling.
- Session-expiry handling.
- Route protection with server verification.
- No sensitive data in local storage.
- Secure payment redirection with verified return states.
- Consent management.
- Privacy controls and account deletion flow.

Backend dependencies:

- Authentication, authorization, CSRF, upload scanning, payment validation, rate limiting, audit logging, and data privacy processing.

---

## 25. Analytics and Tracking

Privacy principles:

- Do not send personal data, exact addresses, payment details, or full support messages.
- Include locale, user type, page type, anonymous/session ID, and consent state where appropriate.
- Use event IDs to deduplicate purchase/checkout events.

| Event | Trigger | Required Properties | Page Context | Privacy |
|---|---|---|---|---|
| `homepage_viewed` | Homepage load | locale, sections shown | homepage | no PII |
| `category_viewed` | Category load | category_id, locale | listing | no PII |
| `product_viewed` | PDP load | product_id, sku, category_id | PDP | no PII |
| `search_submitted` | Search submitted | query_normalized, locale, results_count | search | avoid sensitive raw queries if policy requires |
| `search_result_selected` | Result clicked | query_id, result_type, position, product_id | search/autocomplete | no PII |
| `filter_applied` | Filter applied | filter_key, value_count, category_id | listing/search | no PII |
| `sort_changed` | Sort changed | sort_key, page_type | listing | no PII |
| `product_compared` | Compare added | product_id, compare_count | listing/PDP | no PII |
| `product_favourited` | Favourite toggled | product_id, state | listing/PDP | pseudonymous |
| `add_to_cart` | Cart item added | product_id, sku, quantity, unit, source | PDP/listing | no PII |
| `remove_from_cart` | Cart item removed | product_id, quantity | cart | no PII |
| `begin_checkout` | Checkout starts | cart_id, item_count | cart | pseudonymous |
| `checkout_step_completed` | Step valid | step_name, checkout_id | checkout | no field values |
| `delivery_method_selected` | Delivery choice | method_id, zone_id | cart/checkout | no exact address |
| `payment_method_selected` | Payment choice | method_id/type | checkout | no card data |
| `purchase_completed` | Order success | order_id, item_count, currency | confirmation | follow finance/privacy policy |
| `purchase_failed` | Failure | reason_code, payment_method | failure | no sensitive gateway details |
| `login_completed` | Auth success | method | auth | no credentials |
| `registration_completed` | Registration success | account_type | auth | no PII |
| `whatsapp_clicked` | WhatsApp CTA | source, page_type | global | no message body |
| `contact_form_submitted` | Contact submit | category, locale | contact | no message body |
| `store_selected` | Store chosen | store_id, source | store/product/checkout | no exact geolocation unless consent |

---

## 26. API and Data Requirements

Suggested contracts:

| Domain | Purpose | Method/Endpoint | Request | Response | Auth | Cache | Errors |
|---|---|---|---|---|---|---|---|
| Products | Product detail | `GET /commerce/products/{id}` | locale, preview token optional | Product | public | CDN/revalidate | 404, unavailable |
| Products | Batch cards | `POST /commerce/products/batch` | ids, locale | Product summaries | public | short | missing IDs |
| Categories | Tree/navigation | `GET /commerce/categories/tree` | locale | Category tree | public | long/revalidate | empty |
| Brands | Brand data | `GET /commerce/brands/{slug}` | locale | Brand + counts | public | medium | 404 |
| Search | Product search | `GET /search/products` | q, filters, sort, page, locale | hits, facets, total | public | short | service unavailable |
| Search | Suggestions | `GET /search/suggestions` | q, locale | queries/products/categories/brands | public | short | timeout |
| Pricing | Batch pricing | `POST /pricing/batch` | product/variant IDs, quantities | Price models | public | short | unavailable |
| Stock | Batch stock | `POST /stock/batch` | product/variant IDs, store/zone | stock statuses | public | short | unknown |
| Cart | Get cart | `GET /cart` | cart ID/session | Cart | owner/guest | no-store | expired |
| Cart | Mutate cart | `POST/PATCH/DELETE /cart/items` | item, qty | Cart | owner/guest | no-store | stock/price/min |
| Checkout | Session | `POST/PATCH /checkout/session` | cart, customer, fulfillment | Checkout session | owner/guest | no-store | invalid step |
| Payments | Methods/init | `GET /payments/methods`, `POST /payments/initiate` | checkout/order | methods/redirect | owner/guest | no-store | failed/pending |
| Orders | Create/view | `POST /orders`, `GET /orders/{id}` | checkout/idempotency | Order | owner/guest token | no-store | duplicate/not found |
| Accounts | Profile | `GET/PATCH /account/profile` | profile | Customer | auth | no-store | validation |
| Addresses | Address CRUD | `/account/addresses` | address | Address list | auth | no-store | validation |
| Reviews | Reviews/Q&A | `/products/{id}/reviews` | review | Review list/status | mixed | medium | moderation |
| Favourites | Save products | `/favourites` | product ID | list | auth/guest sync | no-store | unavailable |
| Comparison | Compare | `/compare` | product IDs | compare data | public/auth save | short | limit |
| CMS | Pages/banners | `/cms/pages`, `/cms/homepage` | locale, slug | content | public/preview | CDN | not found |
| Stores | Stores | `/stores` | locale, location | stores | public | medium | map unavailable |
| Delivery | Methods/estimate | `/delivery/methods`, `/delivery/estimate` | cart/address/store | methods/cost/date | public | short | unavailable |
| Promotions | Active/coupon | `/promotions`, `/cart/coupons` | code/cart | promotion/cart | public | short/no-store | invalid/expired |

Frontend data per page:

- Homepage: CMS layout, category tree, product collections, promotions, brands, guides/articles.
- Listing/search: category/search metadata, facets, products, pricing, stock.
- Product: full product, variants, price, stock, delivery, docs, related products, reviews/Q&A.
- Cart/checkout: cart, user/customer, fulfillment, payment, order totals.
- Account: authenticated user, permissions, page-specific records.
- CMS pages: localized content blocks, SEO, related links.

---

## 27. Data Models

These TypeScript-style interfaces are specification models, not final implementation code.

```ts
type Locale = "fr" | "ar" | "en";
type Currency = "TND";
type UserType = "visitor" | "customer" | "content_admin";
type ProductStatus = "active" | "temporarily_unavailable" | "discontinued" | "draft";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "backorder" | "unknown";

interface LocalizedText {
  fr?: string;
  ar?: string;
  en?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  alt?: LocalizedText;
  width?: number;
  height?: number;
  mimeType?: string;
}

interface SEOFields {
  title?: LocalizedText;
  description?: LocalizedText;
  canonicalUrl?: string;
  ogImage?: MediaAsset;
  noindex?: boolean;
}

interface ProductUnit {
  code: "unit" | "metre" | "litre" | "kilogram" | "pack" | "box";
  label: LocalizedText;
  precision?: number;
}

interface ProductAttribute {
  code: string;
  label: LocalizedText;
  value: string | number | boolean | string[];
  unit?: string;
  filterable: boolean;
  comparable: boolean;
  displayGroup?: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  name?: LocalizedText;
  options: Record<string, string>;
  attributes?: ProductAttribute[];
  images?: MediaAsset[];
  unit?: ProductUnit;
  minOrderQuantity?: number;
  quantityStep?: number;
}

interface Category {
  id: string;
  parentId?: string;
  slug: LocalizedText;
  name: LocalizedText;
  description?: LocalizedText;
  image?: MediaAsset;
  icon?: string;
  attributeSetId?: string;
  seo?: SEOFields;
  children?: Category[];
}

interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: MediaAsset;
  description?: LocalizedText;
  seo?: SEOFields;
}

interface Product {
  id: string;
  sku: string;
  slug: LocalizedText;
  name: LocalizedText;
  brand?: Brand;
  primaryCategory: Category;
  categories: Category[];
  status: ProductStatus;
  productType: "simple" | "variant" | "measurement" | "package";
  badges: string[];
  shortDescription?: LocalizedText;
  description?: LocalizedText;
  images: MediaAsset[];
  videos?: MediaAsset[];
  variants?: ProductVariant[];
  attributes: ProductAttribute[];
  unit: ProductUnit;
  minOrderQuantity?: number;
  quantityStep?: number;
  seo?: SEOFields;
}

interface Price {
  productId: string;
  variantId?: string;
  currency: Currency;
  listPrice?: number;
  salePrice?: number;
  unitPrice?: number;
  taxIncluded: boolean;
  vatRate?: number;
  validUntil?: string;
}

interface Stock {
  productId: string;
  variantId?: string;
  status: StockStatus;
  availableQuantity?: number;
  storeAvailability?: StoreStock[];
  deliveryEstimate?: DeliveryEstimate;
}

interface StoreStock {
  storeId: string;
  status: StockStatus;
  availableQuantity?: number;
  pickupReadyAt?: string;
}

interface DeliveryEstimate {
  methodId: string;
  cost?: number;
  estimatedDate?: string;
  message?: LocalizedText;
}

interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  currency: Currency;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingEstimate?: number;
  total: number;
  issues?: CartIssue[];
}

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: LocalizedText;
  image?: MediaAsset;
  unit: ProductUnit;
  quantity: number;
  unitPrice?: number;
  lineSubtotal?: number;
  notes?: string;
}

interface CartIssue {
  code: "out_of_stock" | "insufficient_stock" | "price_changed" | "product_inactive" | "minimum_quantity" | "delivery_incompatible";
  itemId?: string;
  message: LocalizedText;
  blocking: boolean;
}

interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  addresses: Address[];
  preferences?: CommunicationPreferences;
}

interface Address {
  id: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
  phone?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

interface CommunicationPreferences {
  emailMarketing?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
  language: Locale;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  currency: Currency;
  totals: OrderTotals;
  deliveryMethod?: DeliveryMethod;
  shippingAddress?: Address;
  billingAddress?: Address;
  documents?: DocumentLink[];
  createdAt: string;
}

interface OrderItem {
  productId: string;
  variantId?: string;
  sku: string;
  name: LocalizedText;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  taxTotal?: number;
  lineTotal: number;
}

interface OrderTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

interface Payment {
  id: string;
  methodId: string;
  status: "pending" | "authorized" | "paid" | "failed" | "cancelled" | "refunded";
  amount: number;
  currency: Currency;
  redirectUrl?: string;
}

interface DeliveryMethod {
  id: string;
  name: LocalizedText;
  type: "home_delivery" | "store_pickup";
  cost?: number;
  estimatedDate?: string;
  restrictions?: string[];
}

interface Store {
  id: string;
  slug: string;
  name: LocalizedText;
  address: Address;
  phone?: string;
  whatsapp?: string;
  hours: StoreHours[];
  coordinates?: { lat: number; lng: number };
  services?: string[];
}

interface StoreHours {
  dayOfWeek: number;
  opensAt?: string;
  closesAt?: string;
  closed?: boolean;
}

interface Promotion {
  id: string;
  name: LocalizedText;
  type: "percentage" | "fixed" | "product" | "category" | "brand" | "coupon" | "free_delivery" | "bundle" | "flash";
  startsAt: string;
  endsAt?: string;
  eligibility: string[];
  terms?: LocalizedText;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  title?: string;
  content: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ProductList {
  id: string;
  ownerId: string;
  name: string;
  items: CartItem[];
  shared: boolean;
}

interface CMSPage {
  id: string;
  slug: LocalizedText;
  title: LocalizedText;
  blocks: CMSBlock[];
  status: "draft" | "published" | "scheduled";
  seo?: SEOFields;
}

interface CMSBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface Banner {
  id: string;
  title: LocalizedText;
  image: MediaAsset;
  cta?: Link;
  placement: string;
  startsAt?: string;
  endsAt?: string;
  audience?: UserType[];
}

interface Link {
  label: LocalizedText;
  href: string;
  target?: "_self" | "_blank";
}

interface SearchResult {
  type: "product" | "category" | "brand" | "article";
  id: string;
  title: LocalizedText | string;
  url: string;
  image?: MediaAsset;
  score?: number;
  highlights?: Record<string, string>;
}
```

---

## 28. QA Acceptance Criteria

### Homepage

Given active CMS sections exist, when the homepage loads, then sections render in configured order with localized copy and no blank empty sections.  
Given the viewport is mobile, when the user scrolls, then header/bottom navigation remain usable and content has no horizontal overflow.

### Product Listing

Given a category-specific attribute set exists, when the category page loads, then relevant filters appear and update the result count.  
Given an invalid filter is in the URL, when the page loads, then it is ignored without breaking results.

### Search

Given a user searches `clé 13`, when matching products exist, then accent-insensitive results appear.  
Given no results are found, when the page loads, then suggestions, popular searches, and support actions appear.

### Product Details

Given a product has variants, when no variant is selected, then purchasing actions request variant selection.  
Given a product is discontinued, when the user views it, then add-to-cart is unavailable and alternatives appear.

### Cart

Given stock is insufficient, when the cart validates, then checkout is blocked with a message and correction action.  
Given a guest logs in, when carts merge, then duplicates are combined or conflicts shown.

### Checkout

Given checkout session expires, when user attempts next step, then they see session expired and can restart without duplicate order.  
Given payment fails, when redirected back, then retry/change payment options appear.

### Login and Registration

Given invalid credentials, when login fails, then a generic secure error appears.  
Given registration succeeds, when the user verifies email if required, then account access is enabled.

### Customer Orders

Given a customer opens order details, when authorized, then order status, products, totals, documents, and support actions display.  
Given invoice is unavailable, when download is clicked, then a clear unavailable state appears.

### Responsive

Given viewport is 320px wide, when any main page loads, then no horizontal scroll exists and touch targets remain usable.

### Arabic RTL

Given Arabic locale, when the user navigates catalogue, then layout direction mirrors and SKUs/technical units remain readable.

### Accessibility

Given keyboard-only navigation, when using menus, filters, modals, and checkout, then all controls are reachable and focus is visible.

### Error Handling

Given commerce API fails, when a public page loads, then user sees retry/support/category fallback without broken layout.

---

## 29. MVP Scope

### Must Have

- Homepage.
- Categories.
- Product catalogue.
- Search.
- Filters and sorting.
- Product details.
- Product cards with price/stock/action states.
- Cart and mini-cart.
- Checkout with configurable delivery/pickup and payment methods.
- Customer authentication.
- Customer account.
- Orders and order tracking.
- Delivery or pickup.
- CMS-driven pages.
- French and Arabic.
- SEO foundations.
- Analytics foundations.
- Core accessibility and responsive behavior.

### Should Have

- Saved favourites with guest sync.
- Saved carts.
- Basic product comparison.
- Store selector and stock by selected store.
- Buying guides and blog.
- Invoice download.
- Reorder.

### Could Have

- Reviews.
- Product Q&A.
- Saved product lists.
- WhatsApp prefilled product/cart message.
- Advanced recommendations.

### Not Included in MVP

- Marketplace seller functionality.
- Loyalty programme.
- Mobile application.
- AI shopping assistant.
- Product subscriptions.
- Live chat beyond WhatsApp/contact.
- Advanced delivery scheduling.

---

## 30. Phase-Two Functionality

| Feature | Value | Complexity | Notes |
|---|---|---|---|
| Product comparison | Helps technical product decisions | Medium | Needs normalized attributes |
| Reviews | Trust and SEO | Medium | Requires moderation |
| Q&A | Reduces support load | Medium | Requires merchant workflow |
| Advanced Meilisearch tuning | Better discovery | Medium | Synonyms, ranking, analytics tuning |
| Loyalty programme | Retention | High | Requires rules/accounting |
| Product subscriptions | Repeat purchasing | High | Operational complexity |
| Mobile application | Retention/channel | High | Defer until web usage validates |
| Personalized recommendations | Higher average order value | Medium-high | Needs data volume/privacy |
| AI shopping assistant | Discovery/support differentiation | High | Needs guardrails and product data quality |
| Live chat | Conversion/support | Medium | Staffing/tool dependency |
| Advanced delivery scheduling | Better logistics experience | High | Operations/backend dependency |
| Marketplace capabilities | Assortment expansion | Very high | Changes business and operations model |

---

## 31. Open Decisions and Assumptions

### Assumptions

- French and Arabic launch together.
- TND is the default display currency.
- Public retail prices are generally visible.
- CMS owns content and merchandising.
- Commerce backend owns transactional data.
- Guest checkout availability is a business decision.
- Store pickup is supported but exact store count/stock granularity is not yet confirmed.

### Decisions Requiring Business Validation

- Final brand colors, typography, and logo assets.
- Whether guest checkout is enabled.
- Which payment methods launch in MVP.
- VAT label strategy.
- Free-delivery thresholds and delivery zones.
- Return windows and warranty rules.
- Review/Q&A moderation policy.
- Coupon stacking rules.
- Product comparison MVP inclusion.
- Whether WhatsApp support is global or category/order-specific.

### Risks and Dependencies

- Product data quality is critical for search, filters, comparison, SEO, and Arabic localization.
- Attribute schemas must be governed; uncontrolled attributes weaken filters and comparison.
- Delivery/stock promises depend on accurate inventory and logistics APIs.
- Payment methods and pending states need early integration testing.
- RTL must be considered from design system start.
- CMS preview/localization workflows need definition before content production begins.

---

## 32. Design Direction and Tokens

Identity goals: trust, expertise, reliability, simplicity, product availability, modern commerce.

Avoid:

- Generic SaaS dashboard appearance.
- Overcrowded marketplace density.
- Outdated catalogue styling.
- Excessive cards/shadows.

Use:

- Clear typography.
- Strong product imagery.
- Consistent spacing.
- Visible prices.
- Clear stock information.
- Simple CTAs.
- Accessible contrast.
- Subtle borders.
- Limited shadows.
- Consistent icons.

Proposed placeholder tokens:

| Token | Value | Use |
|---|---|---|
| Primary | `#0F766E` | Main actions, links, active states |
| Secondary | `#1F2937` | Header/footer, strong text |
| Accent | `#F59E0B` | Promotions, selected highlights |
| Success | `#15803D` | In-stock/success |
| Warning | `#B45309` | Low stock/warnings |
| Error | `#B91C1C` | Errors/destructive |
| Neutral 50-950 | Tailwind slate/zinc-like scale | Text, borders, surfaces |
| Font | Inter or equivalent Latin plus Noto Sans Arabic | Multilingual UI |
| Radius | 4px controls, 6-8px cards | Practical commerce feel |
| Shadow | Minimal, only overlays/sticky surfaces | Avoid visual clutter |
| Containers | 1200px default, 1440px commerce grids | Responsive commerce |
| Spacing | 4px base scale | Consistency |

Typography:

- H1 public pages: 32-44px desktop, 26-32px mobile.
- H2 sections: 24-32px desktop, 22-26px mobile.
- Body: 16px.
- Compact operational text: 14px minimum.
- Do not scale font size with viewport width.
- Letter spacing: 0.

---

## 33. Arabic and French Localization

Requirements:

- French LTR and Arabic RTL layout.
- Localized navigation, products, categories, CMS pages, metadata.
- Correct number, currency, and date formatting.
- Search in both languages.
- Architecture ready for English.

RTL rules:

- Page direction set with `dir="rtl"` for Arabic.
- Layout order mirrors: navigation, breadcrumbs, drawers, arrows, steppers, pagination.
- Directional icons mirror when direction conveys movement.
- Non-directional icons do not mirror.
- SKU, product references, phone numbers, dimensions, and technical units remain readable with explicit LTR spans where needed.
- Forms mirror, but email/password/reference fields can remain LTR input direction.

---

## 34. Final Deliverables

1. Complete B2C page inventory.
2. Sitemap.
3. Navigation hierarchy.
4. Customer journey map.
5. Page specifications.
6. Component inventory.
7. Frontend data models.
8. Suggested API contracts.
9. Analytics plan.
10. SEO checklist.
11. Accessibility checklist.
12. Responsive checklist.
13. MVP feature matrix.
14. Phase-two roadmap.
15. Open questions.
16. Risks and dependencies.
