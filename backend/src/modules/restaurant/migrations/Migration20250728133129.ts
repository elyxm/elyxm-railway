import { Migration } from '@mikro-orm/migrations';

export class Migration20250728133129 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "restaurant_admin" drop constraint if exists "restaurant_admin_email_unique";`);
    this.addSql(`alter table if exists "restaurant" drop constraint if exists "restaurant_handle_unique";`);
    this.addSql(`alter table if exists "restaurant" alter column "phone" type text using ("phone"::text);`);
    this.addSql(`alter table if exists "restaurant" alter column "phone" drop not null;`);
    this.addSql(`alter table if exists "restaurant" alter column "email" type text using ("email"::text);`);
    this.addSql(`alter table if exists "restaurant" alter column "email" drop not null;`);
    this.addSql(`alter table if exists "restaurant" alter column "address" type text using ("address"::text);`);
    this.addSql(`alter table if exists "restaurant" alter column "address" drop not null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_restaurant_handle_unique" ON "restaurant" (handle) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" type text using ("first_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" drop not null;`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" type text using ("last_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" drop not null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_restaurant_admin_email_unique" ON "restaurant_admin" (email) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_restaurant_handle_unique";`);

    this.addSql(`alter table if exists "restaurant" alter column "phone" type text using ("phone"::text);`);
    this.addSql(`alter table if exists "restaurant" alter column "phone" set not null;`);
    this.addSql(`alter table if exists "restaurant" alter column "email" type text using ("email"::text);`);
    this.addSql(`alter table if exists "restaurant" alter column "email" set not null;`);
    this.addSql(`alter table if exists "restaurant" alter column "address" type text using ("address"::text);`);
    this.addSql(`alter table if exists "restaurant" alter column "address" set not null;`);

    this.addSql(`drop index if exists "IDX_restaurant_admin_email_unique";`);

    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" type text using ("first_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" set not null;`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" type text using ("last_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" set not null;`);
  }

}
