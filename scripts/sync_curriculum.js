/**
 * Curriculum Sync Engine
 *
 * Scans requirements/content/programmes/ for hand-crafted curriculum:
 * - `programme.md` -- YAML frontmatter with programme metadata + ordered lessons array
 * - `{slug}.md` -- v2_interactive: YAML frontmatter + ## Question headings + learnMore
 *
 * Pushes to Firestore:
 * - programmes/{programmeId} (from programme.md)
 * - core_lessons/{slug} (with lessonOrder from programme.md)
 * - screens/{auto-id} (linked by lessonId, lessonType: "core")
 *
 * Usage:
 *   npm run sync-curriculum
 *   npm run validate-curriculum   (parse + validate only, no Firestore)
 *
 * Flags:
 *   --dry-run   Same as validate-curriculum: no Firebase init or writes.
 *   --no-prune  Do not delete programmes/core_lessons/screens removed from the repo.
 *   --force     Always re-write (ignore sourceSha256 / screen-count short-circuit).
 */

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const matter = require("gray-matter");
const admin = require("firebase-admin");

const DRY_RUN =
  process.argv.includes("--dry-run") ||
  process.argv.includes("--validate-only");

const NO_PRUNE = process.argv.includes("--no-prune");

const FORCE_SYNC = process.argv.includes("--force");

const REPO_ROOT = path.join(__dirname, "..");

/**
 * If GOOGLE_APPLICATION_CREDENTIALS is unset, use a key in `.secrets/` so
 * teammates can run `npm run sync-curriculum` without Windows env-var setup.
 */
function ensureLocalServiceAccountFromSecretsFolder() {
  if (DRY_RUN) {
    return;
  }
  const existing = (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();
  if (existing) {
    return;
  }
  const secretsDir = path.join(REPO_ROOT, ".secrets");
  const preferred = path.join(secretsDir, "firebase-adminsdk.json");
  if (fs.existsSync(preferred)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = preferred;
    return;
  }
  if (fs.existsSync(secretsDir)) {
    const jsonFiles = fs
      .readdirSync(secretsDir)
      .filter((f) => f.endsWith(".json"));
    if (jsonFiles.length === 1) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
        secretsDir,
        jsonFiles[0],
      );
    }
  }
}

ensureLocalServiceAccountFromSecretsFolder();

/**
 * Firebase Admin needs a project ID when it cannot infer one from credentials.
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
        admin.initializeApp({ projectId });
      } else {
        admin.initializeApp();
      }
    }
    _db = admin.firestore();
  }
  return _db;
}

const PROGRAMMES_DIR = path.join(
  REPO_ROOT,
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
 * Parse ## Question headings from markdown into structured screen objects.
 * Each question becomes a Firestore screen with a nested learnMore map.
 */
