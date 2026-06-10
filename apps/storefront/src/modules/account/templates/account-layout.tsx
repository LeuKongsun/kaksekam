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
    <div className="flex-1 bg-[#f7f8f4] small:py-10" data-testid="account-page">
      <div className="content-container mx-auto flex h-full max-w-6xl flex-1 flex-col">
        <div className="pt-8 small:pt-0">
          <h1 className="text-2xl-semi text-ui-fg-base">Your marketplace</h1>
          <p className="mt-2 max-w-2xl text-base-regular text-ui-fg-subtle">
            A simple place to manage listings, messages, saved posts, and your
            contact details.
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-6 py-7 small:grid-cols-[236px_minmax(0,1fr)]">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
