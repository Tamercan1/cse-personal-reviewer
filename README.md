# CSE Reviewer (Civil Service Examination Portal)

A student-friendly, minimalist, and offline-first web application designed to help cse-examinees review and prepare for the Civil Service Examination (CSE).

**Live Link**: *[Insert your Netlify deployment URL here]*

---

## Key Features

* **Practice Mode**: Study specific exam subtests (Numerical, Verbal, Analytical, Clerical, and General Info) with step-by-step solutions and explanations.
* **Full Exam Simulator**: A realistic simulation of the official Civil Service Exam with a 2-hour-30-minute timer, a question navigator grid, and review flagging options.
* **Daily Vocabulary Challenge**: A decoupled daily vocabulary digest quiz matching terms to keep synonyms and antonyms sharp.
* **Session Persistence**: Built-in automatic state recovery using browser standard `LocalStorage` so users never lose their practice quiz or exam simulation progress on page refreshes or accidental tab closures.
* **Performance Dashboard**: Real-time high-score tracking, streaks, vocabulary digests, and historical exam reviews.
* **Netlify & Offline-Ready**: Client-side application requiring no backends, cloud databases, or authentication systems—making it extremely fast, offline-capable, and simple to deploy on platforms like Netlify.

---

## Tech Stack

* **Structure & Layout**: Pure HTML5 & [Tailwind CSS](https://tailwindcss.com) (via CDN)
* **Logic & Engine**: Modern Vanilla JavaScript (ES6+)
* **Styling & Icons**: Custom inline SVG outline iconography (inspired by Heroicons/Lucide)
* **Local Storage Layer**: Client-side state saving using standard browser `LocalStorage` API

---


## LocalStorage Persistence Details

All user progress is cached locally inside standard browser variables.
* **`cse_quiz_progress`**: Caches active practice quiz state (category, questions list, current question index, score, selected options, and submission states).
* **`cse_exam_progress`**: Tracks active exam simulation states (answers grid, flags array, question index, and remaining seconds) with real-time 1-second auto-save ticks.
* **`cse_best_scores`**: Stores the highest percentage scored across categories.
* **`cse_exam_history`**: Caches the last 5 mock exam results for review.

