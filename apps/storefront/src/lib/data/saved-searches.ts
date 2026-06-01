"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "./cookies"

export type SavedSearch = {
  id: string
  customer_id: string
  name: string
  query: string | null
  category: string | null
  location: string | null
  match_count?: number
  created_at: string
}

type SavedSearchResponse = {
  saved_searches: SavedSearch[]
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<SavedSearchResponse>(`/store/saved-searches`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ saved_searches }) => saved_searches)
}

export async function saveSearch(
  input: {
    countryCode: string
    query?: string
    category?: string
    location?: string
  }
): Promise<{ success: boolean; error: string | null }> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to save searches." }
  }

  try {
    await sdk.client.fetch(`/store/saved-searches`, {
      method: "POST",
      headers,
      body: {
        query: input.query,
        category: input.category,
        location: input.location,
      },
    })

    revalidatePath(`/${input.countryCode}/account/saved`)

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function removeSavedSearch(
  savedSearchId: string,
  countryCode: string
): Promise<{ success: boolean; error: string | null }> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to manage saved searches." }
  }

  try {
    await sdk.client.fetch(`/store/saved-searches/${savedSearchId}`, {
      method: "DELETE",
      headers,
    })

    revalidatePath(`/${countryCode}/account/saved`)

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
