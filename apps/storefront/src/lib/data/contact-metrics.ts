"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type SellerContactMetrics = {
  total: number
  telegram: number
  messenger: number
  phone: number
  last_14_days: number
}

const EMPTY_METRICS: SellerContactMetrics = {
  total: 0,
  telegram: 0,
  messenger: 0,
  phone: 0,
  last_14_days: 0,
}

export const retrieveSellerContactMetrics =
  async (): Promise<SellerContactMetrics> => {
    const headers = await getAuthHeaders()

    if (!headers.authorization) {
      return EMPTY_METRICS
    }

    return sdk.client
      .fetch<{ metrics: SellerContactMetrics }>("/store/seller-contact-metrics", {
        method: "GET",
        headers,
        cache: "no-store",
      })
      .then(({ metrics }) => metrics)
      .catch(() => EMPTY_METRICS)
  }
