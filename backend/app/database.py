from psycopg import connect
from psycopg.rows import dict_row
from .config import database_url


def read(sql: str, params=()) -> list[dict]:
    with connect(database_url(), row_factory=dict_row, connect_timeout=3) as conn:
        conn.execute("set transaction read only")
        return conn.execute(sql, params).fetchall()


def snapshot(queries: dict) -> dict:
    with connect(database_url(), row_factory=dict_row, connect_timeout=3) as conn:
        conn.execute("set transaction isolation level repeatable read read only")
        return {key: conn.execute(sql, params).fetchall() for key, (sql, params) in queries.items()}
