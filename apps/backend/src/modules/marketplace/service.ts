import { MedusaService } from "@medusajs/framework/utils"

import ContactEvent from "./models/contact-event"
import ListingInquiry from "./models/listing-inquiry"
import ListingInquiryMessage from "./models/listing-inquiry-message"
import ListingReport from "./models/listing-report"
import Listing from "./models/listing"
import SavedListing from "./models/saved-listing"
import SavedSearch from "./models/saved-search"
import Seller from "./models/seller"

class MarketplaceModuleService extends MedusaService({
  ContactEvent,
  Listing,
  ListingInquiry,
  ListingInquiryMessage,
  ListingReport,
  SavedListing,
  SavedSearch,
  Seller,
}) {}

export default MarketplaceModuleService
