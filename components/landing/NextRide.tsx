import { ScheduledRide, Route } from '@prisma/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

type NextRideData = ScheduledRide & {
  route: Route
  isWinterRide?: boolean
}

interface NextRideProps {
  ride?: NextRideData | null
}

function getDifficultyLabel(difficulty: string | null): string {
  if (!difficulty) return 'Niet opgegeven'
  
  const labels: Record<string, string> = {
    'easy': 'Makkelijk',
    'medium': 'Gemiddeld',
    'hard': 'Zwaar',
  }
  
  return labels[difficulty.toLowerCase()] || difficulty
}

export function NextRide({ ride }: NextRideProps) {
  if (!ride) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Volgende Rit</h2>
          <p className="text-xl text-slate-800">
            Geen ritten gepland op dit moment
          </p>
          <p className="text-lg text-slate-700 mt-2">
            Neem contact op met de club voor meer informatie
          </p>
        </div>
      </section>
    )
  }

  const rideDate = new Date(ride.rideDate)
  const formattedDate = format(rideDate, 'EEEE d MMMM yyyy', { locale: nl })
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
  
  const startTime = typeof ride.startTime === 'string' && ride.startTime.includes(':')
    ? ride.startTime.slice(0, 5)
    : new Date(ride.startTime).toLocaleTimeString('nl-BE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

  const isWinter = ride.isWinterRide || false

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {isWinter && (
            <div className="inline-block mb-4">
              <span className="text-6xl">❄️</span>
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Volgende Rit
          </h2>
          <p className="text-xl text-slate-600">
            {isWinter 
              ? 'Sluit je aan voor onze wekelijkse wintertoer' 
              : 'Sluit je aan voor onze eerstvolgende zondagrit'}
          </p>
        </div>

        <div className={`max-w-4xl mx-auto card p-8 md:p-12 border-2 ${
          isWinter 
            ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-300'
            : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
        }`}>
          <div className="text-center mb-8">
            <div className="inline-block bg-white px-6 py-3 rounded-full shadow-md mb-4">
              <p className="text-2xl font-bold text-emerald-600">
                📅 {capitalizedDate}
              </p>
            </div>
            <p className="text-xl text-slate-700 font-medium">
              ⏰ Start om {startTime}
            </p>
          </div>

          <h3 className="text-3xl md:text-4xl font-bold text-center mb-10 text-slate-900">
            {ride.route.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className={`text-4xl font-bold mb-2 ${isWinter ? 'text-blue-600' : 'text-emerald-600'}`}>
                {ride.route.distanceKm.toString()} km
              </div>
              <div className="text-lg text-slate-600 font-medium">Afstand</div>
            </div>

            {ride.route.elevationM !== null && (
              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className={`text-4xl font-bold mb-2 ${isWinter ? 'text-blue-600' : 'text-emerald-600'}`}>
                  {ride.route.elevationM}m
                </div>
                <div className="text-lg text-slate-600 font-medium">Hoogtemeters</div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className={`text-4xl font-bold mb-2 ${isWinter ? 'text-blue-600' : 'text-emerald-600'}`}>
                {getDifficultyLabel(ride.route.difficulty)}
              </div>
              <div className="text-lg text-slate-600 font-medium">Niveau</div>
            </div>
          </div>

          {ride.route.description && (
            <p className="text-lg text-slate-800 mb-6 text-center">
              {ride.route.description}
            </p>
          )}

          {ride.notes && (
            <div className={`border-l-4 p-4 mb-6 ${
              isWinter 
                ? 'bg-blue-50 border-blue-400' 
                : 'bg-yellow-50 border-yellow-400'
            }`}>
              <p className="text-lg">{ride.notes}</p>
            </div>
          )}

          {isWinter && (
            <div className="bg-blue-100 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-lg font-semibold text-blue-900">
                ℹ️ Vaste winterrit
              </p>
              <p className="text-base text-blue-800 mt-1">
                Geen inschrijving nodig - kom gewoon langs elke zondag om 9:00!
              </p>
            </div>
          )}

          <div className="text-center bg-white rounded-xl p-8 shadow-inner">
            <p className="text-xl text-slate-700 mb-6 font-medium">
              🗺️ Meld je aan om de volledige route en GPX te bekijken
            </p>
            <Link
              href="/login"
              className="btn-primary"
            >
              Bekijk volledige route →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
