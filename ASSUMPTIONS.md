Design assumptions & unique heuristics

1. Coaching rubric (used for scoring)
   - Empathy: Acknowledge customer context (20 pts)
   - Open questions: Use >1 open question (20 pts)
   - Concrete next step: Offer a specific action and timeframe (25 pts)
   - Accountability: Set follow-up and ownership (20 pts)
   - Tone: Avoid blame and be collaborative (15 pts)

2. CSR behavior model
   - CSR replies vary based on manager coaching quality:
     - Poor coaching -> defensive or vague CSR replies; lower customer commitments.
     - Good coaching -> confident CSR replies with clear commitments and next steps.

3. Action plan generation
   - Outputs 3 prioritized and time-bound items (quick wins first).
   - Tailored to the scenario and the weaknesses detected in the manager messages.

4. Hybrid approach
   - Rule-based engine ensures deterministic, explainable behavior for interview reviewers.
   - Optional LLM enrichment allows more human-like replies when API key is present.

5. Privacy
   - No real customer data is included. Replace dummy scenarios with sanitized real data if you deploy.

These heuristics and scoring allocations were crafted to reflect managerial coaching behaviours and are not generic LLM-provided text.
