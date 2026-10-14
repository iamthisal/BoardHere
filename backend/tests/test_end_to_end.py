from copy import deepcopy
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engine import estimate_options
from app.repository import get_catalog
from test_estimates import at
from test_recommend import BODY

client=TestClient(app)


@pytest.mark.parametrize('preference',['cheapest','fastest','comfortable'])
@pytest.mark.parametrize('clock,bucket',[('08:00','weekday_morning_peak'),('14:00','weekday_midday'),('17:00','weekday_evening_peak')])
def test_three_preferences_and_buckets_against_real_database(preference,clock,bucket):
    body={**BODY,'preference':preference,'now':f'2026-10-14T{clock}:00+05:30'}
    response=client.post('/recommend',json=body)
    assert response.status_code==200
    result=response.json()
    assert result['bucket']==bucket and len(result['options'])==4
    assert result['recommended_id']==result['options'][0]['id']
    assert all(o['data_status']=='estimated' and o['explanation'] for o in result['options'])
    assert client.post('/recommend',json=body).json()==result


def test_walk_ride_and_tight_budget_through_http():
    for minutes,preference,expected in [(90,'cheapest','walk'),(50,'cheapest','ride'),(5,'fastest','short_on_time')]:
        result=client.post('/recommend',json={**BODY,'now':'2026-10-14T14:00:00+05:30','minutes_available':minutes,'preference':preference}).json()
        assert result['options'][0]['rule_code']==expected
    homagama=client.post('/recommend',json={**BODY,'destination':'homagama'}).json()
    buses=[l for o in homagama['options'] for l in o['legs'] if l['mode']=='bus']
    assert any('138' in l['service_label'] for l in buses)
    assert all(l['data_status']=='estimated' for l in buses)


def test_bus_cost_reads_fare_data_and_refuses_missing_fares():
    catalog=get_catalog('maharagama')
    changed=deepcopy(catalog)
    for fare in changed['fares']:
        fare['amount_lkr']=321
    options=estimate_options(changed,at('14:00'))
    assert next(o for o in options if o['id']=='maharagama-two-buses')['cost_lkr']==642
    changed['fares']=[]
    with pytest.raises(ValueError,match='Missing fare'):
        estimate_options(changed,at('14:00'))
