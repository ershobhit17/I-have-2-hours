# ⏱️ I Have 2 Hours

> **"I have 90 minutes. Tell me exactly what to do."**
> A modern, distraction-free study and work session generator designed to eliminate decision fatigue.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Built%20With-Vanilla%20JS%20%7C%20CSS3-F97316.svg)](#technology-stack)
[![AI Powered](https://img.shields.io/badge/AI-OpenRouter%20Enabled-10b981.svg)](#-ai-engine-integration)

---

## 🎯 What is "I Have 2 Hours"?

Most productivity tools give you a blank to-do list. **“I Have 2 Hours”** turns your available time into an actionable, realistic, scientifically time-boxed blueprint:

1. **What do you want to work on?** (Python, Machine Learning, Data Science, DSA, Exam, Project, English, or Custom Goal).
2. **How much time do you have?** (30 min, 45 min, 1 hour, 90 min, 2 hours, 3 hours, 4 hours, or Custom).
3. **What is your exact goal & skill level?** (e.g. *"Revise Linear Regression & Cost Functions"*, Beginner / Intermediate / Advanced).

The app instantly generates a structured timeline with concrete tasks, cognitive rest intervals, and measurable learning outcomes.

---

## ⚡ Core Features

- 🧠 **Dual-Engine Architecture:**
  - **OpenRouter AI Engine:** Directly generates customized, high-precision plans using models like Google Gemini 2.5 Flash, DeepSeek V3, Meta Llama 3.3, or Claude 3.5 Haiku.
  - **Zero-Dependency Smart Fallback:** A built-in curriculum engine ensures the app always works offline or without an API key.
- ⏱️ **Fullscreen Study Mode Timer:**
  - Real-time countdown ring and digital display.
  - Step through session blocks with `‹ Prev` and `Next ›`.
  - Completion chime synthesized using the Web Audio API.
- 🎧 **Ambient Focus Atmosphere (Synthesized Sounds):**
  - Built-in audio generator for **🌧️ Soft Rain**, **🌊 Ocean Waves**, and **⏱️ Mechanical Clock Tick** with volume controls. Works completely offline with zero external audio assets!
- 📋 **Interactive Checklist & Target Outcomes:**
  - Check off tasks as you finish them during your focus session.
  - Every block features a distinct, observable outcome (e.g., *"Outcome: You should be able to explain linear regression without notes"*).
- 💾 **Local Session History:**
  - Plans are auto-saved to browser `localStorage`.
  - Individual plan deletion (`🗑`) and one-click **"Clear All"** option.
- 📱 **Mobile-First & Sleek Dark UI:**
  - Crafted with near-black tones (`#08090c`), crisp typography, and energetic orange accents (`#ff5722`).
  - Optimized for mobile viewports and referral traffic.

---

## 🚀 How to Run Locally

Since this app uses modern Vanilla web technologies, no heavy build tools or npm installs are required!

```bash
# Clone the repository
git clone https://github.com/ershobhit17/I-have-2-hours.git
cd I-have-2-hours

# Option 1: Run with Python
python -m http.server 3000

# Option 2: Run with Node npx
npx serve .

# Option 3: Simply open index.html in any modern browser!
```

Visit `http://localhost:3000` in your browser.

---

## ☁️ Deployment Guide

You can deploy this repository for free in less than 2 minutes using any of the following methods:

### Option 1: GitHub Pages (Easiest & 100% Free)

1. Go to your repository on GitHub: `https://github.com/ershobhit17/I-have-2-hours`
2. Click on **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` (or `master`) branch and folder `/ (root)`.
4. Click **Save**.
5. Your app will be live within 60 seconds at `https://ershobhit17.github.io/I-have-2-hours/`!
6. **AI is active out of the box** — users can also click **AI Settings** in the top navigation to add their personal OpenRouter key or select other models (Gemini 2.5 Flash, DeepSeek V3, Llama 3.3, Claude 3.5 Haiku).

### Option 2: Vercel (Recommended for Production & Serverless API)

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository: `ershobhit17/I-have-2-hours`.
3. In **Environment Variables**, optionally add:
   - Key: `OPENROUTER_API_KEY`
   - Value: `your_openrouter_api_key_here`
4. Click **Deploy**.
5. The included `/api/generate` serverless proxy will handle AI requests securely without exposing your API key in browser network logs!

---

## 🔒 Confidentiality & API Architecture

- **Zero-Setup Live Experience:** The web app includes a built-in default connection so visitors can experience generative study plans instantly.
- **Personal Key Priority:** Any visitor can add their personal OpenRouter API key directly in **`✨ AI Active / AI Settings`**. Personal keys are saved exclusively in browser `localStorage` and override any defaults.
- **Offline / Template Safety:** If an API quota is reached or network is unavailable, the application gracefully switches to the local template engine with clear UI feedback.

---

## 🛠️ Technology Stack

- **Markup:** Semantic HTML5
- **Styling:** Vanilla CSS3 (Custom design tokens, responsive CSS grid & flexbox, glassmorphism-free modern dark UI)
- **Logic:** Vanilla JavaScript (ES6+)
- **Audio:** Web Audio API (Synthesized ambient noise & frequency-modulated oscillator chimes)
- **AI Integration:** OpenRouter API (REST / JSON schema validation)

---

## 📄 License

MIT License © 2026 Shobhit. Feel free to use, modify, and distribute!
