import assert from 'node:assert/strict'
import test from 'node:test'
import { createApiClient } from '../src/api.ts'

test('API client sends the full deterministic request context', async (t) => {
  const input = { origin: { lat: 6.9, lng: 79.9 }, destination: 'maharagama', preference: 'fastest', minutes_available: 90, now: '2026-10-14T08:00:00+05:30' }
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, 'http://localhost:8000/recommend')
    assert.deepEqual(JSON.parse(init.body), input)
    return new Response(JSON.stringify({ options: [] }), { status: 200 })
  })
  assert.deepEqual(await createApiClient('http://localhost:8000/').recommend(input), { options: [] })
})

test('API client surfaces backend failures without fabricating options', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ detail: 'Database unavailable' }), { status: 503 }))
  await assert.rejects(createApiClient('').stops(), /Database unavailable/)
})

test('API client explains network failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('network') })
  await assert.rejects(createApiClient('').stops(), /backend is running/)
})

test('crowd report includes bus leg and selected as-of time', async(t)=>{
  t.mock.method(globalThis,'fetch',async(url,init)=>{
    assert.equal(url,'http://localhost:8000/crowd-reports')
    assert.deepEqual(JSON.parse(init.body),{leg_id:'bus',crowd_level:'packed',reported_at:'2026-10-14T08:00:00+05:30'})
    return new Response('{}',{status:201})
  })
  await createApiClient('http://localhost:8000').report('bus','packed','2026-10-14T08:00:00+05:30')
})
