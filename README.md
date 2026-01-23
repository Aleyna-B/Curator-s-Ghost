# The Curator's Ghost 

**An immersive, AI-powered museum experience where artworks come alive.**

Explore famous masterpieces not just by looking, but by conversing with the ghostly curators who haunt the gallery halls. Witness clash of opinions in real-time debates, or summon the spirits trapped within the canvas.

Built for the **io.net Hackathon**, demonstrating advanced usage of **io.net Workflows**, **Custom Agents**, and **Reasoning Agents**.

---

## Key Features

### 1. Ghost Strategy (Personas) 
Choose your guide through art history:
*   **Lorenzo (Renaissance):** A poetic scholar who sees divine beauty in every stroke.
*   **Claude (Impressionist):** A dreamer obsessed with fleeting light and emotion.
*   **Edmund (Victorian Critic):** A stern judge who values technical mastery and moral virtue.

### 2. Debate Mode (The Clash) 
**Real-Time AI Debate powered by io.net Custom Agents.**
*   Watch **Lorenzo** and **Edmund** argue over a masterpiece in real-time.
*   **Sequential Reasoning:** 5-turn debate loop where agents respond to each other's points.
*   **Streaming (SSE):** Experience the argument unfold instantly with Server-Sent Events, no waiting.
*   **Visual Drama:** Dynamic "typing..." indicators and split-screen UI.

### 3. Living Subject Mode 
**Don't just talk *about* the art. Talk *to* it.**
*   Switch modes to summon the entity painted in the canvas.
*   The AI adopts the persona of the subject (e.g., the weary peasant, the proud noble) based on visual context.

### 4. Spectral Secrets 
*   Ask the ghosts to reveal hidden details.
*   Hotspots generate dynamically on the image, revealing technical or historical secrets.

---

## Tech Stack & Architecture

### Backend (Node.js + Express)
*   **Clean Architecture:** Logic separated into Controllers, Services (`debateService.js`), and Utils.
*   **Orchestration:** `orchestraAgent.js` utilizes **Reasoning Agents** to determine user intent (e.g., classifying questions as historical, critique, or technical).
*   **io.net Integration:** Uses `inference.io` Workflows API for complex agent tasks.
*   **SSE Streaming:** Custom implementation for delivering real-time text chunks (`utils/sseHelper.js`).

### Frontend (Next.js 14 + React)
*   **Custom Hooks:** Logic encapsulated in `useDebateStream`, `useGhostTTS`.
*   **Tailwind CSS:** Glassmorphism UI, dark mode aesthetics, smooth animations.
*   **Speech Synthesis:** Web Speech API for bringing the ghosts to voice.

### AI Engine
*   **Custom Agents:** distinct personalities (Lorenzo, Edmund, Subject) configured via prompts.
*   **Reasoning Agent:** Uses `solve_with_reasoning` to break down complex user queries.
*   **Model:** `meta-llama/Llama-3.3-70B-Instruct` as the core intelligence.
*   **Fallback:** Robust error handling ensures the show goes on even if the main API hiccups.

---

## 🚀 Quick Start

### Prerequisites
*   Node.js 18+
*   An **io.net** API Key (for the full experience)

### 1. Clone & Install
```bash
git clone https://github.com/Aleyna-B/Curator-s-Ghost.git
cd Curator-s-Ghost
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```env
IOINTELLIGENCE_API_KEY=your_ionet_api_key_here
```

### 3. Run the Backend
```bash
cd backend
npm install
# Starts server on http://localhost:8080
node index.js
```

### 4. Run the Frontend
Open a new terminal:
```bash
cd frontend
npm install
# Starts app on http://localhost:3000
npm run dev
```

### 5. Open Project
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Curator-s-Ghost/
├── backend/
│   ├── components/         # Route Controllers & Agents (ghostController, orchestraAgent)
│   ├── services/           # Business Logic (debateService.js - The Brain )
│   ├── utils/              # Helpers (sseHelper.js - The Stream)
│   └── index.js            # Entry Point
│
├── frontend/
│   ├── src/app/chat/       # Main Chat Interface
│   ├── src/hooks/          # Custom Hooks (useDebateStream, useGhostTTS)
│   ├── src/components/     # UI Components (DebateArena)
│   └── public/             # Assets
```

## Hackathon Highlights
*   **Creative use of AI:** Moving beyond simple Q&A to multi-turn, persona-based debating and roleplay.
*   **Advanced Agents:** Combining **Custom Agents** for personality with **Reasoning Agents** for logic.
*   **Technical Implementation:** Integrating io.net Workflows with real-time frontend streaming.
*   **User Experience:** Polished, atmospheric UI that feels like a game.


## Team

*   **Aleyna Benzer** - [GitHub](https://github.com/Aleyna-B)   
*   **Reyyan Temel** - [Github](https://github.com/ryntml)