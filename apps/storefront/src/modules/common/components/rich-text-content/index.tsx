import { sanitizeRichText } from "@lib/util/rich-text"
import type { HTMLAttributes } from "react"

type RichTextContentProps = Omit<HTMLAttributes<HTMLDivElement>, "content"> & {
  content?: string | null
  fallback?: string
}

const RichTextContent = ({
  content,
  fallback = "No description added.",
  className,
  ...props
}: RichTextContentProps) => {
  const html = sanitizeRichText(content)

  if (!html) {
    return (
      <p className={className} {...props}>
        {fallback}
      </p>
    )
  }

  return (
    <div
      {...props}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default RichTextContent
