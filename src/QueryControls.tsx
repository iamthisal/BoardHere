import type { Stop } from './api'
import type { QueryForm } from './query'

export function QueryControls({ form, stops, onChange }: { form: QueryForm; stops: Stop[]; onChange: (change: Partial<QueryForm>) => void }) {
  return <section className="search-section" aria-label="Journey settings">
    <label htmlFor="place">Starting place</label>
    <select id="place" className="form-input" value="" onChange={event => {
      const stop = stops.find(s => s.id === event.target.value)
      if (stop) onChange({ lat: stop.lat, lng: stop.lng })
    }}><option value="">Choose a place or enter coordinates</option>{stops.map(s => <option value={s.id} key={s.id}>{s.name} (estimated location)</option>)}</select>
    <div className="coordinate-row"><div><label htmlFor="latitude">Latitude (estimated)</label><input className="form-input" id="latitude" type="number" step="0.00001" min={-90} max={90} value={form.lat} onChange={e => onChange({lat: e.target.valueAsNumber})} /></div><div><label htmlFor="longitude">Longitude (estimated)</label><input className="form-input" id="longitude" type="number" step="0.00001" min={-180} max={180} value={form.lng} onChange={e => onChange({lng: e.target.valueAsNumber})} /></div></div>
    <label htmlFor="drop">Bus drop-off stop</label><select className="form-input" id="drop" value={form.destination} onChange={e => onChange({destination: e.target.value})}>{stops.filter(s => s.kind === 'destination').map(s => <option key={s.id} value={s.slug}>{s.name} (estimated)</option>)}</select>
    <label className="control-label">Preference</label><div className="sort-control" role="group" aria-label="Preference">{(['cheapest', 'fastest', 'comfortable'] as const).map(p => <button key={p} type="button" aria-pressed={form.preference === p} className={form.preference === p ? 'active' : ''} onClick={() => onChange({preference: p})}>{p[0].toUpperCase() + p.slice(1)}</button>)}</div>
    <label htmlFor="minutes">Minutes available</label><input className="form-input" id="minutes" type="number" min={1} max={1440} step={1} value={form.minutes} onChange={e => onChange({minutes: e.target.valueAsNumber})} />
    <label className="checkbox-label"><input type="checkbox" checked={form.overrideTime} onChange={e => onChange({overrideTime: e.target.checked})} />Choose journey time</label>
    {form.overrideTime && <><label htmlFor="journey-time">Date and time (Sri Lanka)</label><input className="form-input" id="journey-time" type="datetime-local" value={form.time} onChange={e => onChange({time: e.target.value})} /></>}
  </section>
}
