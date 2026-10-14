from datetime import datetime
from fastapi import HTTPException
from . import repository
from .engine import estimate_options, rank_options
from .models import RecommendRequest
from .rules import apply_rules
from .explanations import explain
from .time_model import COLOMBO, get_time_bucket


def recommend(request: RecommendRequest, now: datetime) -> dict:
    catalog = repository.get_catalog(request.destination)
    if not any(s['slug'] == request.destination or str(s['id']) == request.destination for s in catalog['stops'] if s['kind'] == 'destination'):
        raise HTTPException(404, 'Unknown drop-off stop')
    try:
        options = apply_rules(rank_options(estimate_options(catalog, now, request.origin.model_dump()), request.preference), request.minutes_available)
    except ValueError:
        raise HTTPException(503, 'Journey data is incomplete; no estimate can be supplied') from None
    options = [{**o, 'explanation': explain(o, request.preference, request.minutes_available)} for o in options]
    return {
        'now': now.astimezone(COLOMBO).isoformat(), 'bucket': get_time_bucket(now),
        'preference': request.preference, 'minutes_available': request.minutes_available,
        'origin': request.origin.model_dump(), 'destination': request.destination,
        'data_status': 'estimated', 'method': 'estimated (rule-based)',
        'recommended_id': options[0]['id'] if options else None, 'options': options,
        'message': None if options else 'No eligible options in the estimated demo coverage, or already at the drop-off stop.',
        'assumptions': {'data_status': 'estimated', 'walking_detour_factor': 1.3, 'walking_speed_kmh': 4.5},
    }
