import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260602100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "listing" add column if not exists "variety" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "production_method" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "harvest_date" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "breed" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "age" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "sex" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "health_notes" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "brand" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "equipment_model" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "year" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "pack_size" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "expiry_date" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "service_area" text null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "reviewed_at" timestamptz null;`);
    this.addSql(`alter table if exists "listing" add column if not exists "reviewer_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "listing" drop column if exists "reviewer_id";`);
    this.addSql(`alter table if exists "listing" drop column if exists "reviewed_at";`);
    this.addSql(`alter table if exists "listing" drop column if exists "service_area";`);
    this.addSql(`alter table if exists "listing" drop column if exists "expiry_date";`);
    this.addSql(`alter table if exists "listing" drop column if exists "pack_size";`);
    this.addSql(`alter table if exists "listing" drop column if exists "year";`);
    this.addSql(`alter table if exists "listing" drop column if exists "equipment_model";`);
    this.addSql(`alter table if exists "listing" drop column if exists "brand";`);
    this.addSql(`alter table if exists "listing" drop column if exists "health_notes";`);
    this.addSql(`alter table if exists "listing" drop column if exists "sex";`);
    this.addSql(`alter table if exists "listing" drop column if exists "age";`);
    this.addSql(`alter table if exists "listing" drop column if exists "breed";`);
    this.addSql(`alter table if exists "listing" drop column if exists "harvest_date";`);
    this.addSql(`alter table if exists "listing" drop column if exists "production_method";`);
    this.addSql(`alter table if exists "listing" drop column if exists "variety";`);
  }

}
