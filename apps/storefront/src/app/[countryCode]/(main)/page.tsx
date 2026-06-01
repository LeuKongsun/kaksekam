import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Browse listings",
  description: "Explore active farming listings and contact sellers directly.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    category?: string
    location?: string
  }>
  params: Promise<{ countryCode: string }>
}

export default async function Home(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, category, location } = searchParams

  if (!params.countryCode) {
    return null
  }

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      category={category}
      location={location}
      countryCode={params.countryCode}
    />
  )
}
