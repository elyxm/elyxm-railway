# 🧪 User Testing Instructions

## 1. Seed RBAC System

- Initialize the permission framework
- `curl -X POST http://localhost:9000/admin/rbac/seed -H "Authorization: Bearer <admin_token>"`
- Expected: 33 permissions and 6 roles created successfully

## 2. Check Permission Status

_Verify RBAC setup_

- `curl -X GET http://localhost:9000/admin/rbac/seed -H "Authorization: Bearer <admin_token>"`
- Expected: Summary showing permissions: 33, roles: 6, platformRoles: 2, clientRoles: 4

## 3. Test User Permissions

- Get current user's permissions and feature flags
- `curl -X GET "http://localhost:9000/admin/permissions/me?client_id=cli_test123" -H "Authorization: Bearer <user_token>"`
- Expected: JSON with permissions array, featureFlags object, and role information

## 4. Test Permission Middleware

- Try accessing protected cocktail endpoint without permission
- `curl -X GET http://localhost:9000/admin/cocktails -H "Authorization: Bearer <limited_user_token>"`
- Expected: 403 Forbidden with specific permission requirement

## 5. Test Role Assignment

- Assign role to user in client context

```typescript
const rbacService = container.resolve(RBAC_MODULE);
await rbacService.assignRoleToUser("user_123", "role_client-admin", "cli_test123", "admin_user");
```

- Verify user now has permissions

```typescript
const permissions = await rbacService.getUserPermissions("user_123", "cli_test123");
console.log("User permissions:", permissions);
```

## 6. Test Feature Flags

- Check feature flags for UI components

```typescript
const response = await fetch("/admin/permissions/me?client_id=cli_test123");
const { featureFlags } = await response.json();
```

- Use in React components

```typescript
{
  featureFlags.canCreateCocktails && <button>Create New Cocktail</button>;
}

{
  featureFlags.isPlatformUser && <AdminPanel />;
}
```
