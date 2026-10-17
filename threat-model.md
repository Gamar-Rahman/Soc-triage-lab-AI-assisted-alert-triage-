# Threat model — EvidenceGraph training app

**Scope:** static browser demo with synthetic fixtures and optional local LLM API. No security-sensitive operations are wired.

| Threat | Mitigation in this code | Remaining gap before production |
|---|---|---|
| Prompt injection in logs | System instructions treat events as untrusted data; fixed example case IDs; no tools, no autonomous actions; structured response; allowlisted citations | Attack simulations, stronger content isolation, independent claim validation |
| Hallucinated evidence | Model `cited_event_ids` must exist in the case; response rejected otherwise | A valid ID can still be cited with incorrect interpretation: analyst verification remains mandatory |
| Sensitive data leakage | Sample fixtures only; browser static mode never transmits case data; server-side API key only | Production PII classification, data minimization, retention agreements, provider approval |
| XSS through event data | UI interpolations encoded; raw JSON rendered with `textContent`; no untrusted HTML rendering | CSP, Trusted Types, SAST/DAST, third-party dependencies review |
| Misleading scores | Deterministic, inspectable weights; explicit label that score isn't a probability; completeness independent | Real-world calibration, error-rate measurement, bias and drift analysis |
| Premature closure | Minimum analyst reason; high-risk closing requires 2 checked source records; gap acknowledgment | RBAC and 2-person approvals, case policy enforcement and server audit |
| Forged / tampered data | Fixture schema and citation tests | Source-origin signing/hash, connector auth, log integrity |
| Secrets exposure | Model key is never in frontend; env-only backend | Secret manager, rotation, access controls |
| Public backend abuse | Intended localhost only; fixed ID list, no arbitrary telemetry import | Authn/authz, quotas, CSRF controls, rate limiting and cost budget |
| Local data exfiltration | localStorage only, no outbound analytics | Encryption, tenancy, data lifecycle for real cases |

Security decisions have real-world consequences. Never deploy this demo as a security control. Human approval is necessary, but **not sufficient** to claim reliable operation: measurable detection accuracy and organizational procedures are also required.
