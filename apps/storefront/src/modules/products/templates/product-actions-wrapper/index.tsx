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
      productId={product.id}
      region={region}
      seller={seller}
    />
  )
}
