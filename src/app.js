import { questions } from './data/questions.js';
import { skillQuestions } from './data/skill_questions.js';

// DOM Elements
const screens = {
    landing: document.getElementById('landing-screen'),
    study: document.getElementById('study-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen'),
    notes: document.getElementById('notes-screen'),
    auth: document.getElementById('auth-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    career: document.getElementById('career-screen')
};

const buttons = {
    start: document.getElementById('start-btn'), // Now inside Ranked Card
    career: document.getElementById('career-btn'), // New Career Button
    careerBack: document.getElementById('career-back-btn'),
    study: document.getElementById('study-btn'),
    studyBack: document.getElementById('study-back-btn'),
    restart: document.getElementById('restart-btn'),
    home: document.getElementById('home-btn'), // New Home Button
    viewNotes: document.getElementById('view-notes-btn'),
    notesBack: document.getElementById('notes-back-btn'),
    auth: document.getElementById('auth-btn'),
    authBack: document.getElementById('auth-back-btn'),
    loginConfirm: document.getElementById('login-confirm-btn'),
    signupConfirm: document.getElementById('signup-confirm-btn'),
    logout: document.getElementById('logout-btn'),
    dashboard: document.getElementById('dashboard-btn'),
    dashboardBack: document.getElementById('dashboard-back-btn'),
    resultDashboard: document.getElementById('result-dashboard-btn')
};

// Global State
let gameInstance = null; // Hold the QuizGame instance
let noteHistory = []; // Hold history for the notes screen
let currentMode = 'ranked'; // 'ranked' or 'career'
let currentLevel = 1; // For career mode restart

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

// Supabase Integration
import { supabase } from './supabase-config.js';

async function updateAuthUI(user) {
    const userInfoDiv = document.getElementById('user-info');
    const authBtn = buttons.auth;
    const userNameDisplay = document.getElementById('user-name-display');

    if (user) {
        userInfoDiv.classList.remove('hidden');
        authBtn.classList.add('hidden');
        buttons.dashboard.classList.remove('hidden');

        // Fetch display name from profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', user.id)
            .maybeSingle();

        userNameDisplay.textContent = profile?.display_name || user.email.split('@')[0];
    } else {
        userInfoDiv.classList.add('hidden');
        authBtn.classList.remove('hidden');
        buttons.dashboard.classList.add('hidden');
    }
}

// Initial Setup
function init() {
    // Ensure landing is visible
    showScreen('landing');

    // Event Listeners
    buttons.start.addEventListener('click', () => startQuiz('ranked'));
    buttons.career.addEventListener('click', () => startQuiz('career'));

    buttons.study.addEventListener('click', () => showScreen('study'));
    buttons.studyBack.addEventListener('click', () => showScreen('landing'));
    buttons.restart.addEventListener('click', () => {
        if (currentMode === 'career') {
            startCareerQuiz(currentLevel);
        } else {
            startQuiz('ranked');
        }
    });

    // Re-fetch to ensure DOM is ready, just in case
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            console.log("Home clicked, going to landing");
            showScreen('landing');
        });
    } else {
        console.error("Home button not found in DOM!");
    }

    // buttons.home.addEventListener('click', () => showScreen('landing')); // Commented out old one
    buttons.viewNotes.addEventListener('click', showNotes);
    buttons.notesBack.addEventListener('click', () => showScreen('result'));
    buttons.careerBack.addEventListener('click', () => showScreen('landing'));

    // Career Nodes
    [1, 2, 3, 4].forEach(level => {
        const node = document.getElementById(`level-node-${level}`);
        if (node) {
            node.addEventListener('click', () => startCareerQuiz(level));
        }
    });

    // Auth Listeners
    buttons.auth.addEventListener('click', () => {
        document.getElementById('auth-error').classList.add('hidden');
        showScreen('auth');
    });
    buttons.authBack.addEventListener('click', () => showScreen('landing'));

    buttons.loginConfirm.addEventListener('click', handleLogin);
    buttons.signupConfirm.addEventListener('click', handleSignup);
    buttons.logout.addEventListener('click', handleLogout);
    buttons.dashboard.addEventListener('click', showDashboard);
    buttons.resultDashboard.addEventListener('click', showDashboard);
    buttons.dashboardBack.addEventListener('click', () => showScreen('landing'));

    // Initial Auth Check
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user ?? null);
    });
}

async function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    } else {
        showScreen('landing');
    }
}

async function handleSignup() {
    const nickname = document.getElementById('auth-nickname').value;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!nickname) {
        errorEl.textContent = "請輸入暱稱";
        errorEl.classList.remove('hidden');
        return;
    }

    const { error, data } = await supabase.auth.signUp({ email, password });

    if (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    } else if (data.user) {
        // Create profile with nickname
        await supabase
            .from('user_profiles')
            .upsert({ id: data.user.id, display_name: nickname }, { onConflict: 'id' });

        alert('註冊成功！歡迎加入吧台！');
        showScreen('landing');
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
}

