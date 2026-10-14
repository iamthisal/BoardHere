import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { EstimateBadge,estimatedArrival } from '../../src/EstimateBadge'
test('estimate badge names the bucket and arrival uses the supplied time',()=>{
  const html=renderToStaticMarkup(<EstimateBadge bucket="weekday_morning_peak"/>)
  assert.ok(html.includes('Estimated (rule-based)') && html.includes('Weekday morning peak'))
  assert.match(estimatedArrival('2026-10-14T08:00:00+05:30',60),/09:00/)
  assert.equal(estimatedArrival('2026-10-14T08:00:00+05:30',60),estimatedArrival('2026-10-14T02:30:00Z',60))
})
