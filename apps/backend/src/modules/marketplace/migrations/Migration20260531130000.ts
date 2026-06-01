import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260531130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "listing_inquiry" ("id" text not null, "listing_id" text not null, "product_id" text not null, "seller_id" text not null, "customer_id" text null, "buyer_name" text not null, "buyer_email" text not null, "buyer_phone" text null, "message" text not null, "status" text check ("status" in ('new', 'read', 'archived')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "listing_inquiry_pkey" primary key ("id"));`);
    this.addSql(`create index if not exists "IDX_listing_inquiry_listing_id" on "listing_inquiry" ("listing_id") where deleted_at is null;`);
    this.addSql(`create index if not exists "IDX_listing_inquiry_product_id" on "listing_inquiry" ("product_id") where deleted_at is null;`);
    this.addSql(`create index if not exists "IDX_listing_inquiry_seller_id" on "listing_inquiry" ("seller_id") where deleted_at is null;`);
    this.addSql(`create index if not exists "IDX_listing_inquiry_deleted_at" on "listing_inquiry" ("deleted_at") where deleted_at is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "listing_inquiry" cascade;`);
  }

}
