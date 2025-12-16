# Weather Integration Feature Guide

## User Perspective

### What Members See

When viewing a ride detail page, members now see a weather forecast card displaying:

```
┌─────────────────────────────────────────────────────┐
│ ☀️  Weersvoorspelling                               │
│     Helder                                          │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ 🌡️ Temperatuur│  │ 💧 Neerslag  │  │ 💨 Windsnelh.│ │
│  │             │  │    kans      │  │    eid      │ │
│  │    18°C     │  │     15%      │  │   12 km/u   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                     │
│ Voorspelling wordt dagelijks bijgewerkt            │
│ Bron: Open-Meteo                                    │
└─────────────────────────────────────────────────────┘
```

### When Weather is Shown

Weather forecasts appear on ride detail pages for:
- ✅ Upcoming rides (within next 7 days)
- ✅ Rides happening today

Weather forecasts do NOT appear for:
- ❌ Rides more than 7 days in the future
- ❌ Past rides

### Color Indicators

#### Temperature
- 🔵 **Blue** (< 5°C): Very cold - winter gear needed
- 🔵 **Cyan** (5-14°C): Cool - jacket recommended
- 🟢 **Green** (15-24°C): Comfortable - ideal cycling weather
- 🟠 **Orange** (≥ 25°C): Warm - sun protection needed

#### Precipitation Chance
- 🟢 **Green** (< 30%): Low risk - dry ride likely
- 🟡 **Yellow** (30-69%): Medium risk - bring rain gear
- 🔴 **Red** (≥ 70%): High risk - rain expected

#### Wind Speed
- 🟢 **Green** (< 15 km/u): Light breeze - easy riding
- 🟡 **Yellow** (15-29 km/u): Moderate wind - may affect speed
- 🔴 **Red** (≥ 30 km/u): Strong wind - challenging conditions

## Technical Implementation

### API Endpoints

#### GET /api/weather

Fetches weather forecast for a specific date and time.

**Query Parameters:**
- `date` (required): Ride date in YYYY-MM-DD format
- `time` (required): Ride time in HH:MM format
- `latitude` (optional): Starting location latitude
- `longitude` (optional): Starting location longitude

**Example Request:**
```
GET /api/weather?date=2025-03-15&time=09:00
```

**Example Response:**
```json
{
  "forecast": {
    "temperature": 18,
    "precipitationChance": 15,
    "windSpeed": 12,
    "weatherCode": 0,
    "weatherDescription": "Helder",
    "weatherIcon": "☀️",
    "date": "2025-03-15",
    "time": "09:00"
  }
}
```

**Cache Headers:**
- `Cache-Control: public, s-maxage=21600, stale-while-revalidate=43200`
- Data cached for 6 hours
- Stale data can be served for up to 12 hours while revalidating

### Weather Codes

Based on WMO Weather Interpretation Codes:

| Code | Dutch Description | Icon | English |
|------|------------------|------|---------|
| 0 | Helder | ☀️ | Clear |
| 1 | Overwegend helder | 🌤️ | Mainly clear |
| 2 | Gedeeltelijk bewolkt | ⛅ | Partly cloudy |
| 3 | Bewolkt | ☁️ | Overcast |
| 45-48 | Mist/Rijpmist | 🌫️ | Fog |
| 51-55 | Motregen | 🌦️🌧️ | Drizzle |
| 61-65 | Regen | 🌧️⛈️ | Rain |
| 71-77 | Sneeuw/IJskorrels | 🌨️❄️ | Snow |
| 80-86 | Buien | 🌦️🌧️❄️ | Showers |
| 95-99 | Onweer | ⛈️ | Thunderstorm |

## Configuration

### Default Location

If no coordinates provided, defaults to Belgium center:
- Latitude: 50.8503 (Brussels)
- Longitude: 4.3517 (Brussels)

### Custom Locations

To use route-specific coordinates, update the ride detail page:

```tsx
<WeatherForecast 
  rideDate={rideDateString} 
  startTime={formattedTime}
  latitude={50.9876}  // Route start latitude
  longitude={4.5432}  // Route start longitude
/>
```

---

**Last Updated:** 2025-12-16  
**Feature Version:** 1.0  
**Implemented in:** Phase 5 - Future Enhancements
