# Marketplace Conversion Backlog

This app should behave first as an agriculture marketplace/classifieds platform.
Checkout, cart, shipping, payment, and order flows are legacy ecommerce surfaces
unless a future product decision brings in-platform transactions back.

## Product Decision

- Current direction: inquiry/contact-first classifieds marketplace.
- Buyers browse, save, and contact sellers.
- Sellers create listings, manage seller profile details, and respond to inquiries.
- Admins moderate listings, sellers, and marketplace activity.

## Priority 1 - Marketplace Shell

- Make public navigation marketplace-first: browse listings, post listing, inquiries, saved listings, seller profile.
- Make account navigation a buyer/seller workspace instead of a generic ecommerce account.
- De-emphasize addresses, orders, cart, checkout, shipping, payment, and transfer flows in visible navigation.
- Keep legacy commerce routes in code for now, but stop presenting them as core product paths.

## Priority 2 - Core Marketplace Flows

- Seller onboarding: guide users from account creation to seller profile to first listing.
- Listing creation/editing: keep category-specific fields visible and easy to scan.
- Listing lifecycle: pending review, active, rejected, sold, expired.
- Buyer inquiry flow: send inquiry from listing page, see buyer-side inquiry history, seller replies/status handling.
- Saved marketplace activity: saved listings and saved searches.

## Priority 3 - Marketplace Discovery

- Improve browse page filters for category, location, availability, condition, and listing text.
- Make seller profile pages useful as marketplace storefronts.
- Add stronger empty states for no listings, no seller profile, no inquiries, and no saved searches.
- Make search and quick filters consistent across homepage and browse page.

## Priority 4 - Admin Operations

- Marketplace dashboard: show listings, sellers, inquiries, saved activity, and attention queues.
- Listing moderation: review status, notes, audit metadata, seller context.
- Seller management: verification, suspension, contact details, activity.
- Inquiry management: new/read/replied/archived states and response-rate signals.

## Priority 5 - Legacy Ecommerce Isolation

- Hide cart and checkout entry points from marketplace-first navigation.
- Audit product detail templates for purchase-first assumptions.
- Rename ecommerce copy that conflicts with classifieds behavior.
- Decide whether to delete, feature-flag, or keep legacy commerce code for future mixed marketplace support.

## Priority 6 - Hardening

- Add route tests around listing ownership, moderation visibility, saved listings, saved searches, and inquiries.
- Add UI regression checks for marketplace shell pages.
- Add permission/authorization tests for seller-owned resources.
- Add migration and seed coverage for marketplace demo data.

## First Implementation Slice

Start with the marketplace shell:

- Reframe account navigation around marketplace tasks.
- Keep account settings available, but secondary.
- Avoid deeper moderation/audit polish until the main buyer/seller/admin surfaces feel coherent.
