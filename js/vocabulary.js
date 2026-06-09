/**
 * Controller for the Vocabulary Digest page.
 */

const vocabularyState = {
    currentDay: 1,
    vocabData: [],
    masteredWords: []
};

async function loadVocabulary() {
    vocabularyState.masteredWords = load('cse_mastered_words', []);
    vocabularyState.currentDay = load('cse_vocab_day', 1);
    
    const data = await fetchJSON('../data/vocabulary.json');
    if (data) {
        vocabularyState.vocabData = data;
        showTodayWords();
    } else {
        console.error("Failed to load vocabulary data.");
    }
}

function showTodayWords() {
    const dayData = vocabularyState.vocabData.find(d => d.day === vocabularyState.currentDay);
    if (!dayData) return;
    
    // Update day indicator text
    const dayIndicator = document.getElementById('day-indicator');
    if (dayIndicator) dayIndicator.textContent = `Day ${vocabularyState.currentDay}`;
    
    // Render words list
    const container = document.getElementById('vocabulary-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    dayData.words.forEach(item => {
        const isMastered = vocabularyState.masteredWords.includes(item.word);
        
        const card = document.createElement('div');
        card.className = `bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-slate-200`;
        
        if (isMastered) {
            card.className += ' border-l-4 border-l-emerald-500';
        } else {
            card.className += ' border-l-4 border-l-blue-400';
        }
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-xl font-bold text-slate-800 tracking-tight">${item.word}</h4>
                    <div class="flex items-center space-x-2 mt-1">
                        <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            ${item.type}
                        </span>
                        <span class="text-xs text-slate-400 font-mono">${item.ipa}</span>
                    </div>
                </div>
                <button onclick="toggleMastered('${item.word.replace(/'/g, "\\'")}')" class="p-2.5 rounded-xl border transition-all flex items-center space-x-1.5 text-xs font-semibold focus:outline-none ${
                    isMastered 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 hover:text-blue-600'
                }" title="${isMastered ? 'Word Mastered' : 'Mark as Mastered'}">
                    <span>${isMastered ? '★' : '☆'}</span>
                    <span>${isMastered ? 'Mastered' : 'Master'}</span>
                </button>
            </div>
            
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
                <strong class="text-slate-700 text-xs uppercase tracking-wider font-semibold block mb-1">Definition</strong>
                ${item.definition}
            </p>
            
            <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Context Sentence</span>
                <p class="text-slate-500 text-xs italic leading-relaxed">
                    "${highlightWord(item.example, item.word)}"
                </p>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    save('cse_vocab_day', vocabularyState.currentDay);
    updateDayNavigationButtons();
}

function highlightWord(sentence, word) {
    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped}[a-z]*)\\b`, 'gi');
    return sentence.replace(regex, '<strong class="text-blue-600 font-semibold">$1</strong>');
}

function toggleMastered(word) {
    const idx = vocabularyState.masteredWords.indexOf(word);
    if (idx > -1) {
        vocabularyState.masteredWords.splice(idx, 1);
        showToast(`"${word}" removed from mastered words.`, 'info');
    } else {
        vocabularyState.masteredWords.push(word);
        showToast(`"${word}" marked as mastered!`, 'success');
    }
    
    save('cse_mastered_words', vocabularyState.masteredWords);
    showTodayWords();
}

function nextDay() {
    const maxDay = Math.max(...vocabularyState.vocabData.map(d => d.day), 1);
    if (vocabularyState.currentDay < maxDay) {
        vocabularyState.currentDay++;
        showTodayWords();
    }
}

function previousDay() {
    if (vocabularyState.currentDay > 1) {
        vocabularyState.currentDay--;
        showTodayWords();
    }
}

function updateDayNavigationButtons() {
    const prevBtn = document.getElementById('prev-day-btn');
    const nextBtn = document.getElementById('next-day-btn');
    
    if (prevBtn) {
        if (vocabularyState.currentDay === 1) {
            prevBtn.disabled = true;
            prevBtn.className = "px-4 py-2.5 bg-slate-50 text-slate-300 font-semibold rounded-xl border border-slate-100 cursor-not-allowed text-sm flex items-center space-x-1";
        } else {
            prevBtn.disabled = false;
            prevBtn.className = "px-4 py-2.5 bg-white text-slate-600 font-semibold rounded-xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all text-sm flex items-center space-x-1 cursor-pointer";
        }
    }
    
    if (nextBtn) {
        const maxDay = Math.max(...vocabularyState.vocabData.map(d => d.day), 1);
        if (vocabularyState.currentDay >= maxDay) {
            nextBtn.disabled = true;
            nextBtn.className = "px-4 py-2.5 bg-slate-50 text-slate-300 font-semibold rounded-xl border border-slate-100 cursor-not-allowed text-sm flex items-center space-x-1";
        } else {
            nextBtn.disabled = false;
            nextBtn.className = "px-4 py-2.5 bg-white text-slate-600 font-semibold rounded-xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all text-sm flex items-center space-x-1 cursor-pointer";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadVocabulary();
    
    const prevBtn = document.getElementById('prev-day-btn');
    const nextBtn = document.getElementById('next-day-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', previousDay);
    if (nextBtn) nextBtn.addEventListener('click', nextDay);
});
