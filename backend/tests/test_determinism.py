from copy import deepcopy
from app.engine import estimate_options, rank_options
from app.repository import get_catalog
from test_estimates import at


def test_morning_and_midday_rank_differently_for_same_journey():
    catalog = get_catalog('maharagama')
    morning = rank_options(estimate_options(catalog, at('08:00')), 'fastest')
    midday = rank_options(estimate_options(catalog, at('14:00')), 'fastest')
    assert morning[0]['id'] == 'maharagama-pickme-hop'
    assert midday[0]['id'] == 'maharagama-full-pickme'


def test_same_inputs_and_snapshot_are_identical_even_if_input_order_changes():
    catalog = get_catalog('maharagama')
    first = rank_options(estimate_options(catalog, at('08:00')), 'fastest')
    altered = deepcopy(catalog)
    altered['options'].reverse()
    assert rank_options(estimate_options(altered, at('08:00')), 'fastest') == first
    assert rank_options(estimate_options(catalog, at('08:00')), 'fastest') == first
