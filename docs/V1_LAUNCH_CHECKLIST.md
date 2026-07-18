# V1 Launch Checklist

Use this checklist before the first official launch of the agriculture marketplace.
The v1 product is inquiry-first classifieds: buyers browse listings and contact
sellers directly. Cart, checkout, shipping, payment, and orders are legacy
commerce surfaces and should not be presented as core user paths.

## Product Scope

- Launch label: agriculture marketplace platform / farming classifieds MVP.
- Transaction model: inquiry/contact-first, no in-platform checkout.
- Primary users: farmers and suppliers posting listings; buyers browsing,
  saving, and contacting sellers.
- Admin role: review listings, seller activity, and marketplace inquiries.

## Buyer Flow

- Homepage loads with search/filter controls and category shortcuts.
- Category, location, condition, and sort filters return relevant active
  listings.
- Listing detail pages show category, location, condition, quantity, price or
  contact-for-price, description, seller profile, and safety guidance.
- Buyers can send an inquiry from the listing detail modal.
- Buyers can save listings when signed in.
- Buyer inquiry history is available under account messages.

## Seller Flow

- A signed-in user can reach the seller workspace from Sell / Account.
- Seller profile has display name, handle, contact details, location, bio, and
  optional avatar/logo.
- Seller can create a listing with title, description, category, price,
  location, quantity, condition, and photos.
- New or edited listings enter the expected review state before public display.
- Seller can view listing status, edit eligible listings, mark active listings
  sold, and respond to buyer inquiries.

## Admin And Moderation

- Admin marketplace pages load without errors.
- Pending listings can be approved or rejected with moderation notes.
- Rejected listings remain hidden from public browse/search.
- Suspended sellers should not create public trust confusion.
- Seller verification status is visible where it affects buyer trust.

## Legacy Commerce Isolation

- Public navigation does not show cart or checkout entry points.
- `/cart`, `/checkout`, order confirmation, order details, and order transfer
  routes redirect away from purchase flows.
- Product/detail pages use contact/inquiry language rather than buy/cart
  language.
- Account navigation emphasizes listings, messages, saved listings, and seller
  profile.

## Production Readiness

- Backend migrations have run successfully in the production database.
- Required environment variables are configured for both backend and storefront.
- Storefront can reach the backend store API from the deployed environment.
- Image uploads and image serving work in production.
- Email/contact settings are configured if inquiry notifications are enabled.
- Seed or create realistic initial categories, locations, sellers, and listings.
- Disable demo/mock listings if real listings should be the only public content.
- Run local typecheck/build before deploy.

## Manual Smoke Test

1. Open the homepage as a guest.
2. Filter by one category and confirm only matching active listings show.
3. Open a listing and submit a buyer inquiry.
4. Sign in as the seller and confirm the inquiry appears.
5. Reply to the inquiry as the seller.
6. Sign in as the buyer and confirm the reply appears.
7. Create a seller listing and confirm its moderation status.
8. Approve the listing in admin and confirm it appears publicly.
9. Visit `/cart` and `/checkout`; both should redirect to marketplace browsing.
10. Check mobile navigation and homepage category shortcuts.

## Not Required For V1

- In-platform checkout.
- Shipping methods.
- Payment collection.
- Order fulfillment.
- Order transfer.
- Fully automated seller verification.
- Full marketplace analytics.
