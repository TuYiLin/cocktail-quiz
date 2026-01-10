export class QuizGame {
    constructor(allQuestions, onEndCallback) {
        this.allQuestions = allQuestions;
        this.onEnd = onEndCallback;

        // Game Config
        this.maxLives = 3;
        this.baseScore = 100;
        this.maxTime = 15; // seconds
        this.questionsPerRound = 10;

        // State
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.lives = 3;
        this.timer = null;
        this.timeLeft = this.maxTime;
        this.history = []; // { question, isCorrect, userChoiceText, correctChoiceText }

        // DOM Binding
        this.ui = {
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            score: document.getElementById('score-display'),
            timerFill: document.getElementById('timer-fill'),
            livesGrid: document.getElementById('lives-display'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            feedbackTitle: document.getElementById('feedback-title'),
            feedbackText: document.getElementById('feedback-text'),
            nextBtn: document.getElementById('next-question-btn')
        };

        this.ui.nextBtn.onclick = () => this.nextQuestion();
    }

    start() {
        // Reset State
        this.score = 0;
        this.lives = this.maxLives;
        this.currentIndex = 0;
        this.history = [];

        // Randomize and Pick Questions
        this.currentQuestions = [...this.allQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, this.questionsPerRound);

        this.updateStatsUI();
        this.loadQuestion();
    }

    updateStatsUI() {
        this.ui.score.textContent = this.score;
        // Lives
        this.ui.livesGrid.innerHTML = '';
        for (let i = 0; i < this.maxLives; i++) {
            const icon = document.createElement('span');
            icon.className = `life-icon ${i < this.lives ? '' : 'lost'}`;
            icon.textContent = '🍸'; // Shaker or Martini Glass icon
            this.ui.livesGrid.appendChild(icon);
        }
    }

    loadQuestion() {
        if (this.currentIndex >= this.currentQuestions.length || this.lives <= 0) {
            this.endGame();
            return;
        }

        const q = this.currentQuestions[this.currentIndex];

        // Reset UI
        this.ui.questionText.textContent = q.question;
        this.ui.optionsContainer.innerHTML = '';
        this.ui.feedbackOverlay.classList.add('hidden');

        // Create Options
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => this.handleAnswer(idx);
            this.ui.optionsContainer.appendChild(btn);
        });

        // Start Timer
        this.startTimer();
    }

    startTimer() {
        this.timeLeft = this.maxTime;
        this.ui.timerFill.style.width = '100%';
        this.ui.timerFill.style.transition = 'none'; // Instant reset

        // Force Reflow
        void this.ui.timerFill.offsetWidth;

        this.ui.timerFill.style.transition = `width ${this.maxTime}s linear`;
        this.ui.timerFill.style.width = '0%';

        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.handleTimeout();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timer);
        const computedStyle = window.getComputedStyle(this.ui.timerFill);
        const w = computedStyle.getPropertyValue('width');
        this.ui.timerFill.style.transition = 'none';
        this.ui.timerFill.style.width = w; // Freeze
    }

    handleAnswer(selectedIndex) {
        this.stopTimer(); // Stop immediately

        const q = this.currentQuestions[this.currentIndex];
        const isCorrect = selectedIndex === q.correct;

        // Disable all buttons
        const potentialButtons = this.ui.optionsContainer.querySelectorAll('.option-btn');
        potentialButtons.forEach(b => b.disabled = true);

        // Highlight
        if (selectedIndex !== null && potentialButtons[selectedIndex]) {
            potentialButtons[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (!isCorrect && potentialButtons[q.correct]) {
            potentialButtons[q.correct].classList.add('correct'); // Show correct one if wrong
        }

        // Logic
        if (isCorrect) {
            // Speed Bonus: (TimeLeft / MaxTime) * 50
            const speedBonus = Math.floor((this.timeLeft / this.maxTime) * 50);
            this.score += (this.baseScore + speedBonus);
            this.showFeedback(true, "Correct! 調酒正確！", q.explanation);
        } else {
            this.lives--;
            this.showFeedback(false, "Oops! 手滑了...", q.explanation);
        }

        // Record History
        this.history.push({
            question: q,
            isCorrect: isCorrect,
            userChoiceText: selectedIndex !== null ? q.options[selectedIndex] : "逾時",
            correctChoiceText: q.options[q.correct]
        });

        this.updateStatsUI();
    }

    handleTimeout() {
        this.handleAnswer(null); // Treat as wrong (index null)
    }

    showFeedback(success, title, text) {
        this.ui.feedbackTitle.textContent = title;
        this.ui.feedbackTitle.style.color = success ? 'var(--success-color)' : 'var(--accent-color)';
        this.ui.feedbackText.textContent = text;
        this.ui.feedbackOverlay.classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;
        this.loadQuestion();
    }

    endGame() {
        this.onEnd({
            score: this.score,
            totalQuestions: this.currentIndex,
            history: this.history
        });
    }
}
