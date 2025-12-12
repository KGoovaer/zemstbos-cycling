import { prisma } from '@/lib/prisma'

interface PaymentStatusProps {
  userId: string
}

export async function PaymentStatus({ userId }: PaymentStatusProps) {
  if (!prisma) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      paymentStatus: true,
      paymentYear: true
    }
  })

  if (!user) {
    return null
  }

  const currentYear = new Date().getFullYear()
  const isPaid = user.paymentStatus === 'paid' && user.paymentYear === currentYear

  return (
    <div className={`rounded-lg shadow-lg p-6 ${isPaid ? 'bg-green-50 border-2 border-green-300' : 'bg-orange-50 border-2 border-orange-300'}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Lidmaatschap {currentYear}</h2>

      <div className="text-center py-4">
        {isPaid ? (
          <>
            <div className="text-5xl mb-3">✅</div>
            <p className="text-xl font-semibold text-green-800 mb-2">Betaald</p>
            <p className="text-lg text-gray-700">
              Je lidmaatschap is in orde voor {currentYear}
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-xl font-semibold text-orange-800 mb-2">Betaling uitstaand</p>
            <p className="text-lg text-gray-700 mb-4">
              Je lidmaatschap voor {currentYear} is nog niet betaald
            </p>
            <div className="bg-white rounded-lg p-4 text-left">
              <p className="text-sm font-semibold text-gray-800 mb-2">Betaalinformatie:</p>
              <p className="text-sm text-gray-700">
                Neem contact op met de penningmeester voor betaaldetails
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
