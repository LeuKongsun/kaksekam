import { Button, Container, Text } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"
import { getTranslations } from "@lib/i18n/server"

async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_kaksekam_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  const { t } = await getTranslations()
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const adminUrl = `${backendUrl.replace(/\/$/, "")}/app`

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          {t.product.onboardingCreated}
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          {t.product.onboardingSetup}
        </Text>
        <a href={`${adminUrl.replace(/\/$/, "")}/marketplace`}>
          <Button className="w-full">{t.product.onboardingBtn}</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
