'use client'

interface DownloadGPXButtonProps {
  routeId: string
  routeName: string
}

export function DownloadGPXButton({ routeId: _routeId, routeName: _routeName }: DownloadGPXButtonProps) {
  const handleDownload = () => {
    alert('GPX download functionaliteit wordt geïmplementeerd in story 025')
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
    >
      Download GPX bestand
    </button>
  )
}
