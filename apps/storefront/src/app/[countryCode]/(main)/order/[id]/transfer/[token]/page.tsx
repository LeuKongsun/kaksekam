import { redirect } from "next/navigation"

export default async function TransferPage({
  params,
}: {
  params: Promise<{ countryCode: string; id: string; token: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/account`)
}
