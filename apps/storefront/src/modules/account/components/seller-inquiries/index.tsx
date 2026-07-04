"use client"

import {
  replyToSellerInquiry,
  SellerInquiry,
  updateSellerInquiryStatus,
} from "@lib/data/listing-inquiries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import Package from "@modules/common/icons/package"
import { useMemo, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

type SellerInquiriesProps = {
  inquiries: SellerInquiry[]
}

const statusLabels: Record<SellerInquiry["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
}

const SellerInquiries = ({ inquiries }: SellerInquiriesProps) => {
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null)
  const openCount = inquiries.filter(
    (inquiry) => inquiry.status !== "archived"
  ).length
  const newCount = inquiries.filter((inquiry) => inquiry.status === "new").length
  const repliedCount = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length
  const activeInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === activeInquiryId) ?? null,
    [activeInquiryId, inquiries]
  )

  return (
    <div className="w-full" data-testid="seller-inquiries-page-wrapper">
      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 p-4">
          <h1 className="text-large-semi text-ui-fg-base">Messages</h1>
          <p className="text-small-regular text-ui-fg-subtle">
            {inquiries.length} total, {openCount} open, {newCount} new,{" "}
            {repliedCount} replied.
          </p>
        </div>

        <div className="w-full max-w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr className="text-xsmall-semi font-medium uppercase text-ui-fg-subtle">
                  <th className="w-[30%] px-4 py-3">Listing</th>
                  <th className="w-[20%] px-4 py-3">Buyer</th>
                  <th className="w-[22%] px-4 py-3">Message</th>
                  <th className="w-[12%] px-4 py-3">Status</th>
                  <th className="w-[16%] px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16">
                      <EmptyState label="No buyer messages yet." />
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => (
                    <SellerInquiryRow
                      key={inquiry.id}
                      inquiry={inquiry}
                      isActive={inquiry.id === activeInquiryId}
                      onOpenChat={() => setActiveInquiryId(inquiry.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {activeInquiry && (
        <SellerInquiryChatWindow
          inquiry={activeInquiry}
          onClose={() => setActiveInquiryId(null)}
        />
      )}
    </div>
  )
}

const SellerInquiryRow = ({
  inquiry,
  isActive,
  onOpenChat,
}: {
  inquiry: SellerInquiry
  isActive: boolean
  onOpenChat: () => void
}) => {
  const latestMessage = getLatestMessage(inquiry)

  return (
    <tr
      className={`transition-colors ${
        isActive
          ? "bg-gray-50"
          : inquiry.status === "new"
            ? "bg-[#fff8f6] hover:bg-[#fff1ed]"
            : "bg-white hover:bg-gray-50/70"
      }`}
    >
    <td className="px-4 py-3 align-middle">
      <div className="flex min-w-0 gap-3">
        <ListingThumb
          thumbnail={inquiry.product?.thumbnail}
          title={inquiry.product?.title}
        />
        <div className="min-w-0">
          {inquiry.product ? (
            <LocalizedClientLink
              href={`/products/${inquiry.product.handle}`}
              className="block truncate text-base-semi text-ui-fg-base hover:text-ui-fg-interactive"
            >
              {inquiry.product.title}
            </LocalizedClientLink>
          ) : (
            <div className="truncate text-base-semi">Listing unavailable</div>
          )}
          <div className="truncate text-small-regular text-ui-fg-subtle">
            {formatDate(inquiry.created_at)}
          </div>
        </div>
      </div>
    </td>
    <td className="px-4 py-3 align-middle">
      <div className="truncate text-base-semi text-ui-fg-base">
        {inquiry.buyer_name}
      </div>
      <div className="truncate text-small-regular text-ui-fg-subtle">
        {inquiry.buyer_email}
      </div>
    </td>
    <td className="px-4 py-3 align-middle">
      <p className="truncate text-small-regular text-ui-fg-base">
        {latestMessage?.body ?? "No messages yet."}
      </p>
    </td>
    <td className="px-4 py-3 align-middle">
      <StatusBadge status={inquiry.status} />
    </td>
    <td className="px-4 py-3 align-middle">
      <SellerInquiryActions inquiry={inquiry} onOpenChat={onOpenChat} />
    </td>
  </tr>
  )
}

const SellerInquiryActions = ({
  inquiry,
  onOpenChat,
}: {
  inquiry: SellerInquiry
  onOpenChat: () => void
}) => (
  <div className="flex items-center justify-end gap-2">
    <button
      type="button"
      className={iconActionClass}
      title="Open chat"
      aria-label={`Open chat with ${inquiry.buyer_name}`}
      onClick={onOpenChat}
    >
      <ReplyIcon />
    </button>
    {inquiry.buyer_phone && (
      <a
        href={`tel:${inquiry.buyer_phone.replace(/[^\d+]/g, "")}`}
        className={iconActionClass}
        title="Call"
        aria-label="Call"
      >
        <PhoneIcon />
      </a>
    )}
    <form
      action={updateSellerInquiryStatus.bind(
        null,
        inquiry.id,
        inquiry.status === "archived"
          ? getSellerMessages(inquiry).length > 0
            ? "replied"
            : "read"
          : "archived"
      )}
    >
      <button
        type="submit"
        className={iconActionClass}
        title={inquiry.status === "archived" ? "Restore" : "Archive"}
        aria-label={inquiry.status === "archived" ? "Restore" : "Archive"}
      >
        <Eye size={16} />
      </button>
    </form>
  </div>
)

const SellerInquiryChatWindow = ({
  inquiry,
  onClose,
}: {
  inquiry: SellerInquiry
  onClose: () => void
}) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleReply = async (formData: FormData) => {
    await replyToSellerInquiry(inquiry.id, formData)
    formRef.current?.reset()
  }

  return (
    <aside
      className="fixed bottom-0 right-4 z-50 flex h-[min(620px,calc(100vh-5rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.22)] sm:right-8"
      aria-label={`Chat with ${inquiry.buyer_name}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-ui-fg-base px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-small-semi">{inquiry.buyer_name}</p>
          <p className="truncate text-xsmall-semi text-white/70">
            {inquiry.product?.title ?? "Listing inquiry"}
          </p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#f6f4ef] px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/80 p-3">
          <ListingThumb
            thumbnail={inquiry.product?.thumbnail}
            title={inquiry.product?.title}
          />
          <div className="min-w-0">
            <p className="truncate text-small-semi text-ui-fg-base">
              {inquiry.product?.title ?? "Listing unavailable"}
            </p>
            <p className="text-xsmall-semi text-ui-fg-subtle">
              Started {formatDate(inquiry.created_at)}
            </p>
          </div>
        </div>

        {inquiry.messages.length > 0 ? (
          inquiry.messages.map((message) => (
            <div
              key={message.id}
              className={
                message.sender_type === "seller"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender_type === "seller"
                    ? "rounded-tr-md bg-ui-fg-base text-white"
                    : "rounded-tl-md bg-white text-ui-fg-base ring-1 ring-black/5"
                }`}
              >
                <div
                  className={`text-xsmall-semi font-medium uppercase tracking-wide ${
                    message.sender_type === "seller"
                      ? "text-white/70"
                      : "text-ui-fg-muted"
                  }`}
                >
                  {message.sender_type === "seller" ? "You" : inquiry.buyer_name}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-small-regular">
                  {message.body}
                </p>
                <p
                  className={`mt-2 text-xsmall-semi ${
                    message.sender_type === "seller"
                      ? "text-white/60"
                      : "text-ui-fg-muted"
                  }`}
                >
                  {formatDateTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-full bg-white/70 px-3 py-2 text-center text-xsmall-semi text-ui-fg-muted">
            No messages yet.
          </p>
        )}
      </div>

      <form
        key={inquiry.id}
        ref={formRef}
        action={handleReply}
        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
      >
        <label htmlFor={`reply-${inquiry.id}`} className="sr-only">
          Reply in messages
        </label>
        <div className="flex h-11 flex-1 items-center rounded-full border border-gray-200 bg-ui-bg-subtle px-3">
          <input
            type="text"
            id={`reply-${inquiry.id}`}
            name="reply_message"
            required
            autoComplete="off"
            className="h-full w-full border-0 bg-transparent px-1 text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted"
            placeholder="Write a message..."
          />
        </div>
        <SendButton />
      </form>
    </aside>
  )
}

