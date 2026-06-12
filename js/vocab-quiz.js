/**
 * Controller for the Daily Vocabulary Challenge quiz.
 */

const vocabQuizState = {
    currentDay: 1,
    currentQuestion: 0,
    score: 0,
    questions: [],
    selectedAnswer: null,
    isSubmitted: false,
    quizItemsCount: 5 // Configurable constant for vocabulary challenge question count
};

async function loadQuiz() {
    // Read vocabulary day from local storage, default to 1
    vocabQuizState.currentDay = load('cse_vocab_day', 1);
    
    // Update Day Indicator / Badge
    const dayBadge = document.getElementById('day-badge');
    if (dayBadge) {
        dayBadge.textContent = `Day ${vocabQuizState.currentDay} Quiz`;
    }
    const indicatorLabel = document.getElementById('question-index-label');
    if (indicatorLabel) {
        indicatorLabel.textContent = `Day ${vocabQuizState.currentDay}`;
    }

    const data = await fetchJSON('../data/vocab-quiz.json');
    if (data) {
        // Find questions for the current day
        const dayData = data.find(d => d.day === vocabQuizState.currentDay);
        if (dayData && dayData.questions && dayData.questions.length > 0) {
            // Shuffle and select questions
            const shuffled = shuffleArray([...dayData.questions]);
            const selectCount = Math.min(vocabQuizState.quizItemsCount, shuffled.length);
            vocabQuizState.questions = shuffled.slice(0, selectCount);
            
            vocabQuizState.currentQuestion = 0;
            vocabQuizState.score = 0;
            
            showQuestion();
        } else {
            showError("No quiz questions found for Day " + vocabQuizState.currentDay);
        }
    } else {
        showError("Failed to load vocabulary quiz data.");
    }
}

function showError(msg) {
    const cardBody = document.getElementById('quiz-card-body');
    if (cardBody) {
        cardBody.innerHTML = `
            <div class="text-center py-8 select-none">
                <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 animate-pulse">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"></path>
                    </svg>
                </div>
                <p class="text-slate-650 font-medium">${msg}</p>
                <a href="vocabulary.html" class="inline-block mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
                    Return to Vocabulary
                </a>
            </div>
        `;
    }
    const footer = document.getElementById('quiz-card-footer');
    if (footer) footer.classList.add('hidden');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuestion() {
    vocabQuizState.selectedAnswer = null;
    vocabQuizState.isSubmitted = false;
    
    const question = vocabQuizState.questions[vocabQuizState.currentQuestion];
    
    // Render question text
    document.getElementById('question-text').textContent = question.question;
    
    // Render Choices
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = `w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-450 hover:bg-slate-50/50 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-100`;
        choiceBtn.id = `choice-${index}`;
        choiceBtn.innerHTML = `
            <span class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 flex items-center justify-center font-semibold text-sm transition-colors border border-slate-200 select-none">
                ${String.fromCharCode(65 + index)}
            </span>
            <span class="text-slate-700 font-medium">${choice}</span>
        `;
        choiceBtn.addEventListener('click', () => selectAnswer(choice, index));
        container.appendChild(choiceBtn);
    });
    
    // Hide Explanation Box
    document.getElementById('explanation-box').classList.add('hidden');
    
    // Reset submit button
    const actionBtn = document.getElementById('action-btn');
    actionBtn.textContent = 'Submit Answer';
    actionBtn.disabled = true;
    actionBtn.className = 'w-full py-3.5 bg-slate-150 text-slate-400 font-semibold rounded-xl transition-all cursor-not-allowed';
    
    updateProgress();
}

function selectAnswer(choice, index) {
    if (vocabQuizState.isSubmitted) return;
    
    vocabQuizState.selectedAnswer = choice;
    
    // Reset other choices
    vocabQuizState.questions[vocabQuizState.currentQuestion].choices.forEach((_, idx) => {
        const btn = document.getElementById(`choice-${idx}`);
        const badge = btn.querySelector('span');
        btn.className = `w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-450 hover:bg-slate-50/50 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-100`;
        badge.className = `w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 flex items-center justify-center font-semibold text-sm transition-colors border border-slate-200 select-none`;
    });
    
    // Style selected choice using pastel purple/blue theme
    const selectedBtn = document.getElementById(`choice-${index}`);
    const selectedBadge = selectedBtn.querySelector('span');
    selectedBtn.className = `w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-200`;
    selectedBadge.className = `w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm transition-colors border border-blue-600 select-none`;
    
    // Enable Action Button
    const actionBtn = document.getElementById('action-btn');
    actionBtn.disabled = false;
    actionBtn.className = 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer';
}

