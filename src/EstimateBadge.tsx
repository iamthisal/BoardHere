export const bucketLabel = (bucket:string) => ({weekday_morning_peak:'Weekday morning peak',weekday_midday:'Weekday midday',weekday_evening_peak:'Weekday evening peak',night:'Night',weekend:'Weekend'}[bucket] || bucket)

export function EstimateBadge({bucket}: {bucket:string}) {
  return <div className="estimate-badge"><strong>Estimated (rule-based)</strong><span>{bucketLabel(bucket)}</span></div>
}

export function estimatedArrival(now:string,minutes:number):string {
  return new Date(Date.parse(now)+minutes*60000).toLocaleTimeString('en-LK',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Colombo'})
}
