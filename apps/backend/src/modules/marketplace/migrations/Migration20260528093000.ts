import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260528093000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "listing" add column if not exists "moderation_note" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "listing" drop column if exists "moderation_note";`);
  }

}
