'use client'

import { useEffect, useState } from 'react'
import { NextRide } from './NextRide'
import { ScheduledRide, Route } from '@prisma/client'

type NextRideData = ScheduledRide & {
  route: Route
}

export function NextRideWrapper() {
  const [ride, setRide] = useState<NextRideData | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchNextRide() {
      try {
        const response = await fetch('/api/rides/next')
        
        if (response.status === 404) {
          setRide(null)
          setError(false)
        } else if (response.ok) {
          const data = await response.json()
          setRide(data)
          setError(false)
        } else {
          setError(true)
          setRide(null)
        }
      } catch (err) {
        console.error('Error fetching next ride:', err)
        setError(true)
        setRide(null)
      } finally {
        setLoading(false)
      }
    }

    fetchNextRide()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Volgende Rit</h2>
          <div className="flex justify-center items-center">
            <div className="animate-pulse">
              <p className="text-xl text-slate-800">Laden...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Volgende Rit</h2>
          <p className="text-xl text-slate-800">
            Er is een fout opgetreden bij het laden van de rit
          </p>
          <p className="text-lg text-slate-700 mt-2">
            Probeer de pagina later opnieuw te laden
          </p>
        </div>
      </section>
    )
  }

  return <NextRide ride={ride} />
}
