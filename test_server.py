import pytest
from fastapi.testclient import TestClient
from server.app import app
from server.engine import cases, validate_output

client=TestClient(app)

def test_health_without_key(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    assert client.get('/api/health').json()['ai_enabled'] is False

def test_static_page():
    assert 'EvidenceGraph' in client.get('/').text

def test_model_requires_backend_key(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    r=client.post('/api/ai-analysis',json={'case_id':'SOC-1001'})
    assert r.status_code==503

def test_unknown_case_fails():
    assert client.post('/api/ai-analysis',json={'case_id':'SOC-9999'}).status_code==404

def test_bad_case_id_fails():
    assert client.post('/api/ai-analysis',json={'case_id':'../secrets'}).status_code==422

def test_no_fabricated_source_ids():
    case=cases()['SOC-1001']
    d={'summary':'Login from unusual device','suggested_action':'escalate','cited_event_ids':['E999'],'uncertainties':[],'next_verification':[]}
    with pytest.raises(ValueError,match='source citations'):validate_output(d,case)
    d['cited_event_ids']=['E1'];assert validate_output(d,case)['verified'] is False
