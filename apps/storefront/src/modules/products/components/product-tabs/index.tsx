"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Listing details",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "How to arrange",
      component: <ContactInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ContactInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        <div>
          <span className="font-semibold">Contact the seller</span>
          <p className="max-w-sm">
            Ask questions, confirm the listing is still available, and arrange
            inspection details directly with the seller.
          </p>
        </div>
        <div>
          <span className="font-semibold">Arrange privately</span>
          <p className="max-w-sm">
            Payment, pickup, delivery, and handover are arranged between buyer
            and seller outside this platform.
          </p>
        </div>
        <div>
          <span className="font-semibold">Stay safe</span>
          <p className="max-w-sm">
            Meet in a safe place, check the item carefully, and avoid sending
            money before you are comfortable with the arrangement.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
