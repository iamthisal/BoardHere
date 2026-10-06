import type { Point, Route } from './planner'

export const places: Array<{ id: string; name: string; point: Point }> = [
  { id: 'orion', name: 'Orion City', point: { lat: 6.952, lng: 79.879 } },
  { id: 'orugodawatta', name: 'Orugodawatta', point: { lat: 6.951, lng: 79.883 } },
  { id: 'maradana', name: 'Maradana', point: { lat: 6.928, lng: 79.870 } },
  { id: 'borella', name: 'Borella', point: { lat: 6.916, lng: 79.878 } },
  { id: 'rajagiriya', name: 'Rajagiriya', point: { lat: 6.909, lng: 79.893 } },
  { id: 'nara', name: 'Narahenpita', point: { lat: 6.891, lng: 79.875 } },
  { id: 'nugegoda', name: 'Nugegoda', point: { lat: 6.872, lng: 79.891 } },
]

// Synthetic corridor used only to exercise the planner UI, not a claim about a real bus service.
export const demoRoutes: Route[] = [
  {
    id: 'sample-corridor',
    label: 'Sample bus corridor',
    fareLkr: 100,
    stops: [
      { id: 'orugodawatta-stop', name: 'Orugodawatta', lat: 6.951, lng: 79.883 },
      { id: 'borella-stop', name: 'Borella', lat: 6.916, lng: 79.878 },
      { id: 'nara-stop', name: 'Narahenpita', lat: 6.891, lng: 79.875 },
      { id: 'nugegoda-stop', name: 'Nugegoda', lat: 6.872, lng: 79.891 },
      { id: 'maharagama-stop', name: 'Maharagama', lat: 6.848, lng: 79.926 },
    ],
  },
]
