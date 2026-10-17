# Evaluation plan — separate simulation from evidence

## Historical prototype outcomes (source presentation)

The original academic pitch included a **prepared simulated dataset**, explicitly marked as non-production evidence: prototype 1 showed a 36.1% simulated median-time reduction and +13.3 points simulated accuracy improvement; prototype 2 listed 9.2 minutes median time, 83.3% correct escalation, 4.2/5 ease of use, 2.7/5 workload. **These are not measured outcomes of v2.0** and should not be used as claims in a resume, paper, or product marketing without qualification.

## Repeatable software checks included

- Six cases have complete source-ID references, no unbacked named findings.
- Scoring thresholds and missing-data coverage are independently tested.
- Decision guardrails reject missing notes, unacknowledged gaps, and unsourced high-risk closures.
- API rejects malformed IDs, nonexistent cases and invented LLM citations.

## Recommended human study for a real SOC pilot

**Design:** Obtain ethics/security approval; recruit 12–20 analysts across junior and senior experience levels. Randomize order with counterbalancing to reduce learning effects. Give each participant a matched series of *de-identified synthetic or explicitly authorized* alerts in (A) traditional log view and (B) EvidenceGraph view. Blind graders to condition where possible. Pre-register scoring rubric and stop rules.

**Metrics:**

1. Median time to a correctly justified disposition (not speed alone).
2. True-positive escalation sensitivity and false-positive escalation rate.
3. Evidence citation accuracy, count of unsupported claims, missed evidence gaps.
4. Inter-rater agreement across analysts and senior adjudicators.
5. Hand-off completeness, rework rate, subjective workload (NASA-TLX or simple scale).
6. AI anchoring: how often do users follow a wrong recommendation after seeing contrary evidence?
7. Cost/latency per model-assisted analysis, rate of schema/citation failures, prompt-injection resilience.

**Failure injection:** Simulate a benign high-score case, a malicious low-score case, contradictory identity records, a missing EDR stream, an injected instruction within a log entry, and source-id tampering. Require ground truth and independent senior adjudication.

**Go/no-go:** Pilot only when accuracy and oversight are at least non-inferior to the existing workflow, source traceability is complete, prompt injection results in safe failure, and legal/privacy/security reviews approve the data flow. Set thresholds *before* testing rather than presenting a polished retrospective figure.
