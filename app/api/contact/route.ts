import { NextResponse } from 'next/server'

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

    // Log the contact form submission (in production, this would send an email)
    // eslint-disable-next-line no-console
    console.log('Contact form submission:', {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrate with email service (nodemailer, SendGrid, etc.)
    // For now, we just log and return success
    
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

export const dynamic = 'force-dynamic'
