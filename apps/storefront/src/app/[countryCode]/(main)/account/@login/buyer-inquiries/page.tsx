import LoginTemplate from "@modules/account/templates/login-template"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to view your buyer inquiries.",
}

export default function BuyerInquiriesLogin() {
  return <LoginTemplate />
}
