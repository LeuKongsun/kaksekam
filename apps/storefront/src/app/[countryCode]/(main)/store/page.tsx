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
    q?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, category, location, q } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      category={category}
      location={location}
      q={q}
      countryCode={params.countryCode}
    />
  )
}
