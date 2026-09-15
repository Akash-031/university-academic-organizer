# University Academic Organizer (MVP)

A modern, clean, responsive, and student-friendly web application to help university students organize all their academic materials (lecture slides, notes, assignments, previous exam questions) in one central place.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## Production Deployment

This project is ready for a unified Node.js deployment: Vite builds the React application into `dist/`, then Express serves the built frontend and the existing `/api/*` endpoints from the same origin. This keeps the browser on the deployed app URL and prevents the Supabase service-role key from reaching frontend code.

### Build and start

```bash
npm ci
npm run build
npm start
```

`npm start` runs `node server/index.js`. The hosting platform must provide `PORT`; the local fallback is `5000`. Do not run `vite preview` in production.

### Backend environment variables

Configure these only in the Node/Express service's environment settings or an ignored root `.env` file for local development:

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL. Server-only. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key. Secret and server-only. Never use a `VITE_` prefix. |
| `PORT` | Hosting platform | HTTP port assigned by the platform; defaults to `5000` locally. |
| `ALLOWED_ORIGINS` | Yes for deployed browsers | Comma-separated browser origins, such as `https://your-app-domain.example`. Include `http://localhost:3000` and `http://localhost:5173` for local development. |
| `NODE_ENV` | Recommended | Set to `production` on the hosted service. |

### Frontend API URL

The frontend reads the public, build-time variable `VITE_API_BASE_URL`.

- **Unified deployment (recommended):** leave it empty. Requests use same-origin `/api`, served by Express.
- **Separate frontend deployment:** set it during the frontend build to the backend origin, for example `https://your-api-domain.example`. Do not include `/api` because the client adds it.

Only `VITE_API_BASE_URL` is safe for frontend use. Every `VITE_*` variable is embedded in the browser build, so never place Supabase credentials in one.

### CORS

`ALLOWED_ORIGINS` controls browser origins accepted by Express. Use comma-separated origins with no trailing slash:

```env
ALLOWED_ORIGINS=https://your-app-domain.example,http://localhost:3000,http://localhost:5173
```

For a unified deployment, set it to the public app origin. The backend still accepts requests without an `Origin` header for platform checks and non-browser clients.

### Deployment Recommendation

Use **Render** for the first deployment: it supports a single Node web service with a build command (`npm run build`), start command (`npm start`), managed environment variables, and a stable public URL. This project does not require separate frontend and backend services because Express already serves `dist/`.

Before creating the service, commit the source changes only, confirm the root `.env` remains ignored, and set the backend variables in Render's dashboard. Do not upload or commit `.env`, `server/database.db`, or Supabase credentials. The existing SQLite files remain local reference artifacts; production data is served through Supabase.

---

## 🌟 Core Features Implemented

### 1. 📊 Academic Dashboard
- University name & current semester display (*Metropolitan State University — Fall 2026*).
- Metric cards for **Total Courses**, **Upcoming Tasks & Deadlines**, **Lecture Slides**, and **Study Materials**.
- **Quick Access to Courses** grid with dynamic material count badges.
- **Upcoming Deadlines & Exams** widget with task toggle and priority tracking.
- **Recently Added Lecture Slides** with instant preview and download buttons.
- **Recent Materials Feed** across all registered subjects.

### 2. 📚 Courses Directory
- Displays courses as structured cards with:
  - Course code & course name (e.g., `CSE-201 — Data Structures`, `CSE-202 — Algorithms`, `MATH-201 — Engineering Mathematics`, `MATH-205 — Discrete Mathematics`, `CSE-208 — Database Management Systems`).
  - Instructor name, classroom location, credit hours.
  - Live counts for Lecture Slides, Assignments, Previous Questions, and Notes.
  - Quick action to add materials directly into any course.
  - Course search & department filtering.
  - Ability to register new courses dynamically.

