import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260527100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "seller" add column if not exists "customer_id" text null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_seller_customer_id_unique" ON "seller" ("customer_id") WHERE deleted_at IS NULL AND customer_id IS NOT NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_seller_customer_id_unique";`);
    this.addSql(`alter table if exists "seller" drop column if exists "customer_id";`);
  }

}
