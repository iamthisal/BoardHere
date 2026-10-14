from copy import deepcopy
from datetime import datetime
import pytest
from app.engine import estimate_options
from app.repository import get_catalog


def at(clock):
    return datetime.fromisoformat(f'2026-10-14T{clock}:00+05:30')


def test_totals_are_calculated_from_legs_and_profiles():
    options = {o['id']: o for o in estimate_options(get_catalog('maharagama'), at('14:00'))}
    assert options['maharagama-full-pickme']['cost_lkr'] == 1000
    assert options['maharagama-two-buses']['cost_lkr'] == 160
    assert options['maharagama-pickme-hop']['cost_lkr'] == 480
    assert options['maharagama-full-pickme']['time_minutes'] == 44
    assert options['maharagama-two-buses']['wait_minutes'] == 16
    assert all(o['data_status'] == 'estimated' for o in options.values())
    assert all(l['data_status'] == 'estimated' for o in options.values() for l in o['legs'])


def test_peak_increases_taxi_time_and_bus_crowding():
    options = {o['id']: o for o in estimate_options(get_catalog('maharagama'), at('08:00'))}
    assert options['maharagama-full-pickme']['time_minutes'] == 82
    assert options['maharagama-pickme-hop']['crowd_level'] == 'packed'


def test_missing_profile_fails_instead_of_making_up_a_time():
    catalog = deepcopy(get_catalog('maharagama'))
    catalog['profiles'] = []
    with pytest.raises(ValueError, match='Missing time profile'):
        estimate_options(catalog, at('14:00'))
