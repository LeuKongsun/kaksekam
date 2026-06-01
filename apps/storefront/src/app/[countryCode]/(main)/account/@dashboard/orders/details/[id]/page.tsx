import { Metadata } from "next"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Marketplace account",
    description: "Order details are disabled on this marketplace platform.",
  }
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params
  redirect(`/${params.countryCode}/account`)
}
