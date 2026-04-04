# **Architectural Blueprint and Critical Analysis of the Mulo AI System Scaffold Prompt**

## **Executive Summary of the Mulo AI Infrastructure**

This document serves as the foundational architectural blueprint for the Mulo AI central repository. The initiative transitions Mulo AI from a traditional software engineering environment to an entirely AI-native development ecosystem. This repository acts as the central "CEO Command Center" for a strict GitOps architecture, governing a sophisticated 9-agent educational pipeline while enforcing rigorous UK Financial Conduct Authority (FCA) compliance.

To successfully establish this architecture within an AI-assisted IDE like Cursor, the setup relies on a "Phased Execution" strategy. This strategy systematically automates the generation of repository standards, AI agent behavioral rules, GitHub Copilot capabilities, and a structured knowledge base. This document outlines the technical boundaries of AI agents and why specific architectural patterns (like the modular Cursor rule system, the Maker-Checker loop, and MCP integrations) are explicitly enforced.

## **Market Benchmark & Strategic Improvements**

Based on a comprehensive review of Mulo AI's app functionality and open banking integration, the product is exceptionally well-positioned. However, to maximize the effectiveness of the AI-native architecture in the current market, the following strategic improvements and benchmarks should be observed:

### **1\. A/B Testing AI-Native UX (Sequential vs. Choice-Based)**

You have correctly identified the need to A/B test two distinct lesson architectures.

* **Format A (Sequential):** An 8-11 screen linear flow designed for rapid mobile swiping.  
* **Format B (Choice-Based Drill-Down):** A 5-question format where users receive a feedback banner and can optionally open a scrollable "Learn More" lightbox (containing a Hero, Quick Summary, Deep-Dive Cards, and Apply to My Money).

**The Market Benchmark:** The 2026 EdTech market is shifting rapidly away from rigid, linear paths toward frictionless, choice-based "deep research" formats. Users want the autonomy to skip what they know and drill deep into what they don't. Format B aligns perfectly with this trend.

**Strategic Improvement:** Because your content is LLM-generated, your A/B testing cannot just be a frontend UI toggle. You must treat your *AI Prompts* as A/B testable artifacts. Your Telemetry Agent should track metrics in Firebase Analytics (e.g., "Lightbox opened" or "Story carousel abandoned"), and dynamically switch the Creator Agent's prompt based on which format yields higher completion rates and factual retention.

### **2\. Day 1 (MVP) vs. Day 2 (Anticipatory Banking & Onboarding) Isolation**

Mulo's decision to use 111 Open Banking data points to power the "Apply to My Money" (ATMI) engine is a massive competitive moat. Additionally, the 5-step onboarding questionnaire enables highly personalized lesson routing based on life stages and financial confidence. However, this introduces significant engineering overhead.

**Strategic Improvement:** The architecture has been explicitly segmented. Day 1 focuses purely on the Maker-Checker loop, content generation, and A/B testing lesson formats. The Open Banking agents, advanced onboarding routing logic, and related schemas are isolated into "Day 2 / Phase 1.5" folders and configurations. The ATMI JSON blocks are marked as optional, allowing you to ignore these advanced data integrations during the MVP phase while ensuring the structural foundation is ready when you need it.

## **The Shift: From Agile to AI-Native Requirements**

A critical realization in the Mulo AI architecture is that traditional Agile methodologies (Epics, User Stories) are legacy frameworks designed to prevent miscommunication between *humans*. Large Language Models process deep context natively and do not require rigid Agile syntax. Instead, the repository relies on a strictly separated, AI-native requirements architecture.

### **1\. The Content vs. Engineering Split**

To prevent agents from tangling educational copy with software logic, the requirements/ hub is divided into two strict domains:

* /requirements/content/: Owned by the product/education team. Contains high-level programmes/ (goals/modules) and individual lessons/.  
* /requirements/app/: Owned by the CEO/Engineering. Contains software features/ (UI/UX) and agents/ (AI backend logic).

### **2\. The "Living Prompt" Engine**

