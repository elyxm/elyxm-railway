import { Migration } from '@mikro-orm/migrations';

export class Migration20250731165541 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "invitation" drop constraint if exists "invitation_token_unique";`);
    this.addSql(`create table if not exists "invitation" ("id" text not null, "email" text not null, "token" text not null, "client_id" text not null, "role_id" text null, "inviter_id" text not null, "status" text check ("status" in ('pending', 'accepted', 'expired')) not null default 'pending', "expires_at" timestamptz null, "accepted_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "invitation_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invitation_token_unique" ON "invitation" (token) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_invitation_deleted_at" ON "invitation" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "invitation" cascade;`);
  }

}
