# TAG TEAM — Toastmasters Meeting Role Assistant

> **Track. Analyze. Grow.**  
> A minimal, responsive digital companion for Toastmasters meeting role players.

---

## 🎯 Overview

TAG TEAM is designed around a single unifying concept:
> **One Meeting → Four Roles → One Report**

During a Toastmasters meeting, role players should spend more time listening than managing software. TAG TEAM provides an ultra-fast, tactile, one-tap tracking interface for the four core meeting-support roles:

* ⏱️ **T — Timer:** Large stopwatch, configurable green/yellow/red milestones, audio chimes, and fullscreen signaling cards.
* 👂 **A — Ah-Counter:** One-handed live filler tracking, custom words, action history with Undo (`Ctrl+Z`), and constructive observations.
* 📖 **G — Grammarian:** Word of the Day & Idiom of the Day counters, unique vocabulary tracker, and language highlights.
* 💡 **T — Trivia Master:** Interactive live trivia presentation, multiple-choice reveal animations, one-tap scoring, and automated leaderboard with confetti celebration.

At the end of the meeting, TAG TEAM compiles everything into an editable, professional **Meeting Report** ready for Copy, PDF export, Print, and Sharing.

---

## ✨ Features

* **Offline-First & Local Persistence:** Built with Dexie.js (IndexedDB) for zero-latency local storage. Works 100% offline without mandatory login.
* **Shared Speaker List & Agenda:** Enter speakers and speech durations once; they automatically populate all 4 role workspaces.
* **Live Meeting Mode:** Focused, distraction-free interface with keyboard shortcuts (`Space`, `R`, `A`, `U`, `H`, `Ctrl+Z`).
* **3 Report Styles:** Toastmasters Standard format, Modern Professional cards, and Minimal plain-text / Markdown.
* **Customizable:** Add custom filler words, adjust timing thresholds, toggle audio chimes/vibrations, and switch between Light/Dark/System themes.
* **Installable PWA:** Supports progressive web app installation on mobile and desktop.

---

## 🚀 Quick Start

### Prerequisites
* Node.js (v18+)
* npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Muralidharan027/tag-team.git

# Navigate to project directory
cd tag-team

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

* **Frontend:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS (Notion/Apple Notes aesthetic)
* **Icons:** Lucide React
* **State Management:** Zustand
* **Local Database:** Dexie.js (IndexedDB)
* **Effects & Export:** Canvas Confetti, jsPDF, html2canvas

---

## ⌨️ Desktop Keyboard Shortcuts

* `Space`: Start / Pause Timer or Reveal / Next in Trivia
* `R`: Reset Timer
* `A`: Count *Ah*
* `U`: Count *Um*
* `H`: Count *Uh*
* `Ctrl / Cmd + Z`: Undo last Ah-Counter action
* `Esc`: Close open modal

---

## 📄 License

MIT License. Designed with ❤️ for Toastmasters worldwide.
