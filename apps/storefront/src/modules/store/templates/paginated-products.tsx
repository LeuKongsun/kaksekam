import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  category,
  location,
  availability,
  condition,
  q,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  category?: string
  location?: string
  availability?: string
  condition?: string
  q?: string
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    listingCategory: category,
    listingLocation: location,
    listingAvailability: availability,
    listingCondition: condition,
    listingQuery: q,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-base-semi text-ui-fg-base">No listings found</h2>
        <p className="mt-2 text-small-regular text-ui-fg-subtle">
          Try a different keyword, category, or location.
        </p>
      </div>
    )
  }

  return (
    <>
      <ul
        className="grid w-full grid-cols-1 gap-x-5 gap-y-8 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-5 xlarge:grid-cols-6"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
