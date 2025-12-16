import { NextRequest, NextResponse } from 'next/server'
import { getWeatherForecast } from '@/lib/weather'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Missing required parameters: date and time' },
        { status: 400 }
      )
    }

    // Parse coordinates if provided
    const lat = latitude ? parseFloat(latitude) : undefined
    const lon = longitude ? parseFloat(longitude) : undefined

    const forecast = await getWeatherForecast(date, time, lat, lon)

    if (!forecast) {
      return NextResponse.json(
        { forecast: null, message: 'Weather forecast not available' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { forecast },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200'
        }
      }
    )
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast' },
      { status: 500 }
    )
  }
}
