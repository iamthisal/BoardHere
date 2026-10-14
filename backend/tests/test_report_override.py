from datetime import timedelta
import pytest
from app.engine import estimate_options, fresh_reports
from app.repository import get_catalog
from test_estimates import at


@pytest.mark.parametrize('age_seconds,expected', [(0,'seats_free'),(1799,'seats_free'),(1800,'packed'),(1801,'packed'),(-1,'packed')])
def test_report_override_strict_thirty_minute_boundary(age_seconds,expected):
    now=at('08:00')
    catalog=get_catalog('maharagama')
    catalog['reports']=[{'id':'a','leg_id':'maharagama-pickme-hop-2','crowd_level':'seats_free','reported_at':now-timedelta(seconds=age_seconds)}]
    options=estimate_options(catalog,now)
    hop=next(o for o in options if o['id']=='maharagama-pickme-hop')
    assert hop['crowd_level']==expected
    assert estimate_options(catalog,now)==options


def test_latest_report_tie_is_resolved_by_id_not_input_order():
    now=at('08:00')
    reports=[{'id':id,'leg_id':'bus','reported_at':now,'crowd_level':level} for id,level in [('z','packed'),('a','standing')]]
    assert fresh_reports(reports,now)['bus']['id']=='a'
    assert fresh_reports(reports[::-1],now)==fresh_reports(reports,now)
