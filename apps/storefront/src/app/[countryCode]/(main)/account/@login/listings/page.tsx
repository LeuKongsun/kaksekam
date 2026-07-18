import LoginTemplate from "@modules/account/templates/login-template"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your marketplace listings.",
}

export default function ListingsLogin() {
  return <LoginTemplate />
}
