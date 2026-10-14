import { AlertTriangle, LoaderCircle, MapPinned, RefreshCw } from 'lucide-react'

export function RequestState({loading,error,empty,message,onRetry}: {loading:boolean;error:string;empty:boolean;message?:string|null;onRetry:()=>void}) {
  if (error) return <div className="request-state error-state" role="alert"><span className="state-icon"><AlertTriangle size={20}/></span><div><strong>We couldn’t update your journey</strong><p>{error}</p><button type="button" className="retry-button" onClick={onRetry}><RefreshCw size={15}/>Retry connection</button></div></div>
  if (loading) return <div className="request-state loading-state" role="status"><span className="state-icon"><LoaderCircle size={20}/></span><div><strong>Comparing your options</strong><p>Calculating estimated time, fare and crowd levels…</p></div></div>
  if (empty) return <div className="request-state empty-state" role="status"><span className="state-icon"><MapPinned size={21}/></span><div><strong>No eligible journey found</strong><p>{message || 'Choose a starting point closer to the demo corridor.'}</p></div></div>
  return null
}