Every generated requirement file utilizes a "Living Prompt" architecture. An explicit AI Source Prompt block is anchored at the top of every document. If a team member needs to adjust the tone of a lesson or the scope of a feature, they do not manually rewrite the paragraphs. They update the prompt block at the top, highlight the document, and use Cursor's Cmd+K to allow the AI to autonomously rewrite the document based on the new instructions.

### **3\. Hyper-Specific Task Routing**

Instead of generic "write a requirement" commands, the architecture utilizes four highly specialized AI workflows triggered by @-mentions:

* @create-programme: Maps out user learning goals.  
* @create-lesson: Enforces lesson structures (Format A or Format B) and word limits.  
* @create-feature: Formats technical specs, UI constraints, and data flows.  
* @create-agent: Writes strict system prompts, sets FCA guardrails, and outputs JSON contracts.

## **Deconstructing the Contextual Constraints: The Need for Modular Knowledge**

A core architectural principle of this repository is the strict avoidance of monolithic prompt generation and monolithic knowledge files. While tools like Cursor's Composer mode are designed to handle multi-file edits, they remain bound by the fundamental limitations of underlying Large Language Model (LLM) architectures and attention mechanisms.

When an AI agent attempts to read a massive, centralized knowledge document, it suffers from "context bloat." The model's attention mechanism inevitably begins to degrade, causing it to output generic code, hallucinate business logic, or forget initial strict constraints. Modular code and documentation are AI-friendly; large files create massive context overhead and must be broken down for faster processing and higher accuracy.

To resolve this critical limitation, the Mulo AI scaffolding process utilizes a "Chain of Prompts," and the Mulo AI business context is separated into distinct, modular files. This ensures the AI only loads the exact context it needs for the specific task at hand, drastically improving model precision.

## **Architectural Schema in GitHub Copilot Agent Skills**

To ensure cross-platform parity and avoid vendor lock-in to the Cursor ecosystem, this repository implements GitHub Copilot Agent Skills. GitHub Copilot differentiates between repository-wide custom instructions (which dictate general coding standards) and Agent Skills, which are explicitly used to teach the AI specialized capabilities and repeatable workflows.

GitHub Copilot Agent Skills operate on a highly specific, proprietary folder hierarchy and file naming convention. Project-specific skills, which are intended to be shared across a repository, must be housed within a centralized .github/skills/ directory.

Within this centralized skills/ directory, each individual skill must reside in its own dedicated subdirectory. The naming convention for this subdirectory is strictly enforced: it must be lowercase, use hyphens instead of spaces, and exactly match the name field defined in the skill's frontmatter. The core instructional file must be named SKILL.md, using all uppercase letters.

Furthermore, Copilot's skill discovery engine relies on a mandatory YAML frontmatter block situated at the very top of the SKILL.md file. This frontmatter must contain, at a minimum, the name identifier and a detailed description. Copilot evaluates the user's prompt against this description field to decide whether the skill is relevant and should be fully loaded into the active context.

## **Engineering Cursor Rules (.mdc) and Mitigating Context Bloat**

The repository utilizes .mdc (Markdown Cursor) files within the .cursor/rules/ directory to govern AI behavior within the IDE. To ensure the AI agent operates efficiently and deterministically, these rules are engineered with absolute precision and an understanding of Cursor's internal activation mechanics.

To manage repository rules effectively and eliminate context bloat, the scaffolding implements the "2-4-2 architecture principle". This principle dictates a strict hierarchy of rule deployment based on immediate relevance:

1. **Always-On Rules:** Controlled by setting alwaysApply: true. A maximum of one or two files (such as 01-repo-standards.mdc and 04-folder-integrity.mdc) operate globally. These contain immutable project constraints, such as the GitOps architecture definitions and strict directory routing logic.  
2. **Task-Specific Workflow Rules (Manual Rules):** Files such as create-lesson.mdc and create-feature.mdc are triggered manually via @-mentions in the Cursor chat interface. Leaving the globs array empty (globs: "") and setting alwaysApply: false ensures these heavy product-management templates do not interfere with routine, granular coding tasks. The description field acts as a semantic router, helping the agent understand exactly when the rule applies.

### **Systemic Security over Negative Constraints**

