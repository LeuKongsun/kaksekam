"use client"

import { signout } from "@lib/data/customer"
import type { ProductSeller } from "@lib/data/products"
import { updateAccountSellerProfile } from "@lib/data/seller-profile"
import {
  ArrowRightOnRectangle,
  PencilSquare,
  Photo,
  XMarkMini,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  ChangeEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react"

type AccountNavProps = {
  customer: HttpTypes.StoreCustomer | null
  seller: ProductSeller | null
  messageCount: number
}

import { useTranslation } from "@lib/i18n/context"

const AccountNav = ({
  customer,
  seller,
  messageCount: _messageCount,
}: AccountNavProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const { t } = useTranslation()
  const displayName =
    seller?.display_name ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.email ||
    t.account.profileInitials
  const billingAddress = customer?.addresses?.find(
    (address) => address.is_default_billing
  )
  const location = seller?.location || billingAddress?.city
  const initials = displayName.slice(0, 1).toUpperCase()
  const phone = seller?.phone || customer?.phone
  const description = [location, seller?.bio].filter(Boolean).join(" · ")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [profileState, profileAction] = useActionState(
    updateAccountSellerProfile,
    {
      success: false,
      error: null as string | null,
    }
  )
  const currentAvatarUrl = seller?.avatar_url ?? null
  const tabs = [
    {
      label: t.account.products,
      href: "/account/listings",
      isActive: pathname.includes("/account/listings"),
      icon: Package,
    },
    {
      label: t.common.saved,
      href: "/account/saved",
      isActive: pathname.includes("/account/saved"),
      icon: Eye,
    },
  ]

  const handleLogout = async () => {
    await signout(countryCode)
  }

  useEffect(() => {
    if (profileState.success) {
      setIsEditingProfile(false)
      router.refresh()
    }
  }, [profileState.success, router])

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
    <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-4 small:p-5">
        <div className="flex flex-col gap-4 small:flex-row small:items-start small:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#273b2e] text-white shadow-sm small:h-20 small:w-20">
              {seller?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl-semi">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl-semi text-ui-fg-base small:text-2xl-semi">
                  {displayName}
                </h1>
                {seller?.verification_status === "verified" && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xsmall-semi text-emerald-700">
                    {t.common.verified}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-small-regular text-ui-fg-subtle">
                {customer?.email && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1">
                    {customer.email}
                  </span>
                )}
                {phone && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1">
                    {phone}
                  </span>
                )}
                {location && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1">
                    {location}
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-2 line-clamp-2 max-w-3xl text-small-regular text-ui-fg-subtle">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 small:justify-end">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-ui-fg-base transition-colors hover:border-ui-fg-base hover:bg-gray-50"
              aria-label={t.account.editProfileTitle}
            >
              <PencilSquare />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-ui-fg-subtle transition-colors hover:border-ui-fg-base hover:text-ui-fg-base"
              aria-label={t.account.logout}
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle />
            </button>
          </div>
        </div>
      </div>

      <nav
        className="border-t border-gray-200 px-4 small:px-5"
        aria-label="Account sections"
      >
        <div className="flex min-w-0 items-center gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon

            return (
              <LocalizedClientLink
                key={tab.href}
                href={tab.href}
                className={`relative inline-flex h-12 shrink-0 items-center gap-2 border-b-2 px-0.5 text-small-semi transition-colors ${
                  tab.isActive
                    ? "border-ui-fg-base text-ui-fg-base"
                    : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                <Icon size={17} />
                <span className="truncate">{tab.label}</span>
              </LocalizedClientLink>
            )
          })}
        </div>
      </nav>

      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <form
            action={profileAction}
            className="max-h-full w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
              <div>
                <h2 className="text-large-semi text-ui-fg-base">
                  {t.account.editProfileTitle}
                </h2>
                <p className="mt-1 text-small-regular text-ui-fg-subtle">
                  {t.account.editProfileSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-ui-fg-base transition-colors hover:bg-gray-50"
                aria-label="Close profile editor"
              >
                <XMarkMini />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4">
              {profileState.error && (
                <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
                  {profileState.error}
                </div>
              )}

              <input
                type="hidden"
                name="avatar_url"
                value={currentAvatarUrl ?? ""}
              />

              <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-5 small:flex-row small:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ui-fg-base text-white">
                  {avatarPreview || currentAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview ?? currentAvatarUrl ?? ""}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl-semi">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-base-semi text-ui-fg-base">
                    {t.account.photoLogo}
                  </div>
                  <p className="mt-1 text-small-regular text-ui-fg-subtle">
                    {t.account.photoLogoSubtitle}
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
                      {t.account.uploadPicture}
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={removeSelectedAvatar}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
                      >
                        <XMarkMini />
                        {t.account.remove}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
                <Input
                  label={t.account.farmName}
                  name="display_name"
                  defaultValue={displayName}
                  required
                />
                <Input
                  label={t.account.handle}
                  name="handle"
                  defaultValue={
                    seller?.handle ??
                    displayName
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "")
                  }
                  required
                />
                <Input
                  label={t.account.emailLabel}
                  name="email"
                  type="email"
                  defaultValue={seller?.email ?? customer?.email ?? ""}
                />
                <Input
                  label={t.account.phoneLabel}
                  name="phone"
                  defaultValue={seller?.phone ?? customer?.phone ?? ""}
                />
                <Input
                  label={t.account.telegramLabel}
                  name="telegram"
                  defaultValue={seller?.telegram ?? ""}
                />
                <Input
                  label={t.account.facebookLabel}
                  name="facebook_url"
                  type="url"
                  defaultValue={seller?.facebook_url ?? ""}
                />
                <label className="relative flex w-full text-small-regular text-ui-fg-subtle">
                  <select
                    name="preferred_contact"
                    defaultValue={seller?.preferred_contact ?? ""}
                    className="h-11 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 pb-1 pt-4 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
                  >
                    <option value="">{t.account.notSpecified}</option>
                    <option value="telegram">{t.account.contactTelegram}</option>
                    <option value="messenger">{t.account.contactMessenger}</option>
                    <option value="phone">{t.account.contactPhone}</option>
                  </select>
                  <span className="pointer-events-none absolute left-3 top-1 text-xsmall-regular">
                    {t.account.preferredContact}
                  </span>
                </label>
                <Input
                  label={t.account.pickupLocation}
                  name="location"
                  defaultValue={seller?.location ?? location ?? ""}
                />
              </div>

              <label className="mt-4 flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                <span>{t.account.bio}</span>
                <textarea
                  name="bio"
                  rows={5}
                  defaultValue={seller?.bio ?? ""}
                  placeholder={t.account.bioPlaceholder}
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-small-semi text-ui-fg-base transition-colors hover:border-ui-fg-base"
              >
                {t.common.cancel}
              </button>
              <SubmitButton data-testid="save-profile-button">
                {t.account.saveProfile}
              </SubmitButton>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default AccountNav
