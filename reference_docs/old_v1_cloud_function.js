/**
 * MULO LEARNING FACTORY
 * Trigger: New document in 'lesson_requests'
 * Action: Generates 1 Lesson + Multiple Screens via Gemini AI
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { GoogleGenerativeAI } = require("@google/generative-ai");

initializeApp();
const db = getFirestore();

// 🔑 CONFIGURATION
// PASTE YOUR ORIGINAL API KEY HERE (The one from your main Firebase project)
const GEMINI_API_KEY = "AIzaSyCk_TrAWqyat-1BMq_OcSgV6hiThNKzCDw"; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ FIX: Using 'gemini-2.5-flash'
// This model is stable, fast, and supports Pay-as-you-go billing.
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
  generationConfig: { 
    responseMimeType: "application/json",
    temperature: 0.7 
  }
});

// 🎨 LOTTIE REPO
const lottieRepo = {
  "bank": "https://lottie.host/5a918730-1011-471a-9f79-623548981440/generic_bank.json",
  "piggy_bank": "https://lottie.host/8b725042-4309-4246-86e5-407425114115/piggy_bank.json",
  "card": "https://lottie.host/80404092-2339-4973-9878-831671958440/credit_card.json",
  "phone": "https://lottie.host/79051834-3199-4402-9903-883905391105/mobile_app.json",
  "shield": "https://lottie.host/93128148-5252-4113-9111-823485093110/shield_secure.json",
  "padlock": "https://lottie.host/12480539-1100-4822-9111-923481093110/padlock.json",
  "clock": "https://lottie.host/33829014-9900-4411-9222-123480093110/clock_time.json",
  "hourglass": "https://lottie.host/22180011-1010-4411-9222-123480093110/hourglass.json",
  "lightning": "https://lottie.host/11480022-2020-4411-9222-123480093110/lightning.json",
  "percent": "https://lottie.host/55280033-3030-4411-9222-123480093110/percent.json",
  "gauge": "https://lottie.host/66380044-4040-4411-9222-123480093110/gauge.json",
  "arrow_up": "https://lottie.host/77480055-5050-4411-9222-123480093110/arrow_up.json",
  "checklist": "https://lottie.host/88580066-6060-4411-9222-123480093110/checklist.json",
  "alert": "https://lottie.host/99680077-7070-4411-9222-123480093110/alert_triangle.json",
  "arrows_split": "https://lottie.host/00180088-8080-4411-9222-123480093110/arrows_split.json",
  "default": "https://assets1.lottiefiles.com/packages/lf20_default_loader.json"
};

exports.generateLesson = onDocumentCreated(
  {
    document: "lesson_requests/{requestId}",
    region: "europe-west2", 
    timeoutSeconds: 60,
    memory: "256MiB"
  },
  async (event) => {
    const snap = event.data;
    if (!snap) { return; }
    
    const data = snap.data();
    const requestId = event.params.requestId;

    console.log(`🚀 Starting generation for Request ID: ${requestId}`);

    // --- 1. CONSTRUCT PROMPT ---


    // 1. CAPTURE THE USER ID
    // We default to "public" if it's missing, just to be safe.
    const ownerID = data.userID || "public";

    const systemPrompt = `
      You are an expert educational content creator for 'Mulo'.
      Target Audience: UK-centric, mobile-first learners.
      Tone: Friendly, human, no jargon.

      YOUR TASK:
      Generate ONE single lesson module based on the request.
      
      STRICT OUTPUT FORMAT (JSON):
      Return a JSON object with: 

      1. 'lesson_metadata' object containing:
         - 'goal' (string)
         - 'goalOrder' (number)
         - 'difficulty_level' (string): Must be exactly 'Beginner', 'Intermediate', or 'Expert'.
         - 'estimated_time' (string): Estimate reading time (e.g. "3 min", "6 min") based on content length.
      2. 'screens' (array of screen objects)

      LOTTIE ANIMATION RULES:
      For every screen, include a field 'LottieSuggestion'.
      Choose ONE category from this list: [${Object.keys(lottieRepo).join(", ")}]
      If no category fits, use "default".

      SCREEN STRUCTURE RULES:
      - 'screenType': Must be 'Standard', 'Question', or 'Summary'.
      - 'headline': Max 7 words.
      - 'paragraph': Max 25 words (conversational).
      - 'question': Max 12 words (or empty string if not Question type).
      - 'optionA', 'optionB', 'optionC', 'optionD': Max 12 words each (Provide 4 distinct choices).
      - 'questionAnswer': Must be exactly 'A', 'B', 'C', or 'D' (identifying the correct option).
      - 'feedbackCorrect'/'feedbackIncorrect': Max 15 words.
      - 'keyTakeaway1'...'keyTakeaway3': Max 10 words (only for Summary screen).
    `;

    // 🚩 RAW DATA: If this is undefined, it passes undefined.

    const style = data.learningStyle; 

    const userPrompt = `
      REQUEST TOPIC: ${data.userLessonRequest}
      LEARNING STYLE: ${style}
      CONTEXT: 
        - Category: ${data.category} 
        - Requested Level: ${data.lessonLevel}
        - Requested Time: ${data.lessonTime}
    `;

    try {
      // --- 2. CALL GEMINI ---
      const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
      const response = await result.response;
      const text = response.text();

      // 🔍 DEBUGGING: This prints exactly what the AI sent to the Firebase Logs
      console.log("🤖 RAW AI RESPONSE:", text); 
      
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const aiResponse = JSON.parse(cleanedText);

      const batch = db.batch();

      // --- 3. CREATE LESSON PARENT ---
      const lessonRef = db.collection("lessons").doc();
      

      // Handle potential missing metadata gracefully
      const meta = aiResponse.lesson_metadata || {}; 

      batch.set(lessonRef, {

        "userID":          ownerID, // ✅ SAVED: Only this user can see it
        "category":        "Custom",
        "moduleName":      data.moduleName || null,
        "lessonName":      data.lessonName || data.userLessonRequest || null,

        // ✅ NEW: Uses the AI's calculated recommendation
        // If the AI fails to generate it, it falls back to null (No Defaults)
        "lessonLevel":     meta.difficulty_level || null,
        "lessonTime":      meta.estimated_time || null,

        "learningStyle":   style || null,
        "requestID":       requestId,
        "goal":            meta.goal || null,
        "goalOrder":       meta.goalOrder || 1,
        "created_at":      FieldValue.serverTimestamp()
      });

      // --- 4. CREATE SCREENS ---
      const screens = aiResponse.screens || aiResponse.Screens || [];
      if (screens.length === 0) {
        console.warn("⚠️ WARNING: No screens found in AI response!", aiResponse);
      }
      
      screens.forEach((screen, index) => {
        const screenRef = db.collection("screens").doc();
        
        const tag = screen.LottieSuggestion ? screen.LottieSuggestion.toLowerCase() : "default";
        const matchedUrl = lottieRepo[tag] || lottieRepo["default"];

        batch.set(screenRef, {
          "userID":            ownerID, // ✅ SAVED: Security for screens too
          "lessonName":        data.lessonName || data.userLessonRequest,
          "requestID":         requestId,
          "learningStyle":     style || null,
          "screenNumber":      index + 1,
          
          // 🚩 NO DEFAULT: If AI sends nothing, this saves as null
          "screenType":        screen.screenType || null, 

          "headline":          screen.headline || "",
          "paragraph":         screen.paragraph || "",
          
          "question":          screen.question || "",
          "optionA":           screen.optionA || "",
          "optionB":           screen.optionB || "",
          "optionC":           screen.optionC || "",
          "optionD":           screen.optionD || "",
          "questionAnswer":    screen.questionAnswer || "", 
          "feedbackCorrect":   screen.feedbackCorrect || "",
          "feedbackIncorrect": screen.feedbackIncorrect || "",
          
          "keyTakeaway1":      screen.keyTakeaway1 || "",
          "keyTakeaway2":      screen.keyTakeaway2 || "",
          "keyTakeaway3":      screen.keyTakeaway3 || "",
          
          "LottieSuggestion":  tag,
          "lottieURL":         matchedUrl
        });
      });

      // --- 5. FINISH ---
      batch.update(snap.ref, { status: "completed" });
      await batch.commit();
      console.log(`✅ Success! Created Lesson for User ${ownerID} + ${screens.length} Screens.`);

    } catch (error) {
      console.error("❌ Error generating lesson:", error);
      // Writes the error back to Firestore so you can see it in your app
      await snap.ref.update({ status: "error", error_message: error.message });
    }
  }
);