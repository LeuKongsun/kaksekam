# Admin Extension UI Model

Use the Marketplace admin page as the reference model for custom admin extension pages.

## Preferred Shape

- One primary table section per page.
- Section header contains the page title, a short count/status summary, and only page-specific actions.
- Avoid separate dashboard, command center, metric card, or operations-summary sections unless the user explicitly asks for analytics.
- Do not duplicate side navigation links in the page header.
- Keep header actions minimal. Prefer one clear action plus icon-only utility controls.

## Filters

- Match the Medusa Products page feel.
- Use a compact toolbar row above the table.
- Do not show large visible labels above every filter.
- Use `aria-label` for accessibility when labels are visually omitted.
- Keep filter controls `h-8`, compact text, and restrained widths.
- Put broad filters on the left and search on the right when there is room.
- Use simple placeholders like `Search`.

## Table Actions

- Prefer icon-only row actions for obvious utilities, with tooltip and `aria-label`.
- Avoid redundant row actions that duplicate nearby workflows or side navigation.
- Keep row actions right-aligned and quiet.
- Use text buttons only when the action needs extra clarity, such as review/approve/reject workflows.
- Keep table cells to one line where possible.
- Move verbose row data into a `Details` action/modal instead of stacking multiple lines inside cells.

## Current Marketplace Decisions

- Marketplace is the single listing management page.
- Listing moderation is merged into Marketplace because both pages listed the same records and only differed by row actions.
- Row data should stay compact; listing details, seller contact, moderation notes, and extra listing fields belong in the details modal.
- Removed `Admin product`, `Storefront`, `Moderation queue`, and `Create test listing` from the Marketplace page because they were redundant or crossed into another workflow.
- Listing creation should be tested from the storefront account flow on port `8000`, not from admin.
- Marketplace owns review actions like approve/reject.
- Seller verification belongs on Marketplace sellers only, not in Marketplace listing actions.

## Pages Polished With This Model

- Marketplace
- Marketplace sellers
- Marketplace inquiries
