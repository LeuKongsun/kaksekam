"use server"

import { sdk } from "@lib/config"
import { richTextToPlainText, sanitizeRichText } from "@lib/util/rich-text"
import { revalidatePath } from "next/cache"
import { getAuthHeaders, removeAuthToken } from "./cookies"

export type SellerListing = {
  id: string
  product_id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  image_urls: string[]
  status:
    | "draft"
    | "pending_review"
    | "active"
    | "sold"
    | "rejected"
    | "expired"
  moderation_note: string | null
  reviewed_at: string | null
  reviewer_id: string | null
  category: string | null
  location: string | null
  district: string | null
  quantity: string | null
  unit: string | null
  minimum_order: string | null
  condition: string | null
  availability: string | null
  production_method: string | null
  contact_preference: "telegram" | "messenger" | "phone" | null
  negotiable: boolean
  expires_at: string | null
  refreshed_at: string | null
  created_at: string
  updated_at: string
  seller: {
    id: string
    display_name: string
    handle: string
    email: string | null
    phone: string | null
    telegram: string | null
    facebook_url: string | null
    preferred_contact: "telegram" | "messenger" | "phone" | null
    location: string | null
    bio: string | null
    verification_status: "unverified" | "verified"
  } | null
  price: {
    calculated_amount?: number
    currency_code?: string
  } | null
}

type SellerListingState = {
  success: boolean
  error: string | null
}

type UploadedFile = {
  url?: string
}

const MAX_UPLOAD_FILES = 6
const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in again."
const BACKEND_UNAVAILABLE_MESSAGE =
  "Could not reach the marketplace backend. Make sure Kaksekam is running on localhost:9000."
const isUnauthorizedError = (error: unknown) =>
  String(error).toLowerCase().includes("unauthorized")
const isFetchError = (error: unknown) =>
  String(error).toLowerCase().includes("failed to fetch")

const handleUnauthorizedAction = async () => {
  await removeAuthToken()

  return { success: false, error: SESSION_EXPIRED_MESSAGE }
}

const getImageFiles = (formData: FormData) =>
  formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0)
    .slice(0, MAX_UPLOAD_FILES)

const uploadListingImages = async (
  formData: FormData,
  headers: Record<string, string>,
) => {
  const files = getImageFiles(formData)

  if (!files.length) {
    return []
  }

  const uploads = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      mimeType: file.type,
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })),
  )
  const { files: uploadedFiles } = await sdk.client.fetch<{
    files: UploadedFile[]
  }>(`/store/listing-uploads`, {
    method: "POST",
    headers,
    body: {
      files: uploads,
    },
  })

  return uploadedFiles.map((file) => file.url).filter(Boolean)
}

const getListingImageUrls = async (
  formData: FormData,
  headers: Record<string, string>,
) => {
  const pastedUrls = String(formData.get("image_urls") ?? "")
  const uploadedUrls = await uploadListingImages(formData, headers)
  const imageOrder = String(formData.get("image_order") ?? "")
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)

  if (imageOrder.length) {
    let uploadedIndex = 0

    return imageOrder
      .map((value) => {
        if (value.startsWith("new:")) {
          return uploadedUrls[uploadedIndex++]
        }

        return value
      })
      .filter(Boolean)
      .join("\n")
  }

  return [pastedUrls, ...uploadedUrls].filter(Boolean).join("\n")
}

export const listSellerListings = async (): Promise<SellerListing[]> => {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<{ listings: SellerListing[] }>(`/store/seller-listings`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ listings }) => listings)
    .catch((error) => {
      if (isUnauthorizedError(error)) {
        return []
      }

      throw error
    })
}