function checkAnswer() {
    if (vocabQuizState.isSubmitted) return;
    vocabQuizState.isSubmitted = true;
    
    const question = vocabQuizState.questions[vocabQuizState.currentQuestion];
    const isCorrect = (vocabQuizState.selectedAnswer === question.answer);
    
    if (isCorrect) {
        vocabQuizState.score++;
        showToast("Correct! Great job.", "success");
    } else {
        showToast("Incorrect answer.", "error");
    }
    
    // Update choices display: correct = green (blue-purple), incorrect = red (rose), others = muted
    question.choices.forEach((choice, index) => {
        const btn = document.getElementById(`choice-${index}`);
        const badge = btn.querySelector('span');
        
        if (choice === question.answer) {
            // Correct choice (whether chosen or not) gets highlighted in blue-purple
            btn.className = `w-full text-left p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm border border-blue-600 select-none`;
        } else if (choice === vocabQuizState.selectedAnswer) {
            // Selected wrong choice gets highlighted in rose red
            btn.className = `w-full text-left p-4 rounded-xl border-2 border-rose-300 bg-rose-50/20 flex items-center space-x-3 transition-all duration-200 focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-semibold text-sm border border-rose-500 select-none`;
        } else {
            // Non-selected wrong choices get muted (class='cursor-not-allowed')
            btn.className = `w-full text-left p-4 rounded-xl border border-slate-100 flex items-center space-x-3 opacity-60 cursor-not-allowed focus:outline-none`;
            badge.className = `w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-semibold text-sm border border-slate-200 select-none`;
        }
    });
    
    // Show Explanation
    const explanationBox = document.getElementById('explanation-box');
    const explanationText = document.getElementById('explanation-text');
    if (explanationBox && explanationText) {
        explanationText.textContent = question.explanation;
        explanationBox.classList.remove('hidden');
    }
    
    // Update Action Button
    const actionBtn = document.getElementById('action-btn');
    const isLast = (vocabQuizState.currentQuestion === vocabQuizState.questions.length - 1);
    actionBtn.textContent = isLast ? 'Finish Quiz' : 'Next Question';
    actionBtn.className = 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer';
}

function nextQuestion() {
    if (vocabQuizState.currentQuestion < vocabQuizState.questions.length - 1) {
        vocabQuizState.currentQuestion++;
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    // Save streak bonus on quiz completion
    const streak = load('cse_streak', 1);
    save('cse_streak', streak + 1);

    // Render completion UI
    const cardBody = document.getElementById('quiz-card-body');
    const cardFooter = document.getElementById('quiz-card-footer');
    const completionPanel = document.getElementById('quiz-completion-panel');
    
    if (cardBody) cardBody.classList.add('hidden');
    if (cardFooter) cardFooter.classList.add('hidden');
    
    const percentage = Math.round((vocabQuizState.score / vocabQuizState.questions.length) * 100);
    
    if (completionPanel) {
        completionPanel.classList.remove('hidden');
        completionPanel.innerHTML = `
            <div class="text-center py-8 select-none animate-fade-in">
                <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-bounce">
                    <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">Challenge Completed!</h3>
                <p class="text-slate-500 mb-6 max-w-sm mx-auto">You've finished Day ${vocabQuizState.currentDay} Vocabulary Challenge.</p>
                
                <div class="inline-flex flex-col items-center bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-8">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Score</span>
                    <span class="text-4xl font-extrabold text-blue-600">${vocabQuizState.score} / ${vocabQuizState.questions.length}</span>
                    <span class="text-sm font-medium text-emerald-600 mt-1">${percentage}% Score</span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <button onclick="restartQuiz()" class="py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-all cursor-pointer">
                        Retake Quiz
                    </button>
                    <a href="vocabulary.html" class="py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center shadow-md shadow-blue-100 transition-all cursor-pointer">
                        Back to Vocabulary
                    </a>
                </div>
            </div>
        `;
    }
}

function restartQuiz() {
    const cardBody = document.getElementById('quiz-card-body');
    const cardFooter = document.getElementById('quiz-card-footer');
    const completionPanel = document.getElementById('quiz-completion-panel');
    
    if (completionPanel) completionPanel.classList.add('hidden');
    if (cardBody) cardBody.classList.remove('hidden');
    if (cardFooter) cardFooter.classList.remove('hidden');
    
    loadQuiz();
}

function updateProgress() {
    const total = vocabQuizState.questions.length;
    const current = vocabQuizState.currentQuestion + 1;
    
    const progText = document.getElementById('progress-text');
    if (progText) progText.textContent = `Question ${current} of ${total}`;
    
    const indexLabel = document.getElementById('question-index-label');
    if (indexLabel) indexLabel.textContent = `Question ${current}`;
    
    const progBar = document.getElementById('progress-bar');
    if (progBar) {
        const percent = (current / total) * 100;
        progBar.style.width = `${percent}%`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuiz();
    
    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (!vocabQuizState.isSubmitted) {
                checkAnswer();
            } else {
                nextQuestion();
            }
        });
    }
});