Instead of natural language negative constraints, Mulo AI relies on systemic enforcement. The scaffolding generates a .cursorignore file. This file provides a system-level constraint that physically prevents the Cursor indexing engine from passing the contents of the protected directories (functions/docs/, functions/prompts/, functions/src/) to the LLM for modification, providing a mathematically guaranteed safeguard. Additionally, the 04-folder-integrity.mdc rule actively reroutes the AI if it attempts to save a lesson in the software folder, enforcing boundary integrity at generation time.

## **Architecting the 9-Agent Educational Pipeline & Maker-Checker Loop**

The Mulo AI platform features a highly sophisticated 9-agent pipeline coordinated by a central Orchestrator Agent. The architecture operates on a strict dichotomy of responsibilities:

* **Maker Agents:** Learning Content Creator Agent, Visual Learning Agent, Engagement Optimisation Agent, Tone & Readability Agent, Curriculum & Learning Journey Agent, Government Tools & Eligibility Agent (Day 2).  
* **Checker Agents:** Regulatory Guardrail Agent, Fact Checker & Source Citation Agent.

### **Compliance Agent Implementation Standards**

The Regulatory Guardrail Agent (implemented via compliance\_agent.js) enforces foundational FCA Consumer Duty principles—specifically acting in good faith and preventing foreseeable harm for a target demographic of 16-25-year-olds.

The agent is strictly bound to a programmatic JSON data contract. It must evaluate the draft and output a strict response format: { "status": "PASS" | "FAIL", "reasoning": "string" }. The parseComplianceResponse function sanitizes the LLM output (stripping markdown backticks). If the JSON is unparsable or reasoning is missing, the system automatically defaults to a "FAIL" state and logs the first 500 characters for debugging, ensuring a closed, fail-safe Maker-Checker loop.

## ---

**Post-Scaffold Execution Prompts: V2 A/B Testing & Day 2 Integration**

Once the basic repository is scaffolded, run these 4 perfected prompts sequentially in Cursor's Composer to upgrade the schema for A/B testing and set up the isolated Day 2 Open Banking logic.

### **PROMPT 1: The Architecture & Schema Update**

\*\*\* CONTEXT: IMPLEMENTING A/B TESTING DUAL-TRACK LESSON SCHEMAS \*\*\*

We are upgrading our application to support A/B testing of two distinct lesson formats:

* Format A (Classic): 8-11 swipeable screens.  
* Format B (Interactive Q\&A): 5 questions, each with a deeply nested "Learn More" lightbox, Real World Example carousels, Breakdown cards, and an "Apply to My Money" data section.

\*\*\* INSTRUCTIONS: UPDATE ARCHITECTURE SPEC \*\*\*

1. Open requirements/app/features/core-system-architecture.md.  
2. Locate the "Database Schema (Firestore)" section.  
3. Update the lessons collection to include a new field: lessonFormat (string: "v1\_swipe" or "v2\_interactive").  
4. Under the screens subcollection/collection, explicitly define the TWO possible JSON payload shapes the Creator Agent can output:

**SHAPE A: v1\_swipe (Classic)**

* Document the existing flat schema (screenNumber, screenType, headline, paragraph, optionA-D, feedback, takeaways, lottieURL).

**SHAPE B: v2\_interactive (New)**

* Define the new nested schema. Each of the 5 documents in the subcollection represents ONE question.  
* Fields required per question document:  
  * questionText (string)  
  * emoji (string)  
  * options (array of 4 strings)  
  * correctIndex (integer 0-3)  
  * feedbackCorrect (string, max 30 words)  
  * feedbackIncorrect (string, max 30 words)  
  * learnMore: Object containing:  
    * hero (strapline, headline)  
    * quickSummary (string, 2 sentences)  
    * storyCarousel (array of exactly 5 objects: emoji, title, text)  
    * breakdownCards (array of exactly 2 objects: type \[comparison, highlight, timeline\], caption, and specific layout fields)  
    * takeaways (array of exactly 3 strings)  
    * day2\_applyToMyMoney (NOTE: This is isolated for Day 2\. It requires a headline, 3 insight statements using Open Banking placeholders, and 3 input labels, but mark it as OPTIONAL for Day 1).  
    * actionLink (optional: label, description, URL)  