### 3. 📖 Course Details Page
- Dedicated view for each course with categorized sections:
  - **Lecture Slides**: Structured sequence of lecture decks (Lecture 01 to Lecture 06+), topics, upload dates, file size, page count, and download buttons.
  - **Notes**: Supplemental class notes, call stack traces, memory diagrams, and cheat sheets.
  - **Assignments**: Homework specifications and problem sets.
  - **Previous Questions**: Past midterm and final exam papers with solutions.
  - **Other Materials**: Syllabi, formula sheets, and reference materials.

### 4. 📽️ Lecture Slides Hub
- Unified cross-course hub with filtering by subject or keyword.
- Sortable by Lecture Number (`Lecture 01, 02...`) or Upload Date.
- Interactive **Document Viewer Modal** featuring simulated page navigation, document metadata, and AI summary previews.

### 5. ➕ Add Material Flow
- Modal supporting upload of any academic file.
- Form fields for:
  - Course selection
  - Material type (*Lecture Slide, Note, Assignment, Previous Question, Other*)
  - Title
  - Lecture number (if applicable)
  - Topic / key concepts
  - File drag & drop or browse
  - Due date (for assignments) or exam term (for past papers)
  - AI summary & concept tags metadata slots

### 6. 🔍 Global Search Bar
- Universal search accessible with `Ctrl + K` or `/`.
- Instant search across **Course Names**, **Lecture Titles**, **Topics**, **File Names**, and **Document Summaries**.
- Direct jump to course pages or opening the document previewer.

### 7. 📅 Calendar & Deadlines
- Checklist for upcoming assignment submissions, quizzes, and midterm exams with high/medium/low priority tags.

### 8. ⚙️ Settings & Future AI Architecture
- Profile configuration (student name, ID, university, semester).
- **Future AI Architecture Toggles** structured for Phase 2:
  1. *AI Document Categorization* (auto-classifying course and material type from uploaded PDF).
  2. *AI Lecture Slide Summarization* (extracting key formulas and exam takeaways).
  3. *AI Semantic Cross-Document Search* (natural language Q&A across notes and slides).
  4. *AI Exam Study Plan Generator* (generating revision timelines from syllabus & exam dates).
- Data reset button to restore the initial sample dataset at any time.

---

## 📁 Project Structure

```
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AddMaterialModal.jsx       # Modal for uploading slides/notes/tasks
│   │   ├── CourseCard.jsx             # Card component for course listings
│   │   ├── DashboardCard.jsx          # Metric cards for the dashboard
│   │   ├── MaterialCard.jsx           # Card for slides, notes, past papers
│   │   ├── MaterialViewerModal.jsx    # Interactive document viewer & AI summary preview
│   │   ├── Navbar.jsx                 # Top bar with university info & search
│   │   ├── SearchBar.jsx              # Global instant search bar
│   │   └── Sidebar.jsx                # Responsive navigation sidebar
│   ├── context/
│   │   └── AcademicContext.jsx        # Reactive state with LocalStorage persistence
│   ├── data/
│   │   ├── courses.js                 # Sample courses dataset
│   │   ├── materials.js               # Sample lecture slides, notes, assignments, papers
│   │   └── tasks.js                   # Upcoming deadlines and exams
│   ├── pages/
│   │   ├── Assignments.jsx            # Assignments tracker page
│   │   ├── CalendarTasks.jsx          # Academic calendar & tasks page
│   │   ├── CourseDetails.jsx          # Dedicated course page with tabbed materials
│   │   ├── Courses.jsx                # Courses catalog
│   │   ├── Dashboard.jsx              # Main academic overview dashboard
│   │   ├── LectureSlides.jsx          # Lecture slides repository
│   │   ├── PreviousQuestions.jsx      # Past exam papers archive
│   │   └── Settings.jsx               # Student profile & AI feature preferences
│   ├── App.jsx                        # Layout and routing configuration
│   ├── index.css                      # Tailwind styles and custom utilities
│   └── main.jsx                       # Entry point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
