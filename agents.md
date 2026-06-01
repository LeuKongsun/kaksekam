# Agent Guide

## What This Repo Is Now

This repository started as the Medusa DTC starter, but the intended direction is now an agriculture marketplace platform.

Product north star:

- A farming-products marketplace where farmers can list what they produce or supply.
- Buyers can browse, search, save, and contact sellers for products related to farming.
- The model is closer to Khmer24/Gumtree-style classifieds and vertical marketplaces like Carsales than to a normal ecommerce storefront.
- The first version should be inquiry/contact-first, not checkout-first.

Current shape:

- Backend has a custom `marketplace` module with `listing`, `seller`, and `saved-listing` models.
- Storefront has seller listing creation/editing, saved listings, and moderation-facing flows.
- Backend exposes marketplace-specific store and admin routes.
- The codebase still contains the original DTC storefront concepts: cart, checkout, shipping, payment, orders, and order transfer.

Practical stage label:

- Marketplace platform MVP / classifieds website / two-sided marketplace in progress.
- Not yet a finished multi-vendor platform.
- DTC purchase flow assumptions still exist and should be treated as legacy.

Preferred label: agriculture marketplace platform.

Also valid: farming marketplace, agricultural classifieds, two-sided marketplace.

If you want a simple name for the product type, this is closest to a farming classifieds or agricultural listing marketplace with moderation.

## Working Definition

Use this repository as a platform where users can:

- Farmers create listings for farming products, produce, livestock, supplies, equipment, or agriculture-related services
- Buyers browse, search, filter, and save listings
- Buyers contact farmers or sellers directly
- Review moderation status
- Manage seller-facing listing records

Treat checkout, payment, shipping, and order fulfillment as legacy ecommerce features unless a task explicitly says otherwise.

## Near-Term Plan

1. Decide the transaction model.
   - Pure classifieds with no checkout.
   - In-platform checkout for some categories.
   - Inquiry/contact-only listings.

2. Classify the current surfaces.
   - Keep: marketplace module, seller listings, saved listings, moderation routes.
   - Remove or isolate: cart, checkout, shipping, payment, order completion, order transfer.
   - Replace: ecommerce wording, buyer-first navigation, purchase-first assumptions in copy and templates.

3. Strengthen marketplace flows.
   - Listing lifecycle
   - Seller profile and ownership
   - Farming product categories and category-specific fields
   - Location and availability/seasonality
   - Buyer inquiry/contact flow
   - Moderation queue and review notes
   - Saved/favorited listings

4. Clean up naming and documentation.
   - Replace ecommerce-only language where it confuses the marketplace model.
   - Document what is supported today versus what is planned.

5. Add tests around the marketplace paths.
   - Listing creation and editing
   - Moderation gating
   - Saved listings
   - Seller listing visibility

## Migration Map

### Keep

- `apps/backend/src/modules/marketplace`
- `apps/backend/src/api/middlewares.ts` marketplace routes
- `apps/storefront/src/modules/account/components/seller-listings`
- `apps/storefront/src/modules/account/components/seller-listing-form`
- `apps/storefront/src/modules/account/components/saved-listings`

### Remove Or Isolate

- `cart`
- `checkout`
- `shipping`
- `payment`
- order completion and transfer screens

### Replace

- product-store language with listing-marketplace language
- storefront CTA copy that assumes purchase flow
- any account pages that frame users only as buyers instead of sellers and buyers

## Execution Order

1. Lock the product decision: classifieds only or mixed marketplace.
2. Hide or disable legacy DTC routes in the UI.
3. Simplify backend and middleware around marketplace flows.
4. Rename and document the user-facing model.
5. Add tests after each major slice, not only at the end.

## Agent Rules

- Start from the nearest concrete file or route for the task.
- Prefer marketplace terminology when changing user-facing text.
- Do not remove checkout or payment code unless the task is specifically about decommissioning DTC flows.
- Preserve existing Medusa patterns unless a marketplace-specific abstraction is clearly better.
- When in doubt, treat the current system as a marketplace platform with legacy ecommerce remnants.

## Notes For Future Work

- The repo is best described as a marketplace/classifieds MVP rather than a fully generalized marketplace engine.
- The core decision still pending is whether buyers transact inside the platform or only contact sellers off-platform.
