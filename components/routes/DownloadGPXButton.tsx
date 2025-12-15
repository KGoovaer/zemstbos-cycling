'use client'

import { useState } from 'react'

interface DownloadGPXButtonProps {
  routeId: string
  routeName: string
}

export function DownloadGPXButton({ routeId, routeName }: DownloadGPXButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/routes/${routeId}/gpx-data`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch GPX data')
      }

      const { gpxData } = await res.json()
      
      const blob = new Blob([gpxData], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${routeName.replace(/[^a-z0-9]/gi, '_')}.gpx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading GPX:', error)
      alert('Kon GPX bestand niet downloaden')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? 'Bezig met downloaden...' : 'Download GPX bestand'}
    </button>
  )
}
