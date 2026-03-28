# Service Blueprint: User Onboarding -- From LISA Data to LISA Education

## Overview

**Service Name:** User Onboarding (LISA Journey)
**Owner:** Mulo Product Team
**Date:** 2026-03-28

## Service Blueprint Phases

| Phase | User Actions | Front-stage Interactions | Back-stage Processes | Support Processes |
|-------|-------------|--------------------------|----------------------|-------------------|
| 1. Account Creation | User downloads the app and creates an account with email or social login. | Welcome screen with Mulo branding; single-field sign-up flow; DM Sans typography on near-black (#0A0A1A) background. | Firebase Authentication creates user record; user document initialised in Firestore. | Firebase Auth, Firestore, Cloud Functions (europe-west2). |
| 2. Open Banking Connection (SEE) | User connects their bank account via Open Banking. Consents to read-only data access. | Open Banking consent screen; data loading animation (Lottie: coins motif); financial overview dashboard appears showing savings, debt, income. | Open Banking API fetches account data; system detects LISA account presence; flags LISA-relevant education pathway. | Open Banking provider, Firestore user profile, account categorisation logic. |
| 3. LISA Detection & Education Prompt (SEE to LEARN) | User sees their LISA balance on the dashboard. A contextual prompt invites them to "Learn about your LISA." | LISA card on financial overview with balance; "Learn about your LISA" CTA button (mint green); brief tagline: "Do you know the penalty rules?" (7 words max). | System matches LISA account to the LISA education module; pre-fetches lesson data from Firestore `lessons` collection. | Firestore lesson lookup, lesson availability check. |
| 4. Micro-Lesson (LEARN) | User taps the CTA and enters a 3-screen micro-lesson on LISA penalty rules. Answers quiz questions, reads "Learn More" expandable sections. | Screen 1: Quiz question on LISA withdrawal penalty. Screen 2: Quiz on age rules. Screen 3: Key takeaways with Lottie animation (shield motif). Feedback text limited to 15 words. | Lesson content served from Firestore `screens` collection; user answers logged; completion event tracked. | Firestore reads, analytics event logging, Lottie CDN for animations. |
| 5. Apply to My Money (ACT) | User completes the lesson and sees an ATMI insight card showing their personal LISA projection. A CTA offers to "Compare LISA providers." | ATMI card with deterministic math (penalty amount, projected growth) injected at render time; LLM-generated narrative explains what it means; "Compare providers" CTA (mint green). | ATMI card rendered with separated math constants and LLM text blocks per the ATMI template schema; comparison data fetched from provider API. | ATMI rendering engine, provider comparison API, referral tracking. |

## Line of Visibility

**Above the line (visible to user):** Account creation flow, Open Banking consent, financial dashboard, LISA education CTA, micro-lesson screens, ATMI insight card, provider comparison CTA.

**Below the line (invisible to user):** Firebase Authentication, Open Banking API integration, LISA account detection logic, 9-agent lesson generation pipeline (Creator Agent, Compliance Agent, Design Agent), Firestore batch writes, compliance audit logging, ATMI math/text separation engine, referral commission tracking.

## Pain Points & Opportunities

- Users may abandon during Open Banking consent due to trust concerns; opportunity to add a reassurance screen explaining read-only access and data security.
- The transition from SEE (dashboard) to LEARN (lesson) must feel seamless and contextual, not like a separate product; opportunity to use the detected LISA account as a natural hook.
- Lesson content must be generated and validated before the user reaches this point; opportunity to pre-generate common lessons (LISA, pensions, debt) during off-peak hours.

## Notes

This blueprint maps the complete See -> Learn -> Act journey for a single financial topic (LISA). The same pattern will be replicated for every topic category (pensions, debt, savings, investing). The LISA journey is prioritised because it connects directly to the founder's origin story and Sarah's persona.
