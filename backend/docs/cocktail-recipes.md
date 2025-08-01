# Cocktail Recipe Management System - Implementation Plan

## Project Overview

This document outlines the implementation of a comprehensive **multi-tenant** cocktail recipe management system inspired by Difford's Guide. The system supports complex filtering, ingredient management, user interactions, recipe importing capabilities, and sophisticated role-based access control (RBAC) across multiple clients.

## System Architecture

### Multi-Tenant Hybrid 3-Tier Design

1. **Tier 1: Core Recipe Data** - Direct database columns for performance-critical fields
2. **Tier 2: Structured Relationships** - Normalized tables for ingredients, user interactions, and multi-tenancy
3. **Tier 3: Flexible Metadata** - Generic system for tags, classifications, and extensible attributes

### Multi-Tenancy Features

- **Client Management**: Platform team manages clients and their restaurants
- **User Roles & Permissions**: Sophisticated RBAC with platform-managed roles
- **Recipe Ownership**: Platform recipes (public/restricted) + Client recipes (restaurant-scoped)
- **Ingredient Management**: Platform ingredients + Client-specific ingredients
- **Access Controls**: Feature/functionality access based on user roles

### Key Features

- Advanced filtering system (9 category types)
- Multi-tenant ingredient management with ownership
- User ratings and personal lists per client context
- Recipe import from external sources
- Role-based feature access control
- Client invitation and user management system
- DataTable UI (leveraging existing patterns)

---

## AI Code Assistant Context

### Project Status

- **Base System**: MedusaJS 2.0 e-commerce platform
- **Existing Modules**: Restaurant management, delivery system
- **UI Pattern**: DataTable components with professional admin interface
- **Database**: PostgreSQL with MikroORM
- **Admin SDK**: @medusajs/admin-sdk with custom routes and components
- **Multi-Tenancy**: Shared database with sophisticated access controls

### Current Codebase Patterns

```
backend/src/
├── modules/
│   ├── restaurant/     # Reference implementation
│   ├── delivery/       # Reference implementation
│   ├── cocktail/       # NEW MODULE (to be built)
│   ├── client/         # NEW MODULE (multi-tenancy)
│   └── rbac/           # NEW MODULE (role-based access control)
├── admin/
│   ├── routes/         # Custom admin pages (platform & client contexts)
│   ├── components/     # Reusable UI components
│   └── hooks/          # Data fetching hooks with tenant awareness
└── api/
    └── admin/          # API endpoints with access control
```

### Established Patterns

- **DataTable**: Uses @medusajs/ui with built-in search, filtering, sorting, pagination
- **API Structure**: RESTful endpoints with query parameter support
- **Admin Routes**: React components with defineRouteConfig
- **Data Fetching**: Custom hooks with debounced search and optimistic updates

### Multi-Tenancy Patterns (To Be Established)

- **Tenant Context**: Client-aware data access and UI rendering
- **RBAC Integration**: Role-based feature visibility and access control
- **Access Control**: Middleware for API endpoint protection
- **User Management**: Invitation system and role assignment

---

## Starter Prompt for New AI Conversations

```
I'm implementing a sophisticated multi-tenant cocktail recipe management system in a MedusaJS 2.0 application.

**Project Context:**
- Building a cocktail recipe module inspired by Difford's Guide
- Multi-tenant architecture with clients, restaurants, and sophisticated RBAC
- Using DataTable patterns already established in the codebase
- 3-tier architecture: Core data + Structured relationships + Flexible metadata
- Focus on performance, maintainability, import capabilities, and access control

**Multi-Tenancy Requirements:**
- Platform team manages clients, roles, and platform recipes
- Clients can create custom recipes and ingredients for their restaurants
- Sophisticated role-based access control with platform-managed roles
- Shared database with logical access controls

**Established Patterns:**
- DataTable components with professional admin UI
- Server-side filtering/search with debounced frontend
- MikroORM models with proper relationships
- RESTful API design with query parameter support

**Request:**
- Please proceed with Task 2.3 as described below
  - This should be mostly an admin ui related task as the API should be in place
  - Create role management admin interface
  - Permission assignment interface for roles
  - Client-specific role scoping interface
  - User role assignment for platform admins
  - **User Testing**: Platform admins can manage roles and permissions

**Approach:**
- Please follow the existing code patterns in the restaurant and delivery modules
- Leverage the DataTable implementations for consistent UI/UX
- Provide the user instructions for verifying functionality at the established "User Testing" tasks
- *VERY IMPORTANT:* Stay focused on the core task
```

