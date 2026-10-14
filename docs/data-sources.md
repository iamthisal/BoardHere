# Source-status sheet

**No transport measurement in this demo has been field-verified.** The seeds mark values `estimated`; the original verification timestamps and sources remain unset. A familiar stop name or route number does not establish a valid boarding location or route alignment.

| Data | Source | Status and limitations |
| --- | --- | --- |
| Full PickMe LKR 1,000 | User-provided demo scenario | Estimated fixed scenario fare; not a live quote |
| Two buses LKR 80 + 80 | User-provided demo scenario | Estimated fares; not an official fare table |
| PickMe hop LKR 400 plus bus LKR 80 | User-provided demo scenario | Estimated total LKR 480; not a quote |
| Walk-plus-bus LKR 80 | User bus-fare example used for the demo | Estimated fare |
| Homagama extension fare | Hand-set demo fixture | Estimated; not validated for route 138 |
| Stop and origin coordinates | Approximate developer-entered demo coordinates | Estimated; exact boarding side/location unverified |
| Feeder bus and 138 pattern | Synthetic scenario alignment | Estimated; not a claim that 138 serves the seeded boarding points |
| Baseline in-vehicle minutes | Hand-set demonstration values | Estimated; not measured or timetable-based |
| Traffic multipliers and waits | User's peak/midday concept plus hand-set per-leg values | Estimated (rule-based); taxi and bus segments differ |
| Crowd profiles | Hand-set bucket values | Estimated (rule-based), not live observations |
| Crowd reports | One-tap user input at the selected journey time | Unverified and labeled estimated; simulation-time reports are demonstration inputs |
| GPS position | Browser/device geolocation | Device-reported position; accuracy not guaranteed; walking distance remains estimated |
| Walking detour, speed and coverage limits | Configured demo assumptions | Estimated factor 1.3, speed 4.5 km/h, max walking access 2.4 km, origin coverage radius 10 km |
| Preference weights and time boundaries | User's specification | Configured rules; not transport measurements |
| Background map | OpenStreetMap standard tile service with attribution | Reference map only; drawn demo lines are estimated sketches |

Taxi scenario costs remain fixed when the origin moves within demo coverage. Taxi travel time scales with estimated distance from the new origin; no external taxi pricing service is connected. Bus fares come from the `fares` table using the actual chosen boarding/drop-off positions.

Seeds live in `database/seeds/001_demo_catalog.sql` and `002_time_profiles.sql`. Source notes are stored on records and returned for stops, options, legs, and profiles. The API conservatively marks all calculated outputs estimated, including those influenced by unverified reports.

For a future real-world trial, validate bus numbers and direction, walking access and road crossings, precise boarding locations, fares, measured waits and durations, and local user feedback before changing source status.
