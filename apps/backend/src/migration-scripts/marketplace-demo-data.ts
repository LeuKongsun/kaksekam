import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"

type DemoSeller = {
  display_name: string
  handle: string
  email: string
  phone: string
  location: string
  bio: string
  verification_status: "unverified" | "verified"
}

type DemoListing = {
  title: string
  handle: string
  description: string
  category: string
  location: string
  quantity: string
  unit: string
  condition: "Fresh" | "Organic" | "Used" | "New"
  price: number
  thumbnail: string
  seller_handle: string
}

type ProductWithMarketplace = {
  id: string
  handle: string
  listing?: {
    id: string
    category: string | null
  } | null
  seller?: {
    id: string
  } | null
}

type SellerRecord = {
  id: string
  handle: string
}

const PRODUCT_PAGE_SIZE = 100
const LEGACY_HANDLES = new Set(["t-shirt", "sweatshirt", "sweatpants", "shorts"])

const sellers: DemoSeller[] = [
  {
    display_name: "Kampong Cham Rice Cooperative",
    handle: "kampong-cham-rice-coop",
    email: "rice.coop@example.com",
    phone: "+855 12 410 001",
    location: "Kampong Cham",
    bio: "Farmer cooperative supplying rice, seasonal produce, and field services.",
    verification_status: "verified",
  },
  {
    display_name: "Battambang Fresh Farms",
    handle: "battambang-fresh-farms",
    email: "fresh.farms@example.com",
    phone: "+855 12 410 002",
    location: "Battambang",
    bio: "Fruit and vegetable growers serving wholesale and local pickup buyers.",
    verification_status: "verified",
  },
  {
    display_name: "Kandal Agro Supply",
    handle: "kandal-agro-supply",
    email: "agro.supply@example.com",
    phone: "+855 12 410 003",
    location: "Kandal",
    bio: "Seeds, fertilizer, irrigation supplies, and practical farm tools.",
    verification_status: "verified",
  },
  {
    display_name: "Takeo Farm Equipment",
    handle: "takeo-farm-equipment",
    email: "equipment@example.com",
    phone: "+855 12 410 004",
    location: "Takeo",
    bio: "Used and new farm equipment for small and medium farms.",
    verification_status: "unverified",
  },
  {
    display_name: "Siem Reap Livestock Network",
    handle: "siem-reap-livestock-network",
    email: "livestock@example.com",
    phone: "+855 12 410 005",
    location: "Siem Reap",
    bio: "Livestock sellers and hatchery contacts across northwestern Cambodia.",
    verification_status: "verified",
  },
]

