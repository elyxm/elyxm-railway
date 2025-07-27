import { Migration } from '@mikro-orm/migrations';

export class Migration20250719190012 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "merchant_admin" drop constraint if exists "merchant_admin_email_unique";`);
    this.addSql(`alter table if exists "merchant" drop constraint if exists "merchant_handle_unique";`);
    this.addSql(`create table if not exists "merchant" ("id" text not null, "handle" text not null, "name" text not null, "logo" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "merchant_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_merchant_handle_unique" ON "merchant" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_deleted_at" ON "merchant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "merchant_admin" ("id" text not null, "first_name" text null, "last_name" text null, "email" text not null, "merchant_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "merchant_admin_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_merchant_admin_email_unique" ON "merchant_admin" (email) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_admin_merchant_id" ON "merchant_admin" (merchant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchant_admin_deleted_at" ON "merchant_admin" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "merchant_admin" add constraint "merchant_admin_merchant_id_foreign" foreign key ("merchant_id") references "merchant" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "merchant_admin" drop constraint if exists "merchant_admin_merchant_id_foreign";`);

    this.addSql(`drop table if exists "merchant" cascade;`);

    this.addSql(`drop table if exists "merchant_admin" cascade;`);
  }

}
