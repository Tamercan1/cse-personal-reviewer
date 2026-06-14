const QUIZ_LIMIT = 25; 

const quizState = {
    category: "Numerical",
    currentQuestion: 0,
    score: 0,
    questions: [],
    selectedAnswer: null,
    selectedAnswers: [],
    isSubmitted: false
};

const categoryDisplayNames = {
    'Numerical': 'Numerical Reasoning',
    'Verbal': 'Verbal Reasoning',
    'Analytical': 'Analytical Reasoning',
    'Clerical': 'Clerical Ability',
    'General Information': 'General Information'
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveQuizProgress() {
    if (quizState.questions.length === 0) return;
    const progress = {
        category: quizState.category,
        currentQuestion: quizState.currentQuestion,
        score: quizState.score,
        selectedAnswer: quizState.selectedAnswer,
        selectedAnswers: quizState.selectedAnswers,
        isSubmitted: quizState.isSubmitted,
        questions: quizState.questions,
        status: 'in-progress'
    };
    save('cse_quiz_progress', progress);
}

function disableQuizInteraction() {
    const choices = document.querySelectorAll('#choices-container button');
    choices.forEach(btn => btn.disabled = true);

    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.className = 'w-full py-3.5 bg-slate-100 text-slate-400 font-semibold rounded-xl transition-all cursor-not-allowed';
    }
}

function enableQuizInteraction() {
    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        actionBtn.disabled = false;
    }
}

function resumeQuiz(savedState) {
    quizState.category = savedState.category;
    quizState.currentQuestion = savedState.currentQuestion;
    quizState.score = savedState.score;
    quizState.questions = savedState.questions;
    quizState.selectedAnswer = savedState.selectedAnswer;
    quizState.selectedAnswers = savedState.selectedAnswers || [];
    quizState.isSubmitted = savedState.isSubmitted;

    const resumeCard = document.getElementById('resume-card');
    if (resumeCard) resumeCard.classList.add('hidden');

    enableQuizInteraction();

    const cardCategory = document.getElementById('question-category');
    if (cardCategory) {
        cardCategory.textContent = `${quizState.category} Quiz`;
    }

    if (quizState.isSubmitted) {
        renderCheckedQuestion();
    } else {
        showQuestion();
        if (quizState.selectedAnswer !== null) {
            const index = quizState.questions[quizState.currentQuestion].choices.indexOf(quizState.selectedAnswer);
            if (index !== -1) {
                selectAnswer(quizState.selectedAnswer, index);
            }
        }
    }
    updateProgress();
}

function startOverQuiz() {
    localStorage.removeItem('cse_quiz_progress');
    const resumeCard = document.getElementById('resume-card');
    if (resumeCard) resumeCard.classList.add('hidden');
    enableQuizInteraction();
    startCategory(quizState.category || "Numerical");
}

