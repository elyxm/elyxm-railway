import { Migration } from '@mikro-orm/migrations';

export class Migration20250731052925 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "role_permission" ("id" text not null, "role_id" text not null, "permission_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "role_permission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_permission_role_id" ON "role_permission" (role_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_permission_permission_id" ON "role_permission" (permission_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_permission_deleted_at" ON "role_permission" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "role_permission" add constraint "role_permission_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade;`);
    this.addSql(`alter table if exists "role_permission" add constraint "role_permission_permission_id_foreign" foreign key ("permission_id") references "permission" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "role_permission" cascade;`);
  }

}
