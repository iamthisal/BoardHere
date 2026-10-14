def apply_rules(ranked: list[dict], minutes_available: int) -> list[dict]:
    full_ride = next((o for o in ranked if len(o['legs']) == 1 and o['legs'][0]['mode'] == 'taxi'), None)
    options = []
    for option in ranked:
        fits = option['time_minutes'] <= minutes_available
        code = 'short_on_time' if not fits else ('walk' if option['legs'][0]['mode'] == 'walk' else 'ride')
        options.append({**option, 'fits_available_time': fits, 'rule_code': code,
            'walk_minutes': round(sum(l['in_vehicle_minutes'] for l in option['legs'] if l['mode'] == 'walk'), 2),
            'savings_lkr': round(full_ride['cost_lkr'] - option['cost_lkr'], 2) if full_ride else None})
    return sorted(options, key=lambda o: (not o['fits_available_time'], o['score'], o['id']))
