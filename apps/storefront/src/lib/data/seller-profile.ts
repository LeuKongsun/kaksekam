"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "./cookies"
import type { ProductSeller } from "./products"

export type SellerProfileState = {
  success: boolean
  error: string | null
}

export const retrieveAccountSellerProfile =
  async (): Promise<ProductSeller | null> => {
    const headers = {
      ...(await getAuthHeaders()),
    }

    return sdk.client
      .fetch<{ seller: ProductSeller | null }>(`/store/seller-profile`, {
        method: "GET",
        headers,
        cache: "no-store",
      })
      .then(({ seller }) => seller)
      .catch(() => null)
  }

export async function updateAccountSellerProfile(
  _currentState: SellerProfileState,
  formData: FormData
): Promise<SellerProfileState> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.client.fetch(`/store/seller-profile`, {
      method: "PATCH",
      headers,
      body: {
        display_name: formData.get("display_name"),
        handle: formData.get("handle"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        location: formData.get("location"),
        bio: formData.get("bio"),
      },
    })

    revalidatePath("/[countryCode]/account", "page")
    revalidatePath("/[countryCode]/account/seller-profile", "page")
    revalidatePath("/[countryCode]/account/listings", "page")

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
