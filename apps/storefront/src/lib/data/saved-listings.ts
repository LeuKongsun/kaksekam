"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders, removeAuthToken } from "./cookies"

export type SavedListing = {
  id: string
  product_id: string
  listing_id: string
  created_at: string
  product: {
    id: string
    title: string
    handle: string
    description: string | null
    thumbnail: string | null
    listing: {
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
    } | null
    seller: {
      display_name: string
      location: string | null
    } | null
    price: {
      calculated_amount?: number
      currency_code?: string
    } | null
  }
}

type SavedListingResponse = {
  saved_listings: SavedListing[]
}

const isUnauthorizedError = (error: unknown) =>
  String(error).toLowerCase().includes("unauthorized")

export const listSavedListings = async (): Promise<SavedListing[]> => {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<SavedListingResponse>(`/store/saved-listings`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ saved_listings }) => saved_listings)
    .catch(async (error) => {
      if (isUnauthorizedError(error)) {
        await removeAuthToken()
        return []
      }

      throw error
    })
}

export const retrieveSavedListing = async (
  productId: string
): Promise<SavedListing | null> => {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return null
  }

  return sdk.client
    .fetch<SavedListingResponse>(`/store/saved-listings`, {
      method: "GET",
      query: {
        product_id: productId,
      },
      headers,
      cache: "no-store",
    })
    .then(({ saved_listings }) => saved_listings[0] ?? null)
    .catch(() => null)
}

export async function saveListing(
  productId: string,
  countryCode: string
): Promise<{
  success: boolean
  error: string | null
  savedListing: SavedListing | null
}> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return {
      success: false,
      error: "Sign in to save listings.",
      savedListing: null,
    }
  }

  try {
    await sdk.client.fetch(`/store/saved-listings`, {
      method: "POST",
      headers,
      body: {
        product_id: productId,
      },
    })
    const savedListing = await retrieveSavedListing(productId)

    revalidatePath(`/${countryCode}/account/saved`)

    return { success: true, error: null, savedListing }
  } catch (error) {
    return { success: false, error: String(error), savedListing: null }
  }
}

export async function removeSavedListing(
  savedListingId: string,
  countryCode: string
): Promise<{ success: boolean; error: string | null }> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to manage saved listings." }
  }

  try {
    await sdk.client.fetch(`/store/saved-listings/${savedListingId}`, {
      method: "DELETE",
      headers,
    })

    revalidatePath(`/${countryCode}/account/saved`)

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
