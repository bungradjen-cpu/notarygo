# NotaryGo SaaS Development Guide

## Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker Desktop (for local Supabase instance)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in the values for development.
   ```bash
   cp .env.example .env
   ```

3. **Supabase Local Setup**
   Run the Supabase CLI to start the local database.
   ```bash
   npx supabase start
   npx supabase migration up
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

## Testing

- **Unit Tests (Vitest)**
  ```bash
  npm run test
  ```
- **E2E Tests (Playwright)**
  ```bash
  npx playwright test
  ```

## Quality Assurance
- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

## Database Migrations
Migrations are stored in `/supabase/migrations/`.
Create a new migration:
```bash
npx supabase migration new name_of_migration
```
