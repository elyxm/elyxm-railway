import { Migration } from '@mikro-orm/migrations';

export class Migration20250731051749 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "cocktail" ("id" text not null, "name" text not null, "description" text null, "instructions" text not null, "abv" integer null, "calories" integer null, "is_alcohol_free" boolean not null default false, "sweetness_level" text check ("sweetness_level" in ('dry', 'off_dry', 'medium_dry', 'medium', 'medium_sweet', 'sweet')) null, "strength_level" text check ("strength_level" in ('low', 'medium', 'high', 'very_high')) null, "owner_type" text check ("owner_type" in ('platform', 'client')) not null default 'platform', "owner_id" text null, "is_public" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cocktail_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cocktail_deleted_at" ON "cocktail" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "ingredient" ("id" text not null, "name" text not null, "category_id" text null, "description" text null, "abv" integer null, "cost_per_unit" integer null, "owner_type" text check ("owner_type" in ('platform', 'client')) not null default 'platform', "owner_id" text null, "is_shared" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ingredient_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ingredient_deleted_at" ON "ingredient" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "cocktail_ingredient" ("id" text not null, "quantity" integer not null, "unit" text check ("unit" in ('ml', 'oz', 'cl', 'dash', 'splash', 'garnish')) not null, "notes" text null, "cocktail_id" text not null, "ingredient_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cocktail_ingredient_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cocktail_ingredient_cocktail_id" ON "cocktail_ingredient" (cocktail_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cocktail_ingredient_ingredient_id" ON "cocktail_ingredient" (ingredient_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cocktail_ingredient_deleted_at" ON "cocktail_ingredient" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "cocktail_ingredient" add constraint "cocktail_ingredient_cocktail_id_foreign" foreign key ("cocktail_id") references "cocktail" ("id") on update cascade;`);
    this.addSql(`alter table if exists "cocktail_ingredient" add constraint "cocktail_ingredient_ingredient_id_foreign" foreign key ("ingredient_id") references "ingredient" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "cocktail_ingredient" drop constraint if exists "cocktail_ingredient_cocktail_id_foreign";`);

    this.addSql(`alter table if exists "cocktail_ingredient" drop constraint if exists "cocktail_ingredient_ingredient_id_foreign";`);

    this.addSql(`drop table if exists "cocktail" cascade;`);

    this.addSql(`drop table if exists "ingredient" cascade;`);

    this.addSql(`drop table if exists "cocktail_ingredient" cascade;`);
  }

}
