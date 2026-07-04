import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260621120500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "listing_inquiry_message" ("id" text not null, "inquiry_id" text not null, "sender_type" text check ("sender_type" in ('buyer', 'seller')) not null, "sender_id" text null, "body" text not null, "read_at" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "listing_inquiry_message_pkey" primary key ("id"));`)
    this.addSql(`create index if not exists "IDX_listing_inquiry_message_inquiry_id" on "listing_inquiry_message" ("inquiry_id") where deleted_at is null;`)
    this.addSql(`create index if not exists "IDX_listing_inquiry_message_deleted_at" on "listing_inquiry_message" ("deleted_at") where deleted_at is null;`)
    this.addSql(`alter table if exists "listing_inquiry" add column if not exists "last_message_at" text null;`)

    this.addSql(`
      insert into "listing_inquiry_message" ("id", "inquiry_id", "sender_type", "sender_id", "body", "created_at", "updated_at")
      select
        'li_msg_' || md5(inquiry.id || ':buyer'),
        inquiry.id,
        'buyer',
        inquiry.customer_id,
        inquiry.message,
        inquiry.created_at,
        inquiry.created_at
      from "listing_inquiry" inquiry
      where inquiry.deleted_at is null
        and inquiry.message is not null
        and not exists (
          select 1 from "listing_inquiry_message" message
          where message.inquiry_id = inquiry.id
            and message.sender_type = 'buyer'
            and message.deleted_at is null
        );
    `)

    this.addSql(`
      insert into "listing_inquiry_message" ("id", "inquiry_id", "sender_type", "sender_id", "body", "created_at", "updated_at")
      select
        'li_msg_' || md5(inquiry.id || ':seller:' || replies.ordinality::text),
        inquiry.id,
        'seller',
        inquiry.seller_id,
        replies.body,
        coalesce(inquiry.replied_at::timestamptz, inquiry.updated_at),
        coalesce(inquiry.replied_at::timestamptz, inquiry.updated_at)
      from "listing_inquiry" inquiry
      cross join lateral regexp_split_to_table(coalesce(inquiry.seller_reply, ''), E'\\\\n\\\\n+') with ordinality as replies(body, ordinality)
      where inquiry.deleted_at is null
        and nullif(trim(replies.body), '') is not null
        and not exists (
          select 1 from "listing_inquiry_message" message
          where message.id = 'li_msg_' || md5(inquiry.id || ':seller:' || replies.ordinality::text)
        );
    `)

    this.addSql(`
      update "listing_inquiry" inquiry
      set "last_message_at" = coalesce(
        (
          select max(message.created_at)::text
          from "listing_inquiry_message" message
          where message.inquiry_id = inquiry.id
            and message.deleted_at is null
        ),
        inquiry.updated_at::text
      )
      where inquiry.deleted_at is null;
    `)

    this.addSql(`alter table if exists "listing_inquiry" drop column if exists "seller_reply";`)
    this.addSql(`alter table if exists "listing_inquiry" drop column if exists "message";`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "listing_inquiry" add column if not exists "message" text null;`)
    this.addSql(`alter table if exists "listing_inquiry" add column if not exists "seller_reply" text null;`)

    this.addSql(`
      update "listing_inquiry" inquiry
      set "message" = coalesce(
        (
          select message.body
          from "listing_inquiry_message" message
          where message.inquiry_id = inquiry.id
            and message.sender_type = 'buyer'
            and message.deleted_at is null
          order by message.created_at asc
          limit 1
        ),
        ''
      );
    `)

    this.addSql(`
      update "listing_inquiry" inquiry
      set "seller_reply" = (
        select string_agg(message.body, E'\\n\\n' order by message.created_at asc)
        from "listing_inquiry_message" message
        where message.inquiry_id = inquiry.id
          and message.sender_type = 'seller'
          and message.deleted_at is null
      );
    `)

    this.addSql(`alter table if exists "listing_inquiry" alter column "message" set not null;`)
    this.addSql(`alter table if exists "listing_inquiry" drop column if exists "last_message_at";`)
    this.addSql(`drop table if exists "listing_inquiry_message" cascade;`)
  }
}
