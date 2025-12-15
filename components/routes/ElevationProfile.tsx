'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  TooltipItem,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

interface ElevationPoint {
  distance: number
  elevation: number
}

interface ElevationProfileProps {
  routeId: string
}

export function ElevationProfile({ routeId }: ElevationProfileProps) {
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([])
  const [totalElevationGain, setTotalElevationGain] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadElevationData() {
      try {
        const response = await fetch(`/api/routes/${routeId}/gpx-data`)
        
        if (!response.ok) {
          throw new Error('Failed to load route data')
        }

        const { gpxData } = await response.json()

        if (!mounted) return

        // Parse GPX and extract elevation points
        const parser = new DOMParser()
        const gpx = parser.parseFromString(gpxData, 'text/xml')
        const trackPoints = gpx.querySelectorAll('trkpt')

        if (trackPoints.length === 0) {
          if (mounted) {
            setError('Geen hoogte data beschikbaar')
            setLoading(false)
          }
          return
        }

        const points: ElevationPoint[] = []
        let totalDistance = 0
        let elevationGain = 0
        let prevElevation: number | null = null

        trackPoints.forEach((pt, index) => {
          const ele = pt.querySelector('ele')
          if (!ele) return

          const elevation = parseFloat(ele.textContent || '0')

          if (index > 0) {
            const prevPt = trackPoints[index - 1]
            const lat1 = parseFloat(prevPt.getAttribute('lat') || '0')
            const lon1 = parseFloat(prevPt.getAttribute('lon') || '0')
            const lat2 = parseFloat(pt.getAttribute('lat') || '0')
            const lon2 = parseFloat(pt.getAttribute('lon') || '0')

            // Haversine distance
            const R = 6371 // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180
            const dLon = (lon2 - lon1) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            totalDistance += R * c

            // Calculate elevation gain
            if (prevElevation !== null && elevation > prevElevation) {
              elevationGain += elevation - prevElevation
            }
          }

          prevElevation = elevation
          points.push({ distance: totalDistance, elevation })
        })

        // Simplify data for better performance (keep every Nth point for long routes)
        const maxPoints = 200
        let simplifiedPoints = points
        if (points.length > maxPoints) {
          const step = Math.ceil(points.length / maxPoints)
          simplifiedPoints = points.filter((_, index) => index % step === 0)
          // Always include the last point
          if (simplifiedPoints[simplifiedPoints.length - 1] !== points[points.length - 1]) {
            simplifiedPoints.push(points[points.length - 1])
          }
        }

        if (mounted) {
          setElevationData(simplifiedPoints)
          setTotalElevationGain(Math.round(elevationGain))
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading elevation data:', err)
        if (mounted) {
          setError('Fout bij laden van hoogte data')
          setLoading(false)
        }
      }
    }

    loadElevationData()

    return () => {
      mounted = false
    }
  }, [routeId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4">Hoogteprofiel</h2>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-xl text-gray-600">Hoogteprofiel laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || elevationData.length === 0) {
    return null
  }

  const chartData = {
    labels: elevationData.map(p => p.distance.toFixed(1)),
    datasets: [
      {
        label: 'Hoogte (m)',
        data: elevationData.map(p => p.elevation),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y
            return value !== null ? `${value.toFixed(0)}m` : ''
          },
          title: (context: TooltipItem<'line'>[]) => `${context[0].label} km`,
        },
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Afstand (km)',
          font: { size: 16 },
        },
        ticks: {
          font: { size: 14 },
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Hoogte (m)',
          font: { size: 16 },
        },
        ticks: {
          font: { size: 14 },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Hoogteprofiel</h2>
        {totalElevationGain > 0 && (
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <span className="text-lg text-gray-600">Totale stijging: </span>
            <span className="text-xl font-bold text-blue-600">{totalElevationGain}m</span>
          </div>
        )}
      </div>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
