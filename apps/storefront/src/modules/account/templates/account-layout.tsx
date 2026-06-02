import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 bg-gray-50 small:py-12" data-testid="account-page">
      <div className="content-container mx-auto flex h-full max-w-6xl flex-1 flex-col">
        <div className="pt-8 small:pt-0">
          <p className="text-small-semi uppercase text-ui-fg-muted">
            Marketplace workspace
          </p>
          <h1 className="mt-2 text-2xl-semi text-ui-fg-base">
            Manage buying, selling, and inquiries
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-8 py-8 small:grid-cols-[220px_1fr]">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
