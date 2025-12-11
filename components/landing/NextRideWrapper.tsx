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

  useEffect(() => {
    async function fetchNextRide() {
      try {
        const response = await fetch('/api/rides/next')
        if (response.ok) {
          const data = await response.json()
          setRide(data)
        } else {
          setRide(null)
        }
      } catch (error) {
        console.error('Error fetching next ride:', error)
        setRide(null)
      } finally {
        setLoading(false)
      }
    }

    fetchNextRide()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Volgende Rit</h2>
          <p className="text-xl text-gray-600">Laden...</p>
        </div>
      </section>
    )
  }

  return <NextRide ride={ride} />
}
