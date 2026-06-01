import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260601130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "saved_search" ("id" text not null, "customer_id" text not null, "name" text not null, "query" text null, "category" text null, "location" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "saved_search_pkey" primary key ("id"));`);
    this.addSql(`create index if not exists "IDX_saved_search_customer_id" on "saved_search" ("customer_id") where deleted_at is null;`);
    this.addSql(`create index if not exists "IDX_saved_search_deleted_at" on "saved_search" ("deleted_at") where deleted_at is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "saved_search" cascade;`);
  }

}
