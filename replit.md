# Artist Portfolio Website

## Overview

This is a visual artist portfolio website for "jesaja aljoscha trummer" built with a modern React frontend and Express backend. The site features a brutalist/Web 1.0 aesthetic with a minimalist design using monospace fonts and simple black-and-white styling. Core functionality includes a homepage slideshow with admin-manageable images, placeholder pages for portfolio sections, and file upload capabilities through Google Cloud Storage integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom brutalist theme (monospace fonts, no border radius, Web 1.0 colors)
- **UI Components**: Shadcn/ui component library (New York style variant)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **File Uploads**: Uppy with presigned URL flow to Google Cloud Storage
- **Authentication**: Simple password-based admin verification (environment variable)

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` using Drizzle's pgTable definitions
- **Tables**: 
  - `users` - Basic user accounts with username/password
  - `slideshow_images` - Homepage slideshow images with URL, alt text, and display order
- **Object Storage**: Google Cloud Storage via Replit's sidecar integration for file uploads

### Project Structure
```
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── replit_integrations/  # Object storage service
├── shared/           # Shared types and schema
│   └── schema.ts     # Drizzle database schema
```

### Build and Development
- Development runs client on port 5000 with Vite HMR
- Production build compiles server to CommonJS bundle and client to static files
- Uses esbuild for server bundling with selective dependency bundling for cold start optimization

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `/migrations` directory

### Cloud Services
- **Google Cloud Storage**: File/image uploads via Replit's sidecar service at `127.0.0.1:1106`
- Presigned URL upload pattern for secure direct-to-storage uploads

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_PASSWORD`: Password for admin panel access (defaults to "artist2024")

### Key NPM Dependencies
- Frontend: React, Wouter, TanStack Query, Framer Motion, Radix UI primitives
- Backend: Express, Drizzle ORM, pg (node-postgres), @google-cloud/storage
- File Uploads: @uppy/core, @uppy/aws-s3, @uppy/dashboard