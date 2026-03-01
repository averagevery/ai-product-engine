> **File Summary & Purpose:** This is the prompting manual for the Design Agent. It ensures that the Nano Banana image API consistently generates flat, vector-style, transparent PNGs that look like modern fintech illustrations and are optimized for future Lottie animation tracing.

# Image Generation Guidelines (Nano Banana)

## 1. Primary Goal
Create a single, clear illustration per request that communicates one finance concept fast (1–2 seconds) and feels warm, modern, and non-judgemental.

* **Reuse First:** Before generating a new image, the Design Agent MUST query the `image_library` collection in Firestore. If an existing image matches the `Keywords` of the requested screen AND has `human_approved: true`, the Agent must reuse that `lottieURL` instead of calling the Nano Banana API.

## 2. Style Requirements
* **Flat vector illustration style** (modern fintech explainer art).
* **Simple geometric shapes**, rounded corners.
* **NO gradients, NO textures**, NO photographic detail.
* **NO background shape or background colour** (Must export cleanly as a transparent PNG).
* Clean silhouettes that remain readable on light and dark UI backgrounds.

## 3. Composition Rules
* One focal subject, minimal clutter.
* Centre-weighted composition with generous padding for transparent placement.
* Avoid elements that visually depend on a background edge or horizon line.
* Shadows, if used, should be separate solid layers so they can be toggled.

## 4. Safety & Content
* NO brand logos (e.g., Visa, Mastercard, specific banks).
* NO real people likenesses.
* NO violence or graphic distress. Financial stress should be shown gently (e.g., worried posture), not extremely.

## 5. Prompting Nano Banana (Mandatory Structure)
Every prompt sent to the image generator MUST start with:
`"Flat vector illustration, transparent background, no background colour, no gradients, no textures, simple shapes..."` 
Followed by the main subject + action + 1–3 supporting objects. Keep prompts short and specific (2–5 lines).