import { Metadata } from "next"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}
export const metadata: Metadata = {
  title: "Marketplace listings",
  description: "Order confirmation is disabled on this marketplace platform.",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  redirect(`/${params.countryCode}`)
}