function renderCheckedQuestion() {
    const qIndex = quizState.currentQuestion;
    const question = quizState.questions[qIndex];
    
    document.getElementById('question-text').textContent = question.question;
    
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = `w-full text-left p-4 rounded-xl border border-slate-200 flex items-center space-x-3 focus:outline-none`;
        choiceBtn.id = `choice-${index}`;
        
        if (choice === question.answer) {
            choiceBtn.className = `w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            choiceBtn.innerHTML = `
                <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm border border-blue-600 select-none">
                    ${String.fromCharCode(65 + index)}
                </span>
                <span class="text-slate-700 font-medium">${choice}</span>
            `;
        } else if (choice === quizState.selectedAnswer) {
            choiceBtn.className = `w-full text-left p-4 rounded-xl border-2 border-rose-300 bg-rose-50/20 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            choiceBtn.innerHTML = `
                <span class="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-semibold text-sm border border-rose-500 select-none">
                    ${String.fromCharCode(65 + index)}
                </span>
                <span class="text-slate-700 font-medium">${choice}</span>
            `;
        } else {
            choiceBtn.className = `w-full text-left p-4 rounded-xl border border-slate-100 flex items-center space-x-3 opacity-60 cursor-not-allowed focus:outline-none`;
            choiceBtn.innerHTML = `
                <span class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-semibold text-sm border border-slate-200 select-none">
                    ${String.fromCharCode(65 + index)}
                </span>
                <span class="text-slate-700 font-medium">${choice}</span>
            `;
        }
        choicesContainer.appendChild(choiceBtn);
    });
    
    const expBox = document.getElementById('explanation-box');
    const expText = document.getElementById('explanation-text');
    if (expBox && expText) {
        expText.textContent = question.explanation;
        expBox.classList.remove('hidden');
    }
    
    const expBoxDesktop = document.getElementById('explanation-box-desktop');
    const expTextDesktop = document.getElementById('explanation-text-desktop');
    if (expBoxDesktop && expTextDesktop) {
        expTextDesktop.textContent = question.explanation;
        expBoxDesktop.classList.remove('hidden');
    }
    
    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        const isLast = (qIndex === quizState.questions.length - 1);
        actionBtn.textContent = isLast ? 'Finish Quiz' : 'Next Question';
        actionBtn.className = 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer';
    }
}

const categoryFiles = {
    'Numerical': '../data/numerical.json',
    'Verbal': '../data/verbal.json',
    'Analytical': '../data/analytical.json',
    'Clerical': '../data/clerical.json',
    'General Information': '../data/gen-info.json'
};

async function startCategory(categoryName) {
    quizState.category = categoryName;
    quizState.currentQuestion = 0;
    quizState.score = 0;
    quizState.selectedAnswer = null;
    quizState.selectedAnswers = [];
    quizState.isSubmitted = false;
    
    const file = categoryFiles[categoryName];
    const data = await fetchJSON(file);
    if (data) {
        shuffleArray(data);
        quizState.questions = data.slice(0, QUIZ_LIMIT);
        showQuestion();
        updateProgress();
        const cardCategory = document.getElementById('question-category');
        cardCategory.textContent = `${categoryName} Quiz`;
        saveQuizProgress();
    } else {
        console.error("Failed to load questions for " + categoryName);
    }
}

function showQuestion() {
    quizState.selectedAnswer = null;
    quizState.isSubmitted = false;
    
    const qIndex = quizState.currentQuestion;
    const question = quizState.questions[qIndex];
    
    // Render question text
    document.getElementById('question-text').textContent = question.question;
    
    // Render answer options
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = `w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-100`;
        choiceBtn.id = `choice-${index}`;
        choiceBtn.innerHTML = `
            <span class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 flex items-center justify-center font-semibold text-sm transition-colors border border-slate-200 select-none">
                ${String.fromCharCode(65 + index)}
            </span>
            <span class="text-slate-700 font-medium">${choice}</span>
        `;
        choiceBtn.addEventListener('click', () => selectAnswer(choice, index));
        choicesContainer.appendChild(choiceBtn);
    });
    
    // Hide explanation box
    document.getElementById('explanation-box').classList.add('hidden');
    const expBoxDesktop = document.getElementById('explanation-box-desktop');
    if (expBoxDesktop) expBoxDesktop.classList.add('hidden');
    
    // Setup submit button
    const submitBtn = document.getElementById('action-btn');
    submitBtn.textContent = 'Submit Answer';
    submitBtn.disabled = true;
    submitBtn.className = 'w-full py-3.5 bg-slate-150 text-slate-400 font-semibold rounded-xl transition-all cursor-not-allowed';
    
    updateProgress();
    saveQuizProgress();
}

