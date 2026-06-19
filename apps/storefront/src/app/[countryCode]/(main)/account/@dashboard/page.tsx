import { redirect } from "next/navigation"

export default async function AccountDashboardPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  redirect(`/${params.countryCode}/account/listings`)
}