async function showDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert('請先登入，即可查看個人數據與全球排行榜！');
        showScreen('auth');
        return;
    }

    showScreen('dashboard');

    // Fetch Profile
    let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) console.error("Profile fetch error:", profileError);

    const displayName = profile?.display_name || user.email.split('@')[0];
    document.getElementById('dashboard-user-name').textContent = displayName;

    // If profile doesn't exist yet, create it and use the created data
    if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .upsert({ id: user.id }, { onConflict: 'id' })
            .select()
            .single();
        profile = newProfile;
    }

    if (profile) {
        let displayScore = profile.highest_score || 0;
        let displayStreak = profile.current_streak || 0;

        // 【自動校正邏輯】如果檔案中最高分為 0，但其實有歷史紀錄，則自動補推
        if (displayScore === 0) {
            const { data: maxRecord } = await supabase
                .from('quiz_results')
                .select('score')
                .eq('user_id', user.id)
                .order('score', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (maxRecord && maxRecord.score > 0) {
                displayScore = maxRecord.score;
                // 更新回資料庫，並補齊基本的 display_name 以免下次報錯
                await supabase.from('user_profiles').update({
                    highest_score: displayScore,
                    display_name: user.email.split('@')[0]
                }).eq('id', user.id);
            }
        }

        document.getElementById('best-score-display').textContent = displayScore;
        document.getElementById('streak-display').textContent = displayStreak;

        // Render Career Stats
        const careerProgress = getCareerProgress();
        const careerList = document.getElementById('career-stats-list');
        careerList.innerHTML = '';

        const levelNames = {
            1: "點酒新手", 2: "風味探索者", 3: "酒吧熟客", 4: "專業預備生"
        };

        [1, 2, 3, 4].forEach(lvl => {
            const p = careerProgress[lvl];
            const div = document.createElement('div');
            div.className = `career-stat-item ${p.unlocked ? 'unlocked' : ''}`;

            // Build stars string
            let starStr = '';
            for (let i = 0; i < 3; i++) starStr += i < p.stars ? '★' : '☆';

            div.innerHTML = `
                <h4>Level ${lvl}<br><span style="font-size:0.8em; opacity:0.8">${levelNames[lvl]}</span></h4>
                <div class="stars">${p.unlocked ? starStr : '🔒 Locked'}</div>
            `;
            careerList.appendChild(div);
        });
    }

    // Fetch History
    const { data: history } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (history && history.length > 0) {
        history.forEach(item => {
            const dateTime = new Date(item.created_at).toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <span class="history-score">${item.score} PTS</span>
                    <span class="history-date">${dateTime}</span>
                </div>
                <span class="history-rank">${getRank(item.score)}</span>
            `;
            historyList.appendChild(div);
        });
    } else {
        historyList.innerHTML = '<p class="auth-desc" style="text-align:center; opacity:0.5;">尚無出勤紀錄</p>';
    }

    // Fetch Global Leaderboard
    const { data: leaderboard } = await supabase
        .from('user_profiles')
        .select('highest_score, id, display_name')
        .order('highest_score', { ascending: false })
        .limit(5);

    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    if (leaderboard) {
        leaderboard.forEach((item, index) => {
            const isMe = item.id === user.id;
            const displayName = item.display_name || '匿名大師';
            const div = document.createElement('div');
            div.className = 'history-item';
            if (isMe) div.style.border = '1px solid var(--primary-color)';

            div.innerHTML = `
                <div class="history-info">
                    <span class="history-score">TOP ${index + 1}: ${item.highest_score} PTS</span>
                    <span class="history-date">${isMe ? displayName + ' (你)' : displayName}</span>
                </div>
            `;
            leaderboardList.appendChild(div);
        });
    }
}


// Quiz Logic Imports (We'll implement this next, focusing on structure first)
import { QuizGame } from './quiz.js';


function startQuiz(mode = 'ranked') {
    if (mode === 'career') {
        renderCareerMap();
        showScreen('career');
        return;
    }

    currentMode = 'ranked';
    // Ranked Mode Logic (Original)
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

    // Reset Button Text for Ranked
    buttons.restart.textContent = '再次挑戰 (Challenge Again)';

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

// Call init AFTER function definitions to avoid issues, though module hosting usually hoists.
// Check if user has career progress
function getCareerProgress() {
    const saved = localStorage.getItem('career_progress');
    if (saved) return JSON.parse(saved);
    return {
        1: { stars: 0, unlocked: true },
        2: { stars: 0, unlocked: false },
        3: { stars: 0, unlocked: false },
        4: { stars: 0, unlocked: false }
    };
}

function saveCareerProgress(progress) {
    localStorage.setItem('career_progress', JSON.stringify(progress));
}

function renderCareerMap() {
    const progress = getCareerProgress();

    // Level 1
    updateLevelNode(1, progress[1]);

    // Check unlocks level 2
    if (progress[1].stars >= 3) progress[2].unlocked = true;
    updateLevelNode(2, progress[2]);

    // Check unlocks level 3
    if (progress[2].stars >= 3) progress[3].unlocked = true;
    updateLevelNode(3, progress[3]);

    // Check unlocks level 4
    if (progress[3].stars >= 3) progress[4].unlocked = true;
    updateLevelNode(4, progress[4]);

    // Save auto-unlocks back to storage just in case
    saveCareerProgress(progress);
}

function updateLevelNode(level, status) {
    const node = document.getElementById(`level-node-${level}`);
    const starsContainer = document.getElementById(`stars-level-${level}`);

    // Reset classes
    node.classList.remove('locked', 'unlocked', 'active-node');

    if (status.unlocked) {
        node.classList.add('unlocked');
        // Add active-node if it's the highest unlocked or current focus? 
        // For now, let's pulse the highest unlocked level that isn't fully 3-starred yet.
        if (status.stars < 3) {
            node.classList.add('active-node');
        }

        // Icon update
        const iconDiv = node.querySelector('.node-icon');
        // iconDiv.textContent = '🔓'; // Or keep specific icon
    } else {
        node.classList.add('locked');
    }

    // Stars
    starsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = i < status.stars ? 'star filled' : 'star empty';
        star.textContent = '★';
        starsContainer.appendChild(star);
    }
}

// Start Career Level logic
function startCareerQuiz(level) {
    const progress = getCareerProgress();
    if (!progress[level].unlocked) {
        alert("🔒 此關卡尚未解鎖！請先在上一關獲得 3 顆星！");
        return;
    }

    // Filter questions
    const levelQuestions = skillQuestions.filter(q => q.level === level);

    // QuizEngine expects { question, options, correct, explanation }
    // skillQuestions already matches this format.

    // Pick 10 random
    if (levelQuestions.length < 10) {
        console.warn(`Level ${level} has fewer than 10 questions!`);
    }
    const shuffled = levelQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

    // Start Game
    currentMode = 'career';
    currentLevel = level;
    gameInstance = new QuizGame(shuffled, (result) => onCareerGameEnd(result, level), {
        enableTimer: false,
        enableLives: false,
        saveToLeaderboard: false,
        questionsPerRound: 10
    });
    showScreen('quiz');
    gameInstance.start();
}

function onCareerGameEnd(result, level) {
    // Calculate Stars
    // 10 Qs. 
    // 3 Stars = 9 or 10 correct (>=90%)
    // 2 Stars = 8 correct (>=80%)
    // 1 Star = 6,7 correct (>=60%)
    const correctCount = result.score / 100; // Assumption: 100 pts per question in existing engine?
    // Wait, existing engine score logic might be different (combo etc).
    // Let's check QuizGame result data structure. Usually it passes total questions and score.
    // If QuizGame uses combo scoring, `score` will be high. I should use `correctCount` if available or infer it.
    // Let's modify QuizGame or check it. Assuming standard simple quiz for now or count from history.

    const correctAnswers = result.history.filter(h => h.isCorrect).length;
    let stars = 0;

    // Rating Logic:
    // 3 Stars: 9-10 correct (Mastery) -> Unlocks next level
    // 2 Stars: 6-8 correct (Passable)
    // 1 Star: 0-5 correct (Keep trying)
    if (correctAnswers >= 9) stars = 3;
    else if (correctAnswers >= 6) stars = 2;
    else stars = 1;

    // Save Progress
    const progress = getCareerProgress();
    if (stars > progress[level].stars) {
        progress[level].stars = stars;
        saveCareerProgress(progress);

        // Check unlock next
        if (stars === 3 && level < 4) {
            progress[level + 1].unlocked = true;
            saveCareerProgress(progress);
            // Maybe show unlock animation?
        }
    }

    // Reuse Result Screen but customize
    const scoreDisplay = document.getElementById('final-score-value');
    const rankBadge = document.getElementById('rank-badge');

    scoreDisplay.textContent = `${correctAnswers} / 10`;
    rankBadge.textContent = `${stars} 星級 (STARS)`;

    // Change Button Text
    buttons.restart.textContent = '再次訓練 (Train Again)';

    // Update history for notes
    noteHistory = result.history;

    // Override Restart Button to go back to Career Map instead of Restart Level immediately?
    // Or just keeping restart is fine.

    // Show
    showScreen('result');

    // Custom back behavior for Career?
    // We can add a "Back to Map" button or make "Home" button go to Landing.
    // Existing Home goes to Landing.
}

// Initialization calls
init();

