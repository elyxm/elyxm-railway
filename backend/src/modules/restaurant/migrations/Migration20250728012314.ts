import { Migration } from '@mikro-orm/migrations';

export class Migration20250728012314 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "restaurant" ("id" text not null, "handle" text not null, "is_open" boolean not null default false, "name" text not null, "description" text null, "phone" text not null, "email" text not null, "address" text not null, "image_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restaurant_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restaurant_deleted_at" ON "restaurant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "restaurant_admin" ("id" text not null, "first_name" text not null, "last_name" text not null, "email" text not null, "avatar_url" text null, "restaurant_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restaurant_admin_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restaurant_admin_restaurant_id" ON "restaurant_admin" (restaurant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_restaurant_admin_deleted_at" ON "restaurant_admin" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "restaurant_admin" add constraint "restaurant_admin_restaurant_id_foreign" foreign key ("restaurant_id") references "restaurant" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "restaurant_admin" drop constraint if exists "restaurant_admin_restaurant_id_foreign";`);

    this.addSql(`drop table if exists "restaurant" cascade;`);

    this.addSql(`drop table if exists "restaurant_admin" cascade;`);
  }

}
