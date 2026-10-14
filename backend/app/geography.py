from math import asin, cos, radians, sin, sqrt

# Estimated demo access assumptions, not street-level routing measurements.
WALK_DETOUR = 1.3
WALK_SPEED_KMH = 4.5
MAX_WALK_KM = 2.4
DEMO_ORIGIN_RADIUS_KM = 10


def haversine(a: dict, b: dict) -> float:
    lat_a, lat_b = radians(a['lat']), radians(b['lat'])
    dlat, dlng = lat_b - lat_a, radians(b['lng'] - a['lng'])
    h = sin(dlat / 2) ** 2 + cos(lat_a) * cos(lat_b) * sin(dlng / 2) ** 2
    return 6371 * 2 * asin(sqrt(min(1.0, max(0.0, h))))


def nearest_boarding_points(origin: dict, pattern_id: str, destination_id: str, catalog: dict) -> list[dict]:
    positions = [s for s in catalog['route_stops'] if str(s['pattern_id']) == pattern_id]
    targets = [s['sequence'] for s in positions if str(s['stop_id']) == destination_id and s['can_alight']]
    stops = {str(s['id']): s for s in catalog['stops']}
    candidates = []
    for position in positions:
        if position['can_board'] and any(position['sequence'] < target for target in targets):
            stop = stops.get(str(position['stop_id']))
            if stop:
                candidates.append({**stop, 'id': str(stop['id']),
                    'sequence': position['sequence'], 'distance_km': haversine(origin, stop) * WALK_DETOUR})
    return sorted(candidates, key=lambda s: (s['distance_km'], s['id'], s['sequence']))
