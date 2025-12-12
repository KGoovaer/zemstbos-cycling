import { RouteMap } from './RouteMap'

interface RouteMapPreviewProps {
  routeId: string
  routeName: string
}

export function RouteMapPreview({ routeId, routeName }: RouteMapPreviewProps) {
  return <RouteMap routeId={routeId} routeName={routeName} />
}
