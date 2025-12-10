# 012 - Contact Page

**Epic:** Public Features
**Priority:** Must
**Estimated Effort:** 4 hours
**Phase:** 2

## User Story

As a **visitor interested in joining the club**
I want **to easily find contact information and send a message to the club**
So that **I can ask questions or express my interest in joining**

## Description

Create a simple, accessible contact page with club contact information and a contact form. The page should be easy to use for older visitors and provide all necessary information for getting in touch with the club.

## Acceptance Criteria

- [ ] Contact page accessible at /contact
- [ ] Club email address displayed
- [ ] Club phone number displayed (if available)
- [ ] Club meeting address/location displayed
- [ ] Contact form with name, email, message fields
- [ ] Form validation (required fields, email format)
- [ ] Form submission sends email to club admin
- [ ] Success message shown after submission
- [ ] Error handling for failed submissions
- [ ] Form fields have large, clear labels
- [ ] Submit button is large and prominent

## Technical Implementation

### Database Changes

None (contact form sends emails, not stored in database)

### API Endpoints

Create `/app/api/contact/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      )
    }

    // Create email transporter (configure based on your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email to club admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Contactformulier: ${name}`,
      text: `
Naam: ${name}
Email: ${email}

Bericht:
${message}
      `,
      html: `
        <h2>Nieuw contactformulier bericht</h2>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <h3>Bericht:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Bericht verzonden'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Fout bij verzenden van bericht' },
      { status: 500 }
    )
  }
}
```

### Components/Pages

Create `/app/contact/page.tsx`:

```typescript
import { ContactForm } from '@/components/contact/ContactForm'
import { ContactInfo } from '@/components/contact/ContactInfo'

export const metadata = {
  title: 'Contact - Wielrijvereniging',
  description: 'Neem contact op met onze wielrijvereniging voor vragen of meer informatie.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-12">
          Contact
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </main>
  )
}
```

Create `/components/contact/ContactInfo.tsx`:

```typescript
export function ContactInfo() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6">Contactgegevens</h2>

      <div className="space-y-6 text-lg">
        <div>
          <h3 className="font-semibold text-xl mb-2">Email</h3>
          <a
            href="mailto:info@wielrijvereniging.be"
            className="text-blue-600 hover:text-blue-700 text-xl"
          >
            info@wielrijvereniging.be
          </a>
        </div>

        <div>
          <h3 className="font-semibold text-xl mb-2">Telefoon</h3>
          <a
            href="tel:+32123456789"
            className="text-blue-600 hover:text-blue-700 text-xl"
          >
            +32 12 34 56 789
          </a>
        </div>

        <div>
          <h3 className="font-semibold text-xl mb-2">Verzamelplaats</h3>
          <address className="not-italic text-gray-700">
            Clubhuis Parking<br />
            Hoofdstraat 123<br />
            3000 Leuven<br />
            België
          </address>
        </div>

        <div>
          <h3 className="font-semibold text-xl mb-2">Starttijd</h3>
          <p className="text-gray-700">
            Zondagen om 09:00 uur<br />
            <span className="text-base text-gray-600">
              (Maart tot Oktober)
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
```

Create `/components/contact/ContactForm.tsx`:

```typescript
'use client'

import { useState } from 'react'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij verzenden')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Fout bij verzenden')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold mb-4 text-green-600">
            Bericht verzonden!
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-blue-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-blue-700 min-h-touch"
          >
            Nog een bericht sturen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6">Stuur ons een bericht</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-xl font-semibold mb-2">
            Naam *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xl font-semibold mb-2">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xl font-semibold mb-2">
            Bericht *
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
            disabled={status === 'loading'}
          />
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-lg">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed min-h-touch"
        >
          {status === 'loading' ? 'Verzenden...' : 'Verstuur bericht'}
        </button>
      </form>
    </div>
  )
}
```

### Libraries/Dependencies

```json
{
  "nodemailer": "^6.9.0"
}
```

```json
{
  "@types/nodemailer": "^6.4.0"
}
```

## Dependencies

- **Depends on:** 001 - Project Setup
- **Blocks:** None (standalone feature)

## UI/UX Notes

**Accessibility:**
- Large, clear labels above each field
- High contrast focus indicators
- Large input fields (easy to tap/click)
- Clear error messages
- Success message easily visible

**Form Validation:**
- Client-side validation for immediate feedback
- Server-side validation for security
- Clear error messages in simple Dutch

**User Experience:**
- Success state with visual confirmation
- Loading state during submission
- Disabled inputs during loading
- Option to send another message after success

## Testing Considerations

- [ ] Contact info displays correctly
- [ ] Form validation works for required fields
- [ ] Email validation rejects invalid emails
- [ ] Form submission sends email successfully
- [ ] Success message displays after submission
- [ ] Error message displays on failure
- [ ] Form clears after successful submission
- [ ] Loading state prevents double submission
- [ ] Works on mobile and desktop
- [ ] Email arrives in admin inbox

## Environment Variables

Add to `.env.example`:

```bash
# Email Configuration
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@wielrijvereniging.be"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@wielrijvereniging.be"
CONTACT_EMAIL="info@wielrijvereniging.be"
```

## Implementation Steps

1. Install nodemailer
2. Create contact page
3. Create ContactInfo component
4. Create ContactForm component
5. Create /api/contact endpoint
6. Configure SMTP settings
7. Add form validation
8. Add success/error states
9. Test email delivery
10. Test on multiple devices

## Email Service Options

- **SMTP Server:** Use club's existing email server
- **SendGrid:** Free tier available (100 emails/day)
- **Mailgun:** Free tier available
- **Gmail SMTP:** Simple for testing (not recommended for production)

## Notes

- **Contact Info:** Update with actual club contact details
- **SMTP Configuration:** Requires email service credentials
- **Spam Protection:** Consider adding reCAPTCHA if spam becomes an issue
- **Rate Limiting:** Consider limiting submissions per IP address
- **Email Template:** Can be enhanced with club branding/logo
