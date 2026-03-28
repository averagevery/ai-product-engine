# Epic: The 9-Agent Lesson Engine

## Executive Summary

Build the autonomous content generation pipeline where a Creator Agent drafts structured micro-lessons, a Compliance Agent validates them within a Maker-Checker loop, and a Design Agent attaches Lottie visual assets -- all before any content reaches Firestore. This epic delivers the core product engine that powers Layer 2 (Learn) of the Mulo platform at scale without manual content creation.

## Business Value

Enables zero-human-in-the-loop content generation, reducing per-lesson production cost by an estimated 90% compared to manual authoring. Unlocks the ability to scale from tens to thousands of lessons across all financial education categories, directly supporting user retention and the progression from Layer 2 (Learn) to Layer 3 (Act) where Mulo earns referral revenue.

## Success Metrics

- 100% of published lessons pass Compliance Agent validation with a recorded `compliance_audit` field
- Average lesson generation time (request to Firestore write) under 45 seconds
- Lesson drop-off rate below 30% across the first 3 screens
- Zero FCA compliance violations in generated content

## Associated Personas

- Sarah (First-Time Buyer) -- needs mortgage and LISA education; first candidate for generated lessons
- James (Clueless Professional) -- needs savings vs. investing education; benefits from scaled lesson catalogue
- Aisha (Debt Trapped) -- needs debt payoff education with emotional reassurance; validates tone constraints
- Tom (Passive Pension) -- needs pension contribution education; tests breadth of topic coverage
- Chloe (Financially Curious) -- needs structured beginner journeys; validates pedagogical progression

## Linked Stories

- STORY-001 -- Sarah learns LISA basics (3-screen penalty lesson)
- STORY-002 -- James learns savings vs. investing fundamentals
- STORY-003 -- Aisha learns minimum payment traps

## Scope & Boundaries

**In scope:** Creator Agent prompt design, Compliance Agent validation loop, Design Agent Lottie attachment, Firestore batch writes to `lessons` and `screens` collections, `agent_logs` for failed drafts, `compliance_audit` field on every write.

**Out of scope:** Layer 1 (SEE) Open Banking integration, Layer 3 (ACT) product comparison and switching, user authentication, mobile app UI implementation, human review dashboard.

## Dependencies

- Gemini AI API access (Creator and Compliance Agents)
- Firebase Cloud Functions deployed to `europe-west2`
- Firestore database with `lessons`, `screens`, `agent_logs`, and `image_library` collections
- Lottie asset generation service (Nano Banana or equivalent)

## Notes

The Maker-Checker loop is the non-negotiable safety mechanism. No content may be written to Firestore without a `"status": "PASS"` from the Compliance Agent. The canonical architecture is defined in `functions/docs/agent_architecture.md`.