5. Halt generation once the architecture document perfectly reflects both schemas. Do not alter any.js files yet.

### **PROMPT 2: The V2 Content Rulebook**

\*\*\* CONTEXT: CREATING V2 LESSON GUIDELINES \*\*\*

We are building the AI guidelines for our "v2\_interactive" lesson format. We must extract the rules from the CEO's uploaded Word documents and format them into an AI-Native Markdown spec.

\*\*\* INSTRUCTIONS \*\*\*

1. Create a new file at requirements/app/agents/lesson\_guidelines\_v2.md.  
   CRITICAL: Ensure the document begins with the 'AI Source Prompt' block as defined by our "Living Prompt" repository standards.  
2. Read the uploaded @mulo-lesson-requirements.docx and @Mulo app functionality.docx.  
3. In the new file, define the strict rules for the V2 format:  
   * The lesson MUST consist of exactly 5 questions.  
   * Each question MUST have: questionText, emoji, 4 options, correctIndex, feedbackCorrect, and feedbackIncorrect.  
   * Each question MUST include the deeply nested learnMore lightbox object.  
   * Detail the exact structure of the learnMore object:  
     * hero (strapline, headline)  
     * quickSummary (2 sentences)  
     * storyCarousel (exactly 5 slides: emoji, title, text)  
     * breakdownCards (exactly 2 cards of type: comparison, highlight, or timeline)  
     * takeaways (exactly 3 strings)  
     * day2\_applyToMyMoney (NOTE: Explicitly state that this section is optional and should be bypassed for Day 1 MVP generations).  
4. Explicitly enforce the mobile writing rules: Headlines ≤ 7 words, Body ≤ 25 words, and no bespoke Lottie animations. No scrolling is permitted on the main question screen.  
5. Halt generation once the V2 guidelines file is perfectly created.

### **PROMPT 3: The Engine Rewire (The A/B Router)**

\*\*\* CONTEXT: REWIRING MAKER-CHECKER LOOP FOR A/B TESTING \*\*\*

We have two lesson guidelines now: the original and lesson\_guidelines\_v2.md. We need to update our Google Cloud Functions to dynamically route the AI prompt based on the lessonFormat variable, ensuring both the Creator and the Compliance agent understand the dual JSON schemas.

\*\*\* INSTRUCTIONS \*\*\*

1. Open functions/prompts/creator\_agent.js.  
2. Update the loadCreatorContext() function: It must now load BOTH the V1 guidelines and the new V2 guidelines.  
3. Update buildCreatorPrompt(lessonRequest, context):  
   * Check lessonRequest.request.lessonFormat.  
   * If it equals "v2\_interactive", inject the V2 Guidelines into the prompt and instruct the AI to output the deeply nested 5-question JSON schema.  
   * If it equals "v1\_swipe" (or is missing/undefined), default to the V1 Guidelines and the original 8-11 screen JSON schema.  
4. Update parseCreatorResponse(text) to gracefully handle both shapes.  
5. Open functions/prompts/compliance\_agent.js.  
6. CRITICAL: Update the Checker agent logic to ensure it traverses and validates the nested learnMore objects (including carousels and breakdown cards) when reviewing "v2\_interactive" payloads, ensuring no financial advice is hidden deep in the V2 JSON structure. It must still output the strict { "status": "PASS" | "FAIL", "reasoning": "string" } JSON contract.  
7. Halt generation once both JS files are updated to route between formats flawlessly.

### **PROMPT 4: The Open Banking Agent Spec (Isolated Day 2\)**

\*\*\* CONTEXT: CREATING THE OPEN BANKING DATA AGENT (DAY 2 ISOLATION) \*\*\*

Mulo uses real-time user financial data to personalize lessons. This feature is not required for Day 1 MVP. We need to create the agent spec now, but keep it completely isolated.

\*\*\* INSTRUCTIONS \*\*\*

1. Create a new file at requirements/app/agents/day2-open-banking-agent.md.  
   CRITICAL: Ensure the document begins with the 'AI Source Prompt' block as defined by our repository standards.  
