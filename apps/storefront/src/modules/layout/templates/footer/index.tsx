import { Text } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function Footer() {
  const categories = [
    "Produce",
    "Livestock",
    "Seeds",
    "Fertilizer",
    "Equipment",
    "Services",
  ];
  const marketplaceLinks = [
    ["Browse listings", "/store"],
    ["Post a listing", "/account/listings"],
    ["Seller profile", "/account/seller-profile"],
    ["Saved listings", "/account/saved"],
    ["Inquiries", "/account/inquiries"],
  ];

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 xsmall:flex-row items-start justify-between py-16 small:py-24">
          <div className="max-w-sm">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-[#ff385c] hover:text-[#e83152]"
            >
              Farm Marketplace
            </LocalizedClientLink>
            <p className="mt-3 text-small-regular text-ui-fg-subtle">
              Agriculture listings for buyers, farmers, and suppliers. Contact
              sellers directly to arrange availability, pickup, delivery, and
              payment.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                Listing categories
              </span>
              <ul
                className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small"
                data-testid="footer-categories"
              >
                {categories.map((category) => (
                  <li key={category}>
                    <LocalizedClientLink
                      className="hover:text-ui-fg-base"
                      href={`/store?category=${encodeURIComponent(category)}`}
                      data-testid="category-link"
                    >
                      {category}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Marketplace</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                {marketplaceLinks.map(([label, href]) => (
                  <li key={href}>
                    <LocalizedClientLink
                      className="hover:text-ui-fg-base"
                      href={href}
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">How it works</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>Browse active listings</li>
                <li>Save searches and listings</li>
                <li>Send inquiries to sellers</li>
                <li>Arrange next steps privately</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Farm Marketplace. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
}
