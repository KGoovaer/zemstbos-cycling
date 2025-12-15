export function PaymentStatusCard({
  status,
  year,
}: {
  status: string
  year: number | null
}) {
  const isPaid = status === 'paid'
  const isExempt = status === 'exempt'

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Betaalstatus</h2>

      <div
        className={`p-6 rounded-lg text-center ${
          isPaid || isExempt ? 'bg-green-50' : 'bg-yellow-50'
        }`}
      >
        <div className="text-4xl mb-2">
          {isPaid || isExempt ? '✓' : '⏳'}
        </div>
        <div className="text-xl font-semibold">
          {isPaid && 'Betaald'}
          {isExempt && 'Vrijgesteld'}
          {!isPaid && !isExempt && 'In afwachting'}
        </div>
        {year && (
          <div className="text-lg text-gray-600 mt-2">Seizoen {year}</div>
        )}
      </div>

      <p className="text-base text-gray-600 mt-4">
        Neem contact op met de admin bij vragen over je betaalstatus
      </p>
    </div>
  )
}
