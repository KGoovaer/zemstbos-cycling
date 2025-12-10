# 003 - Authentication

**Epic:** Foundation
**Priority:** Must
**Estimated Effort:** 12 hours
**Phase:** 1

## User Story

As a **club member or admin**
I want **to securely log in using email/password or Google account**
So that **I can access members-only features and manage club content**

## Description

Implement a dual authentication system using NextAuth.js that supports both traditional email/password login and Google OAuth. This provides flexibility for users - older members who may already be signed into Google can use one-click login, while those who prefer traditional authentication can use email/password.

The system must support account linking (connecting a Google account to an existing email/password account), password reset functionality, and secure session management.

## Acceptance Criteria

- [ ] NextAuth.js configured with both Credentials and Google providers
- [ ] Email/password login works correctly
- [ ] Google OAuth login works correctly
- [ ] Users can link Google account to existing email/password account
- [ ] Password reset flow implemented for email/password accounts
- [ ] Sessions persist across browser refreshes
- [ ] Logout functionality works correctly
- [ ] Login redirects to appropriate page based on role
- [ ] Password hashing uses bcrypt
- [ ] Google OAuth credentials configured in environment variables
- [ ] Login page has clear, accessible UI
- [ ] Error messages are user-friendly

## Technical Implementation

### Database Changes

Schema already includes necessary fields (from story 002):
- `passwordHash` - For email/password authentication (nullable for Google-only users)
- `googleId` - For Google OAuth (nullable for email/password-only users)
- `email` - Used by both authentication methods (unique)

### API Endpoints

**NextAuth.js API Routes:**
- `POST /api/auth/signin` - Authenticate user
- `POST /api/auth/signout` - End session
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/session` - Get current session
- `POST /api/auth/callback/credentials` - Email/password callback

**Custom API Routes:**
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password with reset token
- `POST /api/auth/link-google` - Link Google account to existing user

### Components/Pages

**Pages:**
- `/app/(auth)/login/page.tsx` - Login page with both auth options
- `/app/(auth)/forgot-password/page.tsx` - Password reset request
- `/app/(auth)/reset-password/[token]/page.tsx` - Password reset form

**Components:**
- `/components/auth/LoginForm.tsx` - Email/password form
- `/components/auth/GoogleButton.tsx` - Google OAuth button
- `/components/auth/PasswordResetForm.tsx` - Reset password form

**Layout:**
- `/app/(auth)/layout.tsx` - Centered auth layout

### Libraries/Dependencies

```json
{
  "next-auth": "^5.0.0",
  "bcryptjs": "^2.4.3",
  "@auth/prisma-adapter": "^1.0.0"
}
```

```json
{
  "@types/bcryptjs": "^2.4.0"
}
```

### NextAuth Configuration

Create `/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email en wachtwoord zijn verplicht')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.isActive) {
          throw new Error('Ongeldige inloggegevens')
        }

        if (!user.passwordHash) {
          throw new Error('Dit account gebruikt Google login')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValidPassword) {
          throw new Error('Ongeldige inloggegevens')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        }
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      async profile(profile) {
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: profile.email },
              { googleId: profile.sub }
            ]
          }
        })

        if (existingUser) {
          // Link Google ID if not already linked
          if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId: profile.sub }
            })
          }

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: `${existingUser.firstName} ${existingUser.lastName}`,
            role: existingUser.role,
          }
        }

        // New Google user - create account (requires admin approval)
        throw new Error('Account niet gevonden. Vraag de admin om een account aan te maken.')
      }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.userId as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Check if user is active
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! }
      })

      if (dbUser && !dbUser.isActive) {
        return false
      }

      return true
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Login Page

Create `/app/(auth)/login/page.tsx`:

```typescript
import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleButton } from '@/components/auth/GoogleButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h1 className="text-3xl font-bold text-center">
            Wielrijniet
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600">
            Meld je aan om door te gaan
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Sign-In Button */}
          <GoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Of met email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <LoginForm />
        </div>

        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-base text-blue-600 hover:text-blue-500"
          >
            Wachtwoord vergeten?
          </a>
        </div>
      </div>
    </div>
  )
}
```

## Dependencies

- **Depends on:** 001 - Project Setup, 002 - Database Schema
- **Blocks:** 004 - Role-Based Access Control, all member and admin features

## UI/UX Notes

**Accessibility Requirements:**
- Large, clear buttons (minimum 48x48px touch targets)
- High contrast text on form fields
- Clear error messages in simple language
- Focus indicators on all interactive elements
- Labels properly associated with inputs
- Password visibility toggle button

**User-Friendly Features:**
- Google login button prominently displayed (easier for older users)
- Clear visual separation between auth methods
- "Wachtwoord vergeten?" link clearly visible
- Simple error messages in Dutch without technical jargon
- Auto-focus on email field when page loads
- Loading states during authentication

**Sample Button Styling:**
```tsx
<button className="min-h-touch min-w-touch text-lg px-6 py-3">
  Aanmelden
</button>
```

## Testing Considerations

- [ ] Email/password login succeeds with valid credentials
- [ ] Email/password login fails with invalid credentials
- [ ] Google OAuth login redirects correctly
- [ ] Google OAuth creates/updates user correctly
- [ ] Cannot log in with inactive account
- [ ] Password reset email is sent (when email functionality added)
- [ ] Password reset link works and expires correctly
- [ ] Session persists across page refreshes
- [ ] Logout clears session completely
- [ ] Cannot access protected pages without authentication
- [ ] Error messages display correctly for each failure case
- [ ] Google account can link to existing email/password account

## Environment Variables

Add to `.env.example`:
```bash
# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Implementation Steps

1. Install NextAuth.js: `npm install next-auth @auth/prisma-adapter`
2. Generate NextAuth secret: `openssl rand -base64 32`
3. Create Google OAuth credentials at console.cloud.google.com
4. Configure NextAuth with both providers
5. Create login page with both auth options
6. Implement LoginForm component
7. Implement GoogleButton component
8. Create password reset flow
9. Test both authentication methods
10. Add session checking middleware
11. Document setup for other developers

## Security Considerations

- **Password Hashing:** Use bcrypt with salt rounds ≥ 10
- **Session Secret:** Use cryptographically secure random string
- **Google OAuth:** Validate state parameter to prevent CSRF
- **Account Linking:** Require email verification before linking
- **Inactive Users:** Block login for inactive accounts
- **Rate Limiting:** Consider adding rate limiting for login attempts (future enhancement)

## Notes

- **Google OAuth Setup:** Requires creating OAuth credentials in Google Cloud Console
- **Redirect URIs:** Add `http://localhost:3000/api/auth/callback/google` for development
- **Account Creation:** Only admins can create accounts - no self-registration
- **Default Auth:** Most users will prefer Google login (one-click, no password to remember)
- **Password Complexity:** Not enforced initially, but can be added later
- **2FA:** Not in MVP scope, can be added as future enhancement