const ListingThumb = ({
  thumbnail,
  title,
}: {
  thumbnail?: string | null
  title?: string | null
}) => (
  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-gray-100">
    {thumbnail ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnail}
        alt={title ?? "Listing"}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-ui-fg-muted">
        <Package size={18} />
      </div>
    )}
  </div>
)

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center text-center text-ui-fg-muted">
    <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle">
      <Package size={28} />
    </div>
    <p className="mt-3 text-small-semi text-ui-fg-base">No data</p>
    <p className="mt-1 text-small-regular text-ui-fg-subtle">{label}</p>
  </div>
)

const getLatestMessage = (inquiry: SellerInquiry) =>
  inquiry.messages[inquiry.messages.length - 1] ?? null

const getSellerMessages = (inquiry: SellerInquiry) =>
  inquiry.messages.filter((message) => message.sender_type === "seller")

const StatusBadge = ({ status }: { status: SellerInquiry["status"] }) => (
  <span
    className={`inline-flex rounded-md border px-2.5 py-1 text-small-semi ${
      status === "new"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "replied"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-gray-200 bg-gray-50 text-ui-fg-subtle"
    }`}
  >
    {statusLabels[status]}
  </span>
)

const SendButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ui-fg-base text-white shadow-sm transition-colors hover:bg-ui-fg-base/90 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Send reply"
      title="Send"
      data-testid="reply-inquiry-button"
    >
      <SendIcon />
    </button>
  )
}

const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.5 4.5h9v6h-5L4 13v-2.5h-.5v-6Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M3 9 15 3.5 12.7 15 9 10.8 5.5 13.5 6.9 9.9 3 9Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m9 10.8 2.4-3.3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M5.1 3.2 6.3 5.8 5.2 7c.7 1.5 1.8 2.6 3.3 3.3l1.2-1.1 2.6 1.2-.4 2.2c-.1.4-.4.7-.8.7-4.6-.1-8.3-3.8-8.4-8.4 0-.4.3-.7.7-.8l1.7-.9Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="m4.5 4.5 7 7m0-7-7 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

const iconActionClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-ui-fg-base transition-colors hover:bg-gray-50 hover:text-ui-fg-interactive"

export default SellerInquiries
