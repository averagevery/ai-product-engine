> **AI Source Prompt:** Draft the Trending Content feature spec. Trending Now programmes sit primarily under the Economics topic and are tied to current news stories (Bank of England rate changes, tariffs, student loan policy). These are created and rotated to keep the app feeling current and relevant. Day 2 feature.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Trending Content

## 1. Goal and Context

**Product Layer:** Learn (Lesson) -- topical engagement
**Target Persona:** All five personas (especially Chloe -- Financially Curious)
**Priority:** Day 2
**Core Objective:** Keep the app feeling current and relevant by surfacing programmes tied to real-world financial news. Trending programmes sit primarily under the Economics topic and are rotated regularly. They appear in the Trending Now carousel on the Home screen.

## 2. User Journey

* **Entry:** User sees the Trending Now horizontal carousel on the Home screen.
* **Action:** User taps a trending programme card. Enters the programme view and completes lessons as normal.
* **Content Examples:**
  - Bank of England rate decisions and their impact on mortgages/savings
  - Tariff changes and their economic effects
  - Student loan policy updates
  - Budget announcements and tax threshold changes
  - Oil price movements and cost of living impact

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Home Screen | `requirements/features/home-screen.md` | Trending Now carousel placement |
| FCA Regulations | `knowledge/fca-regulations.md` | Trending content must be educational commentary, not market advice |

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `programmes` | READ | `programmeId`, `topic` (= "Economics"), `isTrending` (boolean), `trendingOrder` (number), `trendingStartDate` (Timestamp), `trendingEndDate` (Timestamp or null) |

### Trending Rotation Logic

* Programmes with `isTrending: true` and `trendingStartDate <= now` appear in the Trending Now carousel.
* If `trendingEndDate` is set and past, the programme is removed from Trending but remains accessible via Browse by Topic.
* Ordering is by `trendingOrder` (manual editorial control).
* New trending programmes can be created via the Maker-Checker pipeline (AI-generated) or hand-crafted and synced.

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Creator Agent | May generate trending programme content based on current events | Manual `lesson_requests` with trending context |
| Compliance Agent | Validates trending content is educational commentary, not financial advice or market prediction | Maker-Checker loop |

## 5. Compliance Constraints

* Trending content must be educational commentary on current events, not investment advice or market predictions.
* Never frame trending content as urgent or time-sensitive in a way that could pressure financial decisions ("Act now before rates rise!").
* Content about market movements must include educational context, not just the news headline.

## 6. Failure States

* **No Trending Content:** If no programmes have `isTrending: true`, the Trending Now carousel is hidden from the Home screen entirely.
* **Stale Content:** If a trending programme's `trendingEndDate` has passed, it is automatically removed from the carousel on next load.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* The editorial process for creating trending content is TBD. It may involve a content team writing briefs that are fed to the Maker-Checker pipeline, or manual creation and sync.
* Trending programmes should be refreshed at least fortnightly to maintain the "current" feel.
* The Economics topic is the primary home for trending content, but trending programmes could span other topics (e.g., a Budget announcement affecting pensions could sit under Pensions).
