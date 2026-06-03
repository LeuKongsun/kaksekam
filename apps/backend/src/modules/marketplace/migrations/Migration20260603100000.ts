import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260603100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "saved_search" add column if not exists "availability" text null;`)
    this.addSql(`alter table if exists "saved_search" add column if not exists "condition" text null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "saved_search" drop column if exists "condition";`)
    this.addSql(`alter table if exists "saved_search" drop column if exists "availability";`)
  }
}
