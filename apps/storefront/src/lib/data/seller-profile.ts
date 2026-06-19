"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "./cookies"
import type { ProductSeller } from "./products"

export type SellerProfileState = {
  success: boolean
  error: string | null
}

type UploadedFile = {
  url?: string
}

const getAvatarFile = (formData: FormData) => {
  const file = formData.get("avatar")

  if (
    file &&
    typeof file === "object" &&
    "size" in file &&
    "arrayBuffer" in file &&
    typeof file.arrayBuffer === "function" &&
    Number(file.size) > 0
  ) {
    return file as File
  }

  return null
}

const uploadSellerAvatar = async (
  formData: FormData,
  headers: Record<string, string>
) => {
  const file = getAvatarFile(formData)

  if (!file) {
    return String(formData.get("avatar_url") ?? "") || null
  }

  const { files } = await sdk.client.fetch<{ files: UploadedFile[] }>(
    `/store/listing-uploads`,
    {
      method: "POST",
      headers,
      body: {
        files: [
          {
            filename: file.name,
            mimeType: file.type,
            content: Buffer.from(await file.arrayBuffer()).toString("base64"),
          },
        ],
      },
    }
  )

  return files[0]?.url ?? null
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
    const handle = String(formData.get("handle") ?? "")
    const avatarUrl = await uploadSellerAvatar(formData, headers)

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
        avatar_url: avatarUrl,
      },
    })

    revalidatePath("/[countryCode]/account", "page")
    revalidatePath("/[countryCode]/account/seller-profile", "page")
    revalidatePath("/[countryCode]/account/listings", "page")
    if (handle) {
      revalidatePath(`/[countryCode]/sellers/${handle}`, "page")
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
