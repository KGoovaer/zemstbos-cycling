# 001 - Project Setup

**Epic:** Foundation
**Priority:** Must
**Estimated Effort:** 8 hours
**Phase:** 1

## User Story

As a **developer**
I want **a properly configured Next.js project with all necessary tools and dependencies**
So that **I can build the cycling club application efficiently with modern best practices**

## Description

Initialize a Next.js 14 project with TypeScript, Tailwind CSS, and all necessary dependencies for the cycling club management application. This includes setting up the development environment, configuring linting, formatting, and establishing the project structure.

The setup should follow Next.js 14 App Router conventions and be optimized for accessibility and performance from the start.

## Acceptance Criteria

- [ ] Next.js 14 project initialized with App Router
- [ ] TypeScript configured with strict mode enabled
- [ ] Tailwind CSS installed and configured
- [ ] ESLint and Prettier configured for code quality
- [ ] Project structure created following Next.js App Router conventions
- [ ] Environment variables template created (.env.example)
- [ ] Git repository initialized with proper .gitignore
- [ ] package.json includes all required dependencies
- [ ] Development server runs successfully on localhost
- [ ] README.md updated with setup instructions

## Technical Implementation

### Database Changes
None (database setup in story 002)

### API Endpoints
None (API routes created in later stories)

### Components/Pages
Initial directory structure:
```
/app                    # Next.js 14 App Router
  /layout.tsx          # Root layout
  /page.tsx            # Homepage placeholder
  /api                 # API routes directory
/components            # React components
  /ui                  # Reusable UI components
/lib                   # Utility functions
  /utils.ts           # Helper functions
/public                # Static assets
/styles                # Global styles
```

### Libraries/Dependencies

**Core Dependencies:**
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0"
}
```

**Styling:**
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "@tailwindcss/forms": "^0.5.0"
}
```

**Development Tools:**
```json
{
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.0.0",
  "prettier-plugin-tailwindcss": "^0.5.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0"
}
```

**Configuration Files:**
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `next.config.js` - Next.js configuration
- `.env.example` - Environment variables template

## Dependencies

- **Depends on:** None (first story)
- **Blocks:** All subsequent stories

## UI/UX Notes

**Tailwind Configuration:**
- Configure custom font sizes starting at 18px base (for older users)
- Set up color palette with high contrast
- Configure minimum touch target sizes (48x48px)
- Add custom spacing for accessibility

**Sample Tailwind Config:**
```js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'base': '18px',  // Minimum for older users
        'lg': '20px',
        'xl': '24px',
      },
      minHeight: {
        'touch': '48px',  // Minimum touch target
      },
      minWidth: {
        'touch': '48px',
      }
    }
  }
}
```

## Testing Considerations

- [ ] Development server starts without errors
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes without warnings
- [ ] Tailwind CSS classes are applied correctly
- [ ] Hot module replacement works during development
- [ ] Build process completes successfully (`npm run build`)
- [ ] Environment variables are loaded correctly

## Implementation Steps

1. Run `npx create-next-app@latest cycling-club-web --typescript --tailwind --app --no-src`
2. Install additional dependencies: `npm install @tailwindcss/forms`
3. Configure TypeScript in `tsconfig.json` with strict mode
4. Set up ESLint with Next.js and TypeScript rules
5. Install and configure Prettier with Tailwind plugin
6. Create directory structure for app, components, lib
7. Configure Tailwind with accessibility-first settings
8. Create `.env.example` with placeholder environment variables
9. Update README.md with project setup instructions
10. Test development server and build process

## Notes

- Use Next.js 14's App Router (not Pages Router)
- Enable TypeScript strict mode for better type safety
- Configure Prettier to run automatically on save (IDE configuration)
- Include instructions for PostgreSQL setup in README (actual database setup in story 002)
- Document minimum Node.js version requirement (v18+)
