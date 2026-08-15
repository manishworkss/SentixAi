# SentixAI: Movie Reviews & Recommendations Platform

SentixAI is a modern, full-stack executive analytics platform designed for film studios and analysts to track real-time audience sentiments, ingest movie reviews, and receive actionable insights.

## ✨ Key Features

- **Premium UI/UX**: Designed with a "Figma Mindset" using a custom, warm Beige and Charcoal theme that avoids generic "tech" aesthetics. Built entirely with React and Tailwind CSS using a centralized theme configuration.
- **Secure Authentication Flow**: 
  - Integrated with **Firebase Auth** (Google & Email/Password).
  - Custom Node.js/Express backend handles a **secure 6-digit OTP email verification** step (via `nodemailer`) before creating a user account.
- **Executive Analytics Dashboard**: Displays high-level metrics including total reviews processed, positive/negative sentiment shares, Aspect-Based Sentiment Analysis (ABSA) progress bars, and an AI-generated executive summary.
- **IMDb Data Ingestion Pipeline**: Connects the frontend to an Express backend endpoint (`/api/ingest/imdb`) to fetch realistic dataset metrics based on a given IMDb Title ID (e.g. `tt15398776` for Oppenheimer).

## 🏗️ Architecture

The project is split into two main directories: 

### 1. Frontend (`/frontend`)
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Auth**: Firebase Authentication SDK
- **Design System**: Centralized `ThemeConfig` exported in `App.tsx` allowing for instantaneous, global theme changes (colors, fonts, borders).

### 2. Backend (`/backend`)
- **Framework**: Node.js + Express
- **Dependencies**: `nodemailer`, `cors`, `axios`, `cheerio`
- **Endpoints**:
  - `POST /api/send-otp`: Generates a 6-digit OTP and sends it via Gmail SMTP with a beautifully styled HTML email template.
  - `POST /api/verify-otp`: Validates the user's OTP.
  - `POST /api/ingest/imdb`: A data ingestion simulator that accepts an IMDb ID and returns realistic, high-quality review and sentiment datasets (bypassing strict IMDb bot protections for seamless UI testing).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project configured for Authentication.
- Gmail App Password for SMTP OTP delivery.

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/manishworkss/SentixAi.git
   cd SentixAi
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   # Start the Express server on port 3001
   node server.js 
   ```

3. **Setup the Frontend**
   ```bash
   # In a new terminal
   cd frontend
   npm install
   # Start the Vite dev server
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:5174`.

## 🎨 Theme Configuration

To alter the aesthetics of the entire application, navigate to `/frontend/src/App.tsx` and modify the `Theme` constant at the top of the file. SentixAI handles everything from background tints to button hovers dynamically based on this object.

```typescript
export const Theme = {
  fontFamily: "font-sans",
  bgApp: "bg-[#EAE4D9]",     
  bgCard: "bg-[#F3EFE7]",    
  primary: "bg-[#3E3832]",
  // ...
};
```

---
*Developed for intelligent, AI-powered movie insights.*
