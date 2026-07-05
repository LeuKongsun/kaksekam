import React from "react"

import AccountNav from "../components/account-nav"
import { getUnreadMessageCount } from "@lib/data/listing-inquiries"
import { retrieveAccountSellerProfile } from "@lib/data/seller-profile"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout = async ({
  customer,
  children,
}: AccountLayoutProps) => {
  const [seller, messageCount] = customer
    ? await Promise.all([
        retrieveAccountSellerProfile(),
        getUnreadMessageCount().catch(() => 0),
      ])
    : [null, 0]

  return (
    <div className="flex-1 bg-[#f6f7f2] py-5 small:py-8" data-testid="account-page">
      <div className="content-container mx-auto flex h-full max-w-6xl flex-1 flex-col gap-5">
        {customer && (
          <AccountNav
            customer={customer}
            seller={seller}
            messageCount={messageCount}
          />
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

export default AccountLayout
