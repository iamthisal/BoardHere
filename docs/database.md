# Local database and API

Start PostgreSQL with `docker compose up -d --wait db`, then run `npm run db:seed`. The first command initializes a new volume; the second also applies pending migrations to an existing database and upserts the estimated demo data. No cloud database or deployment is required.

The database defaults are `127.0.0.1:55432`, database `boardhere`, administration user `boardhere`, local password `boardhere_dev_only`. Connect using:

```sh
docker compose exec db psql -U boardhere -d boardhere
```

FastAPI runs in the Compose network and connects to `db:5432` using the restricted `boardhere_api` login. It can read the catalog and insert the permitted crowd-report columns. It cannot edit routes, fares, or time profiles. Its development-only password is `boardhere_api_dev_only`.

The default administration password and host port can be overridden in an ignored root `.env`. Initialization variables only affect an empty PostgreSQL volume; changing `.env` later does not change an existing database password. If using nondefault administration credentials, supply `TEST_DATABASE_URL` to the API test container so its report-fixture cleanup can connect.

The `boardhere` schema is private. React calls FastAPI; it never connects directly to PostgreSQL.

| Table | Purpose |
| --- | --- |
| `stops` | Named places, estimated coordinates, boarding/drop-off/origin kind, and source status |
| `routes`, `route_patterns` | Bus labels and individual directions/variants |
| `route_stops` | Ordered stop positions and boarding/alighting eligibility |
| `fares` | Estimated prices for a boarding/drop-off pair in one pattern |
| `journey_options`, `journey_legs` | Ordered multimodal demo alternatives and baseline scenario values |
| `time_buckets`, `route_time_profile` | Bucket definitions and hand-set segment estimates |
| `crowd_reports` | Unverified passenger reports with timestamps |
| `public.boardhere_migrations` | Applied local migration names and checksums |

The demo explicitly permits estimated data and labels it throughout the response. Original `verified_at` fields remain empty; no seed is promoted to verified transport data. Missing time profiles or valid bus fares produce an incomplete-data error rather than a made-up number.

The named Docker volume survives `docker compose down`. New migrations are applied through `npm run db:seed`; restarting PostgreSQL alone does not apply migrations to an existing volume.

FastAPI exposes:

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Database connectivity |
| `GET /stops` | Catalog places with source/status |
| `POST /recommend` | Ranked options with a recommendation and explanations |
| `GET /explain/{option_id}` | Contextual normalized criteria, weights, and contributions |
| `POST /crowd-reports` | Save an unverified bus-leg report |
| `GET /crowd-reports/latest/{leg_id}` | Latest nonfuture report and freshness flag |

Example recommendation body:

```json
{
  "origin": {"lat": 6.952, "lng": 79.879},
  "destination": "maharagama",
  "preference": "fastest",
  "minutes_available": 90,
  "now": "2026-10-14T08:00:00+05:30"
}
```

`now` is optional. Explicit times must include an offset. `destination` accepts a drop-off slug or ID. `/explain` accepts `origin_lat`, `origin_lng`, `preference`, `minutes_available`, and `now` query parameters. Supply the same resolved context returned by `/recommend` to compare a breakdown.

Catalog reads use a repeatable-read database snapshot. The resolved time is captured outside scoring. Keep the returned data fingerprint when recording a demonstration result.
