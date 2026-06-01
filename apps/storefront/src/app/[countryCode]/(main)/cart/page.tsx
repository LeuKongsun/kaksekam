import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Marketplace listings",
  description: "This marketplace does not use cart checkout.",
}

export default async function Cart() {
  return (
    <div className="content-container py-24 min-h-[50vh]">
      <div className="max-w-xl flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Marketplace listings do not use checkout</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          This platform is for posting and browsing marketplace listings.
          Contact sellers directly to ask questions and arrange next steps
          privately.
        </p>
        <LocalizedClientLink
          href="/store"
          className="text-ui-fg-base underline underline-offset-4"
        >
          Browse listings
        </LocalizedClientLink>
      </div>
    </div>
  )
}
