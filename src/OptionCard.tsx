import { ArrowRight, BusFront, Check, Clock3, Footprints, Navigation, Plus, ShieldCheck, Wallet } from 'lucide-react'
import type { Option } from './api'
import { EstimateBadge, estimatedArrival } from './EstimateBadge'

export const crowdLabel = (level: string) => ({seats_free:'Seats likely',standing:'Standing',packed:'Packed',not_applicable:'Not applicable'}[level] || level)
const modeLabel=(mode:string)=>mode==='taxi'?'PickMe / tuk':mode==='bus'?'Bus':'Walk'
const ModeIcon=({mode,size=18}:{mode:string;size?:number})=>mode==='bus'?<BusFront size={size}/>:mode==='walk'?<Footprints size={size}/>:<Navigation size={size}/>

export function OptionCard({option, selected, recommended, onSelect, now,comparisonSelected=false,comparisonDisabled=false,onCompare}: {option:Option; selected:boolean; recommended:boolean; onSelect:()=>void;now?:string;comparisonSelected?:boolean;comparisonDisabled?:boolean;onCompare?:()=>void}) {
  const arrival=now?estimatedArrival(now,option.time_minutes):null
  return <article className={`option ${selected?'selected':''} ${recommended?'recommended':''}`} data-option-id={option.id}>
    {recommended&&<div className="recommend-ribbon"><Check size={13}/>Best match</div>}
    <button className="option-select" type="button" onClick={onSelect} aria-pressed={selected}>
      <div className="option-heading"><span className={`mode-icon ${option.legs[0].mode}`}><ModeIcon mode={option.legs[0].mode}/></span><div className="option-name"><strong>{option.title}</strong><span>{option.legs.length} {option.legs.length===1?'leg':'legs'} · {option.bucket.replaceAll('_',' ')}</span></div>{recommended&&<span className="recommend-label"><Check size={12}/>Recommended</span>}</div>
      <div className="primary-metrics"><div><Clock3 size={16}/><span><strong>{option.time_minutes.toFixed(1)} min</strong><small>{arrival?`Arrive ${arrival}`:'Estimated total'}</small></span></div><div><Wallet size={16}/><span><strong>LKR {option.cost_lkr.toFixed(0)}</strong><small>Estimated fare</small></span></div></div>
      <div className="mode-chain" aria-label="Transport modes">{option.legs.map((leg,index)=><span key={leg.id}><span className={`chain-mode ${leg.mode}`}><ModeIcon mode={leg.mode} size={13}/>{modeLabel(leg.mode)}</span>{index<option.legs.length-1&&<ArrowRight size={12}/>}</span>)}</div>
    </button>
    <div className="summary-footer"><div className={`budget-note ${option.fits_available_time?'':'late'}`}><ShieldCheck size={14}/><span>{option.fits_available_time?'Fits time budget':'Exceeds time budget'}</span></div><EstimateBadge bucket={option.bucket}/></div>
    {onCompare&&<button type="button" className={`compare-toggle ${comparisonSelected?'active':''}`} aria-pressed={comparisonSelected} disabled={comparisonDisabled&&!comparisonSelected} onClick={onCompare}>{comparisonSelected?<Check size={14}/>:<Plus size={14}/>} {comparisonSelected?'Selected to compare':'Add to compare'}</button>}
  </article>
}
