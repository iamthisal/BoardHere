import pytest
from app.geography import haversine, nearest_boarding_points
from app.repository import get_catalog
from app.engine import estimate_options
from test_estimates import at


def test_haversine_zero_and_known_degree_distance():
    assert haversine({'lat': 0, 'lng': 0}, {'lat': 0, 'lng': 0}) == 0
    assert haversine({'lat': 0, 'lng': 0}, {'lat': 0, 'lng': 1}) == pytest.approx(111.195, abs=.01)


def test_gps_selects_nearest_eligible_upstream_stop_and_changes_walk_time():
    catalog = get_catalog('maharagama')
    borella = next(s for s in catalog['stops'] if s['slug'] == 'borella')
    direct = next(l for l in catalog['legs'] if l['option_id'] == 'maharagama-walk-bus' and l['mode'] == 'bus')
    nearest = nearest_boarding_points(borella, str(direct['pattern_id']), str(direct['to_stop_id']), catalog)
    assert nearest[0]['slug'] == 'borella'
    options = estimate_options(catalog, at('14:00'), borella)
    walking = next(o for o in options if o['id'] == 'maharagama-walk-bus')
    assert walking['walk_km'] == 0
    assert walking['legs'][0]['to_stop']['slug'] == 'borella'
    orion = next(o for o in estimate_options(catalog, at('14:00')) if o['id'] == 'maharagama-walk-bus')
    assert orion['walk_km'] > walking['walk_km']


def test_outside_coverage_and_already_at_dropoff_are_empty():
    catalog = get_catalog('maharagama')
    assert estimate_options(catalog, at('14:00'), {'lat': 0, 'lng': 0}) == []
    target = next(s for s in catalog['stops'] if s['slug'] == 'maharagama')
    assert estimate_options(catalog, at('14:00'), target) == []
