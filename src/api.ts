export type Point = { lat: number; lng: number }
export type Preference = 'cheapest' | 'fastest' | 'comfortable'
export type Stop = Point & { id: string; slug: string; name: string; kind: 'origin' | 'boarding' | 'destination'; data_status: string; source: string }
export type Leg = { id: string; mode: 'walk' | 'taxi' | 'bus'; from_stop_id: string | null; to_stop: Stop; cost_lkr: number; in_vehicle_minutes: number; wait_minutes: number; walk_km: number; crowd_level: string; crowd_source: string; data_status: string }
export type Criterion = { raw: number; normalized: number; weight: number; contribution: number }
export type Option = { id: string; title: string; cost_lkr: number; time_minutes: number; wait_minutes: number; walk_km: number; walk_minutes: number; crowd_level: string; score: number; score_breakdown: Record<string, Criterion>; bucket: string; data_status: string; rule_code: string; fits_available_time: boolean; savings_lkr: number | null; explanation: string; legs: Leg[] }
export type RecommendInput = { origin: Point; destination: string; preference: Preference; minutes_available: number; now?: string }
export type Recommendation = { now: string; bucket: string; preference: Preference; minutes_available: number; recommended_id: string | null; options: Option[]; message: string | null; data_status: string }

export function createApiClient(baseUrl: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, init)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error
      throw new Error('Cannot reach BoardHere. Check that the local backend is running.')
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${response.status}). Check your inputs.`)
    }
    return response.json() as Promise<T>
  }
  return {
    stops: (signal?: AbortSignal) => request<Stop[]>('/stops', { signal }),
    recommend: (input: RecommendInput, signal?: AbortSignal) => request<Recommendation>('/recommend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
    }),
  }
}
