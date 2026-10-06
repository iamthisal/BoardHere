import assert from 'node:assert/strict'
import test from 'node:test'
import { planJourneys, rankJourneys } from '../src/planner.ts'

const stops = [
  { id: 'a', name: 'A', lat: 6.90, lng: 79.86 },
  { id: 'b', name: 'B', lat: 6.90, lng: 79.88 },
  { id: 'c', name: 'C', lat: 6.90, lng: 79.90 },
]
const routes = [{ id: 'test', label: 'Test route', fareLkr: 100, stops }]

test('only upstream stops are offered for the chosen drop-off', () => {
  const journeys = planJourneys(stops[0], 'b', routes)
  assert.ok(journeys.length > 0)
  assert.ok(journeys.every((journey) => journey.board.id === 'a' && journey.drop.id === 'b'))
  assert.deepEqual(planJourneys(stops[0], 'a', routes), [])
})

test('origins beyond access limits have no boarding option', () => {
  assert.deepEqual(planJourneys({ lat: 7.3, lng: 80.2 }, 'c', routes), [])
})

test('fastest and cheapest ranking can choose different access modes', () => {
  const origin = { lat: 6.91, lng: 79.86 }
  const journeys = planJourneys(origin, 'c', routes)
  assert.ok(journeys.some((journey) => journey.mode === 'walk'))
  assert.ok(journeys.some((journey) => journey.mode === 'tuk'))
  assert.equal(rankJourneys(journeys, 'fastest')[0].mode, 'tuk')
  assert.equal(rankJourneys(journeys, 'cheapest')[0].mode, 'walk')
})
