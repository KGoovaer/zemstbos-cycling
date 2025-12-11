# Zemst BOS Cycling Club

A self-hosted web application for managing a cycling club with seasonal rides (March-October). Designed with accessibility in mind for older, less tech-savvy members.

## Features

- **Public Pages**: Landing page with club info and upcoming ride teasers
- **Member Portal**: Season calendar, route details, GPX downloads, profile management
- **Admin Dashboard**: Schedule management, member management, route suggestions

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with accessibility-first configuration
- **Database**: PostgreSQL with Prisma ORM (to be configured)
- **Authentication**: NextAuth.js (to be configured)
- **Deployment**: Kubernetes

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (for production deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd zemstbos-cycling
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string (required for database features)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your application URL (use `http://localhost:3000` for development)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Database setup (when ready)

Once the database schema is created (Story 002):

```bash
# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# (Optional) Seed the database
npx prisma db seed
```

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
/app                    # Next.js 14 App Router pages
  /layout.tsx          # Root layout with global styles
  /page.tsx            # Homepage
  /api                 # API routes (NextAuth, etc.)
/components            # React components
  /ui                  # Reusable UI components
/lib                   # Utility functions
  /utils.ts           # Helper functions
/public                # Static assets (images, icons)
/styles                # Additional stylesheets (if needed)
/prisma                # Database schema and migrations (to be added)
```

## Development Workflow

1. Create a new branch for your feature: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Build to check for errors: `npm run build`
5. Commit your changes: `git commit -m "Description"`
6. Push and create a pull request

## Accessibility Features

The application is designed for older users with limited technical experience:

- **Large typography**: Minimum 18px base font size
- **High contrast**: Colors meet WCAG AA standards
- **Big touch targets**: Minimum 48x48px buttons
- **Simple navigation**: Clear, consistent menu structure
- **Forgiving interactions**: Confirmation dialogs for important actions

## Documentation

- **Project Plan**: See `cycling-club-plan.md` for comprehensive architecture
- **User Stories**: See `stories/` directory for detailed feature specifications
- **Development Guide**: See `CLAUDE.md` for AI assistant context

## License

Apache 2.0 - See LICENSE file for details

## Contributing

This is a private club management application. For questions or contributions, please contact the project maintainer.
