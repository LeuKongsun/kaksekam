import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260601140000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "seller" add column if not exists "verification_status" text check ("verification_status" in ('unverified', 'verified')) not null default 'unverified';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "seller" drop column if exists "verification_status";`);
  }

}
