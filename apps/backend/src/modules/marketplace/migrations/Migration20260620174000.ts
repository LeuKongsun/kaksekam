import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260620174000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "listing_inquiry" add column if not exists "seller_reply" text null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "listing_inquiry" drop column if exists "seller_reply";`)
  }
}
