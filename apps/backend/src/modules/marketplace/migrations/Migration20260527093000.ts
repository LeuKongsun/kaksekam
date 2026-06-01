import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260527093000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "listing" ("id" text not null, "status" text check ("status" in ('draft', 'pending_review', 'active', 'sold', 'rejected', 'expired')) not null default 'draft', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "listing_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_listing_status" ON "listing" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_listing_deleted_at" ON "listing" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "listing" cascade;`);
  }

}
