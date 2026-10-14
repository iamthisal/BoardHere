# Deterministic recommendation rules

All scoring functions take the supplied `now` and a catalog snapshot. They never read the clock, draw random numbers, call a conversational service, or train on reports. With identical inputs and snapshot, the output is identical. The API alone supplies the current time when `now` is omitted.

## Buckets

All boundaries use Asia/Colombo. Saturday and Sunday always use `weekend`, including their night hours. On weekdays:

| Bucket | Interval |
| --- | --- |
| `weekday_morning_peak` | 07:00 inclusive to 09:00 exclusive |
| `weekday_midday` | 09:00 inclusive to 16:30 exclusive |
| `weekday_evening_peak` | 16:30 inclusive to 19:00 exclusive |
| `night` | 19:00 inclusive to 07:00 exclusive |

## Estimates

Each nonwalking leg uses baseline minutes times its bucket multiplier, plus its wait minutes. Taxi and bus profiles are independent. Walking distance uses haversine times the estimated detour factor 1.3; estimated time uses 4.5 km/h. Candidate boarding positions must be boardable and earlier than an alightable target in the same pattern. Changing the selected boarding point scales the baseline bus duration by the estimated remaining-distance ratio.

This demo supports origins within an estimated 10 km radius of its reference origin. Walk access above an estimated 2.4 km is excluded. Arriving within an estimated 150 m of the target produces no bus recommendation. These are demonstration rules, not proven comfort or coverage boundaries.

## Scoring and deadlines

For each criterion, normalize over eligible options using `(value - minimum) / (maximum - minimum)`. A constant criterion contributes zero. Crowd severity is 0 for seats likely or no bus, 0.5 for standing, and 1 for packed; an option uses its most crowded bus leg.

| Preference | Cost | Time | Crowd | Walk |
| --- | --- | --- | --- | --- |
| Cheapest | .60 | .15 | .10 | .15 |
| Fastest | .15 | .60 | .10 | .15 |
| Comfortable | .10 | .20 | .45 | .25 |

Sum normalized values times their weights. Lower weighted scores are better. Equal scores sort by option ID. Feasible options precede options exceeding `minutes_available`; feasibility uses total travel time, including access and waits. If none fit, retain ranked alternatives and explain the overrun.

For each option: use `walk` when its first leg is walking and the option fits, `ride` when its first leg is a ride and it fits, or `short_on_time` when it exceeds the budget. Savings equal the full-ride cost minus that option's cost. All explanations are string templates built from these computed values.

## Reports

The latest report per bus leg with age `0 <= age < 30 minutes` overrides its bucket crowd estimate. Reports exactly 30 minutes old, older, or in the future relative to the supplied time do not override. Equal timestamps choose report ID ascending. API writes reject future timestamps relative to actual submission time. Reports do not alter fares, traffic multipliers, or waits.

## Roadmap

First validate the route catalog and replace illustrative profiles with measured, sourced values. Add actual street paths and carefully verified transfer coverage as separately tested work. A separately scoped, validated trained model could later replace the hand-set time-profile table; no such component is part of this demo. The current recommendation agent remains deterministic and estimated (rule-based).
