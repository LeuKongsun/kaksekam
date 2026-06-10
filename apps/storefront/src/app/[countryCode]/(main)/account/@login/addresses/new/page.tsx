import LoginTemplate from "@modules/account/templates/login-template"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to add a marketplace contact address.",
}

export default function NewAddressLogin() {
  return <LoginTemplate />
}
