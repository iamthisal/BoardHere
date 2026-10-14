from datetime import datetime
import pytest
from app.time_model import get_time_bucket


@pytest.mark.parametrize('clock,expected', [
    ('00:00:00', 'night'), ('06:59:59', 'night'), ('07:00:00', 'weekday_morning_peak'),
    ('08:59:59', 'weekday_morning_peak'), ('09:00:00', 'weekday_midday'),
    ('16:29:59', 'weekday_midday'), ('16:30:00', 'weekday_evening_peak'),
    ('18:59:59', 'weekday_evening_peak'), ('19:00:00', 'night'), ('23:59:59', 'night'),
])
def test_every_weekday_boundary(clock, expected):
    assert get_time_bucket(datetime.fromisoformat(f'2026-10-14T{clock}+05:30')) == expected


@pytest.mark.parametrize('stamp', ['2026-10-17T00:00:00+05:30', '2026-10-18T08:00:00+05:30', '2026-10-18T23:59:59+05:30'])
def test_weekend_precedence(stamp):
    assert get_time_bucket(datetime.fromisoformat(stamp)) == 'weekend'


def test_timezone_conversion_and_naive_input():
    assert get_time_bucket(datetime.fromisoformat('2026-10-14T01:30:00+00:00')) == 'weekday_morning_peak'
    with pytest.raises(ValueError):
        get_time_bucket(datetime(2026, 10, 14, 8))
