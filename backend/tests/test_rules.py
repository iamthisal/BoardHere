from copy import deepcopy
from app.rules import apply_rules


def fixtures():
    return [
        {'id': 'walk', 'time_minutes': 70, 'cost_lkr': 80, 'score': .1, 'legs': [{'mode': 'walk', 'in_vehicle_minutes': 10}, {'mode': 'bus', 'in_vehicle_minutes': 50}]},
        {'id': 'ride', 'time_minutes': 40, 'cost_lkr': 900, 'score': .5, 'legs': [{'mode': 'taxi', 'in_vehicle_minutes': 36}]},
    ]


def test_savings_are_derived_from_the_catalog_not_fixed_prices():
    options = fixtures()
    result = apply_rules(options, 90)
    assert result[0]['savings_lkr'] == 820
    changed = deepcopy(options)
    changed[1]['cost_lkr'] = 1200
    assert apply_rules(changed, 90)[0]['savings_lkr'] == 1120
    assert 'rule_code' not in options[0]


def test_time_budget_places_feasible_options_before_cheaper_late_options():
    assert apply_rules(fixtures(), 50)[0]['id'] == 'ride'
    assert apply_rules([], 50) == []
