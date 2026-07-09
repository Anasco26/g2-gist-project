# G2 Gist - Movie Blog

A full-stack movie blog with Express, TypeScript, Prisma (backend) and React 19, Vite (frontend).

## Features

- JWT authentication with access/refresh tokens
- Rich text editor with image uploads (Supabase Storage)
- Comments (threaded, 2 levels), likes, favorites
- View tracking, related posts, popular posts
- Admin dashboard with pagination, search, and status filters
- Contact messages with admin panel

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Express 5, TypeScript, Prisma, PostgreSQL |
| Frontend | React 19, Vite, React Router |
| Auth | JWT (access + refresh), bcrypt |
| Storage | Supabase Storage (via `@supabase/supabase-js`) |
| Database | PostgreSQL (via Prisma ORM) |

## Local Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL running locally (or a Supabase project)
- A Supabase project with Storage bucket (for image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/g2-gist-project.git
cd g2-gist-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory. Copy from `.env.example`:

```bash
cp .env.example .env
```

Minimum required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Prisma format) |
| `JWT_ACCESS_SECRET` | Random base64 string (`openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Random base64 string |
| `JWT_RESET_SECRET` | Random base64 string |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key |
| `SUPABASE_BUCKET` | Storage bucket name (default: `blog-images`) |

Run database migrations and seed data:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Seed Accounts

After seeding the database, you can log in with:

| Email | Password | Role |
|---|---|---|
| `admin@g2gist.com` | `password123` | ADMIN |
| `writer@g2gist.com` | `password123` | USER |
| `filmfan@example.com` | `password123` | USER |

## Deployment

### Backend (Vercel)

1. Push to GitHub
2. Create a new Vercel project linked to the `backend/` directory
3. Set all environment variables in Vercel dashboard (see `.env.example`)
4. Deploy

### Frontend (Vercel)

1. Create a new Vercel project linked to the `frontend/` directory
2. Set `VITE_API_URL` to your production backend URL
3. Deploy