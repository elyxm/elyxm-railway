import { Migration } from '@mikro-orm/migrations';

export class Migration20250731142645 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "permission" drop constraint if exists "permission_resource_check";`);
    this.addSql(`alter table if exists "permission" drop constraint if exists "permission_action_check";`);

    this.addSql(`alter table if exists "permission" add constraint "permission_resource_check" check("resource" in ('cocktail', 'ingredient', 'client', 'user', 'role', 'restaurant', 'import', 'analytics'));`);
    this.addSql(`alter table if exists "permission" add constraint "permission_action_check" check("action" in ('create', 'read', 'update', 'delete', 'manage', 'assign', 'grant', 'revoke', 'import', 'export'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "permission" drop constraint if exists "permission_resource_check";`);
    this.addSql(`alter table if exists "permission" drop constraint if exists "permission_action_check";`);

    this.addSql(`alter table if exists "permission" add constraint "permission_resource_check" check("resource" in ('cocktail', 'ingredient', 'client', 'user', 'role', 'restaurant'));`);
    this.addSql(`alter table if exists "permission" add constraint "permission_action_check" check("action" in ('create', 'read', 'update', 'delete', 'manage', 'assign'));`);
  }

}
