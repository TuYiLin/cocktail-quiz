import { questions } from './data/questions.js';

// DOM Elements
const screens = {
    landing: document.getElementById('landing-screen'),
    study: document.getElementById('study-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen'),
    notes: document.getElementById('notes-screen')
};

const buttons = {
    start: document.getElementById('start-btn'),
    study: document.getElementById('study-btn'),
    studyBack: document.getElementById('study-back-btn'),
    restart: document.getElementById('restart-btn'),
    viewNotes: document.getElementById('view-notes-btn'),
    notesBack: document.getElementById('notes-back-btn')
};

// State
let currentGameState = [];
let noteHistory = [];

// Navigation Functions
function showScreen(screenName) {
    // Hide all
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; // Ensure fully hidden for accessibility/pointer events overlap prevention
    });

    // Show target
    const target = screens[screenName];
    target.style.display = 'flex'; // Restore display
    // Force reflow for transition
    void target.offsetWidth;
    target.classList.add('active');
}

// Initial Setup
function init() {
    // Ensure landing is visible
    showScreen('landing');

    // Event Listeners
    buttons.start.addEventListener('click', startQuiz);
    buttons.study.addEventListener('click', () => showScreen('study'));
    buttons.studyBack.addEventListener('click', () => showScreen('landing'));
    buttons.restart.addEventListener('click', startQuiz);
    buttons.viewNotes.addEventListener('click', showNotes);
    buttons.notesBack.addEventListener('click', () => showScreen('result'));
}


// Quiz Logic Imports (We'll implement this next, focusing on structure first)
import { QuizGame } from './quiz.js';

let gameInstance = null;

function startQuiz() {
    gameInstance = new QuizGame(questions, onGameEnd);
    showScreen('quiz');
    gameInstance.start();
}

function onGameEnd(resultData) {
    // resultData: { score, totalQuestions, history }
    const scoreDisplay = document.getElementById('final-score-value');
    const rankBadge = document.getElementById('rank-badge');

    scoreDisplay.textContent = resultData.score;
    rankBadge.textContent = getRank(resultData.score);
    noteHistory = resultData.history.filter(h => !h.isCorrect); // Only keep wrong answers for notes? Or all? User said "Review", let's keep all but highlight wrong.
    // Actually user said "錯題筆記 / 完整題解", implying primarily wrong ones but full review is good.
    // Let's store full history.
    noteHistory = resultData.history;

    showScreen('result');
}

function getRank(score) {
    if (score >= 1200) return "首席調酒師 (HEAD BARTENDER)"; // Max score assumption
    if (score >= 800) return "調酒師 (BARTENDER)";
    if (score >= 400) return "吧台助手 (BARBACK)";
    return "客人 (CUSTOMER)";
}

function showNotes() {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';

    if (noteHistory.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem;">太強了！你沒有錯題！(全對)</p>';
    }

    noteHistory.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'study-card';
        // Highlight wrong answers
        const statusColor = item.isCorrect ? 'var(--success-color)' : 'var(--accent-color)';
        itemEl.style.borderLeftColor = statusColor;

        itemEl.innerHTML = `
            <h3>Q${index + 1}: ${item.question.question}</h3>
            <p style="color: ${statusColor}; margin-bottom: 0.5rem; font-weight:bold;">
                ${item.isCorrect ? '✓ 答對' : '✗ 答錯'} (你的選擇: ${item.userChoiceText})
            </p>
            <p style="margin-bottom:0.5rem"><strong>正確答案:</strong> ${item.correctChoiceText}</p>
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:0.5rem 0;">
            <p class="explanation">${item.question.explanation}</p>
        `;
        list.appendChild(itemEl);
    });

    showScreen('notes');
}

// Start App
init();