2. Read the uploaded @mulo-open-banking-data-points.docx.  
3. Define the Open Banking Agent's architecture:  
   * **Role:** It acts as a middleware data-mapper for future implementation. It intercepts the lesson JSON before it is sent to the user, reads the applyToMyMoney arrays, and replaces variables with live user data fetched from TrueLayer/Finexer.  
   * **Data Mapping:** Extract the core categories from the Word doc (e.g., Income & Earnings, Savings & Buffers) and define how the agent should structure this data profile.  
   * **CRITICAL GUARDRAIL:** The agent spec must explicitly mandate that raw transaction data is NEVER stored or passed to the LLM; only derived signals (like verifiedMonthlyIncome) can be processed.  
   * **Fallback Logic:** Define strict fallback behaviors. If a user has not connected their bank, or the data is missing, the agent MUST replace the variable with a generic, educational fallback string or UI input field.  
4. Halt generation once the Day 2 Open Banking Agent spec is fully documented.

## ---

**The Final "Phased Execution" Setup Strategy**

We utilize a "Chain of Prompts" to bypass token limits and ensure perfect repository generation. **You must run these in Cursor's Composer one at a time. Wait for the AI to completely finish Phase 1 before pasting in Phase 2\.**

### **PHASE 1: Security & Knowledge Scaffold**

Copy and paste this into Cursor:

\*\*\* CONTEXT: ABOUT MULO AI & REPOSITORY SECURITY \*\*\*

We are establishing "Mulo AI," an AI-native educational platform featuring a 9-agent pipeline and Maker-Checker loop powered by Gemini AI.

CRITICAL SECURITY PROTOCOL: You are strictly prohibited from modifying, overwriting, or deleting any files within functions/docs/, functions/prompts/, functions/src/, and reference\_docs/. All operations regarding these folders must be strictly READ-ONLY.

\*\*\* INSTRUCTIONS: PHASE 1 SCAFFOLD \*\*\*

Act as an elite AI Software Architect. Scaffold the foundational folder structure, implement security protocols, and build the structured Knowledge Base.

1. CREATE DIRECTORIES:  
   \-.cursor/rules/  
   \-.github/skills/  
* docs/  
* knowledge/  
* requirements/content/programmes/  
* requirements/content/lessons/  
* requirements/app/features/  
* requirements/app/agents/  
* templates/  
2. IMPLEMENT SYSTEMIC SECURITY (.cursorignore):  
   Create a .cursorignore file in the root directory. Add the following paths to physically prevent accidental AI modification of live logic:  
   functions/docs/\*  
   functions/prompts/\*  
   functions/src/\*  
   reference\_docs/\*  
3. POPULATE MACHINE-READABLE KNOWLEDGE BASE (knowledge/ & docs/):  
   Use Markdown tables to structure the data for deterministic retrieval:  
* knowledge/fca-regulations.md: Matrix mapping the 4 layers (FCA PERG/COBS, HMRC/Pensions, Economic Context, Education Framework).  
* knowledge/personas.md: Build structured profiles for Sarah (First-Time Buyer), James (Clueless Professional), Aisha (Debt Trapped), Tom (Passive Pension), and Chloe (Financially Curious).  
* knowledge/day2-open-banking.md: Isolate the 11 categories of derived signals (Income, Spending, Savings, Debt, etc.) and strictly mandate NO raw transaction storage. Mark this as a Day 2 feature.  
* knowledge/onboarding-routing.md: Define the 5 onboarding questions (Goal, Life stage, Savings, Debt, Confidence) and the logic for how they route/prioritize the user's recommended modules (Mark this as Phase 1.5/Day 2).  
* knowledge/glossary.md: Define the 9-agent pipeline and data objects like OpenBankingSignals.  
* knowledge/market-context.md: Detail the competitive landscape (Monzo, Snoop, MSE) and the target customer segments.  
* docs/vision-and-product.md: Detail the "See \-\> Learn \-\> Act" 3-layer architecture, Home/Growth/Profile app structure, XP rewards, and the A/B testable lesson formats.  
* knowledge/llms.txt: Generate an index file mapping the knowledge base (and mapping the new requirements/ folder routing) for MCP servers.  
4. POPULATE TEMPLATES (templates/):  
   Design outlines with fill-in-the-blank brackets. CRITICAL: Every template must retain a top section titled 'AI Source Prompt'.  
