from fastapi import FastAPI, HTTPException, Query
from psycopg import Error as DatabaseError
from . import database, repository
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
from .models import RecommendRequest, Origin, Preference
from .recommendation import recommend

app = FastAPI(title="BoardHere", description="Local estimated (rule-based) journey recommendations")


@app.exception_handler(DatabaseError)
async def database_error(request, exc):
    return JSONResponse(status_code=503, content={"detail": "Database unavailable"})


@app.get("/stops")
def stops():
    return repository.get_stops()


@app.post('/recommend')
def recommendation(request: RecommendRequest):
    now = request.now or datetime.now(timezone.utc)
    return recommend(request, now)


@app.get('/explain/{option_id}')
def explanation(option_id: str, origin_lat: float = Query(6.952, ge=-90, le=90),
                origin_lng: float = Query(79.879, ge=-180, le=180),
                preference: Preference = 'fastest', minutes_available: int = Query(90, ge=1, le=1440),
                now: datetime | None = None):
    if now is not None and (now.tzinfo is None or now.utcoffset() is None):
        raise HTTPException(422, 'now must include a timezone offset')
    destination = repository.option_destination(option_id)
    if not destination:
        raise HTTPException(404, 'Unknown option')
    request = RecommendRequest(origin=Origin(lat=origin_lat, lng=origin_lng), destination=destination,
        preference=preference, minutes_available=minutes_available, now=now)
    result = recommend(request, now or datetime.now(timezone.utc))
    option = next((o for o in result['options'] if o['id'] == option_id), None)
    if not option:
        raise HTTPException(404, 'Option is not eligible for this origin')
    return {'now': result['now'], 'bucket': result['bucket'], 'origin': result['origin'],
        'preference': preference, 'minutes_available': minutes_available, 'data_status': 'estimated',
        'option_id': option_id, 'score': option['score'], 'criteria': option['score_breakdown'],
        'explanation': option['explanation']}


@app.get("/health")
def health():
    try:
        database.read("select 1 as connected")
    except DatabaseError:
        raise HTTPException(503, "Database unavailable") from None
    return {"status": "ok", "database": "connected"}
