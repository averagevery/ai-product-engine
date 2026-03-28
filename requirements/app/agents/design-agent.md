---
> **AI Source Prompt:** Reverse-engineer the Design Agent specification from functions/docs/design_guidelines.md and the agent roster in functions/docs/agent_architecture.md. Document the Nano Banana prompting rules, image_library reuse logic, and visual constraints.
---

# Agent: Design Agent

## Agent Persona

**Name:** Design Agent
**Role:** Generates or reuses flat vector visual assets for lesson screens via the Nano Banana image API, and manages the `image_library` Firestore collection for asset reuse.
**Position in Pipeline:** Step 3 (Post-Pass) -- triggered only after the Compliance Agent returns `"status": "PASS"`. Not part of the Maker-Checker loop itself.

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `screens` | Approved Creator Agent output | The full array of screen objects, each containing a `LottieSuggestion` field describing the desired visual motif |
| `Keywords` | Derived from screen content | Keywords extracted from the screen's educational topic for `image_library` matching |
| `image_library` collection | Firestore | Existing approved images with `Keywords`, `LottieSuggestion`, `lottieURL`, and `human_approved` fields |

## Context Documents

| Document | Path | Purpose |
|----------|------|---------|
| Image Generation Guidelines | `functions/docs/design_guidelines.md` | Nano Banana API prompting rules, style requirements, composition rules, safety constraints |

## Strict Guardrails

The following constraints are non-negotiable. This agent must NEVER:

1. **Skip the reuse check** -- before generating any new image, the agent MUST query the `image_library` collection. If an existing image matches the `Keywords` AND has `human_approved: true`, reuse that `lottieURL` instead of calling the API
2. **Use gradients, textures, or photographic detail** -- all images must be flat vector illustration style with simple geometric shapes and rounded corners
3. **Include a background colour or shape** -- all images must export as transparent PNGs, cleanly composable on any UI background
4. **Include brand logos** -- no Visa, Mastercard, specific bank logos, or any identifiable commercial branding
5. **Include real people likenesses** -- no photorealistic faces or identifiable individuals
6. **Include the `$` symbol** -- dollar signs are permanently banned from all visual assets
7. **Include violence or graphic distress** -- financial stress must be shown gently (e.g., worried posture), never extremely
8. **Generate cluttered compositions** -- one focal subject, minimal clutter, centre-weighted with generous padding

### Nano Banana Prompting Rules

Every prompt sent to the image generator MUST begin with this mandatory prefix:

> "Flat vector illustration, transparent background, no background colour, no gradients, no textures, simple shapes..."

Followed by: main subject + action + 1-3 supporting objects. Prompts must be short and specific (2-5 lines).

### Composition Rules

- One focal subject per image
- Centre-weighted composition with generous padding for transparent placement
- No elements that visually depend on a background edge or horizon line
- Shadows, if used, must be separate solid layers so they can be toggled

## JSON Output Contract

The Design Agent does not return a standalone JSON object. Instead, it performs two Firestore operations:

### Operation 1: Update Screen Documents

For each screen, update the `lottieURL` field in the `screens` collection:

```json
{
  "lottieURL": "https://firebasestorage.googleapis.com/..."
}
```

### Operation 2: Save to Image Library (new images only)

When a new image is generated (not reused), save a record to the `image_library` collection:

```json
{
  "Keywords": "string (comma-separated topic keywords)",
  "LottieSuggestion": "string (description of the visual motif)",
  "lottieURL": "string (Firebase Storage URL)",
  "human_approved": false
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Keywords` | string | Yes | Comma-separated keywords for future matching |
| `LottieSuggestion` | string | Yes | Plain-text description of the visual motif |
| `lottieURL` | string | Yes | Firebase Storage URL of the generated or reused image |
| `human_approved` | boolean | Yes | Default `false` for new images; only a human reviewer can set to `true` |

## Error Handling

- If the Nano Banana API fails, the screen's `lottieURL` remains empty and the failure is logged to `agent_logs`.
- If the `image_library` query fails, the agent falls through to generation (does not block the pipeline).
- Failed outputs are logged to the `agent_logs` Firestore collection with a timestamp.

## Notes

- Source documentation: `functions/docs/design_guidelines.md`
- Pipeline position defined in: `functions/docs/agent_architecture.md`
- The Design Agent is referenced as a future implementation (`prompts/design_agent.js`) in the agent roster but the prompt file has not yet been created. This spec serves as the authoritative requirements document for its implementation.
- The `image_library` reuse-first pattern is critical for cost control -- it prevents duplicate API calls for visually similar screens across lessons.
- New images default to `human_approved: false` and require manual review before they can be reused by future lessons.
