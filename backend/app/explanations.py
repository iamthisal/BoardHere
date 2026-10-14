def explain(option: dict, preference: str, minutes_available: int) -> str:
    prefix = {
        'walk': f"Walk for an estimated {option['walk_minutes']:.1f} min to the boarding point.",
        'ride': 'Use the estimated ride option to reach the bus or your drop-off stop.',
        'short_on_time': f"Short on time: this option exceeds your {minutes_available} min budget by an estimated {option['time_minutes'] - minutes_available:.1f} min.",
    }[option['rule_code']]
    total = f" Estimated (rule-based) total: LKR {option['cost_lkr']:.0f}, {option['time_minutes']:.1f} min, including {option['wait_minutes']:.1f} min waiting."
    saving = f" Estimated saving versus the full ride: LKR {option['savings_lkr']:.0f}." if option['savings_lkr'] is not None else ''
    return prefix + total + saving + f" Ranked for {preference} in {option['bucket']}; lower weighted score is better."
