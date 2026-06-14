# Ka-CSE Reviewer

A student-friendly, minimalist, and front-end only web application designed to help CSE examinees review and prepare for the Civil Service Examination. The platform features practice quizzes, full mock exams, and a daily vocabulary digest that includes a quick review quiz after every single entry to test retention.

**Live Link**: *[kacsereviewer.netlify.app](kacsereviewer.netlify.app)*

---

## Key Features

* **Practice Mode**: Study specific exam subtests (Numerical, Verbal, Analytical, Clerical, and General Info) with step-by-step solutions and explanations.
* **Full Exam Simulator**: A realistic simulation of the official Civil Service Exam with a 3-hour-10-minute timer, a question navigator grid, and review flagging options.
* **Daily Vocabulary Challenge**: A decoupled daily vocabulary digest quiz matching terms to keep synonyms and antonyms sharp.
* **Session Persistence**: Built-in automatic state recovery using browser standard `LocalStorage` so users never lose their practice quiz or exam simulation progress on page refreshes or accidental tab closures.
* **Performance Dashboard**: Real-time high-score tracking, streaks, vocabulary digests, and historical exam reviews.
* **Randomized Questions**: Leverages the Fisher-Yates shuffle algorithm to randomize questions within practice categories or mix them across the entire exam simulation, replicating the layout of the actual Civil Service Examination.

---

## Tech Stack

* **Structure & Layout**: Pure HTML5 & [Tailwind CSS](https://tailwindcss.com) (via CDN)
* **Logic & Engine**: Modern Vanilla JavaScript (ES6+)
* **Local Storage Layer**: Client-side state saving using standard browser `LocalStorage` API

---
