"use server"

import { sdk } from "@lib/config"
import type { ProductSeller } from "./products"

export type SellerProfileListing = {
  id: string
  product_id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images: {
    url?: string | null
  }[]
  category: string | null
  location: string | null
  quantity: string | null
  unit: string | null
  availability: string | null
  condition: string | null
  contact_preference: string | null
  variety: string | null
  production_method: string | null
  harvest_date: string | null
  breed: string | null
  age: string | null
  sex: string | null
  health_notes: string | null
  brand: string | null
  equipment_model: string | null
  year: string | null
  pack_size: string | null
  expiry_date: string | null
  service_area: string | null
  price: {
    calculated_amount?: number
    currency_code?: string
  } | null
}

export type SellerProfile = {
  seller: ProductSeller
  listings: SellerProfileListing[]
}

export async function retrieveSellerProfile(
  handle: string
): Promise<SellerProfile | null> {
  return sdk.client
    .fetch<SellerProfile>(`/store/sellers/${handle}`, {
      method: "GET",
      cache: "no-store",
    })
    .catch(() => null)
}
