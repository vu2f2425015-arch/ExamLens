# ExamLens — University Examination & Proctoring Authority Portal

**ExamLens** is an institutional-grade, AI-powered online examination and automated proctoring platform designed for university examination boards, proctors, and student candidates.

Built with an authoritative academic visual register, ExamLens pairs archival paper aesthetics, crisp typography, and institutional telemetry with real-time proctoring features, live monitoring desks, and full light/dark theme support.

---

## ✨ Features

- **🎓 Dual Entrance Desk**: Dedicated candidate entrance and proctor desk sign-in with roll number authentication.
- **🛡️ Real-Time AI Proctoring Desk**: Automated multi-face detection, phone/object detection, audio volume anomaly telemetry, and proctor warning dispatch.
- **📜 Ruled Paper Question Sheet Interface**: Exam sitting view with candidate palette grid, chronometer desk timer (`01:24:10`), and monospace question item audit tags (`[ AUDIT REF: #Q-ALG-04 ]`).
- **📊 Proctoring Control Center**: Real-time live monitoring grid, anomaly alert log, candidate status stamps, live proctor-to-candidate chat, and Recharts analytics.
- **📄 Official Academic Transcript**: Exam completion results view with verified grade stamps (`[ RESULT: SATISFACTORY / PASSED ]`), category breakdowns, and performance analytics.
- **🌗 Complete Institutional Light & Dark Themes**: Fully tokenized CSS design system with instant toggle, `localStorage` persistence, and OS preference auto-detection.
- **♿ Accessibility & Reduced Motion**: Full `:focus-visible` outline rings for keyboard navigation and `@media (prefers-reduced-motion)` support.

---

## 🛠️ Tech Stack

- **Core**: React 19, JavaScript (ESNext), HTML5
- **Build Tooling**: Vite 8, Oxlint
- **Routing**: React Router 7
- **Icons & Motion**: React Icons (`md`), Framer Motion
- **Data Visualization**: Recharts
- **Styling**: Vanilla CSS Modules with custom CSS variable design tokens (`globals.css`)

---

## 🎨 Design System & Typography

- **Display Face**: `Newsreader` (Editorial serif for portal titles, headers, and transcript seals)
- **Workhorse Body Face**: `IBM Plex Sans` (For forms, tables, and candidate lists)
- **Monospace Telemetry Face**: `IBM Plex Mono` (For roll numbers, audit tags, chronometers, and telemetry logs)
- **Color Palette**:
  - **Light Theme**: Archival Parchment (`#F7F6F2`), Oxford Slate (`#1E2B37`), Fountain Pen Ink (`#0F2042`), Ruled Line Border (`#D9D7CE`)
  - **Dark Theme**: Unified Dark Navy (`#0B1320`), Elevated Surface (`#132032`), Sidebar Panel (`#0F1A2A`), High-Contrast Text (`#F8FAFC`, `#CBD5E1`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+ recommended) installed.

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/examlens-frontend.git

# Navigate into the project folder
cd examlens-frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/          # Shared institutional UI components
│   ├── AIStatusBadge/   # Official rectangular status stamps
│   ├── ActivityLog/     # Real-time proctoring audit ledger
│   ├── ChartCard/       # Paper card wrapper for Recharts
│   ├── DashboardCard/   # Ruled metric cards
│   ├── LiveChat/        # Proctor-candidate messaging desk
│   ├── Navbar/          # Top navigation bar with status ticker
│   ├── QuestionPalette/ # Candidate answer sheet palette
│   ├── Sidebar/         # Oxford slate / Dark navy authority navigation
│   ├── ThemeToggle/     # Light / Dark mode sliding pill toggle
│   ├── WarningPopup/    # Official proctoring notice paper popup
│   └── WebcamPanel/     # Video monitor overlay with face detection grid
├── context/             # React contexts (AuthContext, ThemeContext)
├── data/                # Mock exam datasets, questions, alerts, students
├── hooks/               # Custom hooks (useAIProctor, useExamState, useTimer)
├── pages/
│   ├── Admin/           # Admin & Proctor dashboard views
│   ├── Exam/            # Exam sitting flow (Instructions, ExamInterface, Results)
│   ├── Login/           # Dual candidate & proctor login entrance desk
│   └── Student/         # Student portal (Dashboard, MyExams, Results, Profile)
├── styles/              # Global CSS design tokens (globals.css)
└── utils/              # Helper utilities and formatters
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
