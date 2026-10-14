import type { Preference, RecommendInput } from './api'

export type QueryForm = { lat: number; lng: number; destination: string; preference: Preference; minutes: number; overrideTime: boolean; time: string }
export function buildInput(form: QueryForm): RecommendInput {
  if (!Number.isFinite(form.lat) || !Number.isFinite(form.lng) || Math.abs(form.lat) > 90 || Math.abs(form.lng) > 180) throw new Error('Enter valid starting coordinates.')
  if (!Number.isInteger(form.minutes) || form.minutes < 1 || form.minutes > 1440) throw new Error('Available minutes must be from 1 to 1440.')
  if (!form.destination) throw new Error('Choose a drop-off stop.')
  const input: RecommendInput = { origin: { lat: form.lat, lng: form.lng }, destination: form.destination, preference: form.preference, minutes_available: form.minutes }
  if (form.overrideTime) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(form.time) || Number.isNaN(Date.parse(`${form.time}:00+05:30`))) throw new Error('Enter a valid Sri Lanka date and time.')
    input.now = `${form.time}:00+05:30`
  }
  return input
}
