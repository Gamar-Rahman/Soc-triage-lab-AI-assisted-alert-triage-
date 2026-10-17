# Practical adoption roadmap

## Priority 0 — make the model evidence trustworthy (0–4 weeks)

- Build a labeled incident set from **synthetic** CloudTrail, GuardDuty, Entra ID and EDR-style records with known answer keys.
- Add immutable incident/event identifiers, source hashes, UTC normalization and time-range boundaries.
- Add claim-by-claim validation: a citation must support a specific sentence, not just refer to any existing event.
- Define clear categories: source observation, rule-derived inference, model hypothesis and analyst-confirmed conclusion.
- Add a failure state if a source is missing or contradictory. Never convert data absence into confidence.

## Priority 1 — connect the SOC workflow safely (1–3 months)

- Add **read-only** connectors to one target environment (e.g., Splunk search, Sentinel incidents, AWS CloudTrail/GuardDuty).
- Adopt Open Cybersecurity Schema Framework (OCSF) or Elastic Common Schema (ECS) and preserve raw-source pointers.
- Add a secure backend with OIDC, RBAC (`analyst`,`senior`,`admin`), case locking, reviewer approvals and Postgres audit logs.
- Export to ServiceNow/Jira tickets with approval, citations, gaps, and observables; do not remediate automatically.

## Priority 2 — evaluate AI usefulness honestly (3–6 months)

- Retrieval-augment investigation instructions from **approved internal playbooks** with source and version citations.
- Benchmark rule-only vs LLM-assisted vs existing SOC workflow on the same blinded dataset.
- Measure time, precision/recall, unsupported conclusions, false closures, human override rate, cost and reviewer disagreement.
- Run adversarial tests for prompt injection, manipulated logs, hallucinations, and evidence laundering.

## Priority 3 — bounded pilot (6–12 months)

- Deploy behind organization-approved network boundaries with data minimization, retention controls, privacy approval, observability and rate budgets.
- Keep model suggestions read-only; explicit analyst decision plus senior review for selected critical cases.
- Instrument feedback loops: false positive rule tuning, investigation quality, analyst learning and long-term calibration.

## Recruiter-facing portfolio demonstrations

1. **AWS cloud escalation:** CloudTrail `PutBucketPolicy` → Config finding → missing S3 access logs → human escalation.
2. **Identity investigation:** unfamiliar privileged sign-in → evidence graph → missing endpoint data → analyst decision.
3. **Benign close:** approved scanner with change ticket → two reviewed sources → documented closure rationale.
4. **Adversarial evidence:** malicious text embedded in a fake event → model rejects instruction following and cites only source IDs.

The first three are available in the demo. The fourth is a future adversarial-evaluation task, not a claim of proven protection.
