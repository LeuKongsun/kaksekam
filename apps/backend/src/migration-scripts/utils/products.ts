const PRODUCT_PAGE_SIZE = 100

type ProductGraph = (queryConfig: {
  entity: "product"
  fields: string[]
  pagination: {
    skip: number
    take: number
  }
}) => Promise<{
  data: { id: string }[]
  metadata?: {
    count: number
  }
}>

export async function listAllProductIds(
  graph: ProductGraph
): Promise<{ id: string }[]> {
  const products: { id: string }[] = []
  let skip = 0
  let totalCount: number | undefined
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const { data, metadata } = await graph({
      entity: "product",
      fields: ["id"],
      pagination: {
        skip,
        take: PRODUCT_PAGE_SIZE,
      },
    })

    products.push(...data)
    totalCount = metadata?.count
    skip += data.length

    hasMoreProducts =
      data.length > 0 &&
      (totalCount === undefined
        ? products.length > 0 && products.length % PRODUCT_PAGE_SIZE === 0
        : products.length < totalCount)
  }

  return products
}
