import { BusFront, Check, Clock3, Footprints, Navigation, Wallet } from 'lucide-react'
import type { Option, CrowdLevel } from './api'
import { EstimateBadge, estimatedArrival } from './EstimateBadge'
import { CrowdButtons } from './CrowdButtons'

export const crowdLabel = (level: string) => ({seats_free:'Seats likely',standing:'Standing',packed:'Packed',not_applicable:'Not applicable'}[level] || level)

export function OptionCard({option, selected, recommended, onSelect, now,onReport}: {option:Option; selected:boolean; recommended:boolean; onSelect:()=>void;now?:string;onReport?:(legId:string,level:CrowdLevel)=>Promise<void>}) {
  return <article className={`option ${selected?'selected':''}`} data-option-id={option.id}>
    <EstimateBadge bucket={option.bucket}/>
    <button className="option-select" type="button" onClick={onSelect} aria-pressed={selected}>
      <div className="option-heading"><span className={`mode-icon ${option.legs[0].mode}`}>{option.legs[0].mode==='walk'?<Footprints size={18}/>:<Navigation size={18}/>}</span><div className="option-name"><strong>{option.title}</strong></div>{recommended && <span className="recommend-label"><Check size={12}/>Recommended</span>}</div>
    </button>
    <dl className="journey-metrics">
      <div><dt><Wallet size={14}/>Cost</dt><dd>LKR {option.cost_lkr.toFixed(0)} <small>estimated</small></dd></div>
      <div><dt><Clock3 size={14}/>Total time</dt><dd>{option.time_minutes.toFixed(1)} min <small>estimated</small></dd></div>
      <div><dt>Waiting</dt><dd>{option.wait_minutes.toFixed(1)} min <small>estimated</small></dd></div>
      <div><dt>Crowd</dt><dd>{crowdLabel(option.crowd_level)} <small>estimated</small></dd></div>
      <div><dt>Walking</dt><dd>{option.walk_km.toFixed(2)} km <small>estimated</small></dd></div>
      <div><dt>Saving vs full ride</dt><dd>{option.savings_lkr === null?'Unknown':`LKR ${option.savings_lkr.toFixed(0)}`} <small>estimated</small></dd></div>
    </dl>
    <p className={`budget-note ${option.fits_available_time?'':'late'}`}>{option.fits_available_time?'Fits your time budget':'Exceeds your time budget'} (estimated)</p>
    {now && <p className="arrival-note">Estimated arrival: {estimatedArrival(now,option.time_minutes)} (Sri Lanka)</p>}
    <p className="option-explanation">{option.explanation}</p>
    {selected && <><ol className="journey-legs">{option.legs.map(leg=><li key={leg.id}>{leg.mode==='bus'?<BusFront size={15}/>:leg.mode==='walk'?<Footprints size={15}/>:<Navigation size={15}/>}<span>{leg.mode==='taxi'?'PickMe / tuk':leg.mode==='bus'?'Bus':'Walk'} to {leg.to_stop.name}<small>{leg.in_vehicle_minutes.toFixed(1)} min travel + {leg.wait_minutes.toFixed(1)} min wait, LKR {leg.cost_lkr.toFixed(0)} (estimated)</small></span></li>)}</ol>
    <details className="score-details"><summary>Score breakdown (estimated)</summary><table><thead><tr><th>Criterion</th><th>Normalized</th><th>Weight</th><th>Contribution</th></tr></thead><tbody>{Object.entries(option.score_breakdown).map(([name,c])=><tr key={name}><th>{name}</th><td>{c.normalized.toFixed(3)}</td><td>{c.weight.toFixed(2)}</td><td>{c.contribution.toFixed(3)}</td></tr>)}</tbody></table><p>Total weighted score: {option.score.toFixed(3)} (estimated)</p></details>
    {onReport && option.legs.filter(l=>l.mode==='bus').map(l=><div key={l.id}><p className="report-leg-label">Bus to {l.to_stop.name}</p><CrowdButtons legId={l.id} onReport={onReport}/></div>)}</>}
  </article>
}
