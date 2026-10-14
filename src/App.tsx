import { useEffect, useState } from 'react'
import { AlertCircle, BusFront, Crosshair, MapPin, RefreshCw } from 'lucide-react'
import { createApiClient, type Recommendation, type Stop } from './api'
import { buildInput, type QueryForm } from './query'
import { QueryControls } from './QueryControls'
import { JourneyMap } from './JourneyMap'
import { OptionCard } from './OptionCard'

const api = createApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')

export function App() {
  const [form, setForm] = useState<QueryForm>({lat:6.952,lng:79.879,destination:'maharagama',preference:'fastest',minutes:90,overrideTime:true,time:'2026-10-14T08:00'})
  const [stops, setStops] = useState<Stop[]>([])
  const [result, setResult] = useState<Recommendation | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [gpsError, setGpsError] = useState('')
  const [locating, setLocating] = useState(false)
  const change = (update: Partial<QueryForm>) => setForm(previous => ({...previous,...update}))
  useEffect(() => {
    const controller = new AbortController()
    setError(''); setLoading(true)
    api.stops(controller.signal).then(setStops).catch(e => {if (e.name !== 'AbortError') {setError(e.message);setLoading(false)}})
    return () => controller.abort()
  }, [retry])
  useEffect(() => {
    if (!stops.length) return
    const controller = new AbortController()
    setResult(null);setError('');setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await api.recommend(buildInput(form), controller.signal)
        setResult(response); setSelectedId(response.recommended_id || '')
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') setError(e.message)
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }, 250)
    return () => {clearTimeout(timer);controller.abort()}
  }, [form,stops,retry])
  function gps() {
    if (!navigator.geolocation) {setGpsError('Location is unavailable. Enter coordinates or choose a place.');return}
    setLocating(true);setGpsError('')
    navigator.geolocation.getCurrentPosition(({coords}) => {change({lat:coords.latitude,lng:coords.longitude});setLocating(false)}, () => {setGpsError('Location permission denied or unavailable. Choose a starting place.');setLocating(false)}, {timeout:10000})
  }
  const selected = result?.options.find(o => o.id === selectedId) ?? result?.options[0]
  return <div className="app-shell"><aside className="sidebar">
    <header className="topbar"><div className="brand-mark"><BusFront size={22}/></div><div className="brand-text"><strong>BoardHere</strong><span>Find your best boarding point</span></div><span className="demo-tag">DEMO</span></header>
    <div className="sidebar-scroll"><div className="intro"><h1>Where should you board?</h1></div>
      <div className="notice"><AlertCircle size={16}/><span>Estimated demo data. Stops, fares and travel times are unverified.</span></div>
      <div className="origin-actions"><button className="text-button" type="button" onClick={gps} disabled={locating}><Crosshair size={16}/>{locating?'Locating...':'Use my location'}</button><button className="icon-button" title="Refresh journey" aria-label="Refresh journey" onClick={() => setRetry(v=>v+1)}><RefreshCw size={16}/></button></div>
      {gpsError && <p role="alert" className="error">{gpsError}</p>}
      <QueryControls form={form} stops={stops} onChange={change}/>
      <section className="results" aria-label="Journey options"><h2>Ways to board</h2>
        {loading && <p role="status">Finding journey options...</p>}
        {error && <p role="alert" className="error">{error}</p>}
        <div className="option-list">{result?.options.map(o => <OptionCard option={o} key={o.id} selected={selected?.id===o.id} recommended={result.recommended_id===o.id} onSelect={()=>setSelectedId(o.id)}/>)}</div>
      </section>
    </div></aside><main className="map-panel"><JourneyMap origin={{lat:form.lat,lng:form.lng}} option={selected} onPick={point=>change(point)}/><div className="map-hint"><MapPin size={15}/>Estimated journey sketch</div></main></div>
}
