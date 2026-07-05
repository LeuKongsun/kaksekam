"use client"

import {
  BuyerInquiry,
  InquiryMessage,
  listBuyerInquiries,
  listSellerInquiries,
  replyToBuyerInquiry,
  replyToSellerInquiry,
  SellerInquiry,
  updateBuyerInquiryStatus,
  updateSellerInquiryStatus,
} from "@lib/data/listing-inquiries"
import Package from "@modules/common/icons/package"
import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import { useFormStatus } from "react-dom"

type InboxMessagesProps = {
  sellerInquiries: SellerInquiry[]
  buyerInquiries: BuyerInquiry[]
}

type InboxConversation =
  | {
      id: string
      direction: "received"
      inquiry: SellerInquiry
      participantName: string
      participantDetail: string
      productTitle: string
      productHandle?: string
      thumbnail?: string | null
      latestMessage: InquiryMessage | null
      latestAt: string
      isUnread: boolean
    }
  | {
      id: string
      direction: "sent"
      inquiry: BuyerInquiry
      participantName: string
      participantDetail: string
      productTitle: string
      productHandle?: string
      thumbnail?: string | null
      latestMessage: InquiryMessage | null
      latestAt: string
      isUnread: boolean
    }

const InboxMessages = ({
  sellerInquiries,
  buyerInquiries,
}: InboxMessagesProps) => {
  const router = useRouter()
  const [sellerItems, setSellerItems] = useState(sellerInquiries)
  const [buyerItems, setBuyerItems] = useState(buyerInquiries)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set())
  const [, startTransition] = useTransition()
  const conversations = useMemo(
    () => buildConversations(sellerItems, buyerItems, seenIds),
    [buyerItems, sellerItems, seenIds]
  )
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ??
    conversations[0] ??
    null
  const unreadCount = conversations.filter(
    (conversation) => conversation.isUnread
  ).length
  const refreshInquiries = useCallback(async () => {
    const [nextSellerInquiries, nextBuyerInquiries] = await Promise.all([
      listSellerInquiries(),
      listBuyerInquiries(),
    ])

    setSellerItems(nextSellerInquiries)
    setBuyerItems(nextBuyerInquiries)
  }, [])

  useEffect(() => {
    setSellerItems(sellerInquiries)
  }, [sellerInquiries])

  useEffect(() => {
    setBuyerItems(buyerInquiries)
  }, [buyerInquiries])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") {
        return
      }

      refreshInquiries().catch(() => {})
    }, 5000)

    return () => window.clearInterval(interval)
  }, [refreshInquiries])

  const openConversation = (conversation: InboxConversation) => {
    setActiveId(conversation.id)

    if (conversation.isUnread) {
      setSeenIds((current) => new Set(current).add(conversation.id))
      startTransition(() => {
        if (conversation.direction === "received") {
          updateSellerInquiryStatus(conversation.inquiry.id, "read").then(() =>
            router.refresh()
          )
        } else {
          updateBuyerInquiryStatus(conversation.inquiry.id, "read").then(() =>
            router.refresh()
          )
        }
      })
    }
  }

  return (
    <section
      className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
      data-testid="inbox-messages-page-wrapper"
    >
      <div className="flex flex-col gap-1 border-b border-gray-200 px-4 py-4 small:px-5">
        <h1 className="text-large-semi text-ui-fg-base">Messages</h1>
        <p className="text-small-regular text-ui-fg-subtle">
          {conversations.length} conversations
          {unreadCount > 0 ? `, ${unreadCount} waiting for reply` : ""}
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyInbox />
      ) : (
        <div className="grid min-h-[620px] grid-cols-1 medium:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-gray-200 medium:border-b-0 medium:border-r">
            <div className="max-h-[620px] overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation)}
                  className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    activeConversation?.id === conversation.id
                      ? "bg-[#f5f7f2]"
                      : "bg-white"
                  }`}
                >
                  <ListingThumb
                    thumbnail={conversation.thumbnail}
                    title={conversation.productTitle}
                    unread={conversation.isUnread}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={`truncate ${
                            conversation.isUnread
                              ? "text-base-semi text-ui-fg-base"
                              : "text-base-regular text-ui-fg-base"
                          }`}
                        >
                          {conversation.participantName}
                        </p>
                        <p className="truncate text-small-regular text-ui-fg-subtle">
                          {conversation.productTitle}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-xsmall-semi ${
                            conversation.isUnread
                              ? "text-[#c94f2d]"
                              : "text-ui-fg-muted"
                          }`}
                        >
                          {formatShortDate(conversation.latestAt)}
                        </p>
                        {conversation.isUnread && (
                          <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#c94f2d]" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`mt-1 truncate ${
                        conversation.isUnread
                          ? "text-small-semi text-ui-fg-base"
                          : "text-small-regular text-ui-fg-subtle"
                      }`}
                    >
                      {formatPreview(conversation)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeConversation && (
            <ConversationPane conversation={activeConversation} />
          )}
        </div>
      )}
    </section>
  )
}

const ConversationPane = ({
  conversation,
}: {
  conversation: InboxConversation
}) => {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const messages = conversation.inquiry.messages

  const handleReply = async (formData: FormData) => {
    if (conversation.direction === "received") {
      await replyToSellerInquiry(conversation.inquiry.id, formData)
    } else {
      await replyToBuyerInquiry(conversation.inquiry.id, formData)
    }

    formRef.current?.reset()
    router.refresh()
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <ListingThumb
          thumbnail={conversation.thumbnail}
          title={conversation.productTitle}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base-semi text-ui-fg-base">
            {conversation.participantName}
          </p>
          <p className="truncate text-small-regular text-ui-fg-subtle">
            {conversation.participantDetail}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-[#f6f4ef] px-4 py-4">
        <DateDivider date={formatDate(conversation.inquiry.created_at)} />

        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isOwnMessage =
              conversation.direction === "received"
                ? message.sender_type === "seller"
                : message.sender_type === "buyer"
            const previousMessage = messages[index - 1]
            const shouldShowDate =
              index > 0 &&
              !isSameMessageDay(
                message.created_at,
                previousMessage.created_at
              )

            return (
              <div key={message.id} className="space-y-2.5">
                {shouldShowDate && (
                  <DateDivider date={formatDate(message.created_at)} />
                )}
                <div
                  className={
                    isOwnMessage ? "flex justify-end" : "flex justify-start"
                  }
                >
                  <div
                    className={`max-w-[76%] rounded-2xl px-3 py-2 shadow-sm ${
                      isOwnMessage
                        ? "rounded-tr-md bg-ui-fg-base text-white"
                        : "rounded-tl-md bg-white text-ui-fg-base ring-1 ring-black/5"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-small-regular leading-5">
                      {message.body}
                    </p>
                    <p
                      className={`mt-1 text-[10px] leading-none ${
                        isOwnMessage ? "text-white/60" : "text-ui-fg-muted"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="rounded-full bg-white/70 px-3 py-2 text-center text-xsmall-semi text-ui-fg-muted">
            No messages yet.
          </p>
        )}
      </div>

      <form
        key={conversation.id}
        ref={formRef}
        action={handleReply}
        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
      >
        <label htmlFor={`reply-${conversation.id}`} className="sr-only">
          Write a message
        </label>
        <div className="flex h-11 flex-1 items-center rounded-full border border-gray-200 bg-ui-bg-subtle px-3">
          <input
            id={`reply-${conversation.id}`}
            name="reply_message"
            required
            autoComplete="off"
            className="h-full w-full border-0 bg-transparent px-1 text-small-regular text-ui-fg-base outline-none placeholder:text-ui-fg-muted"
            placeholder="Write a message..."
            type="text"
          />
        </div>
        <SendButton />
      </form>
    </div>
  )
}

const buildConversations = (
  sellerInquiries: SellerInquiry[],
  buyerInquiries: BuyerInquiry[],
  seenIds: Set<string>
): InboxConversation[] => {
  const received = sellerInquiries.map((inquiry): InboxConversation => {
    const latestMessage = getLatestMessage(inquiry)

    return {
      id: `received-${inquiry.id}`,
      direction: "received",
      inquiry,
      participantName: inquiry.buyer_name,
      participantDetail: inquiry.buyer_email,
      productTitle: inquiry.product?.title ?? "Listing unavailable",
      productHandle: inquiry.product?.handle,
      thumbnail: inquiry.product?.thumbnail,
      latestMessage,
      latestAt: inquiry.last_message_at ?? inquiry.created_at,
      isUnread: inquiry.status === "new" && !seenIds.has(`received-${inquiry.id}`),
    }
  })
  const sent = buyerInquiries.map((inquiry): InboxConversation => {
    const latestMessage = getLatestMessage(inquiry)
    const conversationId = `sent-${inquiry.id}`

    return {
      id: conversationId,
      direction: "sent",
      inquiry,
      participantName: inquiry.product?.seller?.display_name ?? "Seller",
      participantDetail:
        inquiry.product?.seller?.handle ?? "Message sent to seller",
      productTitle: inquiry.product?.title ?? "Listing unavailable",
      productHandle: inquiry.product?.handle,
      thumbnail: inquiry.product?.thumbnail,
      latestMessage,
      latestAt: inquiry.last_message_at ?? inquiry.created_at,
      isUnread:
        inquiry.status === "replied" &&
        latestMessage?.sender_type === "seller" &&
        !seenIds.has(conversationId),
    }
  })

  return [...received, ...sent].sort(
    (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
  )
}

const ListingThumb = ({
  thumbnail,
  title,
  unread = false,
}: {
  thumbnail?: string | null
  title?: string | null
  unread?: boolean
}) => (
  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
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
    {unread && (
      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#c94f2d]" />
    )}
  </div>
)

const DateDivider = ({ date }: { date: string }) => (
  <div className="flex justify-center pb-1">
    <span className="rounded-full bg-sky-50 px-3 py-1 text-xsmall-semi text-sky-700 ring-1 ring-sky-100">
      {date}
    </span>
  </div>
)

const EmptyInbox = () => (
  <div className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-ui-bg-subtle text-ui-fg-muted">
      <Package size={28} />
    </div>
    <p className="mt-3 text-base-semi text-ui-fg-base">No messages yet</p>
    <p className="mt-1 max-w-sm text-small-regular text-ui-fg-subtle">
      Buyer and seller conversations will appear here in one inbox.
    </p>
  </div>
)

const SendButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ui-fg-base text-white shadow-sm transition-colors hover:bg-ui-fg-base/90 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Send message"
      title="Send"
      data-testid="reply-inquiry-button"
    >
      <SendIcon />
    </button>
  )
}

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

const getLatestMessage = (inquiry: SellerInquiry | BuyerInquiry) =>
  inquiry.messages[inquiry.messages.length - 1] ?? null

const formatPreview = (conversation: InboxConversation) => {
  const body = conversation.latestMessage?.body ?? "No messages yet."

  if (!conversation.latestMessage) {
    return body
  }

  const isOwnMessage =
    conversation.direction === "received"
      ? conversation.latestMessage.sender_type === "seller"
      : conversation.latestMessage.sender_type === "buyer"

  return isOwnMessage ? `You: ${body}` : body
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value))

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

const isSameMessageDay = (first: string, second: string) =>
  new Date(first).toDateString() === new Date(second).toDateString()

export default InboxMessages