---

## Implementation Phases

## Phase 1: Multi-Tenancy Foundation & Core Models

**Goal**: Establish multi-tenant database schema, RBAC system, and basic models

### [x] Task 1.1: Multi-Tenancy Schema Design

- [x] Create migration files for client and user management tables
- [x] Create migration files for RBAC system (roles, permissions, assignments)
- [x] Create migration files for core cocktail tables with ownership
- [x] Set up proper indexes for performance and tenant isolation
- [x] **User Testing**: Verify schema creation and basic tenant queries

### [x] Task 1.2: Client & User Management Models

- [x] Create `backend/src/modules/client/models/client.ts`
- [x] Create `backend/src/modules/client/models/client-restaurant.ts`
- [x] Create `backend/src/modules/rbac/models/role.ts`
- [x] Create `backend/src/modules/rbac/models/permission.ts`
- [x] Create `backend/src/modules/rbac/models/user-role.ts`
- [x] Define TypeScript types for multi-tenancy
- [x] **User Testing**: Create test clients, roles, and user assignments

### [x] Task 1.3: Core Cocktail Models with Ownership

- [x] Create `backend/src/modules/cocktail/models/cocktail.ts` with ownership fields
- [x] Create `backend/src/modules/cocktail/models/ingredient.ts` with client ownership
- [x] Create `backend/src/modules/cocktail/models/cocktail-ingredient.ts`
- [x] Create access control models for recipes and ingredients
- [x] **User Testing**: Create platform and client recipes with different ownership

### [x] Task 1.4: Basic Multi-Tenant Services

- [x] Implement `backend/src/modules/client/service.ts`
- [x] Implement `backend/src/modules/rbac/service.ts`
- [x] Implement `backend/src/modules/cocktail/service.ts` with tenant-aware methods
- [x] Basic CRUD operations with access control
- [x] **User Testing**: Service methods respect tenant boundaries

**🧪 Phase 1 Testing Checkpoint**

- Database tables exist with proper multi-tenant relationships
- Can create/manage clients, roles, and user assignments
- Recipe and ingredient ownership models work correctly
- Access control prevents cross-tenant data access
- Basic tenant-aware services function properly

---

## Phase 2: RBAC System & Access Control

**Goal**: Implement comprehensive role-based access control and permission system

### [x] Task 2.1: Permission Framework

- [x] Define core permissions for cocktail management features
- [x] Create permission checking middleware for API endpoints
- [x] Implement role-based feature flags for UI components
- [x] Create permission inheritance system (global vs client-scoped roles)
- [x] **User Testing**: Permissions correctly control access to features

### [x] Task 2.2: User Invitation System

- [x] Create user invitation workflow and models
- [x] Implement email invitation system
- [x] Create user registration/onboarding flow
- [x] Role assignment during invitation process
- [x] **User Testing**: Can invite users and assign roles properly

### [ ] Task 2.3: Platform Admin RBAC Interface

- [ ] Create role management admin interface
- [ ] Permission assignment interface for roles
- [ ] Client-specific role scoping interface
- [ ] User role assignment for platform admins
- [ ] **User Testing**: Platform admins can manage roles and permissions

### [ ] Task 2.4: Client Context & Role Assignment

