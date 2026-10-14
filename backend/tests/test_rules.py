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


def test_walk_branch_when_walk_fits():
    result = apply_rules(fixtures(), 90)
    assert result[0]['rule_code'] == 'walk'
    assert result[0]['walk_minutes'] == 10


def test_ride_branch_when_walk_is_too_slow():
    result = apply_rules(fixtures(), 50)
    assert result[0]['rule_code'] == 'ride'
    assert result[0]['fits_available_time']


def test_short_on_time_branch_when_nothing_fits():
    result = apply_rules(fixtures(), 20)
    assert all(o['rule_code'] == 'short_on_time' for o in result)
    assert not any(o['fits_available_time'] for o in result)
