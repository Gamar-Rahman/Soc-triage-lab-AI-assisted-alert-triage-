# EvidenceGraph — SOC Triage Lab v2.0

**AI-assisted cybersecurity alert triage, built around source-linked evidence and human control.**

[![Node tests](https://img.shields.io/badge/tests-Node%20%2B%20pytest-20c2b6)](#quality-gates) [![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Data](https://img.shields.io/badge/data-synthetic%20only-orange)](#safety--scope)

EvidenceGraph is a **functioning security analyst training application** inspired by the Summer 2026 *AI-Assisted Alert Triage / EvidenceGraph Case Builder* innovation project. It is a substantial rebuild of the original three-case SOC Triage Lab concept demo: an offline-ready web dashboard, six documented synthetic security cases, evidence relationships, source log verification, analyst notes, disposition guardrails, exportable case briefs, automated tests, and an **optional server-side LLM** with constrained structured outputs.

> **Key rule:** **AI recommends. Evidence explains. The analyst decides.**
>
> The static website uses a **transparent deterministic rules engine**. It never represents example scores as LLM probabilities. Live generative AI is **optional** and off unless the operator configures a server-side API key. All data is synthetic.

## Quick start — works without an API key

```bash
# Option A: open index.html in a browser (no setup)
# Option B: serve the static site locally
python3 -m http.server 8080
# Visit http://localhost:8080
```

To start the optional API server (using a fresh virtual environment):

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn server.app:app --host 127.0.0.1 --port 8080
# Visit http://127.0.0.1:8080
```

To additionally enable live LLM summaries (never put this key in website JavaScript):

```bash
cp .env.example .env  # for reference; .env is NOT loaded automatically
export OPENAI_API_KEY='YOUR_SERVER_SIDE_KEY'
export OPENAI_MODEL='gpt-4.1-mini'
uvicorn server.app:app --host 127.0.0.1 --port 8080
```

Use only approved, sanitized, non-sensitive data. The backend deliberately accepts **known demo case IDs only**, not arbitrary raw production logs. An API key may incur provider charges.

## What you can try

1. Start with **SOC-1001: Privileged sign-in**. Open every source record linked to a risk factor; mark it checked.
2. Review the **evidence gaps** and the risk score's individual additive weights.
3. Switch to the **Evidence graph** and **Source records** tabs to understand entity relations and event chronology.
4. Select an action, enter a rationale, acknowledge gaps when required, and record a **human analyst decision**.
5. Copy or download a Markdown handoff or JSON case report. Check the local decision audit and compare with the advisory recommendation.
6. Explore OAuth consent, DNS beaconing, MFA abuse, benign scanner, and public storage policy cases. Change themes, search alerts, and filter severity.

The demo stores notes, source checks, and an audit history **only in browser localStorage**. Clear your site data to reset it. It does not phone home or execute remediation.

## Features

| Implemented and testable | Scope |
|---|---|
| 6 linked synthetic incident scenarios | Identity, endpoint, network, cloud |
| Explainable risk scores | Base 10 + per-signal weights, capped at 100; *not* model confidence |
| Evidence traceability | All listed risk factors cite existing demo event IDs |
| Graph of identities, assets, IPs and applications | Source-linked connections, responsive SVG |
| Realistic raw evidence previews | Event timestamps, source names, raw JSON and analyst checked status |
| Evidence gap and uncertainty labeling | Completeness separate from severity and recommendations |
| Human decisions and overrides | Note-length guardrail; missing-evidence acknowledgment; high-risk-close source checks |
| Exportable handoff, local audit log | Markdown / JSON exports; no external write actions |
| Optional LLM summaries | Server-side Responses API, strict JSON Schema, citation allowlisting, no-store request |
| Regression checks | Node core tests, FastAPI endpoint and evidence-citation tests, GitHub Actions |

**Important distinction:** the static rules engine is real running code; its risk weights and recommended actions are hand-authored training heuristics. The optional LLM generates draft analysis and is not automatically trusted. Neither constitutes a validated detector.

## Repository map

```text
soc-triage-lab/
├── index.html                 # website
├── css/styles.css             # responsive dark/light UI
├── js/core.js                 # pure scoring / guardrail logic
├── js/app.js                  # UI, decisions, exports, source verification
├── js/scenarios.js            # generated browser fixture from JSON
├── data/scenarios.json        # six source-linked training cases
├── assets/favicon.svg
├── server/app.py              # optional FastAPI app
├── server/engine.py           # optional evidence-validated OpenAI adapter
├── tests/                     # JS and Python unit/integration tests
├── scripts/build_site.py      # static distribution + standalone preview
├── docs/
│   ├── architecture.md
│   ├── threat-model.md
│   ├── evaluation.md
│   ├── practical-roadmap.md
│   └── deployment.md
├── .github/workflows/         # CI and GitHub Pages publishing
├── SECURITY.md, CONTRIBUTING.md, LICENSE
└── .env.example
```

## Quality gates

```bash
npm test
pip install -r requirements-dev.txt
pytest -q
python3 scripts/build_site.py
```

CI executes the JavaScript and Python suites, verifies the static build, and checks fixture integrity. **A green CI run shows these specific controls work; it does not prove SOC effectiveness.**

## Website and GitHub publishing

The website is ready for GitHub Pages and can be hosted for free as a static training demo. See [deployment steps](docs/deployment.md). The repo includes a **GitHub Pages workflow** that can publish the site when enabled in your repository. An actual new public URL exists **only after you create/push the repository and enable deployment**.

The [original SOC Triage Lab](https://soc-triage-lab.abakerbaba.chatgpt.site) is a separate, earlier demonstration; it is **not automatically updated by this repository**. This rebuilt version needs to be deployed separately.

## Source and academic evaluation provenance

This project is grounded in *AI-Assisted Alert Triage – EvidenceGraph Case Builder for Junior SOC Analysts* (MENG 407, Summer 2026), especially its five-step flow: alert → risk and explanation → evidence graph → raw-log verification → analyst decision. The presentation's earlier usability figures were explicitly **author-created simulated academic data**, not validated customer or production results:

- First prototype: ~36.1% *simulated* median time reduction and +13.3 percentage points *simulated* accuracy lift.
- Second prototype: 9.2 min and 83.3% correct escalation in the *prepared academic dataset*.

Those results are **not** passed off as actual user research or benchmarks for this implementation. See [evaluation plan](docs/evaluation.md) for a proper experimental method.

## Safety & scope

- **No production SIEM connection, no tenant secrets, no destructive response API, no user authentication, no production security claim.**
- No real customer or employee logs in the public demo; all IPs and domains use documentation/test ranges.
- LLM outputs can hallucinate, be manipulated through prompt injection, and omit critical context. Citation IDs are allowlisted but cited statements still require human verification.
- Browser localStorage is **not** an enterprise audit system. Clear cache/localStorage to remove local test notes.
- Do not expose the demo backend to the public internet without authentication, authorization, abuse protection, retention policies, security review and monitoring.

Read [SECURITY.md](SECURITY.md) and the [threat model](docs/threat-model.md).

## Author and license

Project concept: Gamareldeen Abdalrahman. Rebuild released under the [MIT License](LICENSE). Educational / research training only.
