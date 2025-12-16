/**
 * Weather API integration using Open-Meteo (free, no API key required)
 * Provides weather forecasts for cycling routes
 */

export interface WeatherForecast {
  temperature: number
  precipitationChance: number
  windSpeed: number
  weatherCode: number
  weatherDescription: string
  weatherIcon: string
  date: string
  time: string
}

/**
 * Weather code to description and icon mapping
 * Based on WMO Weather interpretation codes
 */
const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'Helder', icon: '☀️' },
  1: { description: 'Overwegend helder', icon: '🌤️' },
  2: { description: 'Gedeeltelijk bewolkt', icon: '⛅' },
  3: { description: 'Bewolkt', icon: '☁️' },
  45: { description: 'Mist', icon: '🌫️' },
  48: { description: 'Rijpmist', icon: '🌫️' },
  51: { description: 'Lichte motregen', icon: '🌦️' },
  53: { description: 'Motregen', icon: '🌦️' },
  55: { description: 'Dichte motregen', icon: '🌧️' },
  61: { description: 'Lichte regen', icon: '🌧️' },
  63: { description: 'Regen', icon: '🌧️' },
  65: { description: 'Zware regen', icon: '⛈️' },
  71: { description: 'Lichte sneeuw', icon: '🌨️' },
  73: { description: 'Sneeuw', icon: '🌨️' },
  75: { description: 'Zware sneeuw', icon: '❄️' },
  77: { description: 'IJskorrels', icon: '🌨️' },
  80: { description: 'Lichte buien', icon: '🌦️' },
  81: { description: 'Buien', icon: '🌧️' },
  82: { description: 'Zware buien', icon: '⛈️' },
  85: { description: 'Lichte sneeuwbuien', icon: '🌨️' },
  86: { description: 'Sneeuwbuien', icon: '❄️' },
  95: { description: 'Onweer', icon: '⛈️' },
  96: { description: 'Onweer met hagel', icon: '⛈️' },
  99: { description: 'Zwaar onweer met hagel', icon: '⛈️' }
}

function getWeatherInfo(code: number): { description: string; icon: string } {
  return weatherCodeMap[code] || { description: 'Onbekend', icon: '❓' }
}

/**
 * Fetch weather forecast from Open-Meteo API
 * @param date - The ride date (YYYY-MM-DD)
 * @param time - The ride time (HH:MM)
 * @param latitude - Starting location latitude (default: Belgium center)
 * @param longitude - Starting location longitude (default: Belgium center)
 */
export async function getWeatherForecast(
  date: string,
  time: string,
  latitude: number = 50.8503, // Brussels/Belgium center as default
  longitude: number = 4.3517
): Promise<WeatherForecast | null> {
  try {
    // Parse the ride date and time
    const rideDateTime = new Date(`${date}T${time}:00`)
    const now = new Date()
    
    // Check if ride is more than 7 days away (API limitation)
    const daysUntilRide = Math.floor((rideDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilRide > 7) {
      return null // Forecast not available beyond 7 days
    }
    
    // Check if ride is in the past
    if (rideDateTime < now) {
      return null
    }

    // Build API URL with parameters
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: 'temperature_2m,precipitation_probability,wind_speed_10m,weather_code',
      timezone: 'Europe/Brussels',
      forecast_days: '7'
    })

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      { next: { revalidate: 21600 } } // Cache for 6 hours
    )

    if (!response.ok) {
      console.error('Weather API error:', response.statusText)
      return null
    }

    const data = await response.json()

    // Find the closest hour to the ride time
    const targetHour = rideDateTime.toISOString().slice(0, 13) + ':00'
    const hourIndex = data.hourly.time.findIndex((t: string) => t === targetHour)

    if (hourIndex === -1) {
      console.error('Weather data not found for target time:', targetHour)
      return null
    }

    const weatherCode = data.hourly.weather_code[hourIndex]
    const weatherInfo = getWeatherInfo(weatherCode)

    return {
      temperature: Math.round(data.hourly.temperature_2m[hourIndex]),
      precipitationChance: data.hourly.precipitation_probability[hourIndex] || 0,
      windSpeed: Math.round(data.hourly.wind_speed_10m[hourIndex]),
      weatherCode,
      weatherDescription: weatherInfo.description,
      weatherIcon: weatherInfo.icon,
      date,
      time
    }
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    return null
  }
}

/**
 * Get color class for temperature display
 */
export function getTemperatureColor(temp: number): string {
  if (temp < 5) return 'text-blue-600'
  if (temp < 15) return 'text-cyan-600'
  if (temp < 25) return 'text-green-600'
  return 'text-orange-600'
}

/**
 * Get color class for wind speed display
 */
export function getWindSpeedColor(speed: number): string {
  if (speed < 15) return 'text-green-600'
  if (speed < 30) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get color class for precipitation chance display
 */
export function getPrecipitationColor(chance: number): string {
  if (chance < 30) return 'text-green-600'
  if (chance < 70) return 'text-yellow-600'
  return 'text-red-600'
}
