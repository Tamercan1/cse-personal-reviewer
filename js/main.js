/**
 * Main module for the CSE Reviewer Home Page.
 */

// Initialize default data if it doesn't exist
function initDefaultData() {
    // 3 day streak default
    if (localStorage.getItem('cse_streak') === null) {
        save('cse_streak', 1);
    }
    // Vocab day 1 default
    if (localStorage.getItem('cse_vocab_day') === null) {
        save('cse_vocab_day', 1);
    }
    // Best practice scores defaults
    if (localStorage.getItem('cse_best_scores') === null) {
        save('cse_best_scores', {
            'Numerical': 80, // 4/5
            'Verbal': 100,    // 5/5
            'Analytical': 60, // 3/5
            'Clerical': 80,   // 4/5
            'General Information': 40 // 2/5
        });
    }
    // Completed words tracker
    if (localStorage.getItem('cse_mastered_words') === null) {
        save('cse_mastered_words', []);
    }
    // Previous exam history
    if (localStorage.getItem('cse_exam_history') === null) {
        save('cse_exam_history', [
            // { date: '2026-06-05', score: 20, total: 25, percentage: 80, passed: true },
            // { date: '2026-06-03', score: 18, total: 25, percentage: 72, passed: false }
        ]);
    }
}

// Function to update the home page stats UI
function updateHomeUI() {
    // get stats from localStorage
    const dailyStreak = load('cse_streak', 1);
    const vocabDay = load('cse_vocab_day', 1);
    const bestScores = load('cse_best_scores', {});
    
    // Find the highest practice score across all categories
    let bestScore = 0;
    let bestCategory = 'None';
    for (const [category, score] of Object.entries(bestScores)) {
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }
    
    // Update DOM elements if we are on the home page
    const dailyStreakEl = document.getElementById('daily-streak');
    const vocabDayEl = document.getElementById('stat-vocab-day');
    const bestScoreEl = document.getElementById('stat-best-score');

    // Daily Streak
    if (dailyStreakEl) dailyStreakEl.textContent = `${dailyStreak} Day`;
    
    if (vocabDayEl) vocabDayEl.textContent = `Day ${vocabDay}`;
    
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
        const history = load('cse_exam_history', []);
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center py-6 text-slate-400 text-sm">
                    No recent exam simulations completed yet.
                </div>
            `;
        } else {
            historyList.innerHTML = history.map(item => `
                <div class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    <div>
                        <p class="font-medium text-slate-800 text-sm">Exam Simulation</p>
                        <p class="text-xs text-slate-400">${item.date}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-sm ${item.passed ? 'text-emerald-600' : 'text-slate-600'}">${item.score}/${item.total} (${item.percentage}%)</p>
                        <span class="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}">
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
