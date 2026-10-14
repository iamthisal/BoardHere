import { useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Point, Option } from './api'

function MapEvents({ origin, option, onPick }: { origin: Point; option?: Option; onPick: (point: Point) => void }) {
  const map = useMap()
  useMapEvents({ click: ({latlng}) => onPick({lat: latlng.lat, lng: latlng.lng}) })
  useEffect(() => {
    const points: [number, number][] = [[origin.lat, origin.lng], ...(option?.legs.map(l => [l.to_stop.lat, l.to_stop.lng] as [number, number]) ?? [])]
    if (points.every(p => p.every(Number.isFinite))) map.fitBounds(points, {padding: [40, 40], maxZoom: 14})
  }, [map, origin.lat, origin.lng, option])
  return null
}

export function JourneyMap({origin, option, onPick}: {origin: Point; option?: Option; onPick: (point: Point) => void}) {
  const validOrigin = Number.isFinite(origin.lat) && Number.isFinite(origin.lng) ? origin : {lat:6.952,lng:79.879}
  return <MapContainer center={[6.90,79.89]} zoom={11} scrollWheelZoom={false} className="map">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <MapEvents origin={validOrigin} option={option} onPick={onPick}/>
    <CircleMarker center={[validOrigin.lat,validOrigin.lng]} radius={8} pathOptions={{color:'#fff',fillColor:'#28342f',fillOpacity:1}}><Popup>Your starting point</Popup></CircleMarker>
    {option?.legs.map((leg,index) => {
      const start = index === 0 ? validOrigin : option.legs[index-1].to_stop
      const color = leg.mode === 'walk' ? '#dfa337' : leg.mode === 'taxi' ? '#d96045' : '#367b67'
      return <span key={leg.id}><Polyline positions={[[start.lat,start.lng],[leg.to_stop.lat,leg.to_stop.lng]]} pathOptions={{color,weight:4,dashArray:'7 6'}}/><CircleMarker center={[leg.to_stop.lat,leg.to_stop.lng]} radius={7} pathOptions={{color:'#fff',fillColor:color,fillOpacity:1}}><Popup>{leg.to_stop.name} (estimated location)</Popup></CircleMarker></span>
    })}
  </MapContainer>
}
