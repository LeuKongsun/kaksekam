"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders, removeAuthToken } from "./cookies"

type InquiryState = {
  success: boolean
  error: string | null
}

const isUnauthorizedError = (error: unknown) =>
  String(error).toLowerCase().includes("unauthorized")

const handleUnauthorizedInquiry = async () => {
  try {
    await removeAuthToken()
  } catch {}
}

export type SellerInquiry = {
  id: string
  listing_id: string
  product_id: string
  seller_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  message: string
  status: "new" | "read" | "replied" | "archived"
  replied_at: string | null
  created_at: string
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    listing?: {
      id: string
      status: string
    } | null
  } | null
}

export type BuyerInquiry = SellerInquiry & {
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    seller?: {
      id: string
      display_name: string
      handle: string
    } | null
  } | null
}

export async function sendListingInquiry(
  productId: string,
  _currentState: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const headers = await getAuthHeaders()

  try {
    await sdk.client.fetch(`/store/listing-inquiries`, {
      method: "POST",
      headers,
      body: {
        product_id: productId,
        buyer_name: formData.get("buyer_name"),
        buyer_email: formData.get("buyer_email"),
        buyer_phone: formData.get("buyer_phone"),
        message: formData.get("message"),
      },
    })

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function listBuyerInquiries(): Promise<BuyerInquiry[]> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<{ inquiries: BuyerInquiry[] }>(`/store/buyer-inquiries`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ inquiries }) => inquiries)
    .catch(async (error) => {
      if (isUnauthorizedError(error)) {
        await handleUnauthorizedInquiry()
        return []
      }

      throw error
    })
}

export async function listSellerInquiries(): Promise<SellerInquiry[]> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<{ inquiries: SellerInquiry[] }>(`/store/seller-inquiries`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ inquiries }) => inquiries)
    .catch(async (error) => {
      if (isUnauthorizedError(error)) {
        await handleUnauthorizedInquiry()
        return []
      }

      throw error
    })
}

export async function updateSellerInquiryStatus(
  inquiryId: string,
  status: SellerInquiry["status"]
) {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    throw new Error("You must be signed in to update inquiries.")
  }

  try {
    await sdk.client.fetch(`/store/seller-inquiries/${inquiryId}`, {
      method: "PATCH",
      headers,
      body: {
        status,
      },
    })
  } catch (error) {
    if (isUnauthorizedError(error)) {
      await handleUnauthorizedInquiry()
      revalidatePath("/[countryCode]/account/inquiries", "page")
      return
    }

    throw error
  }

  revalidatePath("/[countryCode]/account/inquiries", "page")
}
