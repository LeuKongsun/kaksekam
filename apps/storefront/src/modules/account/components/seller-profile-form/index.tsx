"use client"

import { updateAccountSellerProfile } from "@lib/data/seller-profile"
import type { ProductSeller } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Input from "@modules/common/components/input"
import Eye from "@modules/common/icons/eye"
import { PencilSquare, Photo, XMarkMini } from "@medusajs/icons"
import { ChangeEvent, useActionState, useEffect, useRef, useState } from "react"

type SellerProfileFormProps = {
  customer: HttpTypes.StoreCustomer
  seller: ProductSeller | null
}

const getDefaultName = (customer: HttpTypes.StoreCustomer) =>
  `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() ||
  "Marketplace Seller"

const getDefaultHandle = (seller: ProductSeller | null, customerName: string) =>
  seller?.handle ??
  customerName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const SellerProfileForm = ({ customer, seller }: SellerProfileFormProps) => {
  const defaultName = seller?.display_name ?? getDefaultName(customer)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction] = useActionState(updateAccountSellerProfile, {
    success: false,
    error: null as string | null,
  })
  const currentAvatarUrl = seller?.avatar_url ?? null
  const publicDescription =
    [seller?.location, seller?.bio].filter(Boolean).join(" · ") ||
    "No description added."

  useEffect(() => {
    if (state.success) {
      setIsEditing(false)
    }
  }, [state.success])

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }

    const preview = URL.createObjectURL(avatarFile)
    setAvatarPreview(preview)

    return () => URL.revokeObjectURL(preview)
  }, [avatarFile])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] ?? null)
  }

  const removeSelectedAvatar = () => {
    setAvatarFile(null)

    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
  }

  return (
    <>
      <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-large-semi text-ui-fg-base">
              Public seller details
            </h2>
            <p className="mt-1 text-small-regular text-ui-fg-subtle">
              The farm or business information buyers see on your products.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {seller?.handle && (
              <LocalizedClientLink
                href={`/sellers/${seller.handle}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"
                title="View public profile"
                aria-label="View public profile"
              >
                <Eye size={16} />
              </LocalizedClientLink>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"
              aria-label="Edit public seller details"
            >
              <PencilSquare />
            </button>
          </div>
        </div>

        {state.success && (
          <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
            Public seller details saved.
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4 border-t border-gray-200 pt-5 small:flex-row small:items-start">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-ui-fg-base text-white">
            {currentAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAvatarUrl}
                alt={defaultName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl-semi">
                {defaultName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 small:grid-cols-2">
            <InfoItem label="Name">{defaultName}</InfoItem>
            <InfoItem label="Email">{seller?.email ?? customer.email}</InfoItem>
            <InfoItem label="Phone">
              {seller?.phone ?? customer.phone ?? "Not added"}
            </InfoItem>
            <InfoItem label="Location">
              {seller?.location ?? "Not added"}
            </InfoItem>
            <div className="small:col-span-2">
              <InfoItem label="Description">
                {publicDescription}
              </InfoItem>
            </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <form
            action={formAction}
            className="max-h-full w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
        <div>
          <h2 className="text-large-semi text-ui-fg-base">Public seller details</h2>
          <p className="mt-1 text-small-regular text-ui-fg-subtle">
            The farm or business information buyers see on your products.
          </p>
        </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-ui-fg-base transition-colors hover:bg-gray-50"
                aria-label="Close profile editor"
              >
                <XMarkMini />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4">
              {state.error && (
                <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
                  {state.error}
                </div>
              )}

              <input type="hidden" name="avatar_url" value={currentAvatarUrl ?? ""} />

              <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-5 small:flex-row small:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ui-fg-base text-white">
                  {avatarPreview || currentAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview ?? currentAvatarUrl ?? ""}
                      alt={defaultName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl-semi">
                      {defaultName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-base-semi text-ui-fg-base">Photo or logo</div>
                  <p className="mt-1 text-small-regular text-ui-fg-subtle">
                    Upload a square photo or logo buyers can recognize.
                  </p>
                  <input
                    ref={avatarInputRef}
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
                    >
                      <Photo />
                      Upload picture
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={removeSelectedAvatar}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
                      >
                        <XMarkMini />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
                <Input
                  label="Farm or business name"
                  name="display_name"
                  defaultValue={defaultName}
                  required
                />
                <Input
                  label="Handle"
                  name="handle"
                  defaultValue={getDefaultHandle(seller, defaultName)}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={seller?.email ?? customer.email}
                />
                <Input
                  label="Phone"
                  name="phone"
                  defaultValue={seller?.phone ?? customer.phone ?? ""}
                />
                <Input
                  label="Location"
                  name="location"
                  defaultValue={seller?.location ?? ""}
                />
              </div>

              <label className="mt-4 flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                <span>Bio</span>
                <textarea
                  name="bio"
                  rows={5}
                  defaultValue={seller?.bio ?? ""}
                  placeholder="Tell buyers what you grow, supply, where you operate, and when you usually respond."
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
              >
                Cancel
              </button>
              <SubmitButton data-testid="save-seller-profile-button">
                Save public details
              </SubmitButton>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

const InfoItem = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
    <div className="text-xsmall-semi font-medium uppercase text-ui-fg-muted">
      {label}
    </div>
    <div className="mt-1 text-small-regular text-ui-fg-base">{children}</div>
  </div>
)

export default SellerProfileForm