* templates/template-programme.md: AI Source Prompt, Target Persona, Goal, and a list of internal Lessons.  
* templates/template-lesson.md: AI Source Prompt, Database YAML Frontmatter, Lesson Format Choice (A or B), Questions, Feedback, Learn More structure.  
* templates/template-feature.md: AI Source Prompt, UX Flow, UI Layout constraints, and Database connections.  
* templates/template-agent.md: AI Source Prompt, Agent Persona, Inputs, Strict Guardrails, and JSON Output Contract.

Halt generation immediately after completion. Do not generate rules or skills yet.

### **PHASE 2: Cursor Rules (2-4-2 Architecture)**

Once Phase 1 finishes, paste this:

\*\*\* INSTRUCTIONS: PHASE 2 \- CURSOR RULES ARCHITECTURE \*\*\*

Generate the Cursor AI rules using strict .mdc syntax with YAML frontmatter to prevent context bloat.

1. CREATE GLOBAL STANDARDS (Always-On Rules):  
   File: .cursor/rules/01-repo-standards.mdc  
   Frontmatter: description: "Global repository standards", globs: "\*", alwaysApply: true  
   Content: Define the repository hierarchy. Explicitly state backend execution logic is in functions/src/. Define the 9-agent Maker-Checker philosophy.

File: .cursor/rules/02-use-knowledge.mdc

Frontmatter: description: "Knowledge routing and FCA instructions", globs: "\*", alwaysApply: true

Content: Instruct AI to silently read knowledge/llms.txt before answering architecture questions. Mandate FCA compliance: The AI must never provide regulated financial advice.

File: .cursor/rules/04-folder-integrity.mdc

Frontmatter: description: "Folder integrity routing for requirements", globs: "\*", alwaysApply: true

Content: Map the explicit separation of concerns. If the user attempts to generate a lesson in the software folder, automatically reroute it to requirements/content/lessons/. Features/UX go to requirements/app/features/, etc.

2. CREATE TASK RULES (Manual Triggers):  
   For the following, set alwaysApply: false and globs: "" (empty) so they are only triggered via @-mentions. Instruct the AI to use corresponding templates (retaining the 'Living Prompt' structure) and knowledge files.  
* .cursor/rules/create-programme.mdc: Instruct AI to use template-programme.md and save to requirements/content/programmes/.  
* .cursor/rules/create-lesson.mdc: Instruct AI to use template-lesson.md and save to requirements/content/lessons/. Enforce the A/B testing variants (Format A vs Format B).  
* .cursor/rules/create-feature.mdc: Instruct AI to use template-feature.md and save to requirements/app/features/.  
* .cursor/rules/create-agent.mdc: Instruct AI to use template-agent.md and save to requirements/app/agents/. Set FCA guardrails and JSON output contracts.

Halt generation immediately after completion.

### **PHASE 3: GitHub Copilot Skills & MCP**

Once Phase 2 finishes, paste this:

\*\*\* INSTRUCTIONS: PHASE 3 \- GITHUB COPILOT SKILLS & MCP \*\*\*

Mirror our Cursor rules into GitHub Copilot Agent Skills using the strict Copilot architectural specification.

1. CREATE GITHUB SKILLS:  
   Create the following paths. Every SKILL.md MUST include YAML frontmatter with a hyphenated name and description. Write explicit positive instructions detailing how the Copilot agent should execute the task by reading the corresponding .mdc files and templates.  
* .github/skills/create-programme/SKILL.md  
* .github/skills/create-lesson/SKILL.md  
* .github/skills/create-feature/SKILL.md  
* .github/skills/create-agent/SKILL.md  
* .github/skills/repo-standards/SKILL.md  
* .github/skills/use-knowledge-base/SKILL.md  
2. CREATE MCP CONFIGURATION:  
   Create .cursor/mcp.json with a basic boilerplate configuration to prepare for GitLab/GitHub Actions integrations for DevOps agent workflows.  
