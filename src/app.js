import { questions } from './data/questions.js';

// DOM Elements
const screens = {
    landing: document.getElementById('landing-screen'),
    study: document.getElementById('study-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen'),
    notes: document.getElementById('notes-screen'),
    auth: document.getElementById('auth-screen'),
    dashboard: document.getElementById('dashboard-screen')
};

const buttons = {
    start: document.getElementById('start-btn'),
    study: document.getElementById('study-btn'),
    studyBack: document.getElementById('study-back-btn'),
    restart: document.getElementById('restart-btn'),
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
    buttons.start.addEventListener('click', startQuiz);
    buttons.study.addEventListener('click', () => showScreen('study'));
    buttons.studyBack.addEventListener('click', () => showScreen('landing'));
    buttons.restart.addEventListener('click', startQuiz);
    buttons.viewNotes.addEventListener('click', showNotes);
    buttons.notesBack.addEventListener('click', () => showScreen('result'));

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
        .select('highest_score, id')
        .order('highest_score', { ascending: false })
        .limit(5);

    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    if (leaderboard) {
        leaderboard.forEach((item, index) => {
            const isMe = item.id === user.id;
            const div = document.createElement('div');
            div.className = 'history-item';
            if (isMe) div.style.border = '1px solid var(--primary-color)';

            div.innerHTML = `
                <div class="history-info">
                    <span class="history-score">TOP ${index + 1}: ${item.highest_score} PTS</span>
                    <span class="history-date">${isMe ? '(你)' : '匿名大師'}</span>
                </div>
            `;
            leaderboardList.appendChild(div);
        });
    }
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
