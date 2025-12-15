import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { PaymentStatusCard } from '@/components/profile/PaymentStatusCard'

export const metadata = {
  title: 'Mijn Profiel - Wielrijvereniging',
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  if (!prisma) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-bold mb-8">Mijn Profiel</h1>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-lg">Database connection not available</p>
          </div>
        </div>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8">Mijn Profiel</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProfileForm user={user} />
          </div>

          <div>
            <PaymentStatusCard
              status={user.paymentStatus}
              year={user.paymentYear}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
