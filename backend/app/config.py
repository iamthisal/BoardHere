import os


def database_url() -> str:
    return os.getenv("DATABASE_URL", "postgresql://boardhere_api:boardhere_api_dev_only@127.0.0.1:55432/boardhere")


def cors_origins() -> list[str]:
    return [s.strip() for s in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if s.strip()]
