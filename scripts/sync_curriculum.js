/**
 * Curriculum Sync Engine
 *
 * Scans requirements/content/programmes/ for hand-crafted lesson markdown.
 * - `{slug}.md` -- v1_swipe: YAML frontmatter + ## Screen headings
 * - `{slug}.v2.md` -- v2_interactive: YAML frontmatter + ## Question headings + learnMore
 * Pushes to Firestore core_lessons + screens (v2 lesson doc ID: `{slug}--v2`).
 *
 * Usage:
 *   npm run sync-curriculum
 *   npm run validate-curriculum   (parse + validate only, no Firestore)
 *
 * Flags:
 *   --dry-run   Same as validate-curriculum: no Firebase init or writes.
 */

const path = require("path");
const fs = require("fs");
const matter = require("gray-matter");
const admin = require("firebase-admin");

const DRY_RUN =
  process.argv.includes("--dry-run") ||
  process.argv.includes("--validate-only");

/**
 * Firebase Admin needs a project ID when it cannot infer one from credentials
 * (common on Windows / local service-account JSON / ADC without gcloud project).
 */
function resolveFirebaseProjectId() {
  const fromEnv =
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    process.env.FIREBASE_PROJECT_ID;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }
  try {
    const rcPath = path.join(__dirname, "..", ".firebaserc");
    if (fs.existsSync(rcPath)) {
      const rc = JSON.parse(fs.readFileSync(rcPath, "utf8"));
      const def = rc.projects && rc.projects.default;
      if (def && String(def).trim()) {
        return String(def).trim();
      }
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

let _db;
function getFirestore() {
  if (DRY_RUN) {
    return null;
  }
  if (!_db) {
    if (!admin.apps.length) {
      const projectId = resolveFirebaseProjectId();
      if (projectId) {
        admin.initializeApp({projectId});
      } else {
        admin.initializeApp();
      }
    }
    _db = admin.firestore();
  }
  return _db;
}

const PROGRAMMES_DIR = path.resolve(
  __dirname,
  "..",
  "requirements",
  "content",
  "programmes",
);

/**
 * `gray-matter` only treats YAML as frontmatter when `---` is at file start.
 * Core lesson files start with an AI Source Prompt blockquote; YAML sits in the first
 * `---` / `---` block later. Extract that block and parse it.
 */
function matterLessonFile(raw) {
  const m = raw.match(/\r?\n(---\r?\n[\s\S]*?\r?\n---\r?\n)/);
  if (!m) {
    return matter(raw);
  }
  const block = m[1];
  const before = raw.slice(0, m.index);
  const after = raw.slice(m.index + m[0].length);
  const parsed = matter(block + after);
  return {
    data: parsed.data,
    content: `${before}\n${parsed.content}`.trim(),
  };
}

/**
 * Parse ## Screen headings from markdown body into structured screen objects.
 * Each heading becomes a separate Firestore screen document.
 */
function parseScreens(markdownBody) {
  const screens = [];
  const headingPattern = /^## Screen (\d+):\s*(.+)$/gm;
  const sections = markdownBody.split(/^## Screen \d+:.+$/m).slice(1);
  const headings = [...markdownBody.matchAll(headingPattern)];

  headings.forEach((match, i) => {
    const screenNumber = parseInt(match[1], 10);
    const sectionBody = (sections[i] || "").trim();

    const fields = {};
    const fieldPattern = /^\*\*(\w+):\*\*\s*(.+)$/gm;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(sectionBody)) !== null) {
      fields[fieldMatch[1]] = fieldMatch[2].trim();
    }

    const options = [];
    const optionPattern = /^- ([A-D])\)\s*(.+)$/gm;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(sectionBody)) !== null) {
      options.push({ letter: optionMatch[1], text: optionMatch[2].trim() });
    }

    screens.push({
      screenNumber,
      screenType: fields.screenType || "Standard",
      headline: fields.headline || "",
      paragraph: fields.paragraph || "",
      question: fields.question || "",
      optionA: options.find((o) => o.letter === "A")?.text || "",
      optionB: options.find((o) => o.letter === "B")?.text || "",
      optionC: options.find((o) => o.letter === "C")?.text || "",
      optionD: options.find((o) => o.letter === "D")?.text || "",
      questionAnswer: fields.questionAnswer || "",
      feedbackCorrect: fields.feedbackCorrect || "",
      feedbackIncorrect: fields.feedbackIncorrect || "",
      keyTakeaway1: fields.keyTakeaway1 || "",
      keyTakeaway2: fields.keyTakeaway2 || "",
      keyTakeaway3: fields.keyTakeaway3 || "",
      LottieSuggestion: fields.LottieSuggestion || "",
      lottieURL: "",
    });
  });

  return screens;
}

