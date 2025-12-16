'use client'

import { useEffect, useState } from 'react'
import type { WeatherForecast as WeatherData } from '@/lib/weather'

interface WeatherForecastProps {
  rideDate: string
  startTime: string
  latitude?: number
  longitude?: number
}

export function WeatherForecast({ rideDate, startTime, latitude, longitude }: WeatherForecastProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true)
        setError(false)
        
        const params = new URLSearchParams({
          date: rideDate,
          time: startTime
        })
        
        if (latitude !== undefined) params.append('latitude', latitude.toString())
        if (longitude !== undefined) params.append('longitude', longitude.toString())

        const response = await fetch(`/api/weather?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather')
        }
        
        const data = await response.json()
        setWeather(data.forecast)
      } catch (err) {
        console.error('Error fetching weather:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [rideDate, startTime, latitude, longitude])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-xl text-slate-800">
            Weersvoorspelling laden...
          </div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return null // Silently hide if weather data unavailable
  }

  const getTemperatureColor = (temp: number): string => {
    if (temp < 5) return 'text-blue-600'
    if (temp < 15) return 'text-cyan-600'
    if (temp < 25) return 'text-green-600'
    return 'text-orange-600'
  }

  const getWindSpeedColor = (speed: number): string => {
    if (speed < 15) return 'text-green-600'
    if (speed < 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPrecipitationColor = (chance: number): string => {
    if (chance < 30) return 'text-green-600'
    if (chance < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-8 border-2 border-blue-200">
      <div className="flex items-center mb-4">
        <span className="text-5xl mr-4">{weather.weatherIcon}</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Weersvoorspelling</h2>
          <p className="text-lg text-slate-800">{weather.weatherDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-lg text-slate-800 mb-2">🌡️ Temperatuur</div>
          <div className={`text-4xl font-bold ${getTemperatureColor(weather.temperature)}`}>
            {weather.temperature}°C
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-lg text-slate-800 mb-2">💧 Neerslag kans</div>
          <div className={`text-4xl font-bold ${getPrecipitationColor(weather.precipitationChance)}`}>
            {weather.precipitationChance}%
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-lg text-slate-800 mb-2">💨 Windsnelheid</div>
          <div className={`text-4xl font-bold ${getWindSpeedColor(weather.windSpeed)}`}>
            {weather.windSpeed} km/u
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-700 text-center">
        Voorspelling wordt dagelijks bijgewerkt • Bron: Open-Meteo
      </div>
    </div>
  )
}
