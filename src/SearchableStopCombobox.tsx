import { useEffect, useRef, useState } from 'react'
import { Check, Flag, MapPin, Search, X } from 'lucide-react'
import type { Stop } from './api'

export function filterStops(stops: Stop[], query: string): Stop[] {
  const normalized = query.trim().toLocaleLowerCase()
  return normalized ? stops.filter(stop => stop.name.toLocaleLowerCase().includes(normalized)) : stops
}

export function nextActiveIndex(current: number, length: number, direction: 1 | -1): number {
  if (!length) return -1
  if (current < 0) return direction === 1 ? 0 : length - 1
  return (current + direction + length) % length
}

type Props = {
  id: string
  label: string
  placeholder: string
  stops: Stop[]
  selected?: Stop
  loading?: boolean
  onSelect: (stop: Stop) => void
  onClear: () => void
  marker?: 'origin' | 'destination'
}

export function SearchableStopCombobox({id,label,placeholder,stops,selected,loading=false,onSelect,onClear,marker}: Props) {
  const [query,setQuery]=useState(selected?.name ?? '')
  const [open,setOpen]=useState(false)
  const [active,setActive]=useState(-1)
  const root=useRef<HTMLDivElement>(null)
  const matches=filterStops(stops,query)
  const listId=`${id}-listbox`

  useEffect(()=>setQuery(selected?.name ?? ''),[selected?.id,selected?.name])
  useEffect(()=>{
    function outside(event:MouseEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);setActive(-1);setQuery(selected?.name ?? '')
      }
    }
    document.addEventListener('mousedown',outside)
    return ()=>document.removeEventListener('mousedown',outside)
  },[selected?.name])

  function choose(stop:Stop) {
    onSelect(stop);setQuery(stop.name);setOpen(false);setActive(-1)
  }
  function clear() {
    onClear();setQuery('');setOpen(true);setActive(-1)
  }

  return <div className="stop-field" ref={root}>
    <label htmlFor={id} className="stop-label">{marker==='origin'?<MapPin size={15}/>:marker==='destination'?<Flag size={15}/>:null}<span>{label}</span></label>
    <div className={`stop-combobox ${open?'open':''}`}>
      <Search size={16} aria-hidden="true"/>
      <input id={id} type="search" value={query} placeholder={placeholder} autoComplete="off"
        role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listId}
        aria-activedescendant={open && active>=0?`${id}-option-${active}`:undefined}
        onFocus={()=>{setOpen(true);setActive(-1)}}
        onChange={event=>{setQuery(event.target.value);setOpen(true);setActive(-1)}}
        onKeyDown={event=>{
          if (event.key==='ArrowDown' || event.key==='ArrowUp') {
            event.preventDefault();setOpen(true);setActive(index=>nextActiveIndex(index,matches.length,event.key==='ArrowDown'?1:-1))
          } else if (event.key==='Enter' && open && active>=0 && matches[active]) {
            event.preventDefault();choose(matches[active])
          } else if (event.key==='Escape') {
            event.preventDefault();setOpen(false);setActive(-1);setQuery(selected?.name ?? '')
          }
        }}/>
      {(query || selected) && <button type="button" className="stop-clear" aria-label={`Clear ${label.toLowerCase()}`} onClick={clear}><X size={15}/></button>}
    </div>
    {selected && query===selected.name && <span className="stop-selected"><Check size={13}/>Selected: {selected.name}</span>}
    {open && <div className="stop-menu" id={listId} role="listbox" aria-label={`${label} suggestions`}>
      {loading ? <div className="stop-message" role="status">Loading stops...</div> : matches.length ? matches.map((stop,index)=><button
        type="button" role="option" id={`${id}-option-${index}`} aria-selected={selected?.id===stop.id}
        className={index===active?'active':''} key={stop.id}
        onMouseEnter={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(stop)}>
        <span>{stop.name}</span><small>{stop.kind} · estimated location</small>{selected?.id===stop.id && <Check size={15} aria-hidden="true"/>}
      </button>) : <div className="stop-message" role="status">No matching stops found.</div>}
    </div>}
  </div>
}
