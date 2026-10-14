from datetime import datetime, time
from zoneinfo import ZoneInfo

COLOMBO = ZoneInfo("Asia/Colombo")


def get_time_bucket(now: datetime) -> str:
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone offset")
    local = now.astimezone(COLOMBO)
    if local.weekday() >= 5:
        return "weekend"
    hour = local.time()
    if time(7) <= hour < time(9):
        return "weekday_morning_peak"
    if time(9) <= hour < time(16, 30):
        return "weekday_midday"
    if time(16, 30) <= hour < time(19):
        return "weekday_evening_peak"
    return "night"
