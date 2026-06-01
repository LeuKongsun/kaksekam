export const slugifySellerHandle = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const cleanOptionalText = (value?: string) => {
  const cleaned = value?.trim()

  return cleaned || null
}