- [ ] Client admin interface for user management
- [ ] Role assignment interface (assign only, not create)
- [ ] User list with role visibility per client
- [ ] **User Testing**: Client admins can assign available roles to their users

**🧪 Phase 2 Testing Checkpoint**

- RBAC system fully functional with proper access controls
- Platform admins can create and manage roles
- Client admins can assign but not create roles
- Permission system correctly controls feature access
- User invitation and onboarding system works

---

## Phase 3: Basic Admin Interface with Tenant Awareness

**Goal**: Create functional admin pages with multi-tenant context and role-based access

### [ ] Task 3.1: Tenant-Aware API Endpoints

- [ ] Create `backend/src/api/admin/clients/route.ts` (platform admin only)
- [ ] Create `backend/src/api/admin/cocktails/route.ts` with tenant filtering
- [ ] Create `backend/src/api/admin/ingredients/route.ts` with ownership control
- [ ] Implement access control middleware for all endpoints
- [ ] **User Testing**: API endpoints respect tenant boundaries and permissions

### [ ] Task 3.2: Platform Admin Interface

- [ ] Create `backend/src/admin/routes/clients/page.tsx` (client management)
- [ ] Create `backend/src/admin/routes/platform-cocktails/page.tsx`
- [ ] Create platform ingredient management interface
- [ ] Role and permission management interfaces
- [ ] **User Testing**: Platform admins can manage all tenant data

### [ ] Task 3.3: Client Admin Context

- [ ] Create client-scoped cocktail management interface
- [ ] Create client-scoped ingredient management
- [ ] Client user management and role assignment
- [ ] Restaurant assignment interface for client recipes
- [ ] **User Testing**: Client admins see only their data and available actions

### [ ] Task 3.4: Data Hooks with Tenancy

- [ ] Create tenant-aware hooks `useCocktails()`, `useIngredients()`
- [ ] Implement role-based feature visibility hooks
- [ ] Client context hooks for UI rendering
- [ ] Permission checking hooks for component access
- [ ] **User Testing**: UI correctly renders based on user context and permissions

**🧪 Phase 3 Testing Checkpoint**

- Platform and client admin interfaces work correctly
- Data isolation between tenants is enforced
- Role-based UI rendering functions properly
- Users can only access features they have permissions for
- Search, sort, and pagination work within tenant context

---

## Phase 4: Advanced Recipe & Ingredient Management

**Goal**: Implement complex ingredient relationships, recipe creation, and ownership controls

### [ ] Task 4.1: Multi-Tenant Ingredient System

- [ ] Platform vs client ingredient ownership
- [ ] Ingredient sharing controls (platform ingredients visible to all)
- [ ] Client-specific ingredient categories
- [ ] Ingredient access control for recipe creation
- [ ] **User Testing**: Ingredient ownership and visibility work correctly

### [ ] Task 4.2: Recipe Builder with Access Controls

- [ ] Tenant-aware recipe creation interface
- [ ] Restaurant assignment for client recipes
- [ ] Platform recipe visibility controls (public/restricted)
- [ ] Ingredient selection respecting ownership rules
- [ ] **User Testing**: Recipe creation respects all access controls

### [ ] Task 4.3: Recipe Access Management

- [ ] Platform recipe distribution to clients
- [ ] Client recipe restaurant assignment
- [ ] Recipe visibility matrix (platform admin view)
- [ ] Access revocation and modification
- [ ] **User Testing**: Recipe access controls work as intended

### [ ] Task 4.4: Measurement & Category Systems

- [ ] Standardized measurement system across tenants
- [ ] Ingredient category management (platform vs client)
- [ ] Recipe validation with tenant-specific rules
- [ ] **User Testing**: Recipe building works smoothly with all controls

**🧪 Phase 4 Testing Checkpoint**

- Complex recipe creation works within tenant boundaries
- Ingredient ownership and sharing function correctly
- Recipe access controls are properly enforced
- Platform team can distribute recipes to specific clients
- Client teams can create recipes for their restaurants only

