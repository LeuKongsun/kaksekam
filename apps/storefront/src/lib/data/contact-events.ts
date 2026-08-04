"use client"

import { sdk } from "@lib/config"

export type ContactChannel = "telegram" | "messenger" | "phone"

export const trackContactClick = (
  listingId: string,
  channel: ContactChannel
) => {
  return sdk.client
    .fetch(`/store/contact-events`, {
      method: "POST",
      body: {
        listing_id: listingId,
        channel,
        referrer: window.location.href,
      },
    })
    .catch(() => null)
}
