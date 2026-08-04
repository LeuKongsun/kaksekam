import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { richTextToPlainText } from "@lib/util/rich-text"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat(),
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        })),
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`,
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string,
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const listing = product.listing
  const price = product.variants?.[0]?.calculated_price
  const priceText =
    price?.calculated_amount != null
      ? `${price.calculated_amount} ${price.currency_code?.toUpperCase() ?? ""}`
      : "Contact for price"
  const locationText = [listing?.district, listing?.location]
    .filter(Boolean)
    .join(", ")
  const description = [
    richTextToPlainText(product.description).slice(0, 120),
    priceText,
    locationText,
  ]
    .filter(Boolean)
    .join(" · ")
  const title = `${product.title} – ${priceText} | Kaksekam`
  const baseUrl = getBaseURL().replace(/\/$/, "")
  const listingUrl = `${baseUrl}/${params.countryCode}/products/${product.handle}`
  const toAbsoluteUrl = (url?: string | null) => {
    if (!url) {
      return undefined
    }
    if (/^https?:\/\//i.test(url)) {
      return url
    }
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`
  }
  const imageUrl = toAbsoluteUrl(product.thumbnail)

  return {
    title,
    description,
    alternates: {
      canonical: listingUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: listingUrl,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const [region, customer] = await Promise.all([
    getRegion(params.countryCode),
    retrieveCustomer().catch(() => null),
  ])
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)
  const customerName =
    customer &&
    `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
      customer={
        customer
          ? {
              id: customer.id,
              name: customerName || customer.email,
              email: customer.email,
              phone: customer.phone ?? null,
            }
          : null
      }
    />
  )
}
