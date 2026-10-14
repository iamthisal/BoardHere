import { ArrowUpDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { Option } from './api'
import { FILTERS, filterCounts, type JourneyFilter, type JourneySort } from './journeyDiscovery'

export function JourneyDiscoveryControls({options,filter,sort,onFilter,onSort}:{options:Option[];filter:JourneyFilter;sort:JourneySort;onFilter:(filter:JourneyFilter)=>void;onSort:(sort:JourneySort)=>void}) {
  const counts=filterCounts(options)
  return <section className="discovery-tools" aria-label="Filter and sort journeys">
    <div className="tool-heading"><span><SlidersHorizontal size={15}/>Transport type</span>{filter!=='all'&&<button type="button" onClick={()=>onFilter('all')}><RotateCcw size={13}/>Clear filter</button>}</div>
    <div className="filter-chips" role="group" aria-label="Transport type filters">{FILTERS.map(item=><button type="button" key={item.value} aria-pressed={filter===item.value} onClick={()=>onFilter(item.value)}><span>{item.label}</span><small>{counts[item.value]}</small></button>)}</div>
    <div className="sort-row"><label htmlFor="journey-sort"><ArrowUpDown size={15}/>Sort display by</label><select id="journey-sort" value={sort} onChange={event=>onSort(event.target.value as JourneySort)}>
      <option value="recommended">Recommended (backend order)</option><option value="cheapest">Cheapest</option><option value="fastest">Fastest</option><option value="least-walking">Least walking</option><option value="comfortable">Most comfortable*</option>
    </select></div>
    {sort==='comfortable'&&<p className="sort-note">*Client-side display order: lower crowd level, then less walking and waiting. This is not the backend comfort score.</p>}
    {sort!=='recommended'&&<p className="sort-note">Display order only. The backend recommendation remains marked “Recommended”.</p>}
  </section>
}

export function JourneyFilterEmpty({onClear}:{onClear:()=>void}) {
  return <div className="filter-empty" role="status"><strong>No journeys match this transport filter.</strong><p>Try another transport type or show all journeys.</p><button type="button" onClick={onClear}>Show all journeys</button></div>
}
