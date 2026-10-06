export type Point = { lat: number; lng: number }
export type Stop = Point & { id: string; name: string }
export type Route = { id: string; label: string; stops: Stop[]; fareLkr: number }
export type AccessMode = 'walk' | 'tuk'
export type Journey = {
  id: string
  route: Route
  board: Stop
  drop: Stop
  mode: AccessMode
  accessKm: number
  accessMinutes: number
  waitMinutes: number
  busMinutes: number
  totalMinutes: number
  totalCostLkr: number
}

const earthRadiusKm = 6371

export function distanceKm(a: Point, b: Point): number {
  const latDiff = ((b.lat - a.lat) * Math.PI) / 180
  const lngDiff = ((b.lng - a.lng) * Math.PI) / 180
  const aLat = (a.lat * Math.PI) / 180
  const bLat = (b.lat * Math.PI) / 180
  const h = Math.sin(latDiff / 2) ** 2 + Math.cos(aLat) * Math.cos(bLat) * Math.sin(lngDiff / 2) ** 2
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h))
}

function routeDistance(stops: Stop[], from: number, to: number): number {
  let km = 0
  for (let i = from; i < to; i += 1) km += distanceKm(stops[i], stops[i + 1]) * 1.35
  return km
}

export function planJourneys(origin: Point, dropId: string, routes: Route[]): Journey[] {
  const journeys: Journey[] = []

  for (const route of routes) {
    const dropIndex = route.stops.findIndex((stop) => stop.id === dropId)
    if (dropIndex < 1) continue

    for (let index = 0; index < dropIndex; index += 1) {
      const board = route.stops[index]
      const directKm = distanceKm(origin, board)
      const busMinutes = Math.ceil((routeDistance(route.stops, index, dropIndex) / 19) * 60)

      for (const mode of ['walk', 'tuk'] as const) {
        const accessKm = directKm * (mode === 'walk' ? 1.25 : 1.4)
        if (mode === 'walk' && accessKm > 2.4) continue
        if (mode === 'tuk' && (accessKm < 0.6 || accessKm > 7)) continue

        const accessMinutes = mode === 'walk'
          ? Math.ceil((accessKm / 4.5) * 60)
          : Math.ceil(4 + (accessKm / 22) * 60)
        const waitMinutes = 8
        const tukFare = mode === 'tuk' ? Math.ceil((130 + accessKm * 75) / 10) * 10 : 0

        journeys.push({
          id: `${route.id}-${board.id}-${mode}`,
          route,
          board,
          drop: route.stops[dropIndex],
          mode,
          accessKm,
          accessMinutes,
          waitMinutes,
          busMinutes,
          totalMinutes: accessMinutes + waitMinutes + busMinutes,
          totalCostLkr: route.fareLkr + tukFare,
        })
      }
    }
  }

  return journeys.sort((a, b) => a.totalMinutes - b.totalMinutes || a.totalCostLkr - b.totalCostLkr)
}

export type SortMode = 'recommended' | 'fastest' | 'cheapest'

export function rankJourneys(journeys: Journey[], mode: SortMode): Journey[] {
  const score = (journey: Journey) => {
    if (mode === 'fastest') return journey.totalMinutes
    if (mode === 'cheapest') return journey.totalCostLkr
    return journey.totalMinutes + journey.totalCostLkr / 18
  }
  return [...journeys].sort((a, b) => score(a) - score(b) || a.totalMinutes - b.totalMinutes)
}
