# Database and backend direction

BoardHere will use a React web frontend, a Python FastAPI backend, and local PostgreSQL through Docker Compose. Cloud deployment, mobile applications, and offline installation are outside the current scope.

## SQL, cloud hosting, and local development

SQL describes the database model; cloud or local describes where it runs. PostgreSQL can run in either place. We are using a local PostgreSQL container for development; a hosted PostgreSQL service such as Supabase remains an option later.

Run React and FastAPI locally and connect FastAPI to the Docker database. The database files live in a Docker named volume, so ordinary container restarts and `docker compose down` keep them. The SQL tests use a transaction that rolls back every fixture and test role.

SQL suits this project because a stop can serve multiple routes, each route direction has an ordered list of stops, and a fare belongs to a particular boarding/drop-off pair. Foreign keys and constraints protect those relationships.

## Request flow

```text
React (GPS or entered location + drop-off stop)
  -> FastAPI (candidate boarding points, travel estimates, ranking)
  -> Local PostgreSQL (verified routes, stops, and fares)
```

FastAPI owns database access. Database connection credentials stay in backend environment variables and must not use a frontend `VITE_` variable.

## Start and connect

With Docker Desktop running, execute these from the repository root:

```sh
docker compose up -d --wait db
npm run test:database
docker compose exec db psql -U boardhere -d boardhere
```

The connection defaults are host `127.0.0.1`, port `55432`, database `boardhere`, user `boardhere`, and the local-only password `boardhere_dev_only`. Port `55432` avoids the usual local PostgreSQL port `5432`. The database is bound only to localhost.

Optional overrides are documented in `.env.example`; put them in an ignored root `.env` before first startup. The image's database/password initialization variables only take effect on an empty data volume. Changing them later does not change an existing database password.

For FastAPI running on the host, the default connection URL will be `postgresql://boardhere:boardhere_dev_only@127.0.0.1:55432/boardhere`. If the backend later runs in this Compose network, use `db:5432` instead of localhost.

To stop while keeping data:

```sh
docker compose down
```

Do not add `--volumes` when stopping if you want to keep the data.

## Initial schema

The first migration is `database/migrations/20261014000100_route_catalog.sql`. The PostgreSQL image runs it automatically when initializing a new, empty data volume. It creates the private `boardhere` schema. Browser clients will access records through FastAPI.

Restarting an existing container does not rerun migrations. Future migrations must be applied explicitly once, through the backend's migration workflow; deleting the data volume is not a migration strategy.

| Table | Stores |
| --- | --- |
| `stops` | Exact coordinates, names, boarding notes, and verification evidence |
| `routes` | Bus route codes and names |
| `route_patterns` | A particular direction or variant of a route |
| `route_stops` | Stop order and whether boarding/alighting is allowed |
| `fares` | A sourced price between two ordered stops in one pattern |

A stop may appear twice in a pattern, allowing loop routes. Two stops on opposite sides of a road should have separate IDs when their boarding locations differ.

Rows start unverified. Verification needs both a source and a timestamp. The planning API must require a verified pattern and verified boarding/drop-off stops, then select an earlier boardable position and a later alightable position in the same pattern. A missing fare means unknown, not zero.

The migration contains no seeded routes. The existing frontend's sample corridor is synthetic and must not be promoted into verified database records.

## Next backend slice

1. Create the FastAPI application and configure a backend-only database connection.
2. Add read queries and an API for verified drop-off stops.
3. Add the journey-planning endpoint and return explicit estimate sources.
4. Connect the frontend to that API, with loading and connection-error states.

The local `boardhere` login currently administers the development database. The backend should use a dedicated login with only the permissions needed by its endpoints when we add the API.

## References

- [Official PostgreSQL Docker image](https://hub.docker.com/_/postgres)
- [Docker persistent volumes](https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/)
- [FastAPI request validation](https://fastapi.tiangolo.com/python-types/)
