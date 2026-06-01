import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260531120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "listing" add column if not exists "category" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "location" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "quantity" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "unit" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "availability" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "condition" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "contact_preference" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "listing" drop column if exists "contact_preference";`);
    this.addSql(`alter table if exists "listing" drop column if exists "condition";`);
    this.addSql(`alter table if exists "listing" drop column if exists "availability";`);
    this.addSql(`alter table if exists "listing" drop column if exists "unit";`);
    this.addSql(`alter table if exists "listing" drop column if exists "quantity";`);
    this.addSql(`alter table if exists "listing" drop column if exists "location";`);
    this.addSql(`alter table if exists "listing" drop column if exists "category";`);
  }

}
