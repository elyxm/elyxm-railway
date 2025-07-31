import { Migration } from '@mikro-orm/migrations';

export class Migration20250731051732 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "client" drop constraint if exists "client_slug_unique";`);
    this.addSql(`create table if not exists "client" ("id" text not null, "name" text not null, "slug" text not null, "plan_type" text not null default 'basic', "max_restaurants" integer not null default 1, "max_custom_recipes" integer not null default 100, "settings" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "client_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_client_slug_unique" ON "client" (slug) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_client_deleted_at" ON "client" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "client_restaurant" ("id" text not null, "client_id" text not null, "restaurant_id" text not null, "role" text not null default 'member', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "client_restaurant_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_client_restaurant_client_id" ON "client_restaurant" (client_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_client_restaurant_deleted_at" ON "client_restaurant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "client_restaurant" add constraint "client_restaurant_client_id_foreign" foreign key ("client_id") references "client" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "client_restaurant" drop constraint if exists "client_restaurant_client_id_foreign";`);

    this.addSql(`drop table if exists "client" cascade;`);

    this.addSql(`drop table if exists "client_restaurant" cascade;`);
  }

}
