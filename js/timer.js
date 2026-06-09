/**
 * Timer module for tracking exam countdowns.
 */

let timerInterval = null;

function startTimer(durationSeconds, onTick, onFinish) {
    if (timerInterval) clearInterval(timerInterval);
    
    let timeRemaining = durationSeconds;
    onTick(timeRemaining);
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            onTick(0);
            onFinish();
        } else {
            onTick(timeRemaining);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTimer(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (num) => String(num).padStart(2, '0');
    
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}