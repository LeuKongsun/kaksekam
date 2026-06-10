import { Heading, Text } from "@medusajs/ui"
import { ReactNode } from "react"

type OpsPageProps = {
  title: string
  subtitle: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
}

export const OpsPage = ({
  title,
  subtitle,
  eyebrow = "Marketplace operations",
  actions,
  children,
}: OpsPageProps) => (
  <div className="flex flex-col gap-y-6">
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base shadow-elevation-card-rest">
      <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Text className="text-ui-fg-subtle" size="small" weight="plus">
            {eyebrow}
          </Text>
          <Heading className="mt-1">{title}</Heading>
          <Text className="mt-1 max-w-[720px] text-ui-fg-subtle" size="small">
            {subtitle}
          </Text>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
    {children}
  </div>
)

export const OpsSection = ({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) => (
  <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-elevation-card-rest">
    {(title || subtitle || actions) && (
      <div className="flex flex-col gap-3 border-b border-ui-border-base px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          {title && <Heading level="h2">{title}</Heading>}
          {subtitle && (
            <Text className="mt-1 text-ui-fg-subtle" size="small">
              {subtitle}
            </Text>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
)

export const SignalCard = ({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string
  value: number | string
  detail?: string
  tone?: "neutral" | "attention" | "success" | "danger"
}) => {
  const toneClass = {
    neutral: "border-ui-border-base bg-ui-bg-subtle",
    attention: "border-ui-tag-orange-border bg-ui-tag-orange-bg",
    success: "border-ui-tag-green-border bg-ui-tag-green-bg",
    danger: "border-ui-tag-red-border bg-ui-tag-red-bg",
  }[tone]

  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <Text className="text-ui-fg-subtle" size="small">
        {label}
      </Text>
      <Text className="mt-2 text-ui-fg-base" size="xlarge" weight="plus">
        {value}
      </Text>
      {detail && (
        <Text className="mt-1 text-ui-fg-subtle" size="small">
          {detail}
        </Text>
      )}
    </div>
  )
}

export const FilterPanel = ({ children }: { children: ReactNode }) => (
  <div className="border-y border-ui-border-base bg-ui-bg-subtle">
    {children}
  </div>
)

export const EmptyState = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div className="px-6 py-12 text-center">
    <Text weight="plus">{title}</Text>
    <Text className="mt-1 text-ui-fg-subtle" size="small">
      {description}
    </Text>
  </div>
)
