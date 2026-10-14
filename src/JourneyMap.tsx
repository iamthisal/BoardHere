import { Fragment, useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Point, Option } from './api'

function MapEvents({ origin, option, onPick }: { origin: Point; option?: Option; onPick: (point: Point) => void }) {
  const map = useMap()
  useMapEvents({ click: ({latlng}) => onPick({lat: latlng.lat, lng: latlng.lng}) })
  useEffect(() => {
    const points: [number, number][] = [[origin.lat, origin.lng], ...(option?.legs.map(l => [l.to_stop.lat, l.to_stop.lng] as [number, number]) ?? [])]
    function frame() {
      map.invalidateSize({animate:false})
      if (points.every(p => p.every(Number.isFinite))) map.fitBounds(points, {padding: [40, 40], maxZoom: 14, animate:false})
    }
    const animation=requestAnimationFrame(frame)
    const observer=new ResizeObserver(frame)
    observer.observe(map.getContainer())
    return ()=>{cancelAnimationFrame(animation);observer.disconnect()}
  }, [map, origin.lat, origin.lng, option])
  return null
}

export function JourneyMap({origin, option, onPick}: {origin: Point; option?: Option; onPick: (point: Point) => void}) {
  const validOrigin = Number.isFinite(origin.lat) && Number.isFinite(origin.lng) && Math.abs(origin.lat)<=90 && Math.abs(origin.lng)<=180 ? origin : {lat:6.952,lng:79.879}
  return <><MapContainer center={[6.90,79.89]} zoom={11} scrollWheelZoom={false} className="map">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <MapEvents origin={validOrigin} option={option} onPick={onPick}/>
    <CircleMarker center={[validOrigin.lat,validOrigin.lng]} radius={9} weight={3} pathOptions={{color:'#fff',fillColor:'#173f35',fillOpacity:1}}><Popup><strong>Start</strong><br/>Tap the map to move this point</Popup></CircleMarker>
    {option?.legs.map((leg,index) => {
      const start = index === 0 ? validOrigin : option.legs[index-1].to_stop
      const color = leg.mode === 'walk' ? '#d18a19' : leg.mode === 'taxi' ? '#d85e45' : '#21745c'
      const final=index===option.legs.length-1
      const markerColor=final?'#173f35':color
      const dashArray=leg.mode==='walk'?'3 7':leg.mode==='taxi'?'10 7':undefined
      return <Fragment key={leg.id}><Polyline positions={[[start.lat,start.lng],[leg.to_stop.lat,leg.to_stop.lng]]} pathOptions={{color,weight:5,dashArray,lineCap:'round'}}/><CircleMarker center={[leg.to_stop.lat,leg.to_stop.lng]} radius={final?9:7} weight={3} pathOptions={{color:'#fff',fillColor:markerColor,fillOpacity:1}}><Popup><strong>{final?'Destination':'Boarding / transfer'}</strong><br/>{leg.to_stop.name}<br/><small>Estimated location</small></Popup></CircleMarker></Fragment>
    })}
  </MapContainer><div className="map-legend" aria-label="Map legend"><span><i className="legend-line walk"/>Walk</span><span><i className="legend-line taxi"/>Taxi</span><span><i className="legend-line bus"/>Bus</span><span><i className="legend-marker"/>Stop</span></div></>
}
