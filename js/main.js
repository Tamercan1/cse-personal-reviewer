function initDefaultData() {
    if (localStorage.getItem('cse_streak') === null) {
        save('cse_streak', 1);
    }
    if (localStorage.getItem('cse_vocab_day') === null) {
        save('cse_vocab_day', 1);
    }
    if (localStorage.getItem('cse_best_scores') === null) {
        save('cse_best_scores', {
            'Numerical': 0,
            'Verbal': 0,
            'Analytical': 0,
            'Clerical': 0,
            'General Information': 0
        });
    }
    if (localStorage.getItem('cse_mastered_words') === null) {
        // Default mastered words list (e.g. Pragmatic, Diligence)
        save('cse_mastered_words', []);
    }
    if (localStorage.getItem('cse_exam_history') === null) {
        save('cse_exam_history', []);
    }
}

// Function to update the home page stats UI
async function updateHomeUI() {
    // 1. Calculate Exam High Score
    const history = load('cse_exam_history', []);
    let maxPercentage = 0;
    let maxRatio = "0 / 0";
    
    if (history.length > 0) {
        history.forEach(item => {
            if (item.percentage > maxPercentage) {
                maxPercentage = item.percentage;
                maxRatio = `${item.score} / ${item.total}`;
            }
        });
    }
    
    const highScoreEl = document.getElementById('stat-high-score');
    if (highScoreEl) {
        if (maxPercentage > 0) {
            highScoreEl.textContent = `${maxPercentage}% (${maxRatio})`;
        } else {
            highScoreEl.textContent = `0% (0 / ${limits.EXAM_LIMIT})`;
        }
    }
    
    // 2. Calculate Vocabulary Progress
    const masteredWords = load('cse_mastered_words', []);
    let totalWordsCount = 0;
    const vocabData = await fetchJSON('data/vocabulary.json');
    if (vocabData) {
        vocabData.forEach(day => {
            if (day.words) {
                totalWordsCount += day.words.length;
            }
        });
    }
    
    const vocabProgressEl = document.getElementById('stat-vocab-progress');
    if (vocabProgressEl) {
        vocabProgressEl.textContent = `${masteredWords.length} / ${totalWordsCount} Mastered`;
    }
    
    // 3. Best Practice Score (kept as is)
    const bestScores = load('cse_best_scores', {});
    let bestScore = 0;
    let bestCategory = 'None';
    for (const [category, score] of Object.entries(bestScores)) {
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }
    
    const bestScoreEl = document.getElementById('stat-best-score');
    if (bestScoreEl) {
        if (bestScore > 0) {
            bestScoreEl.textContent = `${bestScore}% (${bestCategory})`;
        } else {
            bestScoreEl.textContent = '0%';
        }
    }
    
    // Render recent activity history list
    const historyList = document.getElementById('recent-activity-list');
    if (historyList) {
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center py-6 text-slate-450 text-sm select-none">
                    No recent exam simulations completed yet.
                </div>
            `;
        } else {
            historyList.innerHTML = history.map(item => `
                <div class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    <div>
                        <p class="font-semibold text-slate-700 text-sm">Exam Simulation</p>
                        <p class="text-[11px] text-slate-400 font-medium">${item.date}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm ${item.passed ? 'text-emerald-600' : 'text-slate-655'}">${item.score}/${item.total} (${item.percentage}%)</p>
                        <span class="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${item.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
                            ${item.passed ? 'PASSED' : 'PRACTICED'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Dev function to clear stats and reload
function resetReviewerProgress() {
    if (confirm("Are you sure you want to reset all your study progress? This will reset streaks, vocabulary days, and scores.")) {
        clear();
        initDefaultData();
        updateHomeUI();
        if (typeof renderNavbar === 'function') renderNavbar();
        showToast("Progress has been successfully reset!", "success");
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDefaultData();
    updateHomeUI();
    
    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetReviewerProgress);
    }
});
