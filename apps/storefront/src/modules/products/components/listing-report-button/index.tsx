"use client"

import { sdk } from "@lib/config"
import { useTranslation } from "@lib/i18n/context"
import Modal from "@modules/common/components/modal"
import { FormEvent, useState } from "react"

const ListingReportButton = ({ listingId }: { listingId: string }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setIsSubmitting(true)
    setError(null)

    try {
      await sdk.client.fetch("/store/listing-reports", {
        method: "POST",
        body: {
          listing_id: listingId,
          reason: formData.get("reason"),
          details: formData.get("details"),
          reporter_contact: formData.get("reporter_contact"),
        },
      })
      setSubmitted(true)
    } catch {
      setError(t.product.reportError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="self-start text-small-regular text-ui-fg-subtle underline-offset-4 hover:text-ui-fg-base hover:underline"
        onClick={() => setIsOpen(true)}
      >
        {t.product.reportListing}
      </button>
      <Modal isOpen={isOpen} close={() => setIsOpen(false)} size="medium">
        <Modal.Title>{t.product.reportListing}</Modal.Title>
        {submitted ? (
          <div className="py-6 text-small-regular text-ui-fg-subtle">
            {t.product.reportThanks}
          </div>
        ) : (
          <form onSubmit={submitReport} className="flex flex-col gap-4 pt-4">
            <label className="flex flex-col gap-2 text-small-regular text-ui-fg-subtle">
              {t.product.reportReason}
              <select
                name="reason"
                required
                defaultValue=""
                className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none focus:shadow-borders-interactive-with-active"
              >
                <option value="" disabled>{t.product.selectReason}</option>
                <option value="unavailable">{t.product.reportUnavailable}</option>
                <option value="misleading">{t.product.reportMisleading}</option>
                <option value="fraud">{t.product.reportFraud}</option>
                <option value="prohibited">{t.product.reportProhibited}</option>
                <option value="other">{t.product.reportOther}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-small-regular text-ui-fg-subtle">
              {t.product.reportDetails}
              <textarea
                name="details"
                rows={4}
                maxLength={1000}
                className="rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-ui-fg-base outline-none focus:shadow-borders-interactive-with-active"
              />
            </label>
            <label className="flex flex-col gap-2 text-small-regular text-ui-fg-subtle">
              {t.product.reportContact}
              <input
                name="reporter_contact"
                maxLength={200}
                className="h-11 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-ui-fg-base outline-none focus:shadow-borders-interactive-with-active"
              />
            </label>
            {error && <p className="text-small-regular text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-ui-fg-base px-4 text-small-semi text-white disabled:opacity-50"
            >
              {isSubmitting ? t.product.reporting : t.product.submitReport}
            </button>
          </form>
        )}
      </Modal>
    </>
  )
}

export default ListingReportButton
