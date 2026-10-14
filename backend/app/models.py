from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

Preference = Literal['cheapest', 'fastest', 'comfortable']


class Origin(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False, extra='forbid')
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class RecommendRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    origin: Origin
    destination: str = Field(min_length=1, max_length=160)
    preference: Preference = 'fastest'
    minutes_available: int = Field(default=90, ge=1, le=1440)
    now: datetime | None = None

    @field_validator('now')
    @classmethod
    def aware_time(cls, value):
        if value is not None and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError('now must include a timezone offset')
        return value
