const limits = {
    EXAM_LIMIT: 40,
    TIME_LIMIT: 11400,
    numerical: 45,
    verbal: 45,
    analytical: 45,
    clerical: 15,
    genInfo: 20
}

const examState = {
    questions: [],
    selectedAnswers: [],
    markedForReview: [],
    currentQuestion: 0,
    timeRemaining: limits.TIME_LIMIT,
    finished: false
};

const categoryLabels = {
    'num': 'Numerical Reasoning',
    'verb': 'Verbal Reasoning',
    'anal': 'Analytical Reasoning',
    'cler': 'Clerical Ability',
    'gen': 'General Information'
};

function saveExamProgress() {
    if (examState.finished || examState.questions.length === 0) return;
    
    let score = 0;
    examState.questions.forEach((q, idx) => {
        if (examState.selectedAnswers[idx] === q.answer) {
            score++;
        }
    });

    const progress = {
        currentQuestion: examState.currentQuestion,
        score: score,
        selectedAnswers: examState.selectedAnswers,
        timeRemaining: examState.timeRemaining,
        markedForReview: examState.markedForReview,
        status: 'in-progress',
        questionIds: examState.questions.map(q => q.id)
    };
    save('cse_exam_progress', progress);
}

function disableExamInteraction() {
    const choices = document.querySelectorAll('#choices-container button');
    choices.forEach(btn => btn.disabled = true);

    const prevBtn = document.getElementById('prev-question-btn');
    const nextBtn = document.getElementById('next-question-btn');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    const flagBtn = document.getElementById('flag-review-btn');
    if (flagBtn) flagBtn.disabled = true;

    const submitBtn = document.getElementById('submit-exam-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const gridBtns = document.querySelectorAll('#question-grid button');
    gridBtns.forEach(btn => btn.disabled = true);
}

function enableExamInteraction() {
    const submitBtn = document.getElementById('submit-exam-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    const flagBtn = document.getElementById('flag-review-btn');
    if (flagBtn) {
        flagBtn.disabled = false;
    }
}

function resumeExam(savedState) {
    const resumeCard = document.getElementById('resume-card');
    if (resumeCard) resumeCard.classList.add('hidden');

    enableExamInteraction();

    examState.selectedAnswers = savedState.selectedAnswers || Array(examState.questions.length).fill(null);
    examState.markedForReview = savedState.markedForReview || Array(examState.questions.length).fill(false);
    examState.currentQuestion = savedState.currentQuestion || 0;
    examState.timeRemaining = savedState.timeRemaining;

    renderGrid();
    showQuestion(examState.currentQuestion);

    startTimer(
        examState.timeRemaining,
        (remaining) => {
            examState.timeRemaining = remaining;
            const timerEl = document.getElementById('exam-timer');
            if (timerEl) {
                timerEl.textContent = formatTimer(remaining);
                if (remaining <= 600) {
                    timerEl.className = "text-xl font-bold font-mono text-rose-600 animate-pulse";
                } else {
                    timerEl.className = "text-xl font-bold font-mono text-slate-700";
                }
            }
            saveExamProgress();
        },
        () => {
            showToast("Time is up! Submitting exam automatically.", "error");
            submitExam(true);
        }
    );

    saveExamProgress();
}

function startOverExam() {
    localStorage.removeItem('cse_exam_progress');
    const resumeCard = document.getElementById('resume-card');
    if (resumeCard) resumeCard.classList.add('hidden');

    enableExamInteraction();

    examState.currentQuestion = 0;
    examState.timeRemaining = limits.TIME_LIMIT;

    loadExam();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadExam() {
    // Show loading indicator
    const container = document.getElementById('exam-container');
    if (container) {
        container.classList.add('opacity-50');
    }

    // Load all JSON data in parallel
    const files = [
        { cat: 'Numerical', url: '../data/numerical.json' },
        { cat: 'Verbal', url: '../data/verbal.json' },
        { cat: 'Analytical', url: '../data/analytical.json' },
        { cat: 'Clerical', url: '../data/clerical.json' },
        { cat: 'General Information', url: '../data/gen-info.json' }
    ];

    try {
        const results = await Promise.all(files.map(f => fetchJSON(f.url)));

        // Flatten questions and inject category tag
        let allQuestions = [];
        results.forEach((qList, index) => {
            if (qList) {
                const categoryName = files[index].cat;
                qList.forEach(q => {
                    allQuestions.push({...q, category: categoryName});
                });
            }
        });
        
        if (container) {
            container.classList.remove('opacity-50');
        }

        if (allQuestions.length > 0) {
            const savedState = load('cse_exam_progress', null);

            // check if exam previously in progress
            if (savedState && savedState.status === 'in-progress') {
                const resumeCard = document.getElementById('resume-card');
                const timeEl = document.getElementById('resume-time-left');
                if (timeEl) timeEl.textContent = formatTimer(savedState.timeRemaining);
                if (resumeCard) resumeCard.classList.remove('hidden');

                // Reorder questions to match savedState.questionIds if available
                if (savedState.questionIds && Array.isArray(savedState.questionIds)) {
                    const questionMap = {};
                    allQuestions.forEach(q => {
                        questionMap[q.id] = q;
                    });
                    const reorderedQuestions = [];
                    savedState.questionIds.forEach(id => {
                        if (questionMap[id]) {
                            reorderedQuestions.push(questionMap[id]);
                        }
                    });
                    examState.questions = reorderedQuestions;
                } else {
                    examState.questions = allQuestions.slice(0, limits.EXAM_LIMIT);
                }

                examState.selectedAnswers = savedState.selectedAnswers || Array(examState.questions.length).fill(null);
                examState.markedForReview = savedState.markedForReview || Array(examState.questions.length).fill(false);
                examState.currentQuestion = savedState.currentQuestion || 0;
                examState.timeRemaining = savedState.timeRemaining;

                const resumeBtn = document.getElementById('resume-btn');
                if (resumeBtn) {
                    resumeBtn.onclick = () => resumeExam(savedState);
                }
                const startOverBtn = document.getElementById('start-over-btn');
                if (startOverBtn) {
                    startOverBtn.onclick = () => startOverExam();
                }

                renderGrid();
                showQuestion(examState.currentQuestion);

                const timerEl = document.getElementById('exam-timer');
                if (timerEl) {
                    timerEl.textContent = formatTimer(examState.timeRemaining);
                }

                disableExamInteraction();
            } 
            // else just shuffle question and start exam
            else {
                // Group questions by category to slice and shuffle individually
                const categoriesMap = {
                    'Numerical': [],
                    'Verbal': [],
                    'Analytical': [],
                    'Clerical': [],
                    'General Information': []
                };
                allQuestions.forEach(q => {
                    if (categoriesMap[q.category]) {
                        categoriesMap[q.category].push(q);
                    }
                });

                // Shuffle and slice each category's database pool
                let selectedQuestions = [];
                
                shuffleArray(categoriesMap['Numerical']);
                selectedQuestions = selectedQuestions.concat(categoriesMap['Numerical'].slice(0, limits.numerical));
                
                shuffleArray(categoriesMap['Verbal']);
                selectedQuestions = selectedQuestions.concat(categoriesMap['Verbal'].slice(0, limits.verbal));
                
                shuffleArray(categoriesMap['Analytical']);
                selectedQuestions = selectedQuestions.concat(categoriesMap['Analytical'].slice(0, limits.analytical));
                
                shuffleArray(categoriesMap['Clerical']);
                selectedQuestions = selectedQuestions.concat(categoriesMap['Clerical'].slice(0, limits.clerical));
                
                shuffleArray(categoriesMap['General Information']);
                selectedQuestions = selectedQuestions.concat(categoriesMap['General Information'].slice(0, limits.genInfo));

                // Shuffle the combined questions so categories are mixed randomly
                shuffleArray(selectedQuestions);
                
                // Limit the total count to EXAM_LIMIT
                examState.questions = selectedQuestions.slice(0, limits.EXAM_LIMIT);

                examState.selectedAnswers = Array(examState.questions.length).fill(null);
                examState.markedForReview = Array(examState.questions.length).fill(false);
                initExamUI();
            }
        } else {
            document.getElementById('exam-card-body').innerHTML = `
                <div class="text-center py-12 text-rose-500 font-semibold">
                    Failed to load exam questions. Please verify data files.
                </div>
            `;
        }
    } catch (e) {
        console.error("Error setting up exam simulation:", e);
    }
}

function initExamUI() {
    renderGrid();
    showQuestion(examState.currentQuestion);
    
    // Start count down
    startTimer(
        examState.timeRemaining,
        // Tick callback
        (remaining) => {
            examState.timeRemaining = remaining;
            const timerEl = document.getElementById('exam-timer');
            if (timerEl) {
                timerEl.textContent = formatTimer(remaining);
                // Warning state under 10 minutes (600 seconds)
                if (remaining <= 600) {
                    timerEl.className = "text-xl font-bold font-mono text-rose-600 animate-pulse";
                } else {
                    timerEl.className = "text-xl font-bold font-mono text-slate-700";
                }
            }
            saveExamProgress(); // save exam timer progress
        },
        // Finished callback
        () => {
            showToast("Time is up! Submitting exam automatically.", "error");
            submitExam(true); // Forced submission
        }
    );
}

// For question sheet
function renderGrid() {
    const gridContainer = document.getElementById('question-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    for (let i = 0; i < examState.questions.length; i++) {
        const btn = document.createElement('button');
        btn.id = `grid-btn-${i}`;
        
        updateGridBtnClass(btn, i);
        
        // show q number and mark if flagged
        btn.innerHTML = `
            <span>${i + 1}</span>
            <svg id="grid-flag-${i}" class="w-2.5 h-2.5 text-amber-500 absolute top-0.5 right-0.5 fill-current ${examState.markedForReview[i] ? '' : 'hidden'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
            </svg>
        `;
        
        btn.addEventListener('click', () => {
            showQuestion(i);
        });
        
        gridContainer.appendChild(btn);
    }
}

function updateGridBtnClass(btn, index) {
    const isCurrent = (index === examState.currentQuestion);
    const isAnswered = (examState.selectedAnswers[index] !== null);
    const isFlagged = examState.markedForReview[index];
    
    let baseClass = "relative w-10 h-10 rounded-xl font-semibold text-sm transition-all focus:outline-none flex items-center justify-center border ";
    
    if (isCurrent) {
        // High visibility blue border/outline
        baseClass += "border-blue-600 ring-2 ring-blue-100 bg-blue-50 text-blue-700";
    } else if (isFlagged) {
        // Soft yellow highlighting for review flag
        baseClass += "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100";
    } else if (isAnswered) {
        // Answered question
        baseClass += "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200/70";
    } else {
        // Unanswered question
        baseClass += "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600";
    }
    
    btn.className = baseClass;
}

function scrollContainerToElement(container, element) {
    if (!container || !element) return;
    
    const containerRect = container.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();
    
    let newScrollTop = container.scrollTop;
    
    if (elemRect.top < containerRect.top) {
        // Scroll up to reveal the hidden top of the button
        newScrollTop -= (containerRect.top - elemRect.top);
    } else if (elemRect.bottom > containerRect.bottom) {
        // Scroll down to reveal the hidden bottom of the button
        newScrollTop += (elemRect.bottom - containerRect.bottom);
    }
    
    if (newScrollTop !== container.scrollTop) {
        container.scrollTo({
            top: newScrollTop,
            behavior: 'smooth'
        });
    }
}

function showQuestion(index) {
    // Save current active index
    const prevActive = examState.currentQuestion;
    examState.currentQuestion = index;
    
    // Update old and new button colors in navigation grid
    const oldBtn = document.getElementById(`grid-btn-${prevActive}`);
    const newBtn = document.getElementById(`grid-btn-${index}`);
    if (oldBtn) updateGridBtnClass(oldBtn, prevActive);
    if (newBtn) {
        updateGridBtnClass(newBtn, index);
        // Automatically scroll the active question button into view inside the scrollable container
        // using container-only scrolling to prevent the outer window from jumping on mobile
        const scrollContainer = newBtn.closest('.overflow-y-auto');
        scrollContainerToElement(scrollContainer, newBtn);
    }
    
    const question = examState.questions[index];
    
    // Update labels
    const categoryEl = document.getElementById('question-category');
    const questionNumEl = document.getElementById('question-number');
    
    if (categoryEl) categoryEl.textContent = question.category;
    if (questionNumEl) questionNumEl.textContent = `Question ${index + 1} of ${examState.questions.length}`;
    
    // Set question text
    document.getElementById('question-text').textContent = question.question;
    
    // Render Choices
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    question.choices.forEach((choice, idx) => {
        const isSelected = (examState.selectedAnswers[index] === choice);
        
        // Create and Style each button
        const btn = document.createElement('button');
        btn.id = `choice-${idx}`;
        
        // For styling coice if previously selected or not
        if (isSelected) {
            btn.className = "w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 group focus:outline-none";
        } else {
            btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-100";
        }
        
        // For badge => A,B,C,D and Displaying Choice
        btn.innerHTML = `
            <span class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors border select-none ${
                isSelected 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 border-slate-200'
            }">
                ${String.fromCharCode(65 + idx)}
            </span>
            <span class="text-slate-700 font-medium">${choice}</span>
        `;
        
        btn.addEventListener('click', () => {
            selectAnswer(choice, idx);
        });
        
        // Finally, add each button to the container
        choicesContainer.appendChild(btn);
    });
    
    // Update flag review state checkbox
    const flagCheckbox = document.getElementById('flag-review-btn');
    if (flagCheckbox) {
        const isFlagged = examState.markedForReview[index];
        if (isFlagged) {
            flagCheckbox.className = "flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold transition-all cursor-pointer hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 select-none";
            flagCheckbox.innerHTML = `
                <svg class="w-4 h-4 text-amber-600 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
                </svg>
                <span>Flagged for Review</span>
            `;
        } else {
            flagCheckbox.className = "flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-slate-500 border border-slate-200 hover:border-amber-300 hover:text-amber-600 transition-all text-sm font-semibold transition-all cursor-pointer select-none";
            flagCheckbox.innerHTML = `
                <svg class="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
                </svg>
                <span>Flag for Review</span>
            `;
        }
    }
    
    // Enable/disable navigation buttons
    const prevBtn = document.getElementById('prev-question-btn');
    const nextBtn = document.getElementById('next-question-btn');
    
    if (prevBtn) {
        prevBtn.disabled = (index === 0); // true if index == 0
        prevBtn.className = index === 0 
            ? "px-4 py-2.5 bg-slate-50 text-slate-300 rounded-xl border border-slate-100 cursor-not-allowed text-sm font-semibold flex items-center space-x-1"
            : "px-4 py-2.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-semibold flex items-center space-x-1 cursor-pointer";
    }
    
    if (nextBtn) {
        if (index === examState.questions.length - 1) {
            nextBtn.disabled = false;
            nextBtn.innerHTML = `<span>Submit</span><span>&rarr;</span>`;
            nextBtn.className = "px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl border border-blue-600 text-sm font-semibold flex items-center space-x-1 cursor-pointer transition-all shadow-sm";
        } else {
            nextBtn.disabled = false;
            nextBtn.innerHTML = `<span>Next</span><span>&rarr;</span>`;
            nextBtn.className = "px-4 py-2.5 bg-white text-slate-655 rounded-xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-semibold flex items-center space-x-1 cursor-pointer";
        }
    }

    saveExamProgress();
}

function selectAnswer(choice, index) {
    const qIndex = examState.currentQuestion;
    examState.selectedAnswers[qIndex] = choice;
    
    // Update choices UI highlights
    examState.questions[qIndex].choices.forEach((_, idx) => {
        const btn = document.getElementById(`choice-${idx}`);
        const badge = btn.querySelector('span');
        const isSelected = (idx === index);
        
        if (isSelected) {
            btn.className = "w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 group focus:outline-none";
            badge.className = "w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm transition-colors border border-blue-600 select-none";
        } else {
            btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-100";
            badge.className = "w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 flex items-center justify-center font-semibold text-sm transition-colors border border-slate-200 select-none";
        }
    });
    
    // Update navigation grid item state
    const gridBtn = document.getElementById(`grid-btn-${qIndex}`);
    if (gridBtn) updateGridBtnClass(gridBtn, qIndex);

    saveExamProgress();
}

function toggleFlag() {
    const qIndex = examState.currentQuestion;
    
    // toggling logic true <=> false
    examState.markedForReview[qIndex] = !examState.markedForReview[qIndex];
    
    // Update flag icon in grid
    const flagSpan = document.getElementById(`grid-flag-${qIndex}`);
    if (flagSpan) {
        if (examState.markedForReview[qIndex]) {
            flagSpan.classList.remove('hidden');
        } else {
            flagSpan.classList.add('hidden');
        }
    }
    
    // Update buttons
    showQuestion(qIndex);
}

function confirmSubmit() {
    // Calculate counts
    let answeredCount = 0;
    let flaggedCount = 0;
    
    for (let i = 0; i < examState.questions.length; i++) {
        if (examState.selectedAnswers[i] !== null) answeredCount++;
        if (examState.markedForReview[i]) flaggedCount++;
    }
    
    const unansweredCount = examState.questions.length - answeredCount;
    
    // Render stats inside confirmation modal
    document.getElementById('modal-answered').textContent = answeredCount;
    document.getElementById('modal-unanswered').textContent = unansweredCount;
    document.getElementById('modal-flagged').textContent = flaggedCount;
    
    // Show Modal
    const modal = document.getElementById('submit-confirm-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeSubmitModal() {
    const modal = document.getElementById('submit-confirm-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function submitExam(force = false) {
    if (examState.finished) return;
    examState.finished = true;
    
    stopTimer();
    localStorage.removeItem('cse_exam_progress');
    
    // Close modal
    closeSubmitModal();
    
    // Compile and calculate results
    let totalQuestions = examState.questions.length;
    let score = 0;
    
    // Group breakdowns
    const categoryStats = {
        'Numerical': { correct: 0, total: 0 },
        'Verbal': { correct: 0, total: 0 },
        'Analytical': { correct: 0, total: 0 },
        'Clerical': { correct: 0, total: 0 },
        'General Information': { correct: 0, total: 0 }
    };
    
    const questionsLog = [];
    
    for (let i = 0; i < totalQuestions; i++) {
        const q = examState.questions[i];
        const userAns = examState.selectedAnswers[i];
        const isCorrect = (userAns === q.answer);
        
        categoryStats[q.category].total++;
        if (isCorrect) {
            score++;
            categoryStats[q.category].correct++;
        }
        
        questionsLog.push({
            question: q.question,
            category: q.category,
            choices: q.choices,
            correctAnswer: q.answer,
            userAnswer: userAns,
            explanation: q.explanation,
            isCorrect: isCorrect
        });
    }
    
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 80; // Passing score threshold
    
    // Create exam payload
    const examResult = {
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        score: score,
        total: totalQuestions,
        percentage: percentage,
        passed: passed, // can be true or false
        timeSpent: 9000 - examState.timeRemaining, // seconds
        categoryStats: categoryStats,
        questionsLog: questionsLog
    };
    
    // Save to localStorage
    save('cse_last_exam_result', examResult);
    
    // Save to historical logs
    const history = load('cse_exam_history', []);
    history.unshift({
        date: examResult.date,
        score: examResult.score,
        total: examResult.total,
        percentage: examResult.percentage,
        passed: examResult.passed
    });
    // Keep max 5 history runs
    const fiveHisory = history.slice(0, 5);

    save('cse_exam_history', fiveHisory);
    
    // Increment streak as reward
    const streak = load('cse_streak', 1);
    save('cse_streak', streak + 1);
    
    // Redirect to results dashboard
    window.location.href = 'dashboard.html';
}

function handleNavigation(direction) {
    let nextIndex = examState.currentQuestion;
    if (direction === 'prev' && examState.currentQuestion > 0) {
        nextIndex--;
    } else if (direction === 'next' && examState.currentQuestion < examState.questions.length - 1) {
        nextIndex++;
    }
    showQuestion(nextIndex);
}

// Hook up events
document.addEventListener('DOMContentLoaded', () => {
    loadExam();
    
    // Prev / Next button actions
    const prevBtn = document.getElementById('prev-question-btn');
    const nextBtn = document.getElementById('next-question-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => handleNavigation('prev'));
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (examState.currentQuestion === examState.questions.length - 1) {
                confirmSubmit();
            } else {
                handleNavigation('next');
            }
        });
    }
    
    // Flag check
    const flagBtn = document.getElementById('flag-review-btn');
    if (flagBtn) flagBtn.addEventListener('click', toggleFlag);
    
    // Submit actions
    const submitBtn = document.getElementById('submit-exam-btn');
    if (submitBtn) submitBtn.addEventListener('click', confirmSubmit);
    
    const modalConfirmBtn = document.getElementById('modal-confirm-submit');
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', () => submitExam(false));
    
    const modalCancelBtn = document.getElementById('modal-cancel-submit');
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeSubmitModal);
});
