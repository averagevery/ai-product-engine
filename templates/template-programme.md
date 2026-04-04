> **AI Source Prompt:** [Paste the exact prompt or @-mention that generated this document]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-programme.mdc

---
programmeName: "[Programme Name]"
category: "[Financial education category]"
persona: "[Persona Name from knowledge/personas.md]"
estimatedTime: "[e.g. 10 mins]"
lessonCount: 3
lessons:
  - slug: "[lesson-slug-1]"
    order: 1
  - slug: "[lesson-slug-2]"
    order: 2
  - slug: "[lesson-slug-3]"
    order: 3
---

# Programme: [Programme Name]

> Save this file as `programme.md` inside `requirements/content/programmes/[programme-slug]/`.
> Lesson files sit alongside this file as sibling `.md` files in the same folder.

## Target Persona

**Persona:** [Persona Name from knowledge/personas.md]
**Profile:** [Age, location, income, key situation]

## Programme Goal

[Describe the overarching educational goal this programme achieves for the target persona. What will they understand or be able to do after completing all lessons?]

## Product Layer

**Layer:** [LEARN -- Layer 2 of See -> Learn -> Act]

## Lessons

Each lesson below is a sibling `.md` file in this programme folder. The `lessons` array in the YAML frontmatter above is the source of truth for lesson order (synced to Firestore).

| Order | Filename | Lesson Name | Focus |
|-------|----------|-------------|-------|
| 1 | [lesson-slug.md] | [Lesson Name] | [What this lesson teaches] |
| 2 | [lesson-slug.md] | [Lesson Name] | [What this lesson teaches] |
| 3 | [lesson-slug.md] | [Lesson Name] | [What this lesson teaches] |

## Success Criteria

- [ ] [Criterion 1: a measurable outcome for the programme]
- [ ] [Criterion 2: a measurable outcome]
- [ ] [Criterion 3: a measurable outcome]

## ATMI Connection (Layer 3: Act)

[Describe how completing this programme leads to an "Apply to My Money" insight card. What deterministic math constants will be shown? What action CTA follows?]

## Notes

[Any additional context, prerequisites, or dependencies]
