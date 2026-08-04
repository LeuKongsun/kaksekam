import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260803193000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "seller" add column if not exists "telegram" text null;`
    )
    this.addSql(
      `alter table if exists "seller" add column if not exists "facebook_url" text null;`
    )
    this.addSql(
      `alter table if exists "seller" add column if not exists "preferred_contact" text check ("preferred_contact" in ('telegram', 'messenger', 'phone')) null;`
    )
    this.addSql(
      `alter table if exists "listing" add column if not exists "district" text null, add column if not exists "minimum_order" text null, add column if not exists "availability" text null, add column if not exists "production_method" text null, add column if not exists "contact_preference" text check ("contact_preference" in ('telegram', 'messenger', 'phone')) null, add column if not exists "negotiable" boolean not null default false, add column if not exists "expires_at" timestamptz null, add column if not exists "refreshed_at" timestamptz null;`
    )
    this.addSql(
      `create table if not exists "contact_event" ("id" text not null, "listing_id" text not null, "seller_id" text not null, "channel" text check ("channel" in ('telegram', 'messenger', 'phone')) not null, "referrer" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "contact_event_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_contact_event_listing_id" ON "contact_event" ("listing_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_contact_event_seller_id" ON "contact_event" ("seller_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_contact_event_created_at" ON "contact_event" ("created_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `create table if not exists "listing_report" ("id" text not null, "listing_id" text not null, "seller_id" text not null, "reason" text check ("reason" in ('unavailable', 'misleading', 'fraud', 'prohibited', 'other')) not null, "details" text null, "reporter_contact" text null, "status" text check ("status" in ('new', 'resolved', 'dismissed')) not null default 'new', "resolution_note" text null, "reviewed_by" text null, "reviewed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "listing_report_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_listing_report_listing_id" ON "listing_report" ("listing_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_listing_report_status" ON "listing_report" ("status") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_event" cascade;`)
    this.addSql(`drop table if exists "listing_report" cascade;`)
    this.addSql(
      `alter table if exists "listing" drop column if exists "district", drop column if exists "minimum_order", drop column if exists "availability", drop column if exists "production_method", drop column if exists "contact_preference", drop column if exists "negotiable", drop column if exists "expires_at", drop column if exists "refreshed_at";`
    )
    this.addSql(
      `alter table if exists "seller" drop column if exists "preferred_contact";`
    )
    this.addSql(
      `alter table if exists "seller" drop column if exists "facebook_url";`
    )
    this.addSql(
      `alter table if exists "seller" drop column if exists "telegram";`
    )
  }
}