function parseScreens(markdownBody) {
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
 * Validate parsed lesson screens and frontmatter. Returns human-readable error strings.
 */
function validateLesson(lessonSlug, programmeId, frontmatter, screens) {
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
      `${lessonSlug}: requires exactly 5 questions, found ${screens.length}`,
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

function parseTakeaways(lmBody) {
  const takeaways = [];
  const pattern = /^- Takeaway:\s*(.+)$/gm;
  let m;
  while ((m = pattern.exec(lmBody)) !== null) {
    takeaways.push(m[1].trim());
  }
  return takeaways;
}

function parseProgramme(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matterLessonFile(raw);
  return { data, content, raw };
}

function validateProgramme(programmeId, frontmatter) {
  const errors = [];
  if (!(frontmatter.programmeName || "").trim()) {
    errors.push(`${programmeId}: frontmatter programmeName is missing or empty`);
  }
  if (!Array.isArray(frontmatter.lessons) || frontmatter.lessons.length === 0) {
    errors.push(
      `${programmeId}: frontmatter lessons array is missing or empty`,
    );
    return errors;
  }
  const seenSlugs = new Set();
  const seenOrders = new Set();
  frontmatter.lessons.forEach((entry, idx) => {
    const label = `${programmeId} lessons[${idx}]`;
    if (!(entry.slug || "").trim()) {
      errors.push(`${label}: slug is missing or empty`);
    }
    if (!Number.isInteger(entry.order) || entry.order < 1) {
      errors.push(`${label}: order must be a positive integer (got ${entry.order})`);
    }
    if (entry.slug && seenSlugs.has(entry.slug)) {
      errors.push(`${label}: duplicate slug "${entry.slug}"`);
    }
    if (Number.isInteger(entry.order) && seenOrders.has(entry.order)) {
      errors.push(`${label}: duplicate order ${entry.order}`);
    }
    seenSlugs.add(entry.slug);
    seenOrders.add(entry.order);
  });
  return errors;
}

async function programmeIsUpToDateInFirestore(db, programmeId, sourceSha256, lessonCount) {
  const snap = await db.collection("programmes").doc(programmeId).get();
  if (!snap.exists) return false;
  const prev = snap.data() || {};
  return (prev.sourceSha256 || "") === sourceSha256 && prev.lessonCount === lessonCount;
}

async function syncProgramme(filePath, programmeId) {
  const { data: frontmatter, raw } = parseProgramme(filePath);
  const sourceSha256 = sha256Utf8(raw);

  const validationErrors = validateProgramme(programmeId, frontmatter);
  if (validationErrors.length > 0) {
    return { synced: false, errors: validationErrors, lessons: [] };
  }

  const lessons = frontmatter.lessons.map((e) => ({
    slug: e.slug,
    order: e.order,
  }));
  const lessonCount = lessons.length;

  const relativePath = path
    .relative(path.resolve(__dirname, ".."), filePath)
    .replace(/\\/g, "/");

  const db = getFirestore();
  if (!db) {
    return { synced: true, dryRun: true, lessons, errors: [] };
  }

  if (
    !FORCE_SYNC &&
    (await programmeIsUpToDateInFirestore(db, programmeId, sourceSha256, lessonCount))
  ) {
    console.log(`  Programme ${programmeId} unchanged (hash match)`);
    return { skipped: true, lessons, errors: [] };
  }

  await db.collection("programmes").doc(programmeId).set({
    programmeName: frontmatter.programmeName || "",
    category: frontmatter.category || "",
    persona: frontmatter.persona || "",
    estimatedTime: frontmatter.estimatedTime || "",
    lessonCount,
    lessons,
    sourceSha256,
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    syncedFrom: relativePath,
  });

  return { synced: true, skipped: false, lessons, errors: [] };
}

/**
 * Sync a single lesson file to Firestore.
 * Doc ID is the slug (filename without .md).
 */
async function syncLesson(filePath, programmeId, lessonOrder) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const sourceSha256 = sha256Utf8(raw);
  const { data: frontmatter, content } = matterLessonFile(raw);

  const lessonSlug = path.basename(filePath, ".md");
  const screens = parseScreens(content);

  const validationErrors = validateLesson(
    lessonSlug,
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

  if (
    !FORCE_SYNC &&
    (await lessonIsUpToDateInFirestore(
      db,
      lessonSlug,
      sourceSha256,
      screens.length,
    ))
  ) {
    console.log(`  Unchanged ${lessonSlug} (file hash + screen rows match Firestore)`);
    return { skipped: true, screenCount: screens.length };
  }

  const cleared = await deleteExistingCoreScreens(lessonSlug);
  if (cleared > 0) {
    console.log(`  Cleared ${cleared} existing screens for ${lessonSlug}`);
  }

  const batch = db.batch();

  const lessonRef = db.collection("core_lessons").doc(lessonSlug);
  const lessonDoc = {
    programmeId,
    category: frontmatter.category || "",
    lessonName: frontmatter.lessonName || lessonSlug,
    lessonFormat: "v2_interactive",
    lessonLevel: frontmatter.lessonLevel || "",
    lessonTime: frontmatter.lessonTime || "",
    persona: frontmatter.persona || "",
    screenCount: screens.length,
    sourceSha256,
    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    syncedFrom: relativePath,
  };
  if (Number.isInteger(lessonOrder)) {
    lessonDoc.lessonOrder = lessonOrder;
  }
  batch.set(lessonRef, lessonDoc);

  screens.forEach((screen) => {
    const { correctIndexRaw: _drop, ...screenDoc } = screen;
    const screenRef = db.collection("screens").doc();
    batch.set(screenRef, {
      lessonId: lessonSlug,
      lessonType: "core",
      lessonFormat: "v2_interactive",
      lessonName: frontmatter.lessonName || lessonSlug,
      userID: null,
      requestID: null,
      learningStyle: null,
      ...screenDoc,
    });
  });

  await batch.commit();
  return { synced: true, screenCount: screens.length, skipped: false };
}

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

function sha256Utf8(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

async function lessonIsUpToDateInFirestore(db, lessonDocId, sourceSha256, expectedScreenCount) {
  const lessonSnap = await db.collection("core_lessons").doc(lessonDocId).get();
  if (!lessonSnap.exists) {
    return false;
  }
  const prev = lessonSnap.data() || {};
  if ((prev.sourceSha256 || "") !== sourceSha256) {
    return false;
  }
  const screenSnap = await db
    .collection("screens")
    .where("lessonId", "==", lessonDocId)
    .where("lessonType", "==", "core")
    .get();
  return screenSnap.size === expectedScreenCount;
}

async function deleteCoreLessonDocAndScreens(lessonDocId) {
  const db = getFirestore();
  if (!db) {
    return;
  }
  const n = await deleteExistingCoreScreens(lessonDocId);
  await db.collection("core_lessons").doc(lessonDocId).delete();
  return n;
}

async function pruneOrphanedCoreLessons(expectedByProgramme) {
  const db = getFirestore();
  if (!db) {
    return 0;
  }
  let pruned = 0;
  for (const [programmeId, expectedIds] of expectedByProgramme) {
    const snap = await db
      .collection("core_lessons")
      .where("programmeId", "==", programmeId)
      .get();
    for (const doc of snap.docs) {
      if (!expectedIds.has(doc.id)) {
        console.log(
          `  Pruned ${doc.id} (removed from repo under programme ${programmeId})`,
        );
        await deleteCoreLessonDocAndScreens(doc.id);
        pruned += 1;
      }
    }
  }
  return pruned;
}

async function pruneOrphanedProgrammes(expectedProgrammeIds) {
  const db = getFirestore();
  if (!db) return 0;

  const snap = await db.collection("programmes").get();
  let pruned = 0;
  for (const doc of snap.docs) {
    if (!expectedProgrammeIds.has(doc.id)) {
      console.log(`  Pruned programme ${doc.id} (folder removed from repo)`);

      const lessonsSnap = await db
        .collection("core_lessons")
        .where("programmeId", "==", doc.id)
        .get();
      for (const lessonDoc of lessonsSnap.docs) {
        await deleteCoreLessonDocAndScreens(lessonDoc.id);
        console.log(`    Cascade-deleted lesson ${lessonDoc.id}`);
      }

      await doc.ref.delete();
      pruned += 1;
    }
  }
  return pruned;
}

async function main() {
  if (!fs.existsSync(PROGRAMMES_DIR)) {
    console.log("No programmes directory found at:", PROGRAMMES_DIR);
    console.log("Nothing to sync.");
    process.exit(0);
  }

  if (!DRY_RUN) {
    const creds = (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();
    if (!creds || !fs.existsSync(creds)) {
      console.error(`
Curriculum sync needs Firebase Admin credentials for a local run. Either:

  • Put the service account JSON at .secrets/firebase-adminsdk.json
    (or exactly one *.json in .secrets/), or
  • Set GOOGLE_APPLICATION_CREDENTIALS to the full path of that JSON.

For the usual team flow (no local key), merge to main and use GitHub Actions
— see docs/partner-guide.md
`);
      process.exit(1);
    }
  }

  const programmeFolders = fs
    .readdirSync(PROGRAMMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (programmeFolders.length === 0) {
    console.log("No programme folders found. Nothing to sync.");
    process.exit(0);
  }

  let totalProgrammes = 0;
  let totalLessons = 0;
  let totalScreens = 0;
  let totalSkipped = 0;
  let validationFailed = false;

  /** @type {Map<string, Set<string>>} */
  const expectedByProgramme = new Map();
  const expectedProgrammeIds = new Set();

  for (const programmeId of programmeFolders) {
    const programmeDir = path.join(PROGRAMMES_DIR, programmeId);
    console.log(`\nProgramme: ${programmeId}`);
    expectedProgrammeIds.add(programmeId);

    const programmeMdPath = path.join(programmeDir, "programme.md");
    let lessonOrderMap = new Map();

    if (fs.existsSync(programmeMdPath)) {
      const progResult = await syncProgramme(programmeMdPath, programmeId);
      if (progResult.errors && progResult.errors.length > 0) {
        validationFailed = true;
        progResult.errors.forEach((msg) =>
          console.error(`  VALIDATION ERROR: ${msg}`),
        );
      } else {
        if (progResult.synced && !progResult.skipped) {
          totalProgrammes++;
          const tag = progResult.dryRun ? "validated (dry-run)" : "Synced";
          console.log(`  ${tag} programme ${programmeId}`);
        }
        progResult.lessons.forEach((e) => lessonOrderMap.set(e.slug, e.order));
      }
    } else {
      console.log("  No programme.md found -- skipping programme sync.");
    }

    const lessonFiles = fs
      .readdirSync(programmeDir)
      .filter((f) => f.endsWith(".md") && f !== "programme.md");

    if (lessonFiles.length === 0) {
      console.log("  No lesson files found.");
      expectedByProgramme.set(programmeId, new Set());
      continue;
    }

    const expectedIds = new Set();
    for (const lessonFile of lessonFiles) {
      expectedIds.add(path.basename(lessonFile, ".md"));
    }
    expectedByProgramme.set(programmeId, expectedIds);

    for (const lessonFile of lessonFiles) {
      const filePath = path.join(programmeDir, lessonFile);
      const lessonSlug = path.basename(lessonFile, ".md");
      const order = lessonOrderMap.get(lessonSlug);

      const result = await syncLesson(filePath, programmeId, order);
      if (result.errors && result.errors.length > 0) {
        validationFailed = true;
        result.errors.forEach((msg) =>
          console.error(`  VALIDATION ERROR: ${msg}`),
        );
        continue;
      }
      if (result.skipped) {
        totalSkipped += 1;
        continue;
      }
      if (result.synced) {
        totalLessons++;
        totalScreens += result.screenCount;
        const tag = result.dryRun ? "validated (dry-run)" : "Synced";
        console.log(`  ${tag} ${lessonSlug} (${result.screenCount} screens)`);
      }
    }
  }

  if (validationFailed) {
    console.error(
      "\nCurriculum sync finished with validation errors. Fix lessons above and re-run.",
    );
    process.exit(1);
  }

  let prunedLessons = 0;
  let prunedProgrammes = 0;
  if (!DRY_RUN && !NO_PRUNE) {
    prunedLessons = await pruneOrphanedCoreLessons(expectedByProgramme);
    prunedProgrammes = await pruneOrphanedProgrammes(expectedProgrammeIds);
  } else if (NO_PRUNE && !DRY_RUN) {
    console.log("\nSkipping prune (--no-prune).");
  }

  const modeLabel = DRY_RUN ? "Validated (dry-run, no Firestore writes)" : "Synced";
  const progPart = totalProgrammes > 0 ? `${totalProgrammes} programme(s), ` : "";
  const prunePart =
    !DRY_RUN && (prunedLessons > 0 || prunedProgrammes > 0)
      ? `; pruned ${prunedLessons} lesson(s) + ${prunedProgrammes} programme(s)`
      : "";
  const skipPart =
    !DRY_RUN && totalSkipped > 0
      ? `; ${totalSkipped} unchanged (skipped re-write)`
      : "";
  console.log(
    `\nDone. ${modeLabel}: ${progPart}${totalLessons} lesson(s) written, ${totalScreens} screen row(s)${skipPart}${prunePart}.`,
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
  validateLesson,
  parseProgramme,
  validateProgramme,
};
