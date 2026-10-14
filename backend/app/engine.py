from datetime import datetime
from .time_model import get_time_bucket

CROWD = {'not_applicable': 0.0, 'seats_free': 0.0, 'standing': 0.5, 'packed': 1.0}
WEIGHTS = {
    'cheapest': {'cost': .6, 'time': .15, 'crowd': .1, 'walk': .15},
    'fastest': {'cost': .15, 'time': .6, 'crowd': .1, 'walk': .15},
    'comfortable': {'cost': .1, 'time': .2, 'crowd': .45, 'walk': .25},
}
CRITERIA = {'cost': 'cost_lkr', 'time': 'time_minutes', 'crowd': 'crowd_value', 'walk': 'walk_km'}


def rank_options(options: list[dict], preference: str) -> list[dict]:
    weights = WEIGHTS[preference]
    if not options:
        return []
    bounds = {criterion: (min(o[field] for o in options), max(o[field] for o in options))
              for criterion, field in CRITERIA.items()}
    ranked = []
    for option in options:
        breakdown = {}
        score = 0.0
        for criterion, field in CRITERIA.items():
            low, high = bounds[criterion]
            normalized = (option[field] - low) / (high - low) if high > low else 0.0
            contribution = normalized * weights[criterion]
            score += contribution
            breakdown[criterion] = {'raw': option[field], 'normalized': round(normalized, 6),
                'weight': weights[criterion], 'contribution': round(contribution, 6)}
        ranked.append({**option, 'score': round(score, 6), 'score_breakdown': breakdown})
    return sorted(ranked, key=lambda option: (option['score'], option['id']))


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
