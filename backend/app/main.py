from fastapi import FastAPI, HTTPException
from psycopg import Error as DatabaseError
from . import database, repository
from fastapi.responses import JSONResponse

app = FastAPI(title="BoardHere", description="Local estimated (rule-based) journey recommendations")


@app.exception_handler(DatabaseError)
async def database_error(request, exc):
    return JSONResponse(status_code=503, content={"detail": "Database unavailable"})


@app.get("/stops")
def stops():
    return repository.get_stops()


@app.get("/health")
def health():
    try:
        database.read("select 1 as connected")
    except DatabaseError:
        raise HTTPException(503, "Database unavailable") from None
    return {"status": "ok", "database": "connected"}
