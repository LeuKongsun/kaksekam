"use client"

import type { ProductSeller } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ProductPrice from "../product-price"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  seller?: ProductSeller | null
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {}) ?? {}
}

export default function ProductActions({
  product,
  seller,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const contactSubject = encodeURIComponent(`Listing inquiry: ${product.title}`)
  const contactHref = seller?.email
    ? `mailto:${seller.email}?subject=${contactSubject}`
    : seller?.phone
    ? `tel:${seller.phone.replace(/[^\d+]/g, "")}`
    : undefined
  const canContact = !disabled && isValidVariant && !!contactHref
  const replyRate = seller?.trust_stats?.reply_rate

  return (
    <>
      <div className="flex flex-col gap-y-4 rounded-md border border-gray-200 bg-white p-4">
        <div>
          <div className="text-base-semi">Contact farmer</div>
          <p className="mt-1 text-small-regular text-ui-fg-subtle">
            Send an inquiry or use the farmer contact details below.
          </p>
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

        <ProductPrice product={product} variant={selectedVariant} />

        {seller && (
          <div className="rounded-md bg-gray-50 p-4 text-small-regular">
            <LocalizedClientLink
              href={`/sellers/${seller.handle}`}
              className="inline-flex items-center gap-x-2 font-medium text-ui-fg-base hover:text-ui-fg-interactive"
            >
              <span>{seller.display_name}</span>
              {seller.verification_status === "verified" && (
                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium uppercase text-green-700">
                  Verified
                </span>
              )}
            </LocalizedClientLink>
            {seller.location && (
              <div className="mt-1 text-ui-fg-subtle">{seller.location}</div>
            )}
            {seller.bio && (
              <p className="mt-3 line-clamp-3 whitespace-pre-line text-ui-fg-subtle">
                {seller.bio}
              </p>
            )}
            {(seller.email || seller.phone) && (
              <div className="mt-2 text-ui-fg-subtle">
                {seller.email ?? seller.phone}
              </div>
            )}
            {seller.trust_stats && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-white p-2">
                  <div className="text-[11px] uppercase text-ui-fg-subtle">
                    Profile
                  </div>
                  <div className="text-small-semi text-ui-fg-base">
                    {seller.trust_stats.profile_completeness}% complete
                  </div>
                </div>
                <div className="rounded-md bg-white p-2">
                  <div className="text-[11px] uppercase text-ui-fg-subtle">
                    Replies
                  </div>
                  <div className="text-small-semi text-ui-fg-base">
                    {replyRate === null || replyRate === undefined
                      ? "No history yet"
                      : `${replyRate}% rate`}
                  </div>
                </div>
              </div>
            )}
            <LocalizedClientLink
              href={`/sellers/${seller.handle}`}
              className="mt-3 inline-flex text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              View full seller profile
            </LocalizedClientLink>
          </div>
        )}

        <a
          href={canContact ? contactHref : undefined}
          aria-disabled={!canContact}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-black px-4 font-medium text-white transition-colors hover:bg-gray-800 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          data-testid="contact-seller-link"
        >
          {!isValidVariant
            ? "Select listing option"
            : contactHref
            ? "Contact seller"
            : "Seller contact unavailable"}
        </a>

        <div className="rounded-md border border-ui-border-base p-4 text-small-regular text-ui-fg-subtle">
          Message the seller to confirm availability, price, inspection, and
          pickup or delivery. This platform does not process checkout or
          payment.
        </div>
      </div>
    </>
  )
}
