import { Migration } from '@mikro-orm/migrations';

export class Migration20250731051801 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "role" drop constraint if exists "role_slug_unique";`);
    this.addSql(`alter table if exists "permission" drop constraint if exists "permission_slug_unique";`);
    this.addSql(`create table if not exists "permission" ("id" text not null, "name" text not null, "slug" text not null, "resource" text check ("resource" in ('cocktail', 'ingredient', 'client', 'user', 'role', 'restaurant')) not null, "action" text check ("action" in ('create', 'read', 'update', 'delete', 'manage', 'assign')) not null, "description" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "permission_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_permission_slug_unique" ON "permission" (slug) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_permission_deleted_at" ON "permission" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "role" ("id" text not null, "name" text not null, "slug" text not null, "description" text null, "scope_type" text check ("scope_type" in ('global', 'client')) not null default 'client', "scope_id" text null, "is_global" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "role_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_role_slug_unique" ON "role" (slug) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_deleted_at" ON "role" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "user_role" ("id" text not null, "user_id" text not null, "client_id" text null, "assigned_by" text not null, "role_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "user_role_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_user_role_role_id" ON "user_role" (role_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_user_role_deleted_at" ON "user_role" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "user_role" add constraint "user_role_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "user_role" drop constraint if exists "user_role_role_id_foreign";`);

    this.addSql(`drop table if exists "permission" cascade;`);

    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`drop table if exists "user_role" cascade;`);
  }

}
