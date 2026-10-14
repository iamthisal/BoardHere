from datetime import datetime
from .time_model import get_time_bucket

CROWD = {'not_applicable': 0.0, 'seats_free': 0.0, 'standing': 0.5, 'packed': 1.0}


def estimate_options(catalog: dict, now: datetime) -> list[dict]:
    bucket = get_time_bucket(now)
    profiles = {(p['leg_id'], p['bucket']): p for p in catalog['profiles']}
    stops = {str(s['id']): s for s in catalog['stops']}
    results = []
    for option in catalog['options']:
        legs = []
        for raw in sorted((l for l in catalog['legs'] if l['option_id'] == option['id']), key=lambda l: l['sequence']):
            profile = profiles.get((raw['id'], bucket))
            if profile is None:
                raise ValueError(f"Missing time profile for {raw['id']} / {bucket}")
            vehicle = float(raw['base_minutes']) * float(profile['in_vehicle_multiplier'])
            legs.append({
                'id': raw['id'], 'mode': raw['mode'], 'from_stop_id': str(raw['from_stop_id']) if raw['from_stop_id'] else None,
                'to_stop': {**stops[str(raw['to_stop_id'])], 'id': str(raw['to_stop_id'])},
                'pattern_id': str(raw['pattern_id']) if raw['pattern_id'] else None,
                'cost_lkr': float(raw['cost_lkr']), 'in_vehicle_minutes': round(vehicle, 2),
                'wait_minutes': float(profile['wait_minutes']), 'walk_km': 0.0,
                'crowd_level': profile['crowd_level'], 'crowd_source': 'estimated (rule-based)',
                'data_status': 'estimated', 'source': raw['source'], 'profile_source': profile['source'],
            })
        if not legs:
            raise ValueError(f"Option {option['id']} has no legs")
        wait = sum(l['wait_minutes'] for l in legs)
        crowd = max(CROWD[l['crowd_level']] for l in legs)
        results.append({
            'id': option['id'], 'title': option['title'], 'destination_id': str(option['destination_id']),
            'cost_lkr': round(sum(l['cost_lkr'] for l in legs), 2),
            'time_minutes': round(sum(l['in_vehicle_minutes'] for l in legs) + wait, 2),
            'wait_minutes': round(wait, 2), 'walk_km': 0.0, 'crowd_value': crowd,
            'crowd_level': next(k for k, v in CROWD.items() if k != 'not_applicable' and v == crowd)
                if any(l['mode'] == 'bus' for l in legs) else 'not_applicable',
            'bucket': bucket, 'data_status': 'estimated', 'source': option['source'], 'legs': legs,
        })
    return results
