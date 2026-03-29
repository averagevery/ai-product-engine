/**
 * Curriculum Sync Engine
 *
 * Scans requirements/content/programmes/ for hand-crafted lesson markdown,
 * parses YAML frontmatter + ## Screen headings, and pushes to Firestore
 * core_lessons + screens collections.
 *
 * Usage: npm run sync-curriculum
 */

const path = require("path");
const fs = require("fs");
const matter = require("gray-matter");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const PROGRAMMES_DIR = path.resolve(
  __dirname,
  "..",
  "requirements",
  "content",
  "programmes",
);

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

/**
 * Sync a single lesson file to Firestore.
 */
async function syncLesson(filePath, programmeId) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  const lessonSlug = path.basename(filePath, ".md");
  const screens = parseScreens(content);

  if (screens.length === 0) {
    console.warn(`  SKIP ${lessonSlug} -- no screens found`);
    return { synced: false };
  }

  const relativePath = path.relative(
    path.resolve(__dirname, ".."),
    filePath,
  ).replace(/\\/g, "/");

  const batch = db.batch();

  const lessonRef = db.collection("core_lessons").doc(lessonSlug);
  batch.set(lessonRef, {
    programmeId,
    category: frontmatter.category || "",
    lessonName: frontmatter.lessonName || lessonSlug,
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
 * Delete existing core screens for a lesson before re-syncing.
 */
async function deleteExistingCoreScreens(lessonSlug) {
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
      const lessonSlug = path.basename(lessonFile, ".md");

      const deleted = await deleteExistingCoreScreens(lessonSlug);
      if (deleted > 0) {
        console.log(`  Cleared ${deleted} existing screens for ${lessonSlug}`);
      }

      const result = await syncLesson(filePath, programmeId);
      if (result.synced) {
        totalLessons++;
        totalScreens += result.screenCount;
        console.log(
          `  Synced ${lessonSlug} (${result.screenCount} screens)`,
        );
      }
    }
  }

  console.log(
    `\nDone. Synced ${totalLessons} lessons with ${totalScreens} screens.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
