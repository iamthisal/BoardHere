from fastapi import FastAPI, HTTPException
from psycopg import Error as DatabaseError
from . import database

app = FastAPI(title="BoardHere", description="Local estimated (rule-based) journey recommendations")


@app.get("/health")
def health():
    try:
        database.read("select 1 as connected")
    except DatabaseError:
        raise HTTPException(503, "Database unavailable") from None
    return {"status": "ok", "database": "connected"}
