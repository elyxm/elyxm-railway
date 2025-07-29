import { Migration } from '@mikro-orm/migrations';

export class Migration20250729000542 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "restaurant_admin" add column if not exists "phone" text null;`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" type text using ("first_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" set not null;`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" type text using ("last_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "restaurant_admin" drop column if exists "phone";`);

    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" type text using ("first_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "first_name" drop not null;`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" type text using ("last_name"::text);`);
    this.addSql(`alter table if exists "restaurant_admin" alter column "last_name" drop not null;`);
  }

}
