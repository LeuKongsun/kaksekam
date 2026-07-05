import { Migration } from "@medusajs/framework/mikro-orm/migrations"

const OLD_LISTING_COLUMNS = [
  "availability",
  "contact_preference",
  "variety",
  "production_method",
  "harvest_date",
  "breed",
  "age",
  "sex",
  "health_notes",
  "brand",
  "equipment_model",
  "year",
  "pack_size",
  "expiry_date",
  "service_area",
]

const CURRENT_LISTING_COLUMNS = [
  "category",
  "location",
  "quantity",
  "unit",
  "condition",
]

export class Migration20260705110000 extends Migration {
  override async up(): Promise<void> {
    for (const column of OLD_LISTING_COLUMNS) {
      this.addSql(
        `alter table if exists "listing" drop column if exists "${column}";`
      )
    }

    this.addSql(
      `alter table if exists "saved_search" drop column if exists "availability";`
    )

    for (const column of CURRENT_LISTING_COLUMNS) {
      this.addSql(
        `update "listing" set "${column}" = null where "${column}" is not null and btrim("${column}") = '';`
      )
    }

    this.addSql(
      `update "listing" set "status" = 'expired' where "category" is null and "status" in ('draft', 'pending_review', 'active', 'rejected');`
    )
    this.addSql(
      `update "seller" set "location" = null where "location" is not null and btrim("location") = '';`
    )
    this.addSql(
      `update "saved_search" set "location" = null where "location" is not null and btrim("location") = '';`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "saved_search" add column if not exists "availability" text null;`
    )
  }
}