function selectAnswer(choice, index) {
    if (quizState.isSubmitted) return;
    
    quizState.selectedAnswer = choice;
    quizState.selectedAnswers[quizState.currentQuestion] = choice;
    
    // Reset choices styling
    quizState.questions[quizState.currentQuestion].choices.forEach((_, idx) => {
        const btn = document.getElementById(`choice-${idx}`);
        const badge = btn.querySelector('span');
        btn.className = `w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-100`;
        badge.className = `w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 flex items-center justify-center font-semibold text-sm transition-colors border border-slate-200 select-none`;
    });
    
    // Apply selected styling
    const selectedBtn = document.getElementById(`choice-${index}`);
    const selectedBadge = selectedBtn.querySelector('span');
    selectedBtn.className = `w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-200`;
    selectedBadge.className = `w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm transition-colors border border-blue-600 select-none`;
    
    // Enable submit button
    const submitBtn = document.getElementById('action-btn');
    submitBtn.disabled = false;
    submitBtn.className = 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer';
    
    saveQuizProgress();
}

function checkAnswer() {
    if (quizState.isSubmitted) return;
    quizState.isSubmitted = true;
    
    const question = quizState.questions[quizState.currentQuestion];
    const isCorrect = (quizState.selectedAnswer === question.answer);
    
    if (isCorrect) {
        quizState.score++;
        showToast("Correct! Great job.", "success");
    } else {
        showToast("Incorrect answer.", "error");
    }
    
    // Update choices UI to show correct/incorrect
    question.choices.forEach((choice, index) => {
        const btn = document.getElementById(`choice-${index}`);
        const badge = btn.querySelector('span'); // => A,B,C,D
        
        // if correct => green
        if (choice === question.answer) {
            btn.className = `w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm border border-blue-600 select-none`;
        }
        // if wrong => red
        else if (choice === quizState.selectedAnswer) {
            btn.className = `w-full text-left p-4 rounded-xl border-2 border-rose-300 bg-rose-50/20 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-semibold text-sm border border-rose-500 select-none`;
        } 
        // everything => grey
        else {
            btn.className = `w-full text-left p-4 rounded-xl border border-slate-100 flex items-center space-x-3 opacity-60 cursor-not-allowed focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-semibold text-sm border border-slate-200 select-none`;
        }
    });
    
    // Show explanation box
    const expBox = document.getElementById('explanation-box');
    const expText = document.getElementById('explanation-text');
    expText.textContent = question.explanation;
    expBox.classList.remove('hidden');
    
    // Show desktop explanation box if it exists
    const expBoxDesktop = document.getElementById('explanation-box-desktop');
    const expTextDesktop = document.getElementById('explanation-text-desktop');
    if (expBoxDesktop && expTextDesktop) {
        expTextDesktop.textContent = question.explanation;
        expBoxDesktop.classList.remove('hidden');
    }
    
    
    // Toggle action button to next
    const actionBtn = document.getElementById('action-btn');
    const isLast = (quizState.currentQuestion === quizState.questions.length - 1);
    actionBtn.textContent = isLast ? 'Finish Quiz' : 'Next Question';
    actionBtn.className = 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer';

    saveQuizProgress();
}