const listings: DemoListing[] = [
  {
    title: "Organic jasmine rice",
    handle: "organic-jasmine-rice-kampong-cham",
    description: "Cleaned new-season jasmine rice packed for pickup or local delivery.",
    category: "Produce",
    location: "Kampong Cham",
    quantity: "1,200",
    unit: "kg",
    condition: "Organic",
    price: 1480,
    thumbnail: "/static/mock-products/rice.png",
    seller_handle: "kampong-cham-rice-coop",
  },
  {
    title: "Fresh mango cartons",
    handle: "fresh-mango-cartons-battambang",
    description: "Tree-ripened Keo Romeat mangoes packed in market cartons.",
    category: "Produce",
    location: "Battambang",
    quantity: "80",
    unit: "cartons",
    condition: "Fresh",
    price: 2200,
    thumbnail: "/static/mock-products/mango.png",
    seller_handle: "battambang-fresh-farms",
  },
  {
    title: "Green papaya harvest",
    handle: "green-papaya-harvest-kampong-speu",
    description: "Firm green papaya suitable for market stalls and processing.",
    category: "Produce",
    location: "Kampong Speu",
    quantity: "900",
    unit: "kg",
    condition: "Fresh",
    price: 210,
    thumbnail: "/static/mock-products/mango.png",
    seller_handle: "battambang-fresh-farms",
  },
  {
    title: "Layer hens",
    handle: "layer-hens-siem-reap",
    description: "Healthy laying birds from a small family farm.",
    category: "Livestock",
    location: "Siem Reap",
    quantity: "45",
    unit: "head",
    condition: "Used",
    price: 950,
    thumbnail: "/static/mock-products/hens.png",
    seller_handle: "siem-reap-livestock-network",
  },
  {
    title: "Tilapia fingerlings",
    handle: "tilapia-fingerlings-kandal",
    description: "Strong fingerlings from a managed hatchery.",
    category: "Livestock",
    location: "Kandal",
    quantity: "10,000",
    unit: "fish",
    condition: "Fresh",
    price: 35,
    thumbnail: "/static/mock-products/hens.png",
    seller_handle: "siem-reap-livestock-network",
  },
  {
    title: "Young Boer goats",
    handle: "young-boer-goats-kampot",
    description: "Healthy young goats suitable for breeding or smallholder herds.",
    category: "Livestock",
    location: "Kampot",
    quantity: "18",
    unit: "head",
    condition: "Fresh",
    price: 64000,
    thumbnail: "/static/mock-products/hens.png",
    seller_handle: "siem-reap-livestock-network",
  },
  {
    title: "Cassava cuttings",
    handle: "cassava-cuttings-tboung-khmum",
    description: "Vigorous planting material selected from healthy mother plants.",
    category: "Seeds",
    location: "Tboung Khmum",
    quantity: "15,000",
    unit: "cuttings",
    condition: "Fresh",
    price: 320,
    thumbnail: "/static/mock-products/cassava.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Hybrid corn seed",
    handle: "hybrid-corn-seed-pursat",
    description: "Sealed packs suitable for upland farms.",
    category: "Seeds",
    location: "Pursat",
    quantity: "60",
    unit: "packs",
    condition: "New",
    price: 1250,
    thumbnail: "/static/mock-products/cassava.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Banana seedlings",
    handle: "banana-seedlings-kratie",
    description: "Uniform seedlings ready for field planting.",
    category: "Seeds",
    location: "Kratie",
    quantity: "2,400",
    unit: "plants",
    condition: "Organic",
    price: 180,
    thumbnail: "/static/mock-products/seedlings.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Compost fertilizer blend",
    handle: "compost-fertilizer-blend-kandal",
    description: "Screened compost with rice husk and manure blend.",
    category: "Fertilizer",
    location: "Kandal",
    quantity: "300",
    unit: "bags",
    condition: "Organic",
    price: 650,
    thumbnail: "/static/mock-products/compost.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Cattle mineral blocks",
    handle: "cattle-mineral-blocks-mondulkiri",
    description: "Trace mineral blocks for cattle and buffalo.",
    category: "Fertilizer",
    location: "Mondulkiri",
    quantity: "140",
    unit: "blocks",
    condition: "New",
    price: 760,
    thumbnail: "/static/mock-products/compost.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Liquid biofertilizer",
    handle: "liquid-biofertilizer-takeo",
    description: "Fermented liquid input for vegetable and fruit farms.",
    category: "Fertilizer",
    location: "Takeo",
    quantity: "220",
    unit: "bottles",
    condition: "Organic",
    price: 1800,
    thumbnail: "/static/mock-products/compost.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Compact walking tractor",
    handle: "compact-walking-tractor-takeo",
    description: "Serviced two-wheel tractor with rotary attachment.",
    category: "Equipment",
    location: "Takeo",
    quantity: "1",
    unit: "unit",
    condition: "Used",
    price: 86000,
    thumbnail: "/static/mock-products/tractor.png",
    seller_handle: "takeo-farm-equipment",
  },
  {
    title: "Used rice thresher",
    handle: "used-rice-thresher-svay-rieng",
    description: "Diesel thresher in working condition.",
    category: "Equipment",
    location: "Svay Rieng",
    quantity: "1",
    unit: "unit",
    condition: "Used",
    price: 124000,
    thumbnail: "/static/mock-products/tractor.png",
    seller_handle: "takeo-farm-equipment",
  },
  {
    title: "Solar pump controller",
    handle: "solar-pump-controller-phnom-penh",
    description: "Controller and wiring kit for small irrigation pumps.",
    category: "Equipment",
    location: "Phnom Penh",
    quantity: "9",
    unit: "kits",
    condition: "New",
    price: 27500,
    thumbnail: "/static/mock-products/irrigation.png",
    seller_handle: "takeo-farm-equipment",
  },
  {
    title: "Drip irrigation starter kit",
    handle: "drip-irrigation-starter-kit-phnom-penh",
    description: "Lines, connectors, filter, and valves for vegetable plots.",
    category: "Tools",
    location: "Phnom Penh",
    quantity: "12",
    unit: "sets",
    condition: "New",
    price: 18500,
    thumbnail: "/static/mock-products/irrigation.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Paddy drying tarps",
    handle: "paddy-drying-tarps-battambang",
    description: "Heavy woven tarps for harvest drying yards.",
    category: "Tools",
    location: "Battambang",
    quantity: "70",
    unit: "pieces",
    condition: "New",
    price: 3400,
    thumbnail: "/static/mock-products/seedlings.png",
    seller_handle: "battambang-fresh-farms",
  },
  {
    title: "Pruning tool set",
    handle: "pruning-tool-set-kandal",
    description: "New hand pruners, folding saws, and sharpening stones for orchards.",
    category: "Tools",
    location: "Kandal",
    quantity: "24",
    unit: "sets",
    condition: "New",
    price: 9200,
    thumbnail: "/static/mock-products/irrigation.png",
    seller_handle: "kandal-agro-supply",
  },
  {
    title: "Vegetable transplanting crew",
    handle: "vegetable-transplanting-crew-prey-veng",
    description: "Experienced team available for seasonal field work.",
    category: "Services",
    location: "Prey Veng",
    quantity: "8",
    unit: "workers",
    condition: "New",
    price: 4000,
    thumbnail: "/static/mock-products/seedlings.png",
    seller_handle: "kampong-cham-rice-coop",
  },
  {
    title: "Farm pond excavation",
    handle: "farm-pond-excavation-banteay-meanchey",
    description: "Excavator service for irrigation pond preparation.",
    category: "Services",
    location: "Banteay Meanchey",
    quantity: "3",
    unit: "slots",
    condition: "New",
    price: 56000,
    thumbnail: "/static/mock-products/tractor.png",
    seller_handle: "takeo-farm-equipment",
  },
  {
    title: "Mobile rice milling service",
    handle: "mobile-rice-milling-service-kampong-cham",
    description: "On-farm milling service available for small and medium paddy lots.",
    category: "Services",
    location: "Kampong Cham",
    quantity: "5",
    unit: "booking slots",
    condition: "New",
    price: 12000,
    thumbnail: "/static/mock-products/rice.png",
    seller_handle: "kampong-cham-rice-coop",
  },
  {
    title: "Farm storage drums",
    handle: "farm-storage-drums-phnom-penh",
    description: "Clean used drums for feed, grain, water, or tool storage.",
    category: "Other",
    location: "Phnom Penh",
    quantity: "40",
    unit: "drums",
    condition: "Used",
    price: 6500,
    thumbnail: "/static/mock-products/irrigation.png",
    seller_handle: "takeo-farm-equipment",
  },
  {
    title: "Organic mulch bales",
    handle: "organic-mulch-bales-kampong-speu",
    description: "Dry rice-straw mulch bales for vegetable beds and orchard rows.",
    category: "Other",
    location: "Kampong Speu",
    quantity: "260",
    unit: "bales",
    condition: "Organic",
    price: 900,
    thumbnail: "/static/mock-products/seedlings.png",
    seller_handle: "battambang-fresh-farms",
  },
  {
    title: "Used greenhouse netting",
    handle: "used-greenhouse-netting-siem-reap",
    description: "Shade netting removed from a vegetable house, still usable.",
    category: "Other",
    location: "Siem Reap",
    quantity: "600",
    unit: "meters",
    condition: "Used",
    price: 1400,
    thumbnail: "/static/mock-products/seedlings.png",
    seller_handle: "siem-reap-livestock-network",
  },
]