export async function createSellerListing(
  _currentState: SellerListingState,
  formData: FormData,
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to create listings." }
  }

  try {
    const imageUrls = await getListingImageUrls(formData, headers)
    const description = sanitizeRichText(
      String(formData.get("description") ?? ""),
    )

    await sdk.client.fetch(`/store/seller-listings`, {
      method: "POST",
      headers,
      body: {
        title: formData.get("title"),
        description: richTextToPlainText(description) ? description : "",
        image_urls: imageUrls,
        price: formData.get("price"),
        currency_code: formData.get("currency_code") || "khr",
        category: formData.get("category"),
        location: formData.get("location"),
        district: formData.get("district"),
        quantity: formData.get("quantity"),
        unit: formData.get("unit"),
        minimum_order: formData.get("minimum_order"),
        condition: formData.get("condition"),
        availability: formData.get("availability"),
        production_method: formData.get("production_method"),
        contact_preference: formData.get("contact_preference"),
        negotiable: formData.get("negotiable") === "true",
      },
    })

    revalidatePath("/[countryCode]/account/listings", "page")

    return { success: true, error: null }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return handleUnauthorizedAction()
    }
    if (isFetchError(error)) {
      return { success: false, error: BACKEND_UNAVAILABLE_MESSAGE }
    }

    return { success: false, error: String(error) }
  }
}

export async function updateSellerListing(
  listingId: string,
  _currentState: SellerListingState,
  formData: FormData,
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to edit listings." }
  }

  try {
    const imageUrls = await getListingImageUrls(formData, headers)
    const description = sanitizeRichText(
      String(formData.get("description") ?? ""),
    )

    await sdk.client.fetch(`/store/seller-listings/${listingId}`, {
      method: "PATCH",
      headers,
      body: {
        title: formData.get("title"),
        description: richTextToPlainText(description) ? description : "",
        image_urls: imageUrls,
        price: formData.get("price"),
        currency_code: formData.get("currency_code") || "khr",
        category: formData.get("category"),
        location: formData.get("location"),
        district: formData.get("district"),
        quantity: formData.get("quantity"),
        unit: formData.get("unit"),
        minimum_order: formData.get("minimum_order"),
        condition: formData.get("condition"),
        availability: formData.get("availability"),
        production_method: formData.get("production_method"),
        contact_preference: formData.get("contact_preference"),
        negotiable: formData.get("negotiable") === "true",
      },
    })

    revalidatePath("/[countryCode]/account/listings", "page")

    return { success: true, error: null }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return handleUnauthorizedAction()
    }
    if (isFetchError(error)) {
      return { success: false, error: BACKEND_UNAVAILABLE_MESSAGE }
    }

    return { success: false, error: String(error) }
  }
}

export async function withdrawSellerListing(
  listingId: string,
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to manage listings." }
  }

  try {
    await sdk.client.fetch(`/store/seller-listings/${listingId}`, {
      method: "DELETE",
      headers,
    })

    revalidatePath("/[countryCode]/account/listings", "page")

    return { success: true, error: null }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return handleUnauthorizedAction()
    }
    if (isFetchError(error)) {
      return { success: false, error: BACKEND_UNAVAILABLE_MESSAGE }
    }

    return { success: false, error: String(error) }
  }
}

export async function markSellerListingSold(
  listingId: string,
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to manage listings." }
  }

  try {
    await sdk.client.fetch(`/store/seller-listings/${listingId}/status`, {
      method: "PATCH",
      headers,
      body: {
        status: "sold",
      },
    })

    revalidatePath("/[countryCode]/account/listings", "page")
    revalidatePath("/[countryCode]/store", "page")

    return { success: true, error: null }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return handleUnauthorizedAction()
    }
    if (isFetchError(error)) {
      return { success: false, error: BACKEND_UNAVAILABLE_MESSAGE }
    }

    return { success: false, error: String(error) }
  }
}

export async function refreshSellerListing(
  listingId: string,
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to manage listings." }
  }

  try {
    await sdk.client.fetch(`/store/seller-listings/${listingId}/status`, {
      method: "PATCH",
      headers,
      body: {
        action: "refresh",
      },
    })

    revalidatePath("/[countryCode]/account/listings", "page")
    revalidatePath("/[countryCode]/store", "page")

    return { success: true, error: null }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return handleUnauthorizedAction()
    }

    return { success: false, error: String(error) }
  }
}

export async function republishSellerListing(
  listingId: string,
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to manage listings." }
  }

  try {
    await sdk.client.fetch(`/store/seller-listings/${listingId}/status`, {
      method: "PATCH",
      headers,
      body: {
        action: "republish",
      },
    })

    revalidatePath("/[countryCode]/account/listings", "page")
    revalidatePath("/[countryCode]/store", "page")

    return { success: true, error: null }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return handleUnauthorizedAction()
    }

    return { success: false, error: String(error) }
  }
}
