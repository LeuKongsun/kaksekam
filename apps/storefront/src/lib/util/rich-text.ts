const allowedTags = new Set([
  "a",
  "b",
  "br",
  "div",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
])

const voidTags = new Set(["br"])

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

const escapeAttribute = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

const isSafeHref = (href: string) =>
  /^(https?:\/\/|mailto:|tel:|\/)/i.test(href.trim())

export const sanitizeRichText = (value?: string | null) => {
  if (!value) {
    return ""
  }

  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tag, attrs) => {
      const normalizedTag = tag.toLowerCase()
      const isClosingTag = match.startsWith("</")

      if (!allowedTags.has(normalizedTag)) {
        return ""
      }

      if (isClosingTag) {
        return voidTags.has(normalizedTag) ? "" : `</${normalizedTag}>`
      }

      if (normalizedTag === "a") {
        const hrefMatch = attrs.match(/\shref=(["'])(.*?)\1/i)
        const href = hrefMatch?.[2]?.trim()

        if (!href || !isSafeHref(href)) {
          return "<a>"
        }

        return `<a href="${escapeAttribute(
          href
        )}" target="_blank" rel="noopener noreferrer">`
      }

      return voidTags.has(normalizedTag)
        ? `<${normalizedTag}>`
        : `<${normalizedTag}>`
    })
}

export const richTextToPlainText = (value?: string | null) =>
  decodeHtmlEntities(
    sanitizeRichText(value)
      .replace(/<br>/gi, "\n")
      .replace(/<\/(p|div|li)>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim()