function nextQuestion() {
    if (quizState.currentQuestion < quizState.questions.length - 1) {
        quizState.currentQuestion++;
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    localStorage.removeItem('cse_quiz_progress');
    const bestScores = load('cse_best_scores', {});
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    
    if (!bestScores[quizState.category] || percentage > bestScores[quizState.category]) {
        bestScores[quizState.category] = percentage;
        save('cse_best_scores', bestScores);
    }
    
    const streak = load('cse_streak', 1);
    save('cse_streak', streak + 1);
    
    const cardBody = document.getElementById('quiz-card-body');
    const cardFooter = document.getElementById('quiz-card-footer');
    const completionPanel = document.getElementById('quiz-completion-panel');
    
    if (cardBody) cardBody.classList.add('hidden');
    if (cardFooter) cardFooter.classList.add('hidden');
    
    if (completionPanel) {
        completionPanel.classList.remove('hidden');
        completionPanel.innerHTML = `
            <div class="text-center py-8 select-none">
                <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-bounce">
                    <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h3>
                <p class="text-slate-500 mb-6 max-w-sm mx-auto">You've finished the practice quiz for <strong class="text-slate-700">${quizState.category}</strong>.</p>
                
                <div class="inline-flex flex-col items-center bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-8">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Score</span>
                    <span class="text-4xl font-extrabold text-blue-600">${quizState.score} / ${quizState.questions.length}</span>
                    <span class="text-sm font-medium text-emerald-600 mt-1">${percentage}% Score</span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <button onclick="restartCategory()" class="py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-all cursor-pointer">
                        Retake Quiz
                    </button>
                    <button onclick="scrollToTop()" class="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center shadow-md shadow-blue-100 transition-all cursor-pointer">
                        Choose Category
                    </button>
                </div>
            </div>
        `;
    }
}

function scrollToTop(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
    restartCategory();
}

function restartCategory() {
    localStorage.removeItem('cse_quiz_progress');
    const cardBody = document.getElementById('quiz-card-body');
    const cardFooter = document.getElementById('quiz-card-footer');
    const completionPanel = document.getElementById('quiz-completion-panel');
    
    if (completionPanel) completionPanel.classList.add('hidden');
    if (cardBody) cardBody.classList.remove('hidden');
    if (cardFooter) cardFooter.classList.remove('hidden');
    
    startCategory(quizState.category);
}

function updateProgress() {
    const total = quizState.questions.length;
    const current = quizState.currentQuestion + 1;
    
    const progText = document.getElementById('progress-text');
    if (progText) progText.textContent = `Question ${current} of ${total}`;
    
    const progBar = document.getElementById('progress-bar');
    if (progBar) {
        const percent = (current / total) * 100;
        progBar.style.width = `${percent}%`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.category-tab');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                localStorage.removeItem('cse_quiz_progress');
                const resumeCard = document.getElementById('resume-card');
                if (resumeCard) resumeCard.classList.add('hidden');
                enableQuizInteraction();

                tabs.forEach(t => {
                    t.className = "category-tab w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 font-medium flex justify-between items-center transition-all";
                });
                
                e.currentTarget.className = "category-tab w-full text-left px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-700 font-semibold flex justify-between items-center transition-all shadow-sm";
                
                const cat = e.currentTarget.getAttribute('data-category');
                startCategory(cat);
                
                // Only scroll on mobile/tablet viewports (below the desktop lg breakpoint)
                if (window.innerWidth < 1024) {
                    const quizCard = document.getElementById('quiz-card');
                    if (quizCard) {
                        quizCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }); 
        
        const savedState = load('cse_quiz_progress', null);
        if (savedState && savedState.status === 'in-progress') {
            const resumeCard = document.getElementById('resume-card');
            const sessionDetails = document.getElementById('resume-session-details');
            if (sessionDetails) {
                sessionDetails.textContent = categoryDisplayNames[savedState.category] || savedState.category;
            }
            if (resumeCard) resumeCard.classList.remove('hidden');

            const resumeBtn = document.getElementById('resume-btn');
            if (resumeBtn) {
                resumeBtn.onclick = () => resumeQuiz(savedState);
            }
            const startOverBtn = document.getElementById('start-over-btn');
            if (startOverBtn) {
                startOverBtn.onclick = () => startOverQuiz();
            }

            tabs.forEach(t => {
                const cat = t.getAttribute('data-category');
                if (cat === savedState.category) {
                    t.className = "category-tab w-full text-left px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-700 font-semibold flex justify-between items-center transition-all shadow-sm";
                } else {
                    t.className = "category-tab w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 font-medium flex justify-between items-center transition-all";
                }
            });

            disableQuizInteraction();
        } else {
            startCategory("Numerical");
        }
    }
    
    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (!quizState.isSubmitted) {
                checkAnswer();
            } else {
                nextQuestion();
            }
        });
    }
});