---

## Phase 5: Metadata System & Advanced Filtering

**Goal**: Implement flexible metadata system with tenant-aware filtering

### [ ] Task 5.1: Multi-Tenant Metadata Infrastructure

- [ ] Tenant-scoped metadata categories and values
- [ ] Platform vs client metadata ownership
- [ ] Metadata inheritance and sharing rules
- [ ] **User Testing**: Metadata system handles tenant isolation

### [ ] Task 5.2: User Interaction System with Tenancy

- [ ] Tenant-scoped rating system
- [ ] Personal lists within client context
- [ ] User preferences per tenant
- [ ] **User Testing**: User interactions are properly isolated

### [ ] Task 5.3: Advanced Filtering with Access Control

- [ ] Multi-category filter system respecting ownership
- [ ] Tenant-aware filter options
- [ ] Role-based filter availability
- [ ] Complex filter combinations within tenant scope
- [ ] **User Testing**: Filtering works correctly within tenant boundaries

### [ ] Task 5.4: Classification System with Tenancy

- [ ] Platform vs client classification systems
- [ ] Tenant-specific allergen tracking
- [ ] Custom classification categories per client
- [ ] **User Testing**: Classifications respect tenant boundaries

**🧪 Phase 5 Testing Checkpoint**

- Advanced filtering system works within tenant context
- All filter categories respect access controls
- User interactions are properly tenant-scoped
- Classification system is flexible and secure

---

## Phase 6: Import System & External Integration

**Goal**: Enable importing recipes with tenant assignment and access control

### [ ] Task 6.1: Multi-Tenant Import Framework

- [ ] Import job system with tenant assignment
- [ ] Platform vs client import workflows
- [ ] Access control for import operations
- [ ] **User Testing**: Import system respects tenant boundaries

### [ ] Task 6.2: Platform Recipe Import

- [ ] Bulk import of platform recipes
- [ ] Client assignment during import
- [ ] Recipe visibility control during import
- [ ] **User Testing**: Platform team can import and assign recipes

### [ ] Task 6.3: Client Recipe Import

- [ ] Client-scoped import capabilities
- [ ] Restaurant assignment during import
- [ ] Client permission requirements for imports
- [ ] **User Testing**: Clients can import recipes within their scope

### [ ] Task 6.4: Import Management with RBAC

- [ ] Role-based import permissions
- [ ] Import history per tenant
- [ ] Import conflict resolution with access controls
- [ ] **User Testing**: Import management respects all access controls

**🧪 Phase 6 Testing Checkpoint**

- Import system works correctly for both platform and client contexts
- Recipe assignment and access controls function during import
- Import permissions are properly enforced
- Data quality is maintained across tenant boundaries

---

## Phase 7: Polish, Optimization & Advanced Features

**Goal**: Finalize system with performance optimization, advanced features, and production readiness

### [ ] Task 7.1: Performance Optimization with Tenancy

- [ ] Database query optimization for multi-tenant queries
- [ ] Index analysis for tenant-scoped data
- [ ] Caching strategy with tenant isolation
- [ ] **User Testing**: System performs well with large multi-tenant datasets

### [ ] Task 7.2: Advanced Admin Features

- [ ] Tenant analytics and reporting
- [ ] Bulk operations with access control
- [ ] Advanced user management features
- [ ] System monitoring and health checks
- [ ] **User Testing**: Advanced features work correctly and securely

### [ ] Task 7.3: Security & Compliance

- [ ] Security audit of access controls
- [ ] Data export/import for tenant migration
- [ ] GDPR compliance features (data deletion, export)
- [ ] Audit logging for sensitive operations
- [ ] **User Testing**: Security features work as intended

### [ ] Task 7.4: Documentation & Training

