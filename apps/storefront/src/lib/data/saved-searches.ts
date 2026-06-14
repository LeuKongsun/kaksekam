"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders, removeAuthToken } from "./cookies"

export type SavedSearch = {
  id: string
  customer_id: string
  name: string
  query: string | null
  category: string | null
  location: string | null
  availability: string | null
  condition: string | null
  match_count?: number
  created_at: string
}

type SavedSearchResponse = {
  saved_searches: SavedSearch[]
}

const isUnauthorizedError = (error: unknown) =>
  String(error).toLowerCase().includes("unauthorized")

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
    .catch(async (error) => {
      if (isUnauthorizedError(error)) {
        await removeAuthToken()
        return []
      }

      throw error
    })
}

export async function saveSearch(
  input: {
    countryCode: string
    query?: string
    category?: string
    location?: string
    availability?: string
    condition?: string
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
        availability: input.availability,
        condition: input.condition,
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
