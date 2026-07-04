import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Marketplace listings",
  description: "Checkout is disabled on this marketplace platform.",
}

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}`)
}