const V1_MIN_SCREENS = 8;
const V1_MAX_SCREENS = 11;

/**
 * Validate parsed v1_swipe screens and frontmatter. Returns human-readable error strings.
 */
function validateV1Lesson(lessonSlug, programmeId, frontmatter, screens) {
  const errors = [];
  const fmProg = (frontmatter.programmeId || "").trim();
  if (fmProg && fmProg !== programmeId) {
    errors.push(
      `${lessonSlug}: frontmatter programmeId "${fmProg}" does not match folder "${programmeId}"`,
    );
  }
  if (!(frontmatter.lessonName || "").trim()) {
    errors.push(`${lessonSlug}: frontmatter lessonName is missing or empty`);
  }
  if (!(frontmatter.category || "").trim()) {
    errors.push(`${lessonSlug}: frontmatter category is missing or empty`);
  }

  if (screens.length === 0) {
    errors.push(`${lessonSlug}: no ## Screen sections parsed (check headings)`);
    return errors;
  }
  if (screens.length < V1_MIN_SCREENS || screens.length > V1_MAX_SCREENS) {
    errors.push(
      `${lessonSlug}: expected ${V1_MIN_SCREENS}-${V1_MAX_SCREENS} screens (v1_swipe), found ${screens.length}`,
    );
  }

  screens.forEach((screen, idx) => {
    const n = screen.screenNumber;
    const label = `${lessonSlug} screen #${n} (index ${idx + 1})`;
    if (n !== idx + 1) {
      errors.push(
        `${label}: screenNumber ${n} is out of sequence (expected ${idx + 1})`,
      );
    }
    const st = (screen.screenType || "").toLowerCase();
    if (st === "question") {
      if (!(screen.question || "").trim()) {
        errors.push(`${label}: screenType question requires **question:**`);
      }
      ["A", "B", "C", "D"].forEach((L) => {
        const key = `option${L}`;
        if (!(screen[key] || "").trim()) {
          errors.push(`${label}: missing or empty option${L}`);
        }
      });
      const ans = (screen.questionAnswer || "").trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(ans)) {
        errors.push(
          `${label}: questionAnswer must be A, B, C, or D (got "${screen.questionAnswer}")`,
        );
      }
    }
    if (st === "summary") {
      if (
        !(screen.keyTakeaway1 || "").trim() ||
        !(screen.keyTakeaway2 || "").trim() ||
        !(screen.keyTakeaway3 || "").trim()
      ) {
        errors.push(
          `${label}: screenType summary requires keyTakeaway1, keyTakeaway2, keyTakeaway3`,
        );
      }
    }
  });

  return errors;
}

/**
 * Sync a single v1_swipe lesson file to Firestore.
 */
async function syncLesson(filePath, programmeId) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matterLessonFile(raw);

  const lessonSlug = path.basename(filePath, ".md");
  const screens = parseScreens(content);

  const validationErrors = validateV1Lesson(
    lessonSlug,
    programmeId,
    frontmatter,
    screens,
  );
  if (validationErrors.length > 0) {
    return { synced: false, errors: validationErrors };
  }

  const relativePath = path.relative(
    path.resolve(__dirname, ".."),
    filePath,
  ).replace(/\\/g, "/");

  const db = getFirestore();
  if (!db) {
    return { synced: true, screenCount: screens.length, dryRun: true };
  }

  const cleared = await deleteExistingCoreScreens(lessonSlug);
  if (cleared > 0) {
    console.log(`  Cleared ${cleared} existing screens for ${lessonSlug}`);
  }

  const batch = db.batch();

  const lessonRef = db.collection("core_lessons").doc(lessonSlug);
  batch.set(lessonRef, {
    programmeId,
    category: frontmatter.category || "",
    lessonName: frontmatter.lessonName || lessonSlug,
    lessonFormat: "v1_swipe",
    lessonLevel: frontmatter.lessonLevel || "",
    lessonTime: frontmatter.lessonTime || "",
    persona: frontmatter.persona || "",
    screenCount: screens.length,
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    syncedFrom: relativePath,
  });

  screens.forEach((screen) => {
    const screenRef = db.collection("screens").doc();
    batch.set(screenRef, {
      lessonId: lessonSlug,
      lessonType: "core",
      lessonFormat: "v1_swipe",
      lessonName: frontmatter.lessonName || lessonSlug,
      userID: null,
      requestID: null,
      learningStyle: null,
      ...screen,
    });
  });

  await batch.commit();
  return { synced: true, screenCount: screens.length };
}

