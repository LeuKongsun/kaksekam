import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { StoreTranslations } from "@lib/i18n/translations"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 20

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
  labels,
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
  labels: StoreTranslations
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
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
        <h2 className="text-base-semi text-ui-fg-base">
          {labels.noListingsTitle}
        </h2>
        <p className="mt-2 text-small-regular text-ui-fg-subtle">
          {labels.noListingsDescription}
        </p>
      </div>
    )
  }

  return (
    <>
      <ul
        className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-x-3 gap-y-5 small:grid-cols-3 small:gap-x-5 small:gap-y-7 medium:grid-cols-4"
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
