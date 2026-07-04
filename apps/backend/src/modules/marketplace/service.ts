import { MedusaService } from "@medusajs/framework/utils"

import ListingInquiry from "./models/listing-inquiry"
import ListingInquiryMessage from "./models/listing-inquiry-message"
import Listing from "./models/listing"
import SavedListing from "./models/saved-listing"
import SavedSearch from "./models/saved-search"
import Seller from "./models/seller"

class MarketplaceModuleService extends MedusaService({
  Listing,
  ListingInquiry,
  ListingInquiryMessage,
  SavedListing,
  SavedSearch,
  Seller,
}) {}

export default MarketplaceModuleService
