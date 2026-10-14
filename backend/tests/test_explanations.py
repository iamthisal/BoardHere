from app.explanations import explain


def test_template_uses_computed_values_and_estimated_labels():
    option = {'rule_code': 'walk', 'walk_minutes': 7.3, 'time_minutes': 63.2,
        'wait_minutes': 8, 'cost_lkr': 123, 'savings_lkr': 876, 'bucket': 'weekday_midday'}
    text = explain(option, 'cheapest', 90)
    assert '7.3 min' in text and 'LKR 123' in text and '63.2 min' in text
    assert 'LKR 876' in text and 'estimated' in text.lower()
    assert 'weekday_midday' in text and 'cheapest' in text
