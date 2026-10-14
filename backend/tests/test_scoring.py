from copy import deepcopy
import pytest
from app.engine import rank_options, WEIGHTS


def option(id, cost, time, crowd, walk):
    return {'id': id, 'cost_lkr': cost, 'time_minutes': time, 'crowd_value': crowd, 'walk_km': walk}


@pytest.mark.parametrize('preference', WEIGHTS)
def test_normalization_weights_and_no_mutation(preference):
    options = [option('b', 100, 10, 0, 0), option('a', 200, 20, 1, 1)]
    original = deepcopy(options)
    result = rank_options(options, preference)
    assert sum(WEIGHTS[preference].values()) == pytest.approx(1)
    assert result[0]['score'] == 0
    assert result[1]['score'] == 1
    assert all(0 <= c['normalized'] <= 1 for o in result for c in o['score_breakdown'].values())
    assert options == original


def test_ties_use_id_and_constant_criteria_do_not_divide_by_zero():
    options = [option('z', 1, 2, 0, 0), option('a', 1, 2, 0, 0)]
    assert [o['id'] for o in rank_options(options, 'fastest')] == ['a', 'z']
    assert rank_options([], 'fastest') == []