3. UPDATE ROOT README:  
   Modify README.md to be the "Mulo AI Company Hub" landing page. Document the GitOps philosophy, the 9-agent pipeline, FCA guidelines, the 'Living Prompt' document engine, and a usage guide for triggering Cursor rules and Copilot skills.

## ---

**Appendix: The Modular Knowledge Base Files**

Do not paste the following sections directly into Cursor as one block. Provide these directly to Cursor as separate files or copy them into the designated paths created in Phase 1\.

### **File: docs/vision-and-product.md**

# **Mulo AI: Vision and Product Architecture**

## **Vision & Mission**

* **Vision:** A world where everyone understands how money works. Where financial decisions are simple, transparent, and fair, and no one is left behind.  
* **Mission:** To help millions of people in the UK make better financial decisions through simple, personalised education.  
* **Core Belief:** People are not bad with money. They were never taught.

## **App Functionality & UX**

The application is structured into core tabs focused on user goals rather than generic browsing:

* **Home:** The primary interface featuring the user's active North Star Goal, a "Continue" carousel for in-progress programmes, "Recommended for You" (goal-driven), and "Trending Now" (topical economics).  
* **Growth:** The stats hub featuring the user's Learning Streak, Strongest Areas (averaging 4/5+ scores), Topic Coverage, and "Worth Revisiting" cards (encouraging review of lessons scoring \<2/5).  
* **Profile:** Manages onboarding data (Experience level, Learning pace) and Open Banking connection toggles.

## **The XP & Reward System**

To reward learning activity without being punitive, Mulo uses an XP system:

* Users earn 20 XP per correct answer.  
* Users earn a \+50 XP bonus for achieving a perfect 5/5 score on a lesson.  
* Incorrect answers still yield minimal XP to encourage continuous participation.

## **Lesson Architecture A/B Testing**

Mulo utilizes two distinct lesson formats that must be actively A/B tested to evaluate user retention and pedagogical impact:

**Format A (Sequential Flow):**

* **Structure:** 8–11 linear screens designed for rapid swiping.  
* **Flow:** Hook (1-2) → Learn (3-5) → Reflect (6-7) → Question (3-4 Qs) → Summary (1).  
* **Constraints:** Headlines ≤ 7 words; Body ≤ 25 words. Highly concise, direct storytelling.

**Format B (Choice-Based Drill-Down):**

* **Structure:** Exactly 5 questions per lesson.  
* **Flow:** Question Screen → Feedback Banner (Slides up) → Optional "Learn More" Lightbox.  
* **The Learn More Drill-Down:** If users want depth, they open a scrolling page featuring a Hero, 2-sentence Quick Summary, and 3 specific Lightbox Cards: *Real World Example* (5-slide story), *Breakdown* (Data visualization), and *Trusted Tool* (Gov.uk/MoneyHelper link).  
* **Day 2 \- Apply to My Money:** The bottom of the Learn More page features an insights card using the user's Open Banking data (isolated for future release).

### **File: knowledge/day2-open-banking.md**

# **Mulo Open Banking Data Principles (DAY 2 FEATURE)**

Mulo connects to user accounts via Open Banking (e.g., TrueLayer or Finexer) to personalize the "Apply to My Money" lesson sections and dynamically route programme recommendations. This is a Day 2 feature and should be isolated from Day 1 MVP development.

## **The Data Minimization Rule**

**CRITICAL:** Raw transaction data is NEVER stored. The system only processes transactions into derived, aggregated signals in real-time, and discards the underlying transaction details immediately.

## **The 11 Data Categories**

The engine processes 111 derived data points across the following 11 categories:

1. **Income & Earnings:** Detects verifiedMonthlyIncome, payday dates, and irregular windfalls.  
2. **Spending & Outgoings:** Tracks subscription burdens, BNPL detection, and spending velocity (pacing).  
3. **Savings & Cash Reserves:** Calculates emergency fund runway (months covered) and ISA utilization.  
4. **Debt & Credit:** Calculates credit utilization ratios, minimum payment traps, and debt trajectory.  
5. **Housing & Property:** Infers homeowner vs renter status and calculates rent/mortgage-to-income ratios.  
6. **Investing & Wealth Building:** Identifies regular contribution habits (pound-cost averaging).  
7. **Pensions & Retirement:** Detects workplace auto-enrolment levels and estimates tax relief bands.  
8. **Protection & Insurance:** Detects premium payments to calculate the user's protection gap.  
9. **Tax & Allowances:** Estimates income tax bands and self-assessment obligations.  
10. **Behavioural & Engagement:** Flags impulse spending patterns and tracks "pay-yourself-first" habits.  
11. **User Profile & Life Stage:** Infers household size and dependants to trigger relevant family finance modules.

