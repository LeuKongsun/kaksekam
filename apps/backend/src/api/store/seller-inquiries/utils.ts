type InquiryStatus = "new" | "read" | "replied" | "archived"

export const ALLOWED_INQUIRY_STATUSES = new Set<InquiryStatus>([
  "new",
  "read",
  "replied",
  "archived",
])

export const getInquiryStatusUpdate = (
  status: InquiryStatus,
  now = new Date()
) => ({
  status,
  ...(status === "replied" ? { replied_at: now.toISOString() } : {}),
})
