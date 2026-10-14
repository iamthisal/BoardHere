import type { Stop } from './api'
import { coordinateOriginUpdate, type QueryForm } from './query'
import { SearchableStopCombobox } from './SearchableStopCombobox'
import { CalendarDays, Clock3, Crosshair, Gauge, Heart, SlidersHorizontal, Wallet } from 'lucide-react'

export const originUpdate = (stop:Stop):Partial<QueryForm> => ({originStopId:stop.id,lat:stop.lat,lng:stop.lng})
export const destinationUpdate = (stop:Stop):Partial<QueryForm> => ({destination:stop.slug})

type Props={form:QueryForm;stops:Stop[];onChange:(change:Partial<QueryForm>)=>void;onLocate?:()=>void;locating?:boolean;gpsError?:string}

export function QueryControls({ form, stops, onChange,onLocate,locating=false,gpsError='' }: Props) {
  const originStop=stops.find(stop=>stop.id===form.originStopId)
  const destinations=stops.filter(stop=>stop.kind==='destination')
  const destination=destinations.find(stop=>stop.slug===form.destination)
  const preferences=[['cheapest','Cheapest',Wallet],['fastest','Fastest',Gauge],['comfortable','Comfortable',Heart]] as const
  return <section className="search-section" aria-label="Journey settings">
    <div className="planner-block route-block"><div className="section-heading"><span className="step-number">1</span><div><h2>Plan your route</h2><p>Choose a known stop or use your exact location.</p></div></div>
      <SearchableStopCombobox id="origin-search" label="Starting place" placeholder="Search stops by name" marker="origin" stops={stops} selected={originStop} loading={!stops.length} onSelect={stop=>onChange(originUpdate(stop))} onClear={()=>onChange({originStopId:undefined})}/>
      <div className="origin-tools">{onLocate&&<button className="locate-button" type="button" onClick={onLocate} disabled={locating}><Crosshair size={15}/>{locating?'Finding your location…':'Use my location'}</button>}<span>or tap anywhere on the map</span></div>
      {gpsError&&<p role="alert" className="field-error">{gpsError}</p>}
      <div className="route-connector" aria-hidden="true"/>
      <SearchableStopCombobox id="destination-search" label="Bus drop-off stop" placeholder="Search destinations" marker="destination" stops={destinations} selected={destination} loading={!stops.length} onSelect={stop=>onChange(destinationUpdate(stop))} onClear={()=>onChange({destination:''})}/>
      <details className="coordinate-details"><summary><SlidersHorizontal size={14}/>Enter precise coordinates</summary><div className="coordinate-row"><div><label htmlFor="latitude">Latitude</label><input className="form-input" id="latitude" type="number" step="0.00001" min={-90} max={90} value={form.lat} onChange={e => onChange(coordinateOriginUpdate({lat:e.target.valueAsNumber}))} /></div><div><label htmlFor="longitude">Longitude</label><input className="form-input" id="longitude" type="number" step="0.00001" min={-180} max={180} value={form.lng} onChange={e => onChange(coordinateOriginUpdate({lng:e.target.valueAsNumber}))} /></div></div></details>
    </div>
    <div className="planner-block preference-block"><div className="section-heading"><span className="step-number">2</span><div><h2>Set your priorities</h2><p>We’ll rank the same estimated options around you.</p></div></div>
      <label className="control-label">What matters most?</label><div className="sort-control" role="group" aria-label="Preference">{preferences.map(([value,label,Icon])=><button key={value} type="button" aria-pressed={form.preference===value} className={form.preference===value?'active':''} onClick={()=>onChange({preference:value})}><Icon size={15}/><span>{label}</span></button>)}</div>
      <div className="trip-parameters"><div className="parameter-field"><label htmlFor="minutes"><Clock3 size={14}/>Minutes available</label><div className="input-with-suffix"><input className="form-input" id="minutes" type="number" min={1} max={1440} step={1} value={form.minutes} onChange={e=>onChange({minutes:e.target.valueAsNumber})}/><span>min</span></div></div>
      <div className="parameter-field"><label className="switch-label" htmlFor="override-time"><CalendarDays size={14}/>Journey time</label><label className="switch"><input id="override-time" type="checkbox" checked={form.overrideTime} onChange={e=>onChange({overrideTime:e.target.checked})}/><span aria-hidden="true"/></label></div></div>
      {form.overrideTime&&<div className="date-field"><label htmlFor="journey-time">Date and time (Sri Lanka)</label><input className="form-input" id="journey-time" type="datetime-local" value={form.time} onChange={e=>onChange({time:e.target.value})}/></div>}
    </div>
  </section>
}
