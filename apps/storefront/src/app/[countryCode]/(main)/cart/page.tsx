import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Marketplace listings",
  description: "This marketplace does not use cart checkout.",
}

export default async function Cart({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  redirect(`/${countryCode}`)
}
