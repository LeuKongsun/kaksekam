import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Browse listings",
  description: "Browse farming listings from local farmers and suppliers.",
}

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams

  return (
    <StoreTemplate
      sortBy={getParam(searchParams.sortBy) as SortOptions | undefined}
      page={getParam(searchParams.page)}
      category={getParam(searchParams.category)}
      location={getParam(searchParams.location)}
      condition={getParam(searchParams.condition)}
      q={getParam(searchParams.q)}
      countryCode={params.countryCode}
    />
  )
}

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value
