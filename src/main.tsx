import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { AlertCircle, ArrowRight, BusFront, Check, Clock3, Crosshair, Footprints, MapPin, Navigation, Wallet } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './style.css'
import { demoRoutes, places } from './demoData'
import { distanceKm, planJourneys, rankJourneys, type Journey, type Point, type SortMode } from './planner'

const dropStops = demoRoutes[0].stops.slice(1)
const minutesLabel = (minutes: number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
const arrivalLabel = (minutes: number) => new Date(Date.now() + minutes * 60000).toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' })

function MapClick({ onPick }: { onPick: (point: Point) => void }) {
  useMapEvents({ click: ({ latlng }) => onPick({ lat: latlng.lat, lng: latlng.lng }) })
  return null
}

function JourneyMap({ origin, journey, onPick }: { origin: Point; journey?: Journey; onPick: (point: Point) => void }) {
  return <MapContainer center={[6.899, 79.888]} zoom={11} scrollWheelZoom={false} className="map">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <MapClick onPick={onPick} />
    <Polyline positions={demoRoutes[0].stops.map((stop): [number, number] => [stop.lat, stop.lng])} pathOptions={{ color: '#367b67', weight: 4, dashArray: '9 9' }} />
    {journey && <Polyline positions={[[origin.lat, origin.lng], [journey.board.lat, journey.board.lng]]} pathOptions={{ color: journey.mode === 'walk' ? '#dfa337' : '#d96045', weight: 5 }} />}
    <CircleMarker center={[origin.lat, origin.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#29332e', fillOpacity: 1 }}><Popup>Starting point</Popup></CircleMarker>
    {journey && <CircleMarker center={[journey.board.lat, journey.board.lng]} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#dfa337', fillOpacity: 1 }}><Popup>Board at {journey.board.name}</Popup></CircleMarker>}
    {journey && <CircleMarker center={[journey.drop.lat, journey.drop.lng]} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#367b67', fillOpacity: 1 }}><Popup>Get off at {journey.drop.name}</Popup></CircleMarker>}
  </MapContainer>
}

function App() {
  const [origin, setOrigin] = useState<Point>(places[0].point)
  const [originChoice, setOriginChoice] = useState('orion')
  const [dropId, setDropId] = useState('maharagama-stop')
  const [sortMode, setSortMode] = useState<SortMode>('recommended')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [locationError, setLocationError] = useState('')
  const [locating, setLocating] = useState(false)
  const journeys = useMemo(() => rankJourneys(planJourneys(origin, dropId, demoRoutes), sortMode), [origin, dropId, sortMode])
  const selected = journeys.find((journey) => journey.id === selectedId) ?? journeys[0]
  const atDropStop = dropStops.some((stop) => stop.id === dropId && distanceKm(origin, stop) <= 0.15)

  function choosePlace(id: string) {
    const place = places.find((item) => item.id === id)
    if (!place) return
    setOriginChoice(id)
    setOrigin(place.point)
    setSelectedId(null)
    setLocationError('')
  }

  function pickMapPoint(point: Point) {
    setOrigin(point)
    setOriginChoice('map')
    setSelectedId(null)
    setLocationError('')
  }

  function useGps() {
    if (!navigator.geolocation) {
      setLocationError('Location is unavailable. Choose a place or tap the map.')
      return
    }
    setLocating(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude })
        setOriginChoice('gps')
        setSelectedId(null)
        setLocating(false)
      },
      () => {
        setLocationError('Could not get your location. Allow location access or choose a place.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <header className="topbar"><div className="brand-mark"><BusFront size={22} /></div><div className="brand-text"><strong>BoardHere</strong><span>Find your best boarding point</span></div><span className="demo-tag">DEMO</span></header>
      <div className="sidebar-scroll">
        <div className="intro"><h1>Where should you board?</h1><p>Compare the walk or tuk ride to a bus stop, then choose the journey that fits.</p></div>
        <div className="notice"><AlertCircle size={16} /><span>Sample route, fares and times. Do not use for a real trip yet.</span></div>
        <section className="search-section" aria-label="Journey search">
          <label htmlFor="origin">Your starting point</label>
          <div className="input-row"><MapPin size={19} /><select id="origin" value={originChoice} onChange={(event) => choosePlace(event.target.value)}>
            {places.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
            {(originChoice === 'gps' || originChoice === 'map') && <option value={originChoice}>{originChoice === 'gps' ? 'Current GPS location' : 'Point chosen on map'}</option>}
          </select></div>
          <div className="origin-actions"><button type="button" className="text-button" onClick={useGps} disabled={locating}><Crosshair size={16} />{locating ? 'Locating...' : 'Use my location'}</button><span>or tap the map</span></div>
          {locationError && <p className="error" role="alert">{locationError}</p>}
          <label htmlFor="drop">Bus stop to get off at</label>
          <div className="input-row"><Navigation size={19} /><select id="drop" value={dropId} onChange={(event) => { setDropId(event.target.value); setSelectedId(null) }}>
            {dropStops.map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}
          </select></div>
        </section>
        <section className="results" aria-label="Journey options">
          <div className="results-title"><div><span className="eyebrow">YOUR OPTIONS</span><h2>{atDropStop ? 'You are already there' : journeys.length ? 'Ways to board' : 'No nearby boarding options'}</h2></div><span className="option-count">{journeys.length} found</span></div>
          {journeys.length > 0 && <div className="sort-control" role="group" aria-label="Sort journeys">{(['recommended', 'fastest', 'cheapest'] as const).map((mode) => <button key={mode} type="button" aria-pressed={sortMode === mode} className={sortMode === mode ? 'active' : ''} onClick={() => { setSortMode(mode); setSelectedId(null) }}>{mode === 'recommended' ? 'Best fit' : mode === 'fastest' ? 'Fastest' : 'Cheapest'}</button>)}</div>}
          {journeys.length > 0 && <p className="ranking-note">{sortMode === 'recommended' ? 'Recommended for its balance of time and estimated cost.' : sortMode === 'fastest' ? 'Shortest estimated total travel time first.' : 'Lowest estimated total cost first.'}</p>}
          {journeys.length === 0 && <p className="empty-state">{atDropStop ? 'Your starting point is at the selected drop-off stop.' : 'Try a starting point closer to the sample corridor. Choose a place above or tap the map.'}</p>}
          <div className="option-list">{journeys.slice(0, 4).map((journey, index) => <button key={journey.id} type="button" className={`option ${selected?.id === journey.id ? 'selected' : ''}`} onClick={() => setSelectedId(journey.id)} aria-pressed={selected?.id === journey.id}>
            <div className="option-heading"><span className={`mode-icon ${journey.mode}`}>{journey.mode === 'walk' ? <Footprints size={18} /> : <Navigation size={18} />}</span><div className="option-name"><strong>{journey.mode === 'walk' ? 'Walk' : 'Tuk'} to {journey.board.name}</strong><span>Then board the sample bus</span></div>{index === 0 && <span className="recommend-label"><Check size={12} />{sortMode === 'recommended' ? 'Recommended' : sortMode === 'fastest' ? 'Fastest' : 'Cheapest'}</span>}</div>
            <div className="option-metrics"><div><Clock3 size={15} /><strong>{minutesLabel(journey.totalMinutes)}</strong><span>total</span></div><div><Wallet size={15} /><strong>Rs {journey.totalCostLkr}</strong><span>estimate</span></div></div>
            <div className="option-footer"><span>Board in {minutesLabel(journey.accessMinutes)}</span><span>Arrive ~{arrivalLabel(journey.totalMinutes)}</span><ArrowRight size={16} /></div>
          </button>)}</div>
        </section>
        {selected && <section className="details" aria-label="Selected journey details"><span className="eyebrow">SELECTED JOURNEY</span><h2>How to get there</h2><ol className="steps">
          <li><span className="step-icon">{selected.mode === 'walk' ? <Footprints size={17} /> : <Navigation size={17} />}</span><div><strong>{selected.mode === 'walk' ? 'Walk' : 'Take a tuk'} to {selected.board.name}</strong><span>About {selected.accessKm.toFixed(1)} km · {minutesLabel(selected.accessMinutes)}</span></div></li>
          <li><span className="step-icon"><BusFront size={17} /></span><div><strong>Board the sample bus</strong><span>Allow ~{selected.waitMinutes} min to wait · {minutesLabel(selected.busMinutes)} on bus</span></div></li>
          <li><span className="step-icon"><MapPin size={17} /></span><div><strong>Get off at {selected.drop.name}</strong><span>Estimated arrival {arrivalLabel(selected.totalMinutes)}</span></div></li>
        </ol><p className="estimate-note">Times use simple speed and wait assumptions. No live bus or tuk data is connected.</p></section>}
      </div>
    </aside>
    <main className="map-panel"><JourneyMap origin={origin} journey={selected} onPick={pickMapPoint} /><div className="map-hint"><MapPin size={15} /> Tap the map to set your starting point</div><div className="map-legend"><span><i className="legend-dot origin-dot" /> Start</span><span><i className="legend-dot board-dot" /> Board</span><span><i className="legend-dot drop-dot" /> Get off</span></div></main>
  </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
