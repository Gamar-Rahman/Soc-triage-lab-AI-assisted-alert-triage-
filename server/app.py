"""Optional same-origin training backend; localhost only by default.

Never deploy on a public network without adding authentication, CSRF defenses, rate
limits, privacy review, service monitoring and an organizational security approval.
"""
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from .engine import cases, analyze_case

ROOT = Path(__file__).resolve().parents[1]
app = FastAPI(title='EvidenceGraph training API', version='2.0.0', docs_url=None, redoc_url=None)

class AnalyzeRequest(BaseModel):
    case_id: str = Field(pattern=r'^SOC-[0-9]{4}$', max_length=12)

@app.get('/api/health')
def health():
    return {'status':'ok','mode':'synthetic-demo', 'ai_enabled': bool(os.getenv('OPENAI_API_KEY'))}

@app.post('/api/ai-analysis')
def ai_analysis(body: AnalyzeRequest):
    case = cases().get(body.case_id)
    if case is None:
        raise HTTPException(404, 'Unknown demo case ID')
    if not os.getenv('OPENAI_API_KEY'):
        raise HTTPException(503, 'Optional model adapter is disabled. Add an approved server-side key.')
    try:
        return analyze_case(case)
    except (RuntimeError, ValueError) as ex:
        # Intentionally do not expose provider messages / sensitive details.
        raise HTTPException(502, 'Model analysis unavailable or failed evidence validation') from ex

app.mount('/assets', StaticFiles(directory=ROOT/'assets'), name='assets')
app.mount('/css', StaticFiles(directory=ROOT/'css'), name='css')
app.mount('/js', StaticFiles(directory=ROOT/'js'), name='js')
app.mount('/docs', StaticFiles(directory=ROOT/'docs'), name='docs')
@app.get('/')
def index(): return FileResponse(ROOT/'index.html')
