# The Curator's Ghost 👻

Explore famous artworks through the eyes of a ghostly curator. An atmospheric museum experience with AI-powered art critiques.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Aleyna-B/Curator-s-Ghost.git
cd Curator-s-Ghost
```

### Running the Application

**1️⃣ Start Backend (Terminal 1)**
```bash
cd backend
npm install
node index.js
```
Backend will run on: `http://localhost:8080`

**2️⃣ Start Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: `http://localhost:3000`

**3️⃣ Open in Browser**
```
http://localhost:3000
```

## 🎨 Features

- **Landing Page** - Atmospheric museum entrance with wax seal button
- **Era Selection** - Choose between Renaissance, Impressionism, or Victorian Critic
- **Gallery** - Browse artworks from the Met Museum API
- **Ghost Critique** - AI-powered artwork commentary with typewriter effect

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Node.js, Express |
| Art Data | Metropolitan Museum of Art API |
| AI | IO Intelligence (Llama-3.3-70B) |

## 📁 Project Structure

```
Curator-s-Ghost/
├── backend/
│   ├── index.js          # Express server + API endpoints
│   ├── config/           # CORS configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   └── components/   # React components
│   ├── public/           # Static assets
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/artworks?vibe={vibe}` | Get artworks by era |
| GET | `/api/artworks/:id` | Get single artwork details |
| POST | `/api/critique` | Get ghost critique for artwork |

## 📝 Environment Variables

Create `.env.local` in root directory:
```
IOINTELLIGENCE_API_KEY=your_api_key_here
```

---

Built for hackathon 🏆
