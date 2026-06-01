import { MedusaService } from "@medusajs/framework/utils"

import ListingInquiry from "./models/listing-inquiry"
import Listing from "./models/listing"
import SavedListing from "./models/saved-listing"
import SavedSearch from "./models/saved-search"
import Seller from "./models/seller"

class MarketplaceModuleService extends MedusaService({
  Listing,
  ListingInquiry,
  SavedListing,
  SavedSearch,
  Seller,
}) {}

export default MarketplaceModuleService
