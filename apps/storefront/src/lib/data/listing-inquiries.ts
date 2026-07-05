"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders, removeAuthToken } from "./cookies"
import { retrieveCustomer } from "./customer"

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
  status: "new" | "read" | "replied" | "archived"
  replied_at: string | null
  last_message_at: string | null
  created_at: string
  messages: InquiryMessage[]
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

export type InquiryMessage = {
  id: string
  inquiry_id: string
  sender_type: "buyer" | "seller"
  sender_id: string | null
  body: string
  read_at: string | null
  created_at: string
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
  const customer = headers.authorization ? await retrieveCustomer() : null
  const customerName = customer
    ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() ||
      customer.email
    : null

  try {
    await sdk.client.fetch(`/store/listing-inquiries`, {
      method: "POST",
      headers,
      body: {
        product_id: productId,
        buyer_name: customerName ?? formData.get("buyer_name"),
        buyer_email: customer?.email ?? formData.get("buyer_email"),
        buyer_phone: customer?.phone ?? formData.get("buyer_phone"),
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

export async function getUnreadMessageCount() {
  const [sellerInquiries, buyerInquiries] = await Promise.all([
    listSellerInquiries().catch(() => []),
    listBuyerInquiries().catch(() => []),
  ])
  const sellerUnreadCount = sellerInquiries.filter(
    (inquiry) => inquiry.status === "new"
  ).length
  const buyerUnreadCount = buyerInquiries.filter((inquiry) => {
    const latestMessage = inquiry.messages[inquiry.messages.length - 1]

    return inquiry.status === "replied" && latestMessage?.sender_type === "seller"
  }).length

  return sellerUnreadCount + buyerUnreadCount
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

export async function updateBuyerInquiryStatus(
  inquiryId: string,
  status: "read"
) {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    throw new Error("You must be signed in to update messages.")
  }

  try {
    await sdk.client.fetch(`/store/buyer-inquiries/${inquiryId}`, {
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

export async function replyToBuyerInquiry(
  inquiryId: string,
  formData: FormData
) {
  const headers = await getAuthHeaders()
  const replyMessage = String(formData.get("reply_message") ?? "").trim()

  if (!headers.authorization) {
    throw new Error("You must be signed in to send messages.")
  }

  if (!replyMessage) {
    throw new Error("Message is required.")
  }

  try {
    await sdk.client.fetch(`/store/buyer-inquiries/${inquiryId}`, {
      method: "POST",
      headers,
      body: {
        message: replyMessage,
      },
    })
  } catch (error) {
    if (isUnauthorizedError(error)) {
      await handleUnauthorizedInquiry()
      revalidatePath("/[countryCode]/account/buyer-inquiries", "page")
      return
    }

    throw error
  }

  revalidatePath("/[countryCode]/account/buyer-inquiries", "page")
  revalidatePath("/[countryCode]/account/inquiries", "page")
}

export async function replyToSellerInquiry(
  inquiryId: string,
  formData: FormData
) {
  const headers = await getAuthHeaders()
  const replyMessage = String(formData.get("reply_message") ?? "").trim()

  if (!headers.authorization) {
    throw new Error("You must be signed in to reply to inquiries.")
  }

  if (!replyMessage) {
    throw new Error("Reply message is required.")
  }

  try {
    await sdk.client.fetch(`/store/seller-inquiries/${inquiryId}`, {
      method: "PATCH",
      headers,
      body: {
        reply_message: replyMessage,
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
  revalidatePath("/[countryCode]/account/buyer-inquiries", "page")
}