- [ ] Platform admin documentation
- [ ] Client admin user guides
- [ ] API documentation with access control notes
- [ ] Role-based feature documentation
- [ ] **User Testing**: Documentation is comprehensive and accurate

**🧪 Final Testing Checkpoint**

- Complete multi-tenant system is performant, secure, and stable
- All access controls function correctly
- Role-based features work as designed
- System is ready for production deployment
- Documentation supports both platform and client users

---

## Testing Strategy

### Multi-Tenant Testing Focus

- **Tenant Isolation**: Verify clients cannot access other client data
- **Role-Based Access**: Confirm permissions control feature access
- **Cross-Tenant Scenarios**: Test platform recipe distribution
- **Scale Testing**: Performance with multiple tenants and large datasets

### Manual Testing Points

- After each task: Feature-specific testing with different user roles
- After each phase: Cross-tenant integration testing
- Regular security testing throughout development
- Performance testing with realistic multi-tenant data volumes

### Automated Testing

- Unit tests for service layer methods with tenant context
- API endpoint testing with various permission levels
- Integration tests for complex multi-tenant workflows
- Performance benchmarks with tenant isolation

### User Acceptance Testing

- Platform admin workflows (manage clients, roles, recipes)
- Client admin workflows (manage users, create recipes)
- End-user workflows (access recipes based on permissions)
- System performance under multi-tenant load

---

## Technical Specifications

### Multi-Tenant Database Schema

```sql
-- Multi-Tenancy Core
clients (id, name, slug, plan_type, max_restaurants, max_custom_recipes, settings, created_at, updated_at)
client_restaurants (id, client_id, restaurant_id, role, created_at)

-- RBAC System
roles (id, name, slug, description, scope_type, scope_id, is_global, created_at)
permissions (id, name, slug, resource, action, description)
role_permissions (role_id, permission_id)
user_roles (id, user_id, role_id, client_id, assigned_by, created_at)

-- Recipe System
cocktails (id, name, description, instructions, abv, calories, is_alcohol_free, sweetness_level, strength_level, owner_type, owner_id, is_public, created_at, updated_at)
ingredients (id, name, category_id, description, abv, cost_per_unit, owner_type, owner_id, is_shared, created_at, updated_at)

-- Access Control
cocktail_client_access (id, cocktail_id, client_id, granted_by, granted_at)
cocktail_restaurant_access (id, cocktail_id, restaurant_id, granted_by, granted_at)
ingredient_client_access (id, ingredient_id, client_id, granted_by, granted_at)

-- Existing Relationships with Tenant Awareness
cocktail_ingredients (cocktail_id, ingredient_id, quantity, unit, notes)
ingredient_categories (id, name, slug, description, owner_type, owner_id)
cocktail_ratings (cocktail_id, user_id, client_id, rating, status, notes)
cocktail_user_lists (cocktail_id, user_id, client_id, list_type, created_at)

-- Flexible Metadata with Tenancy
metadata_categories (id, name, type, validation_rules, owner_type, owner_id, is_shared)
metadata_values (id, category_id, name, value, sort_order)
cocktail_metadata (cocktail_id, metadata_value_id)
```

### API Endpoints with Access Control

```
-- Platform Admin Only
GET/POST     /admin/clients                    - Client management
GET/PUT/DEL  /admin/clients/{id}              - Individual client operations
GET/POST     /admin/roles                     - Role management
GET/PUT/DEL  /admin/roles/{id}               - Individual role operations
POST         /admin/clients/{id}/invite       - Invite client users

-- Platform Admin + Client Admin (scoped)
GET/POST     /admin/cocktails                 - List/create cocktails (tenant-filtered)
GET/PUT/DEL  /admin/cocktails/{id}           - Individual cocktail operations
GET/POST     /admin/ingredients               - List/create ingredients (tenant-filtered)
GET/PUT/DEL  /admin/ingredients/{id}         - Individual ingredient operations

-- Client Admin Only (within tenant scope)
GET/POST     /admin/my-cocktails             - Client's own cocktails
GET/POST     /admin/my-ingredients           - Client's own ingredients
GET/POST     /admin/my-users                 - Client's user management
POST         /admin/my-users/{id}/assign-role - Assign roles to client users

-- Access Control Operations
POST         /admin/cocktails/{id}/grant-access      - Grant recipe access
DELETE       /admin/cocktails/{id}/revoke-access     - Revoke recipe access
POST         /admin/cocktails/{id}/assign-restaurants - Assign recipe to restaurants
```