### **File: knowledge/onboarding-routing.md**

# **Mulo AI: Onboarding & Recommendation Routing (Phase 1.5/Day 2\)**

To personalize the learning journey and route users to the correct modules, Mulo utilizes a 5-step onboarding questionnaire. This data is used to prioritize the "Recommended for You" section on the Home screen.1

## **1\. Goal (Determines first learning category)**

* **Question:** What are you most interested in right now?1  
* **Options:** Buying my first home, Saving money, Investing, Pensions / retirement, Paying off debt, Understanding money basics.1

## **2\. Life Stage (Prioritizes specific modules)**

* **Question:** Which best describes you?1  
* **Options:** Student, Early career, Mid career, Parent / family, Approaching retirement.1  
* **Routing Logic:** E.g., Students are routed to savings/renting, while Mid-career users are routed to pensions/investing.1

## **3\. Savings Status (Unlocks paths)**

* **Question:** Do you currently have savings?1  
* **Options:** No savings yet, Under £5k, £5k–£20k, £20k+.1  
* **Routing Logic:** E.g., "No savings" unlocks emergency fund modules; "£20k+" unlocks investing modules.1

## **4\. Existing Debt (Prioritizes borrowing modules)**

* **Question:** Do you have any of these? (Multi-select)1  
* **Options:** Mortgage, Student loan, Credit card debt, Personal loan, None.1

## **5\. Financial Confidence (Adjusts difficulty)**

* **Question:** How confident do you feel with money?1  
* **Options:** I'm just getting started, I know a little, I'm fairly confident.1  
* **Routing Logic:** Beginners receive simple foundational questions; confident users receive advanced modules.1

## **Example Routing Output**

If a user selects: Goal \= Buying first home, Life stage \= Early career, Savings \= £5k–£20k, Debt \= Student loan, Confidence \= Beginner.1 **Their Home Screen prioritizes:** 1\. First Home Essentials, 2\. Saving for a Deposit, 3\. Mortgage Basics, 4\. Credit Scores & Mortgages.1

### **File: knowledge/personas.md**

# **Mulo Customer Personas**

* **Sarah (First-Time Buyer):** Age 29, London. Income: £42k. Saving for a house deposit, uses Monzo, feels pressure to get on the ladder.  
* **James (The "Clueless" Professional):** Age 27, Manchester. Income: £38k. Saving without a plan, avoids financial decisions.  
* **Aisha (Debt Trapped):** Age 34, Birmingham. Income: £30k. Has credit card debt/overdraft, pays only minimums. Feels anxious, judged, and stuck.  
* **Tom (Passive Pension):** Age 36, Leeds. Income: £50k. Has a workplace pension but ignores it.  
* **Chloe (Financially Curious):** Age 24, Bristol. Income: £28k. Wants to start investing but suffers from TikTok information overload. Afraid of losing money.

### **File: knowledge/market-context.md**

# **Mulo AI: Market Context & Segments**

**Primary Segment:** UK adults aged 22–40 who are making their first major financial decisions without the knowledge or confidence to do so.

* **Core Insight:** They are undereducated, overwhelmed, and unsupported.  
* **Key Pain Points:** "I don't know where to start," "I don't trust banks," and "I know I should sort my money, but I don't act."

**Competitive Landscape:** No existing player combines education, personal financial data, and product comparison. Mulo sits at the intersection of:

* **Monzo:** Banking app. No education layer.  
* **Snoop:** Spending insights. No structured learning.  
* **MoneySuperMarket:** Comparison site. Sells products, doesn't educate.  
* **MoneySavingExpert:** Content/editorial. No app, no personal data integration.

#### **Works cited**

1. Initial onboarding questions.docx