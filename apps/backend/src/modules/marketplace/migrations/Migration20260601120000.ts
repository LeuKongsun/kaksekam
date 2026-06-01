import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260601120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "listing_inquiry" drop constraint if exists "listing_inquiry_status_check";`);
    this.addSql(`alter table if exists "listing_inquiry" add constraint "listing_inquiry_status_check" check ("status" in ('new', 'read', 'replied', 'archived'));`);
    this.addSql(`alter table if exists "listing_inquiry" add column if not exists "replied_at" text null;`);
    this.addSql(`create index if not exists "IDX_listing_inquiry_customer_id" on "listing_inquiry" ("customer_id") where deleted_at is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "listing_inquiry" drop constraint if exists "listing_inquiry_status_check";`);
    this.addSql(`alter table if exists "listing_inquiry" add constraint "listing_inquiry_status_check" check ("status" in ('new', 'read', 'archived'));`);
    this.addSql(`alter table if exists "listing_inquiry" drop column if exists "replied_at";`);
    this.addSql(`drop index if exists "IDX_listing_inquiry_customer_id";`);
  }

}