### Admin Routes with Context

```
-- Platform Admin Context
/app/clients                          - Client management
/app/platform-cocktails               - Platform recipe management
/app/platform-ingredients             - Platform ingredient management
/app/roles                           - Role and permission management
/app/client/{id}/overview            - Individual client management

-- Client Admin Context (tenant-scoped)
/app/my-cocktails                    - Client's recipe management
/app/my-ingredients                  - Client's ingredient management
/app/my-restaurants                  - Client's restaurant management
/app/my-users                        - Client's user management
/app/available-recipes               - Platform recipes available to client

-- Shared Context (role-dependent)
/app/recipes                         - All accessible recipes (filtered by tenant/role)
/app/ingredients                     - All accessible ingredients (filtered by tenant/role)
```

---

## Success Criteria

### Phase 1 Success

- Multi-tenant database schema is complete and secure
- Basic client, role, and cocktail models work correctly
- Tenant isolation is properly enforced
- Foundation supports complex RBAC requirements

### Phase 2 Success

- Comprehensive RBAC system functions correctly
- Platform admins can create and manage roles
- Client admins can assign but not create roles
- Permission system controls feature access accurately

### Phase 3 Success

- Platform and client admin interfaces are distinct and functional
- Data isolation between tenants is absolute
- Role-based UI rendering works correctly
- Multi-tenant DataTable provides excellent user experience

### Phase 4 Success

- Complex multi-tenant recipe creation is intuitive
- Ingredient ownership and sharing work correctly
- Recipe access controls are properly enforced
- All tenant scenarios function as designed

### Phase 5 Success

- Advanced filtering works within tenant boundaries
- Metadata system supports tenant-specific customization
- User interactions are properly tenant-scoped
- System is flexible and extensible for future needs

### Phase 6 Success

- Import system handles multi-tenant scenarios correctly
- Recipe assignment and distribution function properly
- Platform team can efficiently manage recipe distribution
- Client teams can import within their scope

### Phase 7 Success

- Complete system is performant, secure, and production-ready
- Multi-tenant architecture scales properly
- Documentation supports both platform and client users
- System meets enterprise security and compliance requirements

---

## Notes for Implementation

### Multi-Tenancy Best Practices

- Always filter queries by tenant context
- Implement row-level security where appropriate
- Use consistent tenant-aware service patterns
- Validate access controls at both API and service layers

### RBAC Implementation Guidelines

- Keep permission granularity appropriate (not too fine, not too coarse)
- Use consistent permission naming conventions
- Implement permission inheritance properly
- Cache role/permission lookups for performance

### Code Quality Standards

- Follow existing codebase patterns and conventions
- Use TypeScript for type safety across tenant boundaries
- Implement comprehensive error handling and logging
- Write tests that cover multi-tenant scenarios

### Performance Considerations

- Index all tenant-scoped queries properly
- Optimize multi-tenant filtering queries
- Implement efficient caching with tenant isolation
- Monitor query performance across tenant boundaries

### Security Requirements

- Implement defense in depth for access controls
- Audit all cross-tenant operations
- Use principle of least privilege for permissions
- Regular security reviews of access control logic

### User Experience

- Provide clear context about current tenant scope
- Make role-based feature availability obvious
- Ensure consistent UI patterns across tenant contexts
- Provide helpful onboarding for different user types
