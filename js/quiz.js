/**
 * Interactive controller for the Practice Quiz mode.
 */

const quizState = {
    category: "Numerical",
    currentQuestion: 0,
    score: 0,
    questions: [],
    selectedAnswer: null,
    isSubmitted: false
};

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
    quizState.isSubmitted = false;
    
    const file = categoryFiles[categoryName];
    const data = await fetchJSON(file);
    if (data) {
        quizState.questions = data;
        showQuestion();
        updateProgress();
        const cardCategory = document.getElementById('question-category');
        cardCategory.textContent = `${categoryName} Quiz`
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
    
    // Setup submit button
    const submitBtn = document.getElementById('action-btn');
    submitBtn.textContent = 'Submit Answer';
    submitBtn.disabled = true;
    submitBtn.className = 'w-full py-3.5 bg-slate-150 text-slate-400 font-semibold rounded-xl transition-all cursor-not-allowed';
    
    updateProgress();
}

function selectAnswer(choice, index) {
    if (quizState.isSubmitted) return;
    
    quizState.selectedAnswer = choice;
    
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
            btn.className = `w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm border border-emerald-600 select-none`;
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
    
    // Toggle action button to next
    const actionBtn = document.getElementById('action-btn');
    const isLast = (quizState.currentQuestion === quizState.questions.length - 1);
    actionBtn.textContent = isLast ? 'Finish Quiz' : 'Next Question';
    actionBtn.className = 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer';
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
    
    if (cardBody) {
        cardBody.innerHTML = `
            <div class="text-center py-8">
                <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner animate-bounce">
                    🎉
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h3>
                <p class="text-slate-500 mb-6 max-w-sm mx-auto">You've finished the practice quiz for <strong class="text-slate-700">${quizState.category}</strong>.</p>
                
                <div class="inline-flex flex-col items-center bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-8">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Score</span>
                    <span class="text-4xl font-extrabold text-blue-600">${quizState.score} / ${quizState.questions.length}</span>
                    <span class="text-sm font-medium text-emerald-600 mt-1">${percentage}% Score</span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <button onclick='restartCategory()' class="py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-all">
                        Retake Quiz
                    </button>
                    <a href="dashboard.html" class="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center shadow-md shadow-blue-100 transition-all">
                        View Results Dashboard
                    </a>
                </div>
            </div>
        `;
    }
    
    if (cardFooter) {
        cardFooter.classList.add('hidden');
    }
}

function restartCategory() {
    startCategory(quizState.category);
    const cardFooter = document.getElementById('quiz-card-footer');
    if (cardFooter) cardFooter.classList.remove('hidden');
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
                tabs.forEach(t => {
                    t.className = "category-tab w-full text-left px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 font-medium flex justify-between items-center transition-all";
                });
                
                e.currentTarget.className = "category-tab w-full text-left px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-700 font-semibold flex justify-between items-center transition-all shadow-sm";
                
                const cat = e.currentTarget.getAttribute('data-category');
                startCategory(cat);
            });
        }); 
        
        startCategory("Numerical");
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