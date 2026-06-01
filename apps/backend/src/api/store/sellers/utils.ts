type SellerTrustProfile = {
  display_name?: string | null
  handle?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  bio?: string | null
}

type SellerTrustInquiry = {
  status?: string | null
}

export const getProfileCompleteness = (seller: SellerTrustProfile) => {
  const fields = [
    seller.display_name,
    seller.handle,
    seller.email,
    seller.phone,
    seller.location,
    seller.bio,
  ]
  const completed = fields.filter(Boolean).length

  return Math.round((completed / fields.length) * 100)
}

export const getSellerTrustStats = (
  seller: SellerTrustProfile,
  inquiries: SellerTrustInquiry[]
) => {
  const totalInquiries = inquiries.length
  const repliedInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "replied"
  ).length

  return {
    profile_completeness: getProfileCompleteness(seller),
    inquiry_count: totalInquiries,
    replied_inquiry_count: repliedInquiries,
    reply_rate:
      totalInquiries === 0
        ? null
        : Math.round((repliedInquiries / totalInquiries) * 100),
  }
}
