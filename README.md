# The Curator's Ghost

**An immersive, AI-powered museum experience where artworks come alive.**

Explore famous masterpieces not just by looking, but by conversing with the ghostly curators who haunt the gallery halls. Witness clash of opinions in real-time debates, or summon the spirits trapped within the canvas.

---

This project is fundamentally built upon the **io Intelligence** platform. It utilizes advanced agentic workflows to power its core logic, surpassing simple LLM wrappers.

### How We Use io Intelligence
The application does not simply "call an AI"; it orchestrates a complex cognitive architecture using io.net’s `workflows/run` API.

#### 1. System Architecture Role
*   **The Orchestrator (The Brain):**
    *   Located in `backend/components/orchestraAgent.js`.
    *   We utilize the **Reasoning Agent** (`solve_with_reasoning`) to act as a logic layer.
    *   It intelligently analyzes user queries to classify intent (e.g., distinguishing between a request for historical facts vs. a request for a subjective critique), ensuring the right persona responds.
*   **The Debate Engine (The Voice):**
    *   Located in `backend/services/debateService.js`.
    *   We employ **Custom Agents** (`custom_agent`) to embody distinct personalities (Lorenzo the Romantic vs. Edmund the Critic).
    *   These agents are not static; they are dynamically prompted to "remember" the previous turn of the debate, allowing for coherent, multi-turn argumentation.

#### 2. Contributions to the Project
*   **Advanced Reasoning:** Enables the system to understand *nuance* rather than just keyword matching.
*   **Persona Fidelity:** io Intelligence allows us to maintain strict character boundaries, ensuring the user feels they are talking to a 19th-century critic, not a generic robot.
*   **Real-Time Performance:** The workflow integration supports the low-latency requirements needed for our real-time typewriter effects.

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
*   **Visual Drama:** Dynamic "typing..." indicators and split-screen UI.

### 3. Living Subject Mode
**Don't just talk *about* the art. Talk *to* it.**
*   Switch modes to summon the entity painted in the canvas.
*   The AI adopts the persona of the subject (e.g., the weary peasant, the proud noble) based on visual context.

---

## Requirements

Before you start, make sure you have the following installed on your computer:

1.  **Node.js (Version 18 or higher)**
    *   We use Node.js to run both our backend server and frontend website.
    *   [Download Node.js here](https://nodejs.org/).
2.  **Git**
    *   Required to download the project files.
    *   [Download Git here](https://git-scm.com/).
3.  **io Intelligence API Key**
    *   Required to power the AI agents. Without this, the ghosts cannot speak.

---

## Step-by-Step Installation (A-Z Guide)

Even if you have never run a code project before, follow these steps to get "The Curator's Ghost" running on your machine.

### Step 1: Download the Project
1.  Open your **Command Prompt** (Windows) or **Terminal** (Mac/Linux).
2.  Copy and paste the following command and press Enter:
    ```bash
    git clone https://github.com/Aleyna-B/Curator-s-Ghost.git
    ```
3.  Go into the project folder:
    ```bash
    cd Curator-s-Ghost
    ```

### Step 2: Configure the "Key"
The project needs a password (API Key) to talk to io Intelligence.
1.  In the project folder, create a new file named `.env.local`.
2.  Open this file with any text editor (Notepad, VS Code, etc.).
3.  Paste the following line inside, replacing `your_ionet_api_key_here` with your actual key:
    ```env
    IOINTELLIGENCE_API_KEY=your_actual_key_starts_with_io...
    ```
4.  Save and close the file.

### Step 3: Install & Start the Backend (The Brain)
This manages the data and AI connections.
1.  In your terminal, navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install the necessary tools (dependencies):
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node index.js
    ```
    *You should see a message saying "Server running on port 8080". Keep this terminal window **OPEN**.*

### Step 4: Install & Start the Frontend (The Visuals)
This acts as the website you interact with.
1.  Open a **NEW** terminal window (do not close the previous one).
2.  Navigate to the frontend folder:
    ```bash
    cd Curator-s-Ghost/frontend
    ```
    *(Adjust the path if you are in a different folder)*
3.  Install the tools:
    ```bash
    npm install
    ```
4.  Start the website:
    ```bash
    npm run dev
    ```

### Step 5: Enter the Museum
1.  Open your web browser (Chrome, Edge, Safari).
2.  Type in the address: [http://localhost:3000](http://localhost:3000)
3.  Enjoy the experience!

---

## Technical Support / Running the Project
*   **Backend Port:** 8080
*   **Frontend Port:** 3000
*   **Common Issues:**
    *   *Error: "Address in use"* -> Make sure no other program is using port 3000 or 8080.
    *   *Ghosts not replying* -> Check your `.env.local` file and ensure your API Key is correct.

---

## Team
*   **Aleyna Benzer** - [GitHub](https://github.com/Aleyna-B)
*   **Reyyan Temel** - [Github](https://github.com/ryntml)