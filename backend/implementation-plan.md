# Backend Implementation Plan

This document outlines the plan to implement missing backend features identified by comparing our project with the `medusa-eats` reference project located in the tmp/ folder.

## Analysis Summary

The analysis revealed the following missing features:

- **API Endpoints:** `deliveries` and `drivers` endpoints in the `store` API.
- **API Middlewares:** Authentication and authorization middlewares for various store routes.

The `loaders` directory was present in the reference project but contained only a README file, indicating no active loaders are implemented. Therefore, no action is needed for loaders.

## Implementation Phases

The implementation will be carried out in the following phases:

### Phase 1: Implement `deliveries` and `drivers` API Endpoints

- **Task 1.1: Create `deliveries` API Endpoint.**
  - Create a `deliveries` directory inside `backend/src/api/store`.
  - Inside `backend/src/api/store/deliveries`, create a `route.ts` file.
  - Implement `GET` and `POST` handlers for the `/store/deliveries` endpoint. The `GET` handler should fetch a list of deliveries, and the `POST` handler should create a new delivery.
- **Task 1.2: Create `drivers` API Endpoint.**
  - Create a `drivers` directory inside `backend/src/api/store`.
  - Inside `backend/src/api/store/drivers`, create a `route.ts` file.
  - Implement `GET` and `POST` handlers for the `/store/drivers` endpoint. The `GET` handler should fetch a list of drivers, and the `POST` handler should create a new driver.

### Phase 2: Implement API Middlewares

- **Task 2.1: Implement Middlewares.**
  - Create a `middlewares.ts` file in `backend/src/api`.
  - Define the `isAllowed` middleware to check for `restaurant_id` or `driver_id`.
  - Configure middlewares for the following routes:
    - `/store/users/me`
    - `/store/users`
    - `/store/restaurants/:id/**`
    - `/store/restaurants/:id/admin/**`

## Conversation Starter for AI Agent

To work on each task, please use the following prompt format. Replace `[Task Description]` with the specific task you want to accomplish.

```
Hello, I need your help with a task for our Medusa 2.0 backend.

**Project Context:** We are building a food delivery application similar to `medusa-eats` which is referenced in the tmp/ folder. Our project is split into a `backend` and a `storefront`. We are currently working on implementing missing backend features based on an implementation plan located at `backend/implementation-plan.md`.

**Current Task:** [Task Description]

Please help me implement this task. Adhere to the existing conventions in our codebase. Allow me to validate the work manually before marking the task complete.

use context7
```
