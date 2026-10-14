import type { Option } from './api'

export type JourneyFilter = 'all' | 'taxi' | 'bus' | 'taxi-bus' | 'walk-bus'
export type JourneySort = 'recommended' | 'cheapest' | 'fastest' | 'least-walking' | 'comfortable'

export const FILTERS: {value:JourneyFilter;label:string}[] = [
  {value:'all',label:'All journeys'}, {value:'taxi',label:'Full taxi'},
  {value:'bus',label:'Bus-based'}, {value:'taxi-bus',label:'Taxi + Bus'},
  {value:'walk-bus',label:'Walk + Bus'},
]

export function transportCategory(option: Option): Exclude<JourneyFilter,'all'> {
  const modes=option.legs.map(leg=>leg.mode)
  const buses=modes.filter(mode=>mode==='bus').length
  if (modes.every(mode=>mode==='taxi')) return 'taxi'
  if (modes.includes('taxi') && buses) return 'taxi-bus'
  if (modes.includes('walk') && buses===1) return 'walk-bus'
  return 'bus'
}

export function filterOptions(options:Option[],filter:JourneyFilter) {
  return filter==='all' ? options : options.filter(option=>transportCategory(option)===filter)
}

const crowdValue=(level:string)=>({seats_free:0,standing:1,packed:2,not_applicable:0}[level] ?? 3)
const numeric=(field:(option:Option)=>number)=>(a:Option,b:Option)=>field(a)-field(b)||a.id.localeCompare(b.id)

export function sortOptions(options:Option[],sort:JourneySort) {
  if (sort==='recommended') return [...options]
  const compare = sort==='cheapest' ? numeric(option=>option.cost_lkr)
    : sort==='fastest' ? numeric(option=>option.time_minutes)
    : sort==='least-walking' ? numeric(option=>option.walk_km)
    : (a:Option,b:Option)=>crowdValue(a.crowd_level)-crowdValue(b.crowd_level)
      ||a.walk_km-b.walk_km||a.wait_minutes-b.wait_minutes||a.id.localeCompare(b.id)
  return [...options].sort(compare)
}

export function filterCounts(options:Option[]) {
  return Object.fromEntries(FILTERS.map(({value})=>[value,filterOptions(options,value).length])) as Record<JourneyFilter,number>
}

export function toggleComparison(ids:string[],id:string,limit=3) {
  if (ids.includes(id)) return ids.filter(value=>value!==id)
  return ids.length<limit ? [...ids,id] : ids
}

export function bestIds(options:Option[],value:(option:Option)=>number,direction:'min'|'max'='min') {
  if (!options.length) return new Set<string>()
  const values=options.map(value)
  const best=direction==='min'?Math.min(...values):Math.max(...values)
  return new Set(options.filter(option=>value(option)===best).map(option=>option.id))
}

export const crowdComfortValue=(option:Option)=>crowdValue(option.crowd_level)