/**
 * Parse ## Question headings from v2 markdown into structured screen objects.
 * Each question becomes a Firestore screen with a nested learnMore map.
 */
function parseV2Screens(markdownBody) {
  const screens = [];
  const questionPattern = /^## Question (\d+):/gm;
  const sections = markdownBody.split(/^## Question \d+:.+$/m).slice(1);
  const headings = [...markdownBody.matchAll(questionPattern)];

  headings.forEach((match, i) => {
    const screenNumber = parseInt(match[1], 10);
    const sectionBody = (sections[i] || "").trim();

    const fields = {};
    const fieldPattern = /^\*\*(\w+):\*\*\s*(.+)$/gm;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(sectionBody)) !== null) {
      fields[fieldMatch[1]] = fieldMatch[2].trim();
    }

    const options = [];
    const optionPattern = /^- (\d)\)\s*(.+)$/gm;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(sectionBody)) !== null) {
      options.push(optionMatch[2].trim());
    }

    const learnMore = parseLearnMore(sectionBody);

    const ciRaw = fields.correctIndex;
    const ciParsed = parseInt(ciRaw, 10);

    screens.push({
      screenNumber,
      questionText: fields.questionText || "",
      emoji: fields.emoji || "",
      options: options.length === 4 ? options : ["", "", "", ""],
      correctIndex: Number.isFinite(ciParsed) ? ciParsed : NaN,
      correctIndexRaw: ciRaw,
      feedbackCorrect: fields.feedbackCorrect || "",
      feedbackIncorrect: fields.feedbackIncorrect || "",
      learnMore,
    });
  });

  return screens;
}

/**
 * Validate parsed v2_interactive screens and frontmatter.
 */
