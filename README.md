# ReadFluently 🦉
### Interactive Reading Speed Trainer & Fluency App for Children
#### *Disponible en Français 🇫🇷 et en Anglais 🇬🇧*

**ReadFluently** is an interactive web application designed to help children build reading confidence, improve reading speed (WPM / MPM), and develop reading comprehension through real-time speech recognition, playful visual pacing, and engaging feedback.

---

## 🌟 What's New: Bilingual & Advanced TTS Voice Controls

### 🌐 Bilingual Support (English 🇬🇧 & French 🇫🇷)
- **1-Click Language Switcher**: A dedicated button in the header toggles the entire application between English and French instantly without reloading.
- **Bilingual Interface**: Tabs, buttons, accessibility tools, speedometer gauges, trophies, and profile settings are translated.
- **Curated French Story Library**:
  - *Pip le Renard et la Lune* (Niveau 1, CP - CE1)
  - *Le Brave Petit Astronaute* (Niveau 2, CE1 - CE2)
  - *Le Mystère de l'Arbre Chuchoteur* (Niveau 2, CE2 - CM1)
  - *Kira et le Récif Secret* (Niveau 3, CM1 - CM2)
- **Bilingual Speech Recognition (STT)**:
  - Automatically switches recognition models between `en-US` and `fr-FR`.
  - Normalizes accents and French elisions (`l'`, `d'`, `c'`, `qu'`) for accurate phonetic matching.

### 🗣️ Multilingual Text-to-Speech (TTS) & Voice Customization
- **French & English Audio**: Text-to-Speech narration and word pronunciation work in both French and English.
- **Voice Gender Selection**:
  - 👨 **Male voices** (e.g., Paul, Henri, David, George, Thomas...)
  - 👩 **Female voices** (e.g., Julie, Hortense, Denise, Samantha, Zira...)
  - 👤 **All System Voices**: Choose any voice installed in your operating system or browser.
- **🔊 Test Voice Button**: Test your chosen voice with a single click (*"Hello! I am ready to read stories with you today!"* or *"Bonjour ! Je suis prêt à lire des histoires avec toi aujourd'hui !"*).
- **Interactive Tap-to-Pronounce**: Children can tap any word in the text to hear it spoken in the selected voice and language before reading it aloud.

---

## 🚀 Key Features

### 1. 🎙️ Real-Time Speech Recognition & Word Highlighting
- Powered by the **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`).
- Listens to the child reading aloud through their microphone.
- **Word Highlighting in Real-Time**:
  - **Spoken words**: Highlighted in soft pastel green (`.word-spoken`).
  - **Active word**: Pulsing golden focus indicator (`.word-current`) guiding the child's eyes.
  - **Upcoming words**: High-legibility text (`.word-upcoming`).
- **Auto-scroll**: Automatically keeps the current reading line centered in the viewport.

### 2. ⚡ Live Reading Speed (WPM / MPM) & Speed Tiers
- Displayed prominently below the reading area while the child speaks.
- Dynamically calculated:
  $$\text{WPM} = \text{round}\left( \frac{\text{Words Spoken}}{\text{Active Reading Minutes}} \right)$$
- Pauses the timer during silence so idle pauses do not unfairly penalize reading speed.
- Cheerful Speed Tiers:
  - 🐢 **Steady Turtle / Tortue tranquille** (< 55 WPM)
  - 🐰 **Fast Bunny / Lapin rapide** (55 - 74 WPM)
  - 🐆 **Speedy Cheetah / Guépard agile** (75 - 89 WPM)
  - 🚀 **Rocket Reader / Lecteur fusée** (90+ WPM)

### 3. 📄 Multiple Reading Input Modes
- **📚 Curated Story Library**: Grade-appropriate stories in English and French with curated comprehension questions.
- **📄 Paste Custom Text**: Paste any book excerpt, homework story, or poem.
- **📑 Upload PDF Documents**: Client-side PDF text extraction using Mozilla's **PDF.js** (works 100% in-browser, no external database or server needed). Also accepts `.txt` files.

### 4. 🧠 Reading Comprehension Check
- 3 quick, fun multiple-choice questions right after finishing a story.
- Available in both French and English.
- Dynamically generates questions for custom pasted text and uploaded PDFs.
- Calculates **Comprehension Score %** alongside reading speed to encourage deep understanding.

### 5. 📁 100% Text File Profile Storage (No Database!)
- **No database required**: All profiles and session records are stored directly in clean, formatted `.txt` files.
- **Human-Readable & Printable**: Parents and teachers can open any profile `.txt` file in Windows Notepad, print it, or email it.
- **Embedded Application Payload**: Contains machine-parseable data blocks for instant, lossless 1-click importing on any device.

### 6. ♿ Accessibility & Child-Friendly Design
- **Dyslexia-Friendly Mode**: High-legibility typography, relaxed letter-spacing, and warm non-glare background tint.
- **Font Size Adjuster**: Small, Normal, Large (A+), and Extra Large (A++).
- **Reading Ruler Guide 📏**: Optional focus ruler following the mouse/current line.
- **Synthesized Audio Effects**: Joyful chimes, success dings, and victory fanfare generated purely via Web Audio API.

---

## 🚀 How to Run the Application

### Option 1: One-Click Windows Launcher
Double-click `start.bat` in the project folder. It will launch the app in your default browser.

### Option 2: Run via Any Local HTTP Server (Recommended for Microphone Permissions)
In terminal / command prompt:
```bash
# Using Python:
python -m http.server 8080

# Or using Node / npx:
npx serve -l 8080
```
Then navigate to: **`http://localhost:8080`**

### Option 3: Direct Browser Launch
Open `index.html` directly in **Google Chrome** or **Microsoft Edge** (browsers that support the Web Speech API).
