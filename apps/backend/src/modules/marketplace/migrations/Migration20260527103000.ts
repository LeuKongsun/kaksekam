import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260527103000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "saved_listing" ("id" text not null, "customer_id" text not null, "product_id" text not null, "listing_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "saved_listing_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_saved_listing_customer_product_unique" ON "saved_listing" ("customer_id", "product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_saved_listing_customer_id" ON "saved_listing" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_saved_listing_product_id" ON "saved_listing" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_saved_listing_deleted_at" ON "saved_listing" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "saved_listing" cascade;`);
  }

}
