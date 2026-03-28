---
name: design-system
description: "Frontend UI colour palette, typography, copy word limits, and Lottie animation constraints for the Mulo AI platform."
---

# Design System

## Instructions

Apply these design and pedagogical constraints when generating or reviewing any frontend code or educational content. Read `.cursor/rules/03-design-system.mdc` for the canonical Cursor rule this skill mirrors.

## Colour Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0A0A1A` | Near-black. Must be used as the base background colour for all screens. |
| Primary | `#3733E5` | Electric blue. Used for interactive elements, links, and highlights. |
| Positive / CTA | Mint green | Used for success states, call-to-action buttons, and positive feedback. |

## Typography

- **Font family:** DM Sans (strict -- no fallback substitutions in design mocks).
- Apply appropriate weight variants (Regular, Medium, Bold) for hierarchy.

## Copy Constraints

These word limits are hard ceilings enforced across all generated educational content:

| Element | Max Words |
|---------|-----------|
| Headlines | 7 |
| Body text | 25 |
| Feedback screens | 15 |

## Lottie Animation Constraints

### Approved Motifs

Use only generic, culturally neutral financial education motifs:
- Bank building
- Piggy bank
- Shield (protection/security)
- Coins
- Graduation cap
- Growth chart (upward arrow)

### Strictly Banned

The following are permanently banned from all Lottie animations and visual assets:
- The `$` dollar sign symbol
- Flashy red effects or red warning pulses
- Any currency-specific iconography (pound signs in animations, euro symbols, etc.)
- Realistic banknote or credit card imagery