function validateV2Lesson(lessonSlug, baseSlug, programmeId, frontmatter, screens) {
  const errors = [];
  const fmProg = (frontmatter.programmeId || "").trim();
  if (fmProg && fmProg !== programmeId) {
    errors.push(
      `${lessonSlug}: frontmatter programmeId "${fmProg}" does not match folder "${programmeId}"`,
    );
  }
  if (!(frontmatter.lessonName || "").trim()) {
    errors.push(`${lessonSlug}: frontmatter lessonName is missing or empty`);
  }
  if (!(frontmatter.category || "").trim()) {
    errors.push(`${lessonSlug}: frontmatter category is missing or empty`);
  }
  if ((frontmatter.lessonFormat || "").trim() !== "v2_interactive") {
    errors.push(
      `${lessonSlug}: frontmatter lessonFormat should be v2_interactive`,
    );
  }

  if (screens.length === 0) {
    errors.push(`${lessonSlug}: no ## Question sections parsed`);
    return errors;
  }
  if (screens.length !== 5) {
    errors.push(
      `${lessonSlug}: v2_interactive requires exactly 5 questions, found ${screens.length}`,
    );
  }

  screens.forEach((screen, idx) => {
    const n = screen.screenNumber;
    const label = `${lessonSlug} question #${n} (index ${idx + 1})`;
    if (n !== idx + 1) {
      errors.push(
        `${label}: question number ${n} is out of sequence (expected ${idx + 1})`,
      );
    }
    if (!(screen.questionText || "").trim()) {
      errors.push(`${label}: **questionText:** is required`);
    }
    if (!(screen.emoji || "").trim()) {
      errors.push(`${label}: **emoji:** is required`);
    }
    if (!Array.isArray(screen.options) || screen.options.length !== 4) {
      errors.push(`${label}: need exactly 4 options (- 0) through (- 3)`);
    } else {
      screen.options.forEach((opt, j) => {
        if (!(opt || "").trim()) {
          errors.push(`${label}: option ${j} is empty`);
        }
      });
    }
    if (
      !Number.isInteger(screen.correctIndex) ||
      screen.correctIndex < 0 ||
      screen.correctIndex > 3
    ) {
      errors.push(
        `${label}: **correctIndex:** must be 0, 1, 2, or 3 (got "${screen.correctIndexRaw}")`,
      );
    }
    if (!(screen.feedbackCorrect || "").trim()) {
      errors.push(`${label}: **feedbackCorrect:** is required`);
    }
    if (!(screen.feedbackIncorrect || "").trim()) {
      errors.push(`${label}: **feedbackIncorrect:** is required`);
    }

    const lm = screen.learnMore;
    if (!lm) {
      errors.push(`${label}: missing ### learnMore block`);
      return;
    }
    if (!(lm.hero?.strapline || "").trim() || !(lm.hero?.headline || "").trim()) {
      errors.push(`${label}: learnMore requires **strapline:** and **headline:**`);
    }
    if (!(lm.quickSummary || "").trim()) {
      errors.push(`${label}: learnMore requires **quickSummary:**`);
    }
    const slides = lm.storyCarousel || [];
    if (slides.length !== 5) {
      errors.push(
        `${label}: learnMore story carousel must have exactly 5 slides, found ${slides.length}`,
      );
    } else {
      slides.forEach((sl, k) => {
        if (!(sl.text || "").trim()) {
          errors.push(`${label}: slide ${k + 1} **text:** is empty`);
        }
      });
    }
    const cards = lm.breakdownCards || [];
    if (cards.length !== 2) {
      errors.push(
        `${label}: learnMore needs exactly 2 breakdown cards (#### Card 1 / Card 2), found ${cards.length}`,
      );
    } else {
      const t0 = (cards[0].type || "").toLowerCase();
      const t1 = (cards[1].type || "").toLowerCase();
      if (t0 && t1 && t0 === t1) {
        errors.push(
          `${label}: breakdown Card 1 and Card 2 must use different **type:** values`,
        );
      }
    }
    const takes = lm.takeaways || [];
    if (takes.length < 3) {
      errors.push(
        `${label}: need at least 3 "- Takeaway:" lines, found ${takes.length}`,
      );
    }
    if (lm.actionLink) {
      const url = (lm.actionLink.url || "").trim();
      if (!/^https:\/\//i.test(url)) {
        errors.push(
          `${label}: action **actionUrl:** must be an https URL`,
        );
      }
      if (!(lm.actionLink.label || "").trim()) {
        errors.push(`${label}: action link missing **actionLabel:**`);
      }
    }
  });

  return errors;
}

/**
 * Parse the ### learnMore sub-section within a question block.
 */
function parseLearnMore(sectionBody) {
  const learnMoreSplit = sectionBody.split(/^### learnMore$/m);
  if (learnMoreSplit.length < 2) return null;

  const lmBody = learnMoreSplit[1].trim();

  const fields = {};
  const fieldPattern = /^\*\*(\w+):\*\*\s*(.+)$/gm;
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(lmBody)) !== null) {
    fields[fieldMatch[1]] = fieldMatch[2].trim();
  }

  const slides = parseSlides(lmBody);
  const cards = parseBreakdownCards(lmBody);
  const takeaways = parseTakeaways(lmBody);

  const learnMore = {
    hero: {
      strapline: fields.strapline || "",
      headline: fields.headline || "",
    },
    quickSummary: fields.quickSummary || "",
    storyCarousel: slides,
    breakdownCards: cards,
    takeaways,
  };

  if (fields.actionLabel) {
    learnMore.actionLink = {
      label: fields.actionLabel || "",
      description: fields.actionDescription || "",
      url: fields.actionUrl || "",
    };
  }

  return learnMore;
}

/**
 * Parse #### Slide N: headings into story carousel array.
 */
