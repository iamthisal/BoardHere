import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BusFront, CheckCircle2, Eye, MapPin, RefreshCw, Route, Scale } from 'lucide-react'
import { createApiClient, type Recommendation, type Stop, type CrowdLevel } from './api'
import { buildInput, coordinateOriginUpdate, type QueryForm } from './query'
import { QueryControls } from './QueryControls'
import { JourneyMap } from './JourneyMap'
import { OptionCard } from './OptionCard'
import { RequestState } from './RequestState'
import { JourneyDiscoveryControls, JourneyFilterEmpty } from './JourneyDiscoveryControls'
import { JourneyComparison } from './JourneyComparison'
import { filterOptions, sortOptions, toggleComparison, type JourneyFilter, type JourneySort } from './journeyDiscovery'
import { JourneyDetails } from './JourneyDetails'

const api = createApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')

export function App() {
  const [form, setForm] = useState<QueryForm>({lat:6.952,lng:79.879,originStopId:'10000000-0000-0000-0000-000000000001',destination:'maharagama',preference:'fastest',minutes:90,overrideTime:true,time:'2026-10-14T08:00'})
  const [stops, setStops] = useState<Stop[]>([])
  const [result, setResult] = useState<Recommendation | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [gpsError, setGpsError] = useState('')
  const [locating, setLocating] = useState(false)
  const [reportNotice,setReportNotice]=useState('')
  const [filter,setFilter]=useState<JourneyFilter>('all')
  const [sort,setSort]=useState<JourneySort>('recommended')
  const [comparisonIds,setComparisonIds]=useState<string[]>([])
  const [comparisonOpen,setComparisonOpen]=useState(false)
  const [detailsOpen,setDetailsOpen]=useState(false)
  const change = (update: Partial<QueryForm>) => setForm(previous => ({...previous,...update}))
  useEffect(() => {
    const controller = new AbortController()
    setError(''); setLoading(true);setStops([]);setResult(null)
    const timeout=setTimeout(()=>{controller.abort();setError('Connection timed out. Check the local backend and retry.');setLoading(false)},12000)
    api.stops(controller.signal).then(list=>{if (!controller.signal.aborted) {setStops(list);if (!list.length) setLoading(false)}}).catch(e => {if (!controller.signal.aborted) {setError(e.message);setLoading(false)}}).finally(()=>clearTimeout(timeout))
    return () => {clearTimeout(timeout);controller.abort()}
  }, [retry])
  useEffect(() => {
    if (!stops.length) return
    const controller = new AbortController()
    let timeout: ReturnType<typeof setTimeout> | undefined
    setResult(null);setError('');setLoading(true)
    const timer = setTimeout(async () => {
      timeout=setTimeout(()=>{controller.abort();setError('Recommendation timed out. Retry the local connection.');setLoading(false)},12000)
      try {
        const response = await api.recommend(buildInput(form), controller.signal)
        if (!controller.signal.aborted) {setResult(response);setSelectedId(response.recommended_id||'');setFilter('all');setSort('recommended');setComparisonIds([]);setComparisonOpen(false);setDetailsOpen(false)}
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') setError(e.message)
      } finally { clearTimeout(timeout);if (!controller.signal.aborted) setLoading(false) }
    }, 250)
    return () => {clearTimeout(timer);clearTimeout(timeout);controller.abort()}
  }, [form,stops,retry])
  function gps() {
    if (!navigator.geolocation) {setGpsError('Location is unavailable. Enter coordinates or choose a place.');return}
    setLocating(true);setGpsError('')
    navigator.geolocation.getCurrentPosition(({coords}) => {change(coordinateOriginUpdate({lat:coords.latitude,lng:coords.longitude}));setLocating(false)}, () => {setGpsError('Location permission denied or unavailable. Choose a starting place.');setLocating(false)}, {timeout:10000})
  }
  const selected = result?.options.find(o => o.id === selectedId) ?? result?.options[0]
  const visibleOptions=useMemo(()=>sortOptions(filterOptions(result?.options??[],filter),sort),[result,filter,sort])
  const selectedHidden=Boolean(selected&&result&&filter!=='all'&&!visibleOptions.some(option=>option.id===selected.id))
  const comparisonOptions=comparisonIds.map(id=>result?.options.find(option=>option.id===id)).filter((option):option is NonNullable<typeof option>=>Boolean(option))
  async function report(legId:string,level:CrowdLevel) {
    if (!result) return
    await api.report(legId,level,result.now)
    setReportNotice('Unverified report saved for the selected journey time.');setRetry(v=>v+1)
  }
  return <div className="app-shell">
    <header className="topbar"><div className="brand-mark"><BusFront size={22}/></div><div className="brand-text"><strong>BoardHere</strong><span>Smarter ways to board</span></div><div className="topbar-context"><MapPin size={14}/><span>Colombo demo network</span></div><span className="demo-tag">ESTIMATED DEMO</span></header>
    <main className="workspace">
      <section className="planner-panel" aria-label="Journey planner"><div className="panel-scroll"><div className="intro"><span className="eyebrow">Journey planner</span><h1>Where are you going?</h1><p>Plan and compare an estimated journey in a few steps.</p></div>
        <div className="notice"><AlertCircle size={16}/><span><strong>Demo estimates only.</strong> Unverified routes, fares and times.</span></div>
        <QueryControls form={form} stops={stops} onChange={change} onLocate={gps} locating={locating} gpsError={gpsError}/>
      </div></section>
      <section className="results-panel" aria-label="Journey options"><div className="results-scroll"><div className="results-heading"><div><span className="eyebrow">Your options</span><h2>Choose your journey</h2></div><div className="results-actions">{loading&&<span className="updating"><span/>Updating</span>}<button className="icon-button" title="Refresh journey" aria-label="Refresh journey" onClick={()=>setRetry(v=>v+1)}><RefreshCw size={16}/></button></div></div>
        {result?.options.length?<p className="results-summary"><Route size={14}/>{result.options.length} estimated routes · ranked for {result.preference}</p>:null}
        {reportNotice && <p className="report-notice" role="status"><CheckCircle2 size={15}/>{reportNotice}</p>}
        <RequestState loading={loading} error={error} empty={!result?.options.length} message={result?.message} onRetry={()=>setRetry(v=>v+1)}/>
        {result?.options.length?<JourneyDiscoveryControls options={result.options} filter={filter} sort={sort} onFilter={setFilter} onSort={setSort}/>:null}
        {selectedHidden&&<div className="hidden-selection" role="status"><Eye size={16}/><span><strong>Your mapped journey is hidden by this filter.</strong> The map still shows {selected?.title}.</span><button type="button" onClick={()=>setFilter('all')}>Show it</button></div>}
        {comparisonIds.length>0&&<div className="comparison-tray" role="status"><span><Scale size={16}/><strong>{comparisonIds.length} of 3</strong> selected for comparison</span><button type="button" disabled={comparisonIds.length<2} onClick={()=>setComparisonOpen(true)}>Compare {comparisonIds.length}</button><button type="button" onClick={()=>{setComparisonIds([]);setComparisonOpen(false)}}>Clear</button></div>}
        {result&&visibleOptions.length===0&&<JourneyFilterEmpty onClear={()=>setFilter('all')}/>}
        <div className="option-list">{result&&visibleOptions.map(o => <OptionCard option={o} key={o.id} selected={selected?.id===o.id} recommended={result.recommended_id===o.id} now={result.now} onSelect={()=>{setSelectedId(o.id);setDetailsOpen(true)}} comparisonSelected={comparisonIds.includes(o.id)} comparisonDisabled={comparisonIds.length>=3} onCompare={()=>setComparisonIds(ids=>toggleComparison(ids,o.id))}/>)}</div>
      </div></section>
      <section className="map-panel" aria-label="Journey map"><JourneyMap origin={{lat:form.lat,lng:form.lng}} option={selected} onPick={point=>change(coordinateOriginUpdate(point))}/><div className="map-hint"><MapPin size={15}/><span><strong>Estimated schematic</strong><small>Tap map to move your start</small></span></div>{selected&&!detailsOpen&&<button className="open-details" type="button" onClick={()=>setDetailsOpen(true)}>View selected journey details</button>}{selected&&detailsOpen&&result?<JourneyDetails option={selected} now={result.now} recommended={result.recommended_id===selected.id} onClose={()=>setDetailsOpen(false)} onReport={report}/>:null}</section>
    </main>
    {comparisonOpen&&comparisonOptions.length>=2?<div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Journey comparison"><JourneyComparison options={comparisonOptions} now={result?.now||''} onClose={()=>setComparisonOpen(false)} onRemove={id=>{setComparisonIds(ids=>ids.filter(value=>value!==id));if(comparisonIds.length<=2)setComparisonOpen(false)}}/></div>:null}
  </div>
}
