import { redirect } from "next/navigation"

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const nextParams = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          nextParams.append(key, item)
        }
      })
      return
    }

    if (value) {
      nextParams.set(key, value)
    }
  })

  const query = nextParams.toString()

  redirect(`/${params.countryCode}${query ? `?${query}` : ""}`)
}
