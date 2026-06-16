"use client"

import { Button } from "@modules/common/components/ui"
import { FormEvent, useEffect, useMemo, useState } from "react"

type ProductComment = {
  id: string
  customerId: string
  author: string
  body: string
  createdAt: string
  helpful: number
}

type CommentCustomer = {
  id: string
  name: string
  email: string
}

type CommentSectionProps = {
  productId: string
  productTitle: string
  countryCode: string
  customer: CommentCustomer | null
}

const makeStorageKey = (productId: string) =>
  `medusa-storefront:product-comments:${productId}`

const CommentSection = ({
  productId,
  productTitle,
  countryCode,
  customer,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<ProductComment[]>([])
  const [body, setBody] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const storageKey = useMemo(() => makeStorageKey(productId), [productId])

  useEffect(() => {
    try {
      const storedComments = window.localStorage.getItem(storageKey)

      if (storedComments) {
        const parsedComments = JSON.parse(storedComments) as ProductComment[]
        setComments(
          parsedComments.filter((comment) => Boolean(comment.customerId)),
        )
      }
    } catch {
      setStatus("Comments are available, but saved drafts could not load.")
    }
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(comments))
    } catch {
      setStatus("Your comment was added, but could not be saved locally.")
    }
  }, [comments, storageKey])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    const trimmedBody = body.trim()

    if (!customer) {
      setStatus("Sign in before posting a comment.")
      return
    }

    if (!trimmedBody) {
      setStatus("Add a comment before posting.")
      return
    }

    const nextComment: ProductComment = {
      id: `comment-${Date.now()}`,
      customerId: customer.id,
      author: customer.name,
      body: trimmedBody,
      createdAt: "Just now",
      helpful: 0,
    }

    setComments((currentComments) => [nextComment, ...currentComments])
    setBody("")
    setStatus("Comment posted.")
  }

  const markHelpful = (commentId: string) => {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, helpful: comment.helpful + 1 }
          : comment,
      ),
    )
  }

  return (
    <section
      className="mx-auto w-full max-w-[1120px] border-t border-ui-border-base py-8"
      aria-labelledby="product-comments-heading"
      data-testid="product-comments"
    >
      <div className="mb-5 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
        <div>
          <h2
            id="product-comments-heading"
            className="text-xl-semi text-ui-fg-base"
          >
            Comments on {productTitle}
          </h2>
          <p className="mt-1 max-w-2xl text-small-regular text-ui-fg-subtle">
            Ask a question or share a practical note before contacting the
            seller.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-small-regular text-ui-fg-subtle">
          <span>
            <span className="text-ui-fg-base">{comments.length}</span> comments
          </span>
          <span>
            <span className="text-ui-fg-base">
              {comments.reduce((total, comment) => total + comment.helpful, 0)}
            </span>{" "}
            helpful
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 large:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          {customer ? (
            <form
              onSubmit={handleSubmit}
              className="rounded-md border border-ui-border-base bg-white p-4"
            >
              <div className="mb-4 rounded-md bg-ui-bg-subtle px-3 py-2 text-small-regular text-ui-fg-subtle">
                Posting as{" "}
                <span className="text-ui-fg-base">{customer.name}</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
                  <span>
                    Comment <span className="text-rose-500">*</span>
                  </span>
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
                    placeholder="Share a question or field note about this listing."
                  />
                </label>
                <div className="flex flex-col gap-3 small:items-start">
                  {status ? (
                    <p className="text-small-regular text-ui-fg-subtle">
                      {status}
                    </p>
                  ) : (
                    <p className="text-small-regular text-ui-fg-muted">
                      Saved in this browser.
                    </p>
                  )}
                  <Button type="submit" size="small" className="small:w-auto">
                    Post comment
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-md border border-ui-border-base bg-white p-4">
              <h3 className="text-base-semi text-ui-fg-base">
                Sign in to comment
              </h3>
              <p className="mt-1 text-small-regular text-ui-fg-subtle">
                Comments are linked to marketplace accounts.
              </p>
              <a
                href={`/${countryCode}/account`}
                className="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-black px-3 text-small-regular font-medium text-white transition-colors hover:bg-gray-800"
              >
                Sign in
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-md border border-ui-border-base bg-white p-4"
              >
                <div className="flex flex-col gap-3 small:flex-row small:items-start small:justify-between">
                  <div>
                    <h3 className="text-base-semi text-ui-fg-base">
                      {comment.author}
                    </h3>
                    <p className="text-small-regular text-ui-fg-muted">
                      {comment.createdAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => markHelpful(comment.id)}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-ui-border-base px-3 text-small-regular text-ui-fg-subtle transition-colors hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                    aria-label={`Mark ${comment.author}'s comment as helpful`}
                  >
                    Helpful ({comment.helpful})
                  </button>
                </div>
                <p className="mt-3 text-base-regular leading-7 text-ui-fg-base">
                  {comment.body}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-ui-border-base bg-white p-4 text-small-regular text-ui-fg-subtle">
              No comments yet. Be the first account to add a note.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CommentSection