async function listAllMarketplaceProducts(graph: any) {
  const products: ProductWithMarketplace[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "listing.id",
        "listing.category",
        "seller.id",
      ],
      pagination: {
        skip,
        take: PRODUCT_PAGE_SIZE,
      },
    })

    products.push(...(data as ProductWithMarketplace[]))
    totalCount = metadata?.count
    skip += data.length
    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined ? data.length === PRODUCT_PAGE_SIZE : skip < totalCount)
  }

  return products
}

export default async function marketplace_demo_data({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE)

  logger.info("Seeding marketplace demo data...")

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    pagination: {
      skip: 0,
      take: 1,
    },
  })
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    pagination: {
      skip: 0,
      take: 1,
    },
  })
  const shippingProfileId = shippingProfiles[0]?.id
  const salesChannelId = salesChannels[0]?.id

  if (!shippingProfileId) {
    throw new Error("No shipping profile is configured.")
  }

  const sellerByHandle = new Map<string, SellerRecord>()

  for (const sellerInput of sellers) {
    const [existingSeller] = await marketplaceService.listSellers({
      handle: sellerInput.handle,
    })
    const seller =
      existingSeller ??
      (await marketplaceService.createSellers({
        ...sellerInput,
        customer_id: null,
        status: "active",
        avatar_url: null,
      }))

    sellerByHandle.set(seller.handle, seller)
  }

  const allProducts = await listAllMarketplaceProducts(query.graph)
  const productsByHandle = new Map(allProducts.map((product) => [product.handle, product]))

  for (const legacyProduct of allProducts.filter((product) =>
    LEGACY_HANDLES.has(product.handle)
  )) {
    if (legacyProduct.listing?.id) {
      await marketplaceService.updateListings({
        id: legacyProduct.listing.id,
        status: "expired",
      })
    }
  }

  for (const listingInput of listings) {
    let product = productsByHandle.get(listingInput.handle)

    if (!product) {
      const { result } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: listingInput.title,
              handle: listingInput.handle,
              description: listingInput.description,
              thumbnail: listingInput.thumbnail,
              images: [{ url: listingInput.thumbnail }],
              status: ProductStatus.PUBLISHED,
              shipping_profile_id: shippingProfileId,
              sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
              options: [
                {
                  title: "Listing",
                  values: ["Default"],
                },
              ],
              variants: [
                {
                  title: "Default",
                  options: {
                    Listing: "Default",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: listingInput.price,
                      currency_code: "eur",
                    },
                    {
                      amount: listingInput.price,
                      currency_code: "usd",
                    },
                  ],
                },
              ],
            },
          ],
        },
      })

      product = {
        id: result[0].id,
        handle: result[0].handle,
      }
      productsByHandle.set(product.handle, product)
    } else {
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: product.id },
          update: {
            thumbnail: listingInput.thumbnail,
            images: [{ url: listingInput.thumbnail }],
          },
        },
      })
    }

    const seller = sellerByHandle.get(listingInput.seller_handle)

    if (!seller) {
      throw new Error(`Missing demo seller: ${listingInput.seller_handle}`)
    }

    const listing =
      product.listing?.id && product.listing.category
        ? await marketplaceService.updateListings({
            id: product.listing.id,
            status: "active",
            category: listingInput.category,
            location: listingInput.location,
            quantity: listingInput.quantity,
            unit: listingInput.unit,
            condition: listingInput.condition,
            moderation_note: null,
            reviewed_at: null,
            reviewer_id: null,
          })
        : await marketplaceService.createListings({
            status: "active",
            category: listingInput.category,
            location: listingInput.location,
            quantity: listingInput.quantity,
            unit: listingInput.unit,
            condition: listingInput.condition,
            moderation_note: null,
            reviewed_at: null,
            reviewer_id: null,
          })

    try {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [MARKETPLACE_MODULE]: {
          seller_id: seller.id,
        },
      })
    } catch (error) {
      logger.debug(
        `Skipping seller link for ${listingInput.handle}: ${
          error instanceof Error ? error.message : "already linked"
        }`
      )
    }

    if (!product.listing?.id) {
      try {
        await link.create({
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
          [MARKETPLACE_MODULE]: {
            listing_id: listing.id,
          },
        })
      } catch (error) {
        logger.debug(
          `Skipping listing link for ${listingInput.handle}: ${
            error instanceof Error ? error.message : "already linked"
          }`
        )
      }
    }
  }

  logger.info("Finished seeding marketplace demo data.")
}
