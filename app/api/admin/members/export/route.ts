import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    const members = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        paymentStatus: true,
        paymentYear: true,
        createdAt: true,
      },
    })

    // Create CSV content
    const headers = [
      'Voornaam',
      'Achternaam',
      'Email',
      'Telefoon',
      'Rol',
      'Betaalstatus',
      'Betaaljaar',
      'Aangemaakt',
    ]
    
    const rows = members.map((member) => [
      member.firstName,
      member.lastName,
      member.email,
      member.phone || '',
      member.role === 'admin' ? 'Beheerder' : 'Lid',
      member.paymentStatus === 'paid' ? 'Betaald' : 'Onbetaald',
      member.paymentYear?.toString() || '',
      new Date(member.createdAt).toLocaleDateString('nl-BE'),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leden-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting members:', error)
    return NextResponse.json(
      { error: 'Failed to export members' },
      { status: 500 }
    )
  }
}
