'use client'

interface RouteMapPreviewProps {
  routeId: string
}

export function RouteMapPreview({ routeId: _routeId }: RouteMapPreviewProps) {
  return (
    <div className="mb-6 bg-gray-100 rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Routekaart</h2>
      <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-500">
        <p className="text-xl">
          Kaartweergave wordt geïmplementeerd in story 023
        </p>
      </div>
    </div>
  )
}
