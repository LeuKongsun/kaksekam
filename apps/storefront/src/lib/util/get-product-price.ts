import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-percentage-diff"
import { convertToLocale } from "./money"

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number
    original_amount: number
    currency_code: string
    calculated_price: {
      price_list_type: string
    }
  }
  prices?: {
    amount: number
    currency_code: string
  }[]
}

export const getPricesForVariant = (variant: VariantWithPrice) => {
  if (variant?.calculated_price?.calculated_amount != null) {
    return {
      calculated_price_number: variant.calculated_price.calculated_amount,
      calculated_price: convertToLocale({
        amount: variant.calculated_price.calculated_amount,
        currency_code: variant.calculated_price.currency_code,
      }),
      original_price_number: variant.calculated_price.original_amount,
      original_price: convertToLocale({
        amount: variant.calculated_price.original_amount,
        currency_code: variant.calculated_price.currency_code,
      }),
      currency_code: variant.calculated_price.currency_code,
      price_type: variant.calculated_price.calculated_price.price_list_type,
      percentage_diff: getPercentageDiff(
        variant.calculated_price.original_amount,
        variant.calculated_price.calculated_amount
      ),
    }
  }

  const price = variant?.prices?.[0]

  if (!price?.currency_code || price.amount == null) {
    return null
  }

  return {
    calculated_price_number: price.amount,
    calculated_price: convertToLocale({
      amount: price.amount,
      currency_code: price.currency_code,
    }),
    original_price_number: price.amount,
    original_price: convertToLocale({
      amount: price.amount,
      currency_code: price.currency_code,
    }),
    currency_code: price.currency_code,
    price_type: "default",
    percentage_diff: "0",
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant = (product.variants as VariantWithPrice[])
      .filter((v) => !!v.calculated_price || !!v.prices?.length)
      .sort((a, b) => {
        return (
          (a.calculated_price?.calculated_amount ?? a.prices?.[0]?.amount ?? 0) -
          (b.calculated_price?.calculated_amount ?? b.prices?.[0]?.amount ?? 0)
        )
      })[0]

    return getPricesForVariant(cheapestVariant)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    ) as VariantWithPrice | undefined

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
