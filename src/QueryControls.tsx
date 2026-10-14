import type { Stop } from './api'
import { coordinateOriginUpdate, type QueryForm } from './query'
import { SearchableStopCombobox } from './SearchableStopCombobox'

export const originUpdate = (stop:Stop):Partial<QueryForm> => ({originStopId:stop.id,lat:stop.lat,lng:stop.lng})
export const destinationUpdate = (stop:Stop):Partial<QueryForm> => ({destination:stop.slug})

export function QueryControls({ form, stops, onChange }: { form: QueryForm; stops: Stop[]; onChange: (change: Partial<QueryForm>) => void }) {
  const originStop=stops.find(stop=>stop.id===form.originStopId)
  const destinations=stops.filter(stop=>stop.kind==='destination')
  const destination=destinations.find(stop=>stop.slug===form.destination)
  return <section className="search-section" aria-label="Journey settings">
    <SearchableStopCombobox id="origin-search" label="Starting place" placeholder="Search stops by name" stops={stops} selected={originStop} loading={!stops.length} onSelect={stop=>onChange(originUpdate(stop))} onClear={()=>onChange({originStopId:undefined})}/>
    <div className="coordinate-row"><div><label htmlFor="latitude">Latitude (estimated)</label><input className="form-input" id="latitude" type="number" step="0.00001" min={-90} max={90} value={form.lat} onChange={e => onChange(coordinateOriginUpdate({lat:e.target.valueAsNumber}))} /></div><div><label htmlFor="longitude">Longitude (estimated)</label><input className="form-input" id="longitude" type="number" step="0.00001" min={-180} max={180} value={form.lng} onChange={e => onChange(coordinateOriginUpdate({lng:e.target.valueAsNumber}))} /></div></div>
    <SearchableStopCombobox id="destination-search" label="Bus drop-off stop" placeholder="Search destinations" stops={destinations} selected={destination} loading={!stops.length} onSelect={stop=>onChange(destinationUpdate(stop))} onClear={()=>onChange({destination:''})}/>
    <label className="control-label">Preference</label><div className="sort-control" role="group" aria-label="Preference">{(['cheapest', 'fastest', 'comfortable'] as const).map(p => <button key={p} type="button" aria-pressed={form.preference === p} className={form.preference === p ? 'active' : ''} onClick={() => onChange({preference: p})}>{p[0].toUpperCase() + p.slice(1)}</button>)}</div>
    <label htmlFor="minutes">Minutes available</label><input className="form-input" id="minutes" type="number" min={1} max={1440} step={1} value={form.minutes} onChange={e => onChange({minutes: e.target.valueAsNumber})} />
    <label className="checkbox-label"><input type="checkbox" checked={form.overrideTime} onChange={e => onChange({overrideTime: e.target.checked})} />Choose journey time</label>
    {form.overrideTime && <><label htmlFor="journey-time">Date and time (Sri Lanka)</label><input className="form-input" id="journey-time" type="datetime-local" value={form.time} onChange={e => onChange({time: e.target.value})} /></>}
  </section>
}
