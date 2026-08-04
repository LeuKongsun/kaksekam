import { listProducts, retrieveProductSeller } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
  customer: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
}) {
  const isMockProduct = id.startsWith("mock-product-")
  const [product, seller] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    isMockProduct ? Promise.resolve(null) : retrieveProductSeller(id),
  ])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      seller={seller}
    />
  )
}
