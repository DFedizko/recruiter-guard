# RecruiterGuard

An ethical recruiting platform that anonymizes résumés and ranks candidates based on skills and experience, not on personal attributes.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS v4.1
- **Database**: MySQL
- **ORM**: Prisma

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for MySQL)

## Setup Instructions

### 1. Start MySQL Database

```bash
docker-compose up -d
```

This will start a MySQL container on port 3306.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Or manually create `.env` with:

```env
DATABASE_URL="mysql://user:password@localhost:3306/recruiter_guard"
SHADOW_DATABASE_URL="mysql://root:rootpassword@localhost:3306/recruiter_guard_shadow"
PORT=3001
SESSION_SECRET="your-secret-key-change-in-production"
FRONTEND_URL="http://localhost:3000"
```

**Note**: The `SHADOW_DATABASE_URL` uses the root user to create a temporary shadow database for migrations. If you prefer, you can use `prisma db push` instead (see below).

Run Prisma migrations:

**Option 1: Using db push (recommended for development, no shadow DB needed)**
```bash
npm run db:push
```

**Option 2: Using migrations (for production, requires shadow database)**
```bash
# Make sure SHADOW_DATABASE_URL is set in .env
npm run migrate
```

**Note**: For development, `db:push` is simpler and doesn't require a shadow database. For production, use migrations with a properly configured shadow database.

This will create the database schema.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Or manually create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note**: This project uses Tailwind CSS v4.1, which uses CSS-first configuration (no `tailwind.config.js` needed). Customizations can be added directly in `app/globals.css` using the `@theme` directive.

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Register**: Create a new recruiter account at `http://localhost:3000/register`
2. **Login**: Sign in at `http://localhost:3000/login`
3. **Create Job**: Create a job posting with title, description, and required skills
4. **Upload Candidates**: Upload candidate résumés (PDF, DOCX, or text) for a job
5. **View Rankings**: See candidates ranked by match score based on skills
6. **View Sanitized Résumés**: Review anonymized résumé text without PII

## Features

- **Résumé Sanitization**: Automatically removes personal identifying information (PII) including:
  - Names
  - Email addresses
  - Phone numbers
  - Addresses
  - Dates of birth
  - Social media links

- **Skill Extraction**: Extracts skills from résumé text using keyword matching

- **Match Scoring**: Calculates a match score based on overlap between job required skills and candidate skills

- **Ranked Listings**: Displays candidates sorted by match score

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic (sanitization, scoring, etc.)
│   │   ├── middleware/    # Auth middleware
│   │   └── lib/           # Utilities (Prisma client)
│   ├── prisma/            # Prisma schema and migrations
│   └── package.json
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # API client utilities
│   └── package.json
└── docker-compose.yml     # MySQL database setup
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - List jobs for logged-in user
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/applications` - Upload candidate résumé
- `GET /api/jobs/:id/applications` - List applications for a job

### Applications
- `GET /api/applications/:id` - Get application details

## Development Notes

- The scoring logic is a simple deterministic function and can be easily replaced with AI-based scoring
- Resume sanitization uses regex patterns and can be enhanced with more sophisticated NLP
- Session management uses simple cookies (MVP approach)
- No JWT, Redis, RBAC, or rate limiting as per requirements

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:
1. Ensure MySQL container is running: `docker-compose ps`
2. Check that the DATABASE_URL in `.env` matches the docker-compose.yml credentials
3. Wait a few seconds after starting the container for MySQL to fully initialize

### Port Conflicts

If ports 3000 or 3001 are already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/package.json` dev script
- MySQL: Change port mapping in `docker-compose.yml`

