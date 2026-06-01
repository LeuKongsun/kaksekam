import LoginTemplate from "@modules/account/templates/login-template"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your seller profile.",
}

export default function SellerProfileLogin() {
  return <LoginTemplate />
}
