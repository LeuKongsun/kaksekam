import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260619113000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "seller" add column if not exists "avatar_url" text null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "seller" drop column if exists "avatar_url";`)
  }
}
