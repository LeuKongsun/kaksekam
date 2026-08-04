"use client"

import { trackContactClick, type ContactChannel } from "@lib/data/contact-events"
import type {
  ProductSeller,
  StoreProductWithListing,
} from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import ListingReportButton from "@modules/products/components/listing-report-button"
import { isEqual } from "lodash"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: StoreProductWithListing
  region: HttpTypes.StoreRegion
  seller?: ProductSeller | null
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"],
) => {
  return (
    variantOptions?.reduce((acc: Record<string, string>, varopt) => {
      if (varopt.option_id) acc[varopt.option_id] = varopt.value
      return acc
    }, {}) ?? {}
  )
}

import { useTranslation } from "@lib/i18n/context"

export default function ProductActions({
  product,
  region,
  seller,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  const sellerPhoneHref = seller?.phone
    ? `tel:${seller.phone.replace(/[^\d+]/g, "")}`
    : undefined
  const telegramHref = seller?.telegram
    ? `https://t.me/${seller.telegram.replace(/^@/, "")}`
    : undefined
  const messengerHref = seller?.facebook_url ?? undefined
  const contactOptions = [
    telegramHref
      ? {
          channel: "telegram" as const,
          href: telegramHref,
          label: t.product.telegram,
          icon: <TelegramIcon />,
        }
      : null,
    messengerHref
      ? {
          channel: "messenger" as const,
          href: messengerHref,
          label: t.product.messenger,
          icon: <MessengerIcon />,
        }
      : null,
    sellerPhoneHref
      ? {
          channel: "phone" as const,
          href: sellerPhoneHref,
          label: t.product.call,
          icon: <PhoneIcon />,
        }
      : null,
  ].filter(Boolean) as {
    channel: ContactChannel
    href: string
    label: string
    icon: React.ReactNode
  }[]
  const preferredChannel =
    product.listing?.contact_preference ?? seller?.preferred_contact
  const sortedContactOptions = [...contactOptions].sort((left, right) =>
    left.channel === preferredChannel
      ? -1
      : right.channel === preferredChannel
        ? 1
        : 0
  )
  const canContact = !disabled && Boolean(product.listing?.id)
  const sellerImage = seller?.avatar_url ?? product.thumbnail
  return (
    <div className="flex flex-col gap-y-4 rounded-md border border-gray-200 bg-white p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base-semi">{t.product.contactFarmer}</div>
              <p className="mt-1 text-small-regular text-ui-fg-subtle">
                {t.product.arrangeDetails}
              </p>
            </div>
          </div>
        </div>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        {seller && (
          <div className="rounded-md bg-gray-50 p-4 text-small-regular">
            <div className="flex min-w-0 items-center gap-3">
              <LocalizedClientLink
                href={`/sellers/${seller.handle}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ui-fg-base text-small-semi text-white"
              >
                {sellerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sellerImage}
                    alt={seller.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  seller.display_name.slice(0, 1).toUpperCase()
                )}
              </LocalizedClientLink>
              <div className="min-w-0">
                <LocalizedClientLink
                  href={`/sellers/${seller.handle}`}
                  className="inline-flex max-w-full items-center gap-x-2 font-medium text-ui-fg-base hover:text-ui-fg-interactive"
                >
                  <span className="truncate">{seller.display_name}</span>
                  {seller.verification_status === "verified" && (
                    <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xsmall-semi uppercase text-green-700">
                      {t.common.verified}
                    </span>
                  )}
                </LocalizedClientLink>
                {seller.verification_status === "verified" && (
                  <p className="mt-1 text-xsmall-regular text-ui-fg-muted">
                    {t.product.verifiedHelp}
                  </p>
                )}
                {seller.location && (
                  <div className="mt-1 truncate text-ui-fg-subtle">
                    {seller.location}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xsmall-regular text-ui-fg-muted">
                  {seller.active_listing_count != null && (
                    <span>
                      {seller.active_listing_count} {t.product.activeListings}
                    </span>
                  )}
                  {seller.created_at && (
                    <span>
                      {t.product.memberSince}{" "}
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        year: "numeric",
                      }).format(new Date(seller.created_at))}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {seller.bio && (
              <p className="mt-3 line-clamp-3 whitespace-pre-line text-ui-fg-subtle">
                {seller.bio}
              </p>
            )}
            {(seller.telegram || seller.facebook_url || seller.phone) && (
              <div className="mt-3 flex flex-col gap-2 text-ui-fg-subtle">
                {seller.telegram && (
                  <a
                    href={telegramHref}
                    className="inline-flex min-w-0 items-center gap-2 hover:text-ui-fg-base"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <TelegramIcon />
                    <span className="truncate">@{seller.telegram}</span>
                  </a>
                )}
                {seller.facebook_url && (
                  <a
                    href={messengerHref}
                    className="inline-flex min-w-0 items-center gap-2 hover:text-ui-fg-base"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessengerIcon />
                    <span className="truncate">{t.product.messenger}</span>
                  </a>
                )}
                {seller.phone && (
                  <a
                    href={sellerPhoneHref}
                    className="inline-flex min-w-0 items-center gap-2 hover:text-ui-fg-base"
                  >
                    <PhoneIcon />
                    <span className="truncate">{seller.phone}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {sortedContactOptions.length ? (
          <div className="grid grid-cols-1 gap-2 small:grid-cols-2">
            {sortedContactOptions.map((option, index) => (
              <a
                key={option.channel}
                href={canContact ? option.href : undefined}
                aria-disabled={!canContact}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 ${
                  index === 0
                    ? "bg-[#273b2e] text-white hover:bg-[#1d2d23]"
                    : "border border-gray-300 bg-white text-ui-fg-base hover:bg-gray-50"
                }`}
                data-testid={`contact-seller-${option.channel}`}
                rel={option.channel === "phone" ? undefined : "noreferrer"}
                target={option.channel === "phone" ? undefined : "_blank"}
                onClick={() => {
                  if (product.listing?.id) {
                    void trackContactClick(product.listing.id, option.channel)
                  }
                }}
              >
                {option.icon}
                {option.label}
                {option.channel === preferredChannel && (
                  <span className="text-xsmall-regular opacity-75">
                    {t.product.preferred}
                  </span>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-md bg-gray-100 px-4 py-3 text-center text-small-regular text-ui-fg-subtle">
            {t.product.contactUnavailable}
          </div>
        )}

        <div className="rounded-md border border-ui-border-base p-4 text-small-regular text-ui-fg-subtle">
          {t.product.disclaimer}
        </div>
        {product.listing?.id && (
          <ListingReportButton listingId={product.listing.id} />
        )}
      </div>
  )
}

const TelegramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m17 3-3 14-4-4-2.5 2v-3.5L14 6 6 11 2 9.5 17 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const MessengerIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 9.5C3 5.9 6 3 10 3s7 2.9 7 6.5S14 16 10 16c-.7 0-1.4-.1-2-.3L4.5 17v-3A6.2 6.2 0 0 1 3 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m6.5 11 2.3-2.5 2.2 1.7 2.5-2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PhoneIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.5 3.5 8 7 6.25 8.25c.9 1.9 2.35 3.35 4.25 4.25L11.75 11 15.5 12.5l-.5 3c-.15.85-.9 1.45-1.75 1.35-5.1-.6-9.5-5-10.1-10.1-.1-.85.5-1.6 1.35-1.75l2-.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
