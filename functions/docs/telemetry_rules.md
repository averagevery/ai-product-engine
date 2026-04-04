> **File Summary & Purpose:** This defines the self-improvement loop for the Telemetry Agent. It outlines how the AI should ingest in-app user drop-off data, quiz failure rates, and external UK market trends to autonomously suggest curriculum updates.

# Telemetry & Market Data Rules (The Feedback Loop)

## 1. Goal
The Telemetry Agent acts as Mulo's Data Scientist. Its job is to ingest in-app user behaviour, direct customer feedback, and external market trends, and output actionable recommendations to improve the curriculum.

## 2. In-App Customer Feedback (Micro Data)
The agent will analyze data collected from the FlutterFlow app. 
**Recommended App Features for the CEO to Build:**
* **Quiz Pass/Fail Rates:** Track which specific screens/questions users fail most often. A fail rate >40% on a single question means the preceding "Learn" screens are poorly written.
* **Drop-off Rates:** Track the exact screen number where users abandon a lesson.
* **The "Thumbs Up/Down" Micro-Survey:** At the end of every lesson summary, ask: *"Did this make sense? 👍 / 👎"*. If 👎, reveal a text box: *"What was confusing?"*.

**Agent Rules for Micro Data:**
* If a lesson receives >15% Thumbs Down or high drop-offs, the Telemetry Agent must automatically flag the lesson in the `agent_logs` and draft a revised prompt for the Creator Agent to rewrite it.

## 3. External Market Data (Macro Data)
To keep Mulo relevant and highly investable, the Telemetry Agent should monitor the wider UK financial landscape.
**Data Sources to Monitor:**
* **FCA Announcements:** Monitor for updates to the Consumer Duty or youth financial regulations.
* **Bank of England Rates:** Track base rate changes. If rates rise significantly, trigger the Creator Agent to generate a new lesson on "How Interest Rates Affect Savings and Mortgages."
* **Government Policy:** Monitor changes to UK ISA allowances, student loan thresholds, or tax brackets. 

## 4. Engagement Tracking

The following events MUST be tracked in the `analytics` collection for all lessons:

| Event | Data Captured | Interpretation |
|-------|--------------|---------------|
| `lightbox_opened` | `lessonId`, `questionIndex` (1-5), `timestamp` | Learn More engagement rate per question |
| `lightbox_closed_early` | `lessonId`, `questionIndex`, `scrollDepth` (%) | User bailed before reading full Learn More page |
| `story_carousel_abandoned` | `lessonId`, `questionIndex`, `slideReached` (1-5) | Which slide loses users |
| `story_carousel_completed` | `lessonId`, `questionIndex` | Full carousel completion rate |
| `breakdown_card_tapped` | `lessonId`, `questionIndex`, `cardType` (comparison/highlight/timeline) | Which card type drives most engagement |
| `action_link_tapped` | `lessonId`, `questionIndex`, `url` | Trusted Tool click rate |
| `feedback_choice` | `lessonId`, `questionIndex`, `choice` (learn_more/next) | Ratio of "Learn More" vs "Next" on feedback banner |

## 5. Output & Reporting
The Telemetry Agent runs weekly. It must compile its findings into a JSON report saved to the `analytics` collection, formatted so that the CEO can easily query it (e.g., "What were our worst-performing lessons this week, and what is the AI doing to fix them?"). The report must include completion rate, lightbox engagement, and average score summaries.