"use client"

import { sendListingInquiry } from "@lib/data/listing-inquiries"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type ListingInquiryFormProps = {
  productId: string
  customer?: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
}

const ListingInquiryForm = ({
  productId,
  customer,
}: ListingInquiryFormProps) => {
  const [state, formAction] = useActionState(
    sendListingInquiry.bind(null, productId),
    {
      success: false,
      error: null as string | null,
    }
  )

  return (
    <form
      action={formAction}
      className="rounded-md border border-gray-200 bg-white p-4"
    >
      {state.success && (
        <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-small-regular text-green-700">
          Inquiry sent to the seller.
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-small-regular text-rose-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {!customer && (
          <>
            <Input label="Your name" name="buyer_name" required />
            <Input label="Email" name="buyer_email" type="email" required />
            <Input label="Phone" name="buyer_phone" />
          </>
        )}
        <label className="flex flex-col gap-y-2 text-small-regular text-ui-fg-subtle">
          <span>
            Message<span className="text-rose-500">*</span>
          </span>
          <textarea
            name="message"
            required
            rows={4}
            placeholder="Hi, I am interested in this listing. Is it still available?"
            className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-3 text-ui-fg-base outline-none hover:bg-ui-bg-field-hover focus:shadow-borders-interactive-with-active"
          />
        </label>
        <SubmitButton data-testid="send-inquiry-button">
          Send inquiry
        </SubmitButton>
      </div>
    </form>
  )
}

export default ListingInquiryForm
