"use server"

import { sdk } from "@lib/config"
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
  status: "draft" | "pending_review" | "active" | "sold" | "rejected" | "expired"
  moderation_note: string | null
  reviewed_at: string | null
  reviewer_id: string | null
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
  created_at: string
  updated_at: string
  seller: {
    id: string
    display_name: string
    handle: string
    email: string | null
    phone: string | null
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
  "Could not reach the marketplace backend. Make sure Medusa is running on localhost:9000."
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
  headers: Record<string, string>
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
    }))
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
  headers: Record<string, string>
) => {
  const pastedUrls = String(formData.get("image_urls") ?? "")
  const uploadedUrls = await uploadListingImages(formData, headers)

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
  formData: FormData
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to create listings." }
  }

  try {
    const imageUrls = await getListingImageUrls(formData, headers)

    await sdk.client.fetch(`/store/seller-listings`, {
      method: "POST",
      headers,
      body: {
        title: formData.get("title"),
        description: formData.get("description"),
        image_urls: imageUrls,
        price: formData.get("price"),
        currency_code: formData.get("currency_code") || "eur",
        category: formData.get("category"),
        location: formData.get("location"),
        quantity: formData.get("quantity"),
        unit: formData.get("unit"),
        availability: formData.get("availability"),
        condition: formData.get("condition"),
        contact_preference: formData.get("contact_preference"),
        variety: formData.get("variety"),
        production_method: formData.get("production_method"),
        harvest_date: formData.get("harvest_date"),
        breed: formData.get("breed"),
        age: formData.get("age"),
        sex: formData.get("sex"),
        health_notes: formData.get("health_notes"),
        brand: formData.get("brand"),
        equipment_model: formData.get("equipment_model"),
        year: formData.get("year"),
        pack_size: formData.get("pack_size"),
        expiry_date: formData.get("expiry_date"),
        service_area: formData.get("service_area"),
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
  formData: FormData
): Promise<SellerListingState> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, error: "Sign in to edit listings." }
  }

  try {
    const imageUrls = await getListingImageUrls(formData, headers)

    await sdk.client.fetch(`/store/seller-listings/${listingId}`, {
      method: "PATCH",
      headers,
      body: {
        title: formData.get("title"),
        description: formData.get("description"),
        image_urls: imageUrls,
        price: formData.get("price"),
        currency_code: formData.get("currency_code") || "eur",
        category: formData.get("category"),
        location: formData.get("location"),
        quantity: formData.get("quantity"),
        unit: formData.get("unit"),
        availability: formData.get("availability"),
        condition: formData.get("condition"),
        contact_preference: formData.get("contact_preference"),
        variety: formData.get("variety"),
        production_method: formData.get("production_method"),
        harvest_date: formData.get("harvest_date"),
        breed: formData.get("breed"),
        age: formData.get("age"),
        sex: formData.get("sex"),
        health_notes: formData.get("health_notes"),
        brand: formData.get("brand"),
        equipment_model: formData.get("equipment_model"),
        year: formData.get("year"),
        pack_size: formData.get("pack_size"),
        expiry_date: formData.get("expiry_date"),
        service_area: formData.get("service_area"),
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
  listingId: string
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
  listingId: string
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
