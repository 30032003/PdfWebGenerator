# Store Rating Platform

## Overview

This is a full-stack store rating platform that allows users to browse and rate stores, store owners to manage their stores and view ratings, and administrators to oversee the entire system. The application implements role-based access control with three distinct user types: regular users, store owners, and system administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React with TypeScript for type safety and developer experience
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing

**UI Component Library**
- shadcn/ui components built on Radix UI primitives following the "new-york" style
- Material Design-inspired design system optimized for data-intensive dashboards
- Tailwind CSS for utility-first styling with custom CSS variables for theming
- Inter font family from Google Fonts for consistent typography

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and automatic refetching
- React Hook Form with Zod validation for form state and validation
- Local storage for client-side authentication state persistence

**Authentication Flow**
- Session-based authentication with client-side user object caching
- Protected routes with role-based access control enforced at the component level
- Automatic session validation on protected route access

### Backend Architecture

**Server Framework**
- Express.js for the HTTP server and API routing
- TypeScript for type safety across the full stack
- Session-based authentication using express-session with PostgreSQL session store

**API Design**
- RESTful API endpoints organized by feature domain (auth, admin, stores, ratings)
- Middleware-based authentication and role authorization
- Consistent error handling and response formatting

**Authentication & Authorization**
- bcryptjs for password hashing with salt rounds
- Session cookies with httpOnly flag for security
- Role-based middleware guards (`requireAuth`, `requireRole`) for endpoint protection
- Three user roles: "user", "store_owner", "admin" with hierarchical permissions

**Business Logic Layer**
- Storage abstraction interface (IStorage) for data access operations
- DatabaseStorage implementation handling all database queries
- Separation of concerns between route handlers and data access

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver for production scalability
- WebSocket connection support for serverless environments
- Drizzle ORM for type-safe database queries and schema management

**Schema Design**
- **users table**: Stores user accounts with roles (user, store_owner, admin)
- **stores table**: Store information with foreign key to owner (users.id)
- **ratings table**: User ratings for stores with composite relationship (userId + storeId)
- **session table**: Auto-created by connect-pg-simple for session persistence

**Data Relationships**
- One-to-many: User → Stores (a store owner can own multiple stores)
- One-to-many: Store → Ratings (a store can have multiple ratings)
- One-to-many: User → Ratings (a user can rate multiple stores)
- Constraint: One user can only rate each store once (enforced at application level)

**Migrations**
- Drizzle Kit for schema migrations with push-based deployment
- Schema defined in TypeScript with automatic type inference

### External Dependencies

**UI Component Libraries**
- @radix-ui/* primitives for accessible, unstyled components (dialogs, dropdowns, menus, etc.)
- lucide-react for consistent icon set
- date-fns for date formatting utilities

**Validation & Forms**
- Zod for runtime schema validation
- drizzle-zod for automatic schema generation from database models
- @hookform/resolvers for React Hook Form + Zod integration

**Database & ORM**
- @neondatabase/serverless for PostgreSQL connection pooling
- drizzle-orm for type-safe queries
- connect-pg-simple for PostgreSQL-backed session storage

**Development Tools**
- tsx for running TypeScript in Node.js during development
- esbuild for server-side bundling in production
- @replit/vite-plugin-* for Replit-specific development features

**Styling**
- tailwindcss with autoprefixer for CSS processing
- class-variance-authority for component variant management
- tailwind-merge with clsx for conditional class merging