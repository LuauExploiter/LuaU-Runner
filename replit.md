# Luau Web Playground

## Overview

A web-based Luau code playground that allows users to write, execute, and store Luau scripts. The application features a code editor with syntax highlighting, a console for viewing output, and a history system for tracking previous executions. Built as a full-stack TypeScript application with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark theme default)
- **Code Editor**: react-simple-code-editor with PrismJS for Lua syntax highlighting
- **Build Tool**: Vite with custom Replit plugins for development

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development
- **API Design**: RESTful endpoints defined in shared routes file with Zod validation
- **Code Execution**: Executes Luau code via child process running a compiled Luau runtime (server/luau.cjs)
- **Execution Limits**: 5-second timeout, 1MB output buffer

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` - defines snippets table for execution history
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)

### Shared Code Pattern
- `shared/` directory contains code shared between frontend and backend
- `shared/schema.ts`: Database schema and Zod validation schemas
- `shared/routes.ts`: API route definitions with input/output type contracts
- Path aliases: `@/` for client, `@shared/` for shared modules

### Build System
- Development: `npm run dev` - tsx watches server, Vite serves frontend with HMR
- Production: `npm run build` - esbuild bundles server, Vite builds frontend
- Output: `dist/` directory with `index.cjs` (server) and `public/` (static assets)

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Connection**: pg Pool with Drizzle ORM wrapper
- **Session Storage**: connect-pg-simple for Express sessions (configured but may not be active)

### Runtime Dependencies
- **Luau Runtime**: WebAssembly-compiled Luau interpreter at `server/luau.cjs`
- Executes user-submitted Lua/Luau code in sandboxed child process

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Async state management
- `zod` / `drizzle-zod`: Runtime validation and schema generation
- `prismjs`: Syntax highlighting for code editor
- `date-fns`: Date formatting for history display