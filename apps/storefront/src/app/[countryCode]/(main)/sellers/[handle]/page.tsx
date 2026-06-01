import { retrieveSellerProfile } from "@lib/data/sellers"
import SellerProfileTemplate from "@modules/sellers/templates/seller-profile"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const profile = await retrieveSellerProfile(handle)

  if (!profile) {
    return {
      title: "Farmer profile",
    }
  }

  return {
    title: `${profile.seller.display_name} | Farmer profile`,
    description:
      profile.seller.bio ??
      `View active farming listings from ${profile.seller.display_name}.`,
  }
}

export default async function SellerPage(props: Props) {
  const { handle } = await props.params
  const profile = await retrieveSellerProfile(handle)

  if (!profile) {
    notFound()
  }

  return <SellerProfileTemplate profile={profile} />
}