function parseSlides(lmBody) {
  const slides = [];
  const slidePattern = /^#### Slide \d+:/gm;
  const slideSections = lmBody.split(/^#### Slide \d+:.+$/m).slice(1);
  const slideHeadings = [...lmBody.matchAll(slidePattern)];

  slideHeadings.forEach((_, i) => {
    const body = (slideSections[i] || "").trim();
    const fields = {};
    const fp = /^\*\*(\w+):\*\*\s*(.+)$/gm;
    let m;
    while ((m = fp.exec(body)) !== null) {
      fields[m[1]] = m[2].trim();
    }
    slides.push({
      emoji: fields.emoji || "",
      title: fields.title || "",
      text: fields.text || "",
    });
  });

  return slides;
}

/**
 * Parse #### Card N: headings into breakdown cards array.
 */
function parseBreakdownCards(lmBody) {
  const cards = [];
  const cardPattern = /^#### Card \d+:/gm;
  const cardSections = lmBody.split(/^#### Card \d+:.+$/m).slice(1);
  const cardHeadings = [...lmBody.matchAll(cardPattern)];

  cardHeadings.forEach((_, i) => {
    const body = (cardSections[i] || "").trim();
    const nextSlide = body.indexOf("#### Slide");
    const nextCard = body.indexOf("#### Card", 1);
    const nextTakeaway = body.indexOf("- Takeaway:");
    let end = body.length;
    [nextSlide, nextCard, nextTakeaway].forEach((pos) => {
      if (pos > 0 && pos < end) end = pos;
    });

    const cardBody = body.slice(0, end).trim();
    const fields = {};
    const fp = /^\*\*(\w+):\*\*\s*(.+)$/gm;
    let m;
    while ((m = fp.exec(cardBody)) !== null) {
      fields[m[1]] = m[2].trim();
    }

    const card = {
      type: fields.type || "highlight",
      caption: fields.caption || "",
    };

    if (card.type === "comparison") {
      card.leftLabel = fields.leftLabel || "";
      card.leftItems = (fields.leftItems || "").split("|").map((s) => s.trim());
      card.rightLabel = fields.rightLabel || "";
      card.rightItems = (fields.rightItems || "").split("|").map((s) => s.trim());
    } else if (card.type === "highlight") {
      card.heroNumber = fields.heroNumber || "";
      card.subtitle = fields.subtitle || "";
      card.detail = fields.detail || "";
    } else if (card.type === "timeline") {
      card.steps = [
        { step: 1, description: fields.step1 || "" },
        { step: 2, description: fields.step2 || "" },
        { step: 3, description: fields.step3 || "" },
      ];
    }

    cards.push(card);
  });

  return cards;
}

/**
 * Parse - Takeaway: lines into array of strings.
 */
function parseTakeaways(lmBody) {
  const takeaways = [];
  const pattern = /^- Takeaway:\s*(.+)$/gm;
  let m;
  while ((m = pattern.exec(lmBody)) !== null) {
    takeaways.push(m[1].trim());
  }
  return takeaways;
}

/**
 * Sync a single v2_interactive lesson file to Firestore.
 * The doc ID uses {baseSlug}--v2 to distinguish from the v1 doc.
 */
async function syncV2Lesson(filePath, programmeId) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matterLessonFile(raw);

  const baseSlug = path.basename(filePath, ".v2.md");
  const lessonSlug = baseSlug + "--v2";
  const screens = parseV2Screens(content);

  const validationErrors = validateV2Lesson(
    lessonSlug,
    baseSlug,
    programmeId,
    frontmatter,
    screens,
  );
  if (validationErrors.length > 0) {
    return { synced: false, errors: validationErrors };
  }

  const relativePath = path
    .relative(path.resolve(__dirname, ".."), filePath)
    .replace(/\\/g, "/");

  const db = getFirestore();
  if (!db) {
    return { synced: true, screenCount: screens.length, dryRun: true };
  }

  const cleared = await deleteExistingCoreScreens(lessonSlug);
  if (cleared > 0) {
    console.log(`  Cleared ${cleared} existing screens for ${lessonSlug}`);
  }

  const batch = db.batch();

  const lessonRef = db.collection("core_lessons").doc(lessonSlug);
  batch.set(lessonRef, {
    programmeId,
    category: frontmatter.category || "",
    lessonName: frontmatter.lessonName || baseSlug,
    lessonFormat: "v2_interactive",
    lessonLevel: frontmatter.lessonLevel || "",
    lessonTime: frontmatter.lessonTime || "",
    persona: frontmatter.persona || "",
    screenCount: screens.length,
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    syncedFrom: relativePath,
  });

  screens.forEach((screen) => {
    const {correctIndexRaw: _drop, ...screenDoc} = screen;
    const screenRef = db.collection("screens").doc();
    batch.set(screenRef, {
      lessonId: lessonSlug,
      lessonType: "core",
      lessonFormat: "v2_interactive",
      lessonName: frontmatter.lessonName || baseSlug,
      userID: null,
      requestID: null,
      learningStyle: null,
      ...screenDoc,
    });
  });

  await batch.commit();
  return { synced: true, screenCount: screens.length };
}

/**
 * Delete existing core screens for a lesson before re-syncing.
 */
async function deleteExistingCoreScreens(lessonSlug) {
  const db = getFirestore();
  if (!db) {
    return 0;
  }
  const snapshot = await db
    .collection("screens")
    .where("lessonId", "==", lessonSlug)
    .where("lessonType", "==", "core")
    .get();

  if (snapshot.empty) return 0;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

async function main() {
  if (!fs.existsSync(PROGRAMMES_DIR)) {
    console.log("No programmes directory found at:", PROGRAMMES_DIR);
    console.log("Nothing to sync.");
    process.exit(0);
  }

  const programmeFolders = fs
    .readdirSync(PROGRAMMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (programmeFolders.length === 0) {
    console.log("No programme folders found. Nothing to sync.");
    process.exit(0);
  }

  let totalLessons = 0;
  let totalScreens = 0;
  let validationFailed = false;

  for (const programmeId of programmeFolders) {
    const programmeDir = path.join(PROGRAMMES_DIR, programmeId);
    console.log(`\nProgramme: ${programmeId}`);

    const lessonFiles = fs
      .readdirSync(programmeDir)
      .filter((f) => f.endsWith(".md") && f !== "programme.md");

    if (lessonFiles.length === 0) {
      console.log("  No lesson files found.");
      continue;
    }

    for (const lessonFile of lessonFiles) {
      const filePath = path.join(programmeDir, lessonFile);
      const isV2 = lessonFile.endsWith(".v2.md");

      if (isV2) {
        const baseSlug = path.basename(lessonFile, ".v2.md");
        const v2Slug = baseSlug + "--v2";

        const result = await syncV2Lesson(filePath, programmeId);
        if (result.errors && result.errors.length > 0) {
          validationFailed = true;
          result.errors.forEach((msg) =>
            console.error(`  VALIDATION ERROR: ${msg}`),
          );
          continue;
        }
        if (result.synced) {
          totalLessons++;
          totalScreens += result.screenCount;
          const tag = result.dryRun ? "validated (dry-run)" : "Synced";
          console.log(`  ${tag} ${v2Slug} (${result.screenCount} screens, v2)`);
        }
      } else {
        const lessonSlug = path.basename(lessonFile, ".md");

        const result = await syncLesson(filePath, programmeId);
        if (result.errors && result.errors.length > 0) {
          validationFailed = true;
          result.errors.forEach((msg) =>
            console.error(`  VALIDATION ERROR: ${msg}`),
          );
          continue;
        }
        if (result.synced) {
          totalLessons++;
          totalScreens += result.screenCount;
          const tag = result.dryRun ? "validated (dry-run)" : "Synced";
          console.log(
            `  ${tag} ${lessonSlug} (${result.screenCount} screens, v1)`,
          );
        }
      }
    }
  }

  if (validationFailed) {
    console.error(
      "\nCurriculum sync finished with validation errors. Fix lessons above and re-run.",
    );
    process.exit(1);
  }

  const modeLabel = DRY_RUN ? "Validated (dry-run, no Firestore writes)" : "Synced";
  console.log(
    `\nDone. ${modeLabel}: ${totalLessons} lessons with ${totalScreens} screens.`,
  );
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
}

module.exports = {
  parseScreens,
  parseV2Screens,
  validateV1Lesson,
  validateV2Lesson,
};
