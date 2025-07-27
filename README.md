<p align="center">
  <a href="https://www.medusajs.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
      <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" width=100>
    </picture>
  </a>
  <a href="https://railway.app/template/gkU-27?referralCode=-Yg50p">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://railway.app/brand/logo-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://railway.app/brand/logo-dark.svg">
      <img alt="Railway logo" src="https://railway.app/brand/logo-light.svg" width=100>
    </picture>
  </a>
</p>

<h2 align="center">
  Prebaked medusajs 2.0 monorepo
</h2>
<h4 align="center">
  Backend + Storefront + postgres + redis + MinIO + MeiliSearch
</h4>

<h2 align="center">
  <a href="https://railway.app/template/gkU-27?referralCode=-Yg50p">one-click deploy on railway!</a>
</h2>

<h1 align="center">
  Need help?<br>
  <a href="https://funkyton.com/medusajs-2-0-is-finally-here/">Step by step deploy guide, and video instructions</a>
</h1>

<p align="center">
Combine Medusa's modules for your commerce backend with the newest Next.js 14 features for a performant storefront.</p>

## About this boilerplate

This boilerplate is a monorepo consisting of the officially released MedusaJS 2.0 backend and storefront application. It is a pre-configured, ready-to-deploy solution, modified for seamless deployment on [railway.app](https://railway.app?referralCode=-Yg50p).

Updated: to `version 2.8.4` 🥳

## Preconfigured 3rd party integrations

- MinIO file storage: Replaces local file storage with MinIO cloud storage, automatically creating a 'medusa-media' bucket for your media files. [README](backend/src/modules/minio-file/README.md)
- Resend email integration [Watch setup video](https://youtu.be/pbdZm26YDpE?si=LQTHWeZMLD4w3Ahw) - special thanks to [aleciavogel](https://github.com/aleciavogel) for Resend notification service, and react-email implementation! [README](backend/src/modules/email-notifications/README.md)
- Stripe payment service: [Watch setup video](https://youtu.be/dcSOpIzc1Og)
- Meilisearch integration by [Rokmohar](https://github.com/rokmohar/medusa-plugin-meilisearch): Adds powerful product search capabilities to your store. When deployed on Railway using the template, MeiliSearch is automatically configured. (For non-railway'ers: [Watch setup video](https://youtu.be/hrXcc5MjApI))

# /backend

### local setup

Video instructions: https://youtu.be/PPxenu7IjGM

- `cd /backend`
- `pnpm install` or `npm i`
- Rename `.env.template` -> `.env`
- To connect to your online database from your local machine, copy the `DATABASE_URL` value auto-generated on Railway and add it to your `.env` file.
  - If connecting to a new database, for example a local one, run `pnpm ib` or `npm run ib` to seed the database.
- `pnpm dev` or `npm run dev`

### requirements

- **postgres database** (Automatic setup when using the Railway template)
- **redis** (Automatic setup when using the Railway template) - fallback to simulated redis.
- **MinIO storage** (Automatic setup when using the Railway template) - fallback to local storage.
- **Meilisearch** (Automatic setup when using the Railway template)

### commands

`cd backend/`
`npm run ib` or `pnpm ib` will initialize the backend by running migrations and seed the database with required system data.
`npm run dev` or `pnpm dev` will start the backend (and admin dashboard frontend on `localhost:9000/app`) in development mode.
`pnpm build && pnpm start` will compile the project and run from compiled source. This can be useful for reproducing issues on your cloud instance.

# /storefront

### local setup

Video instructions: https://youtu.be/PPxenu7IjGM

Install dependencies `npm i` of `pnpm i`
Rename `.env.local.template` -> `.env.local`

### requirements

- A running backend on port 9000 is required to fetch product data and other information needed to build Next.js pages.

### commands

`cd storefront/`
`npm run dev` or `pnpm dev` will run the storefront on uncompiled code, with hot-reloading as files are saved with changes.

## Useful resources

- How to setup credit card payment with Stripe payment module: https://youtu.be/dcSOpIzc1Og
- https://funkyton.com/medusajs-2-0-is-finally-here/#succuessfully-deployed-whats-next

<p align="center">
  <a href="https://funkyton.com/">
    <div style="text-align: center;">
      A template by,
      <br>
      <picture>
        <img alt="FUNKYTON logo" src="https://res-5.cloudinary.com/hczpmiapo/image/upload/q_auto/v1/ghost-blog-images/funkyton-logo.png" width=200>
      </picture>
    </div>
  </a>
</p>

---

# elyxm-railway - Medusa 2.0 E-commerce Platform

A complete Medusa 2.0 e-commerce platform with local development environment using Docker services.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Docker & Docker Compose

### Local Development Setup

1. **Clone and install dependencies:**

   ```bash
   npm run install:all
   ```

2. **Start local database services:**

   ```bash
   npm run docker:up
   ```

3. **Set up local environment:**

   ```bash
   # Copy your backend/.env file and update DATABASE_URL to:
   DATABASE_URL=postgresql://medusa_user:medusa_password@localhost:5433/medusa_dev

   # Also update Meilisearch settings to:
   MEILISEARCH_HOST=http://localhost:7700
   MEILISEARCH_MASTER_KEY=local_development_master_key_please_change_in_production
   ```

4. **Initialize local database:**

   ```bash
   cd backend && pnpm medusa db:migrate && pnpm seed
   ```

5. **Create admin user:**

   ```bash
   cd backend && pnpm medusa user -e admin@localhost.com -p password123
   ```

6. **Start development servers:**

   ```bash
   npm run dev:all    # Both backend + storefront
   # OR separately:
   npm run dev:backend     # Backend only (port 9000)
   npm run dev:storefront  # Storefront only (port 3000/8000)
   ```

7. **Access your local environment:**
   - **Admin Dashboard**: http://localhost:9000/app
   - **Storefront**: http://localhost:3000 or http://localhost:8000
   - **API**: http://localhost:9000
   - **Meilisearch**: http://localhost:7700

## 🛠️ Available Commands

### Docker Services Management

```bash
npm run docker:up              # Start all services
npm run docker:down            # Stop and remove containers
npm run docker:restart         # Restart all services
npm run docker:stop            # Stop containers (keep them)
npm run docker:logs            # View all logs
npm run docker:logs:postgres   # PostgreSQL logs only
npm run docker:logs:meilisearch # Meilisearch logs only
npm run docker:clean           # Full cleanup (removes volumes)
npm run docker:rebuild         # Rebuild and restart everything
```

### Database Utilities

```bash
npm run db:status              # Check container status
npm run db:shell               # Connect to PostgreSQL shell
npm run db:backup              # Create timestamped backup
npm run db:generate product     # Generate migrations for modules
```

### Development Workflow

```bash
npm run dev:backend            # Start Medusa backend
npm run dev:storefront         # Start Next.js storefront
npm run dev:all               # Start both simultaneously
npm run install:all           # Install all dependencies
```

## 🐳 Local Services

### PostgreSQL Database

- **Host**: localhost
- **Port**: 5433
- **Database**: medusa_dev
- **User**: medusa_user
- **Password**: medusa_password
- **Connection URL**: `postgresql://medusa_user:medusa_password@localhost:5433/medusa_dev`

### Meilisearch

- **Host**: localhost
- **Port**: 7700
- **Master Key**: `local_development_master_key_please_change_in_production`
- **Admin Key**: Auto-generated during initialization
- **Dashboard**: http://localhost:7700

### Medusa Backend

- **Host**: localhost
- **Port**: 9000
- **Admin**: http://localhost:9000/app
- **API**: http://localhost:9000

## 🔄 Development Workflow

### Local vs Production

- **Local Development**: Uses Docker PostgreSQL & Meilisearch
- **Production**: Uses Railway hosted services
- **Switching**: Simply change environment variables in `backend/.env`

### Typical Development Flow

1. Start Docker services: `npm run docker:up`
2. Start backend: `npm run dev:backend`
3. Make changes to schema/code
4. Test locally with fresh database
5. When ready, deploy to production

### Schema Development

1. Make changes to your data models
2. Generate migrations: `npm run db:generate product order` (for changed modules)
3. Apply locally: `cd backend && pnpm migrate`
4. Test with seed data: `cd backend && pnpm seed`
5. Deploy to production when ready

#### About Medusa Migrations

Medusa 2.0 generates migrations for **existing modules** when you modify their data models:

- `npm run db:generate product` - Generates migrations for product module changes
- `npm run db:generate order user` - Generates for multiple modules
- Module names: `product`, `order`, `user`, `customer`, `cart`, `payment`, etc.

## 📁 Project Structure

```
elyxm-railway/
├── backend/              # Medusa 2.0 backend
│   ├── src/
│   ├── medusa-config.js  # Medusa configuration
│   ├── package.json
│   └── .env             # Environment variables
├── storefront/          # Next.js storefront
│   ├── src/
│   ├── package.json
│   └── next.config.js
├── docker/              # Docker configuration files
│   └── postgres/init/   # PostgreSQL initialization scripts
├── docker-compose.yml   # Local services definition
├── package.json        # Root workspace & scripts
└── README.md          # This file
```

## 🔧 Troubleshooting

### Port Conflicts

If you get port conflicts, check what's running:

```bash
lsof -i :5433  # PostgreSQL
lsof -i :7700  # Meilisearch
lsof -i :9000  # Medusa
```

### Database Issues

Reset local database completely:

```bash
npm run docker:clean
npm run docker:up
cd backend && pnpm medusa db:migrate && pnpm seed
pnpm medusa user -e admin@localhost.com -p password123
```

### Environment Variables

Make sure your `backend/.env` has the correct local URLs:

- `DATABASE_URL=postgresql://medusa_user:medusa_password@localhost:5433/medusa_dev`
- `MEILISEARCH_HOST=http://localhost:7700`
- `MEILISEARCH_MASTER_KEY=local_development_master_key_please_change_in_production`

### Switching to Production

Update `backend/.env` to use Railway URLs:

- `DATABASE_URL=your-railway-postgres-url`
- `MEILISEARCH_HOST=your-railway-meilisearch-url`
- `MEILISEARCH_MASTER_KEY=your-production-key`

## 🎯 Benefits

- ✅ **Isolated Development**: Local database for safe schema iteration
- ✅ **Fast Iteration**: No network latency, instant feedback
- ✅ **Complete Reset**: Easy cleanup and fresh starts
- ✅ **Production Parity**: Same PostgreSQL & Meilisearch versions
- ✅ **Easy Management**: Simple npm scripts for all operations
- ✅ **Cost Effective**: No usage of production resources during development

## 📝 Notes

- **Redis**: Not needed locally - Medusa uses in-memory fallback
- **MinIO**: Optional - uses local file storage by default
- **Admin User**: Create with `pnpm medusa user -e email -p password`
- **Backups**: Use `npm run db:backup` before major changes

---

**Happy coding!** 🚀✨
