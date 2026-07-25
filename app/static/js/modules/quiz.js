/* noteX AI - AI Quiz & Evaluation System (Hyper Pro) */
const QuizModule = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: {},
  timerInterval: null,
  timeTakenSeconds: 0,
  selectedQuestionType: 'mcq',

  async render(container) {
    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.2)); border-color: rgba(245, 158, 11, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-amber" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-question"></i> Quiz Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Quiz & Evaluation System</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Curriculum Grade: <strong style="color: var(--hyper-accent-cyan);">${typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10'}</strong>. Practice MCQs, 1-Mark, 2-Mark, 5-Mark & HOTS Questions.
              </p>
            </div>
            
            <div style="display: flex; gap: 0.5rem; background: var(--hyper-bg-surface); padding: 0.35rem; border-radius: var(--hyper-radius-md); border: 1px solid var(--hyper-border-subtle);">
              <button id="quizCreateTabBtn" class="hyper-btn hyper-btn-primary hyper-btn-sm" onclick="QuizModule.switchTab('create')">Create Quiz</button>
              <button id="quizLeaderboardTabBtn" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="QuizModule.switchTab('leaderboard')">Leaderboard</button>
            </div>
          </div>
        </div>

        <div id="quizTabArea" class="hyper-col-12">
          <!-- Quiz Creator Section -->
          <div class="hyper-card" style="margin-bottom: 1.5rem;">
            <div class="hyper-card-header">
              <div class="hyper-card-title">
                <i class="fa-solid fa-square-poll-vertical" style="color: var(--hyper-accent-amber);"></i> Generate Custom AI Quiz
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              <!-- Question Format Pills -->
              <div>
                <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.5rem; display: block;">Select Question Format:</label>
                <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
                  <button class="hyper-btn hyper-btn-primary hyper-btn-sm qtype-pill" onclick="QuizModule.selectType('mcq', this)">🎯 Multiple Choice (MCQs)</button>
                  <button class="hyper-btn hyper-btn-glass hyper-btn-sm qtype-pill" onclick="QuizModule.selectType('1mark', this)">✍️ 1-Mark Questions</button>
                  <button class="hyper-btn hyper-btn-glass hyper-btn-sm qtype-pill" onclick="QuizModule.selectType('2mark', this)">📝 2-Mark Short Answers</button>
                  <button class="hyper-btn hyper-btn-glass hyper-btn-sm qtype-pill" onclick="QuizModule.selectType('5mark', this)">📖 5-Mark Long Answers</button>
                  <button class="hyper-btn hyper-btn-glass hyper-btn-sm qtype-pill" onclick="QuizModule.selectType('hots', this)">🧠 HOTS (Higher Order Thinking)</button>
                </div>
              </div>

              <!-- Subject & Chapter Inputs -->
              <div style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 1rem; align-items: flex-end;">
                <div>
                  <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
                  <select id="quizSubjectSelect" class="hyper-select">
                    <option value="Science" selected>Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Chapter / Topic:</label>
                  <input type="text" id="quizChapterInput" class="hyper-input" placeholder="e.g. Chemical Reactions and Equations, Electricity...">
                </div>

                <button class="hyper-btn hyper-btn-primary" onclick="QuizModule.handleGenerateQuiz()">
                  <i class="fa-solid fa-play"></i> Start Quiz
                </button>
              </div>

              <div id="quizGenStatus" style="font-size: 0.85rem; text-align: center;"></div>
            </div>
          </div>

          <!-- Active Quiz Container -->
          <div id="quizRunnerArea"></div>
        </div>
      </div>
    `;
  },

  selectType(type, btn) {
    this.selectedQuestionType = type;
    document.querySelectorAll('.qtype-pill').forEach(b => b.className = 'hyper-btn hyper-btn-glass hyper-btn-sm qtype-pill');
    btn.className = 'hyper-btn hyper-btn-primary hyper-btn-sm qtype-pill';
  },

  async switchTab(tab) {
    const createBtn = document.getElementById('quizCreateTabBtn');
    const leadBtn = document.getElementById('quizLeaderboardTabBtn');

    if (tab === 'leaderboard') {
      createBtn.className = 'hyper-btn hyper-btn-glass hyper-btn-sm';
      leadBtn.className = 'hyper-btn hyper-btn-primary hyper-btn-sm';
      await this.renderLeaderboard();
    } else {
      createBtn.className = 'hyper-btn hyper-btn-primary hyper-btn-sm';
      leadBtn.className = 'hyper-btn hyper-btn-glass hyper-btn-sm';
      const container = document.getElementById('quizTabArea');
      container.innerHTML = `
        <div class="hyper-card">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-square-poll-vertical" style="color: var(--hyper-accent-amber);"></i> Generate Custom AI Quiz
            </div>
          </div>
          <p style="color: var(--hyper-text-secondary);">Fill in your chapter details above and click Start Quiz!</p>
        </div>
      `;
    }
  },

  async handleGenerateQuiz() {
    const chapterInput = document.getElementById('quizChapterInput');
    const subjectSelect = document.getElementById('quizSubjectSelect');
    const statusDiv = document.getElementById('quizGenStatus');

    const chapter = chapterInput ? chapterInput.value.trim() : '';
    const subject = subjectSelect ? subjectSelect.value : 'Science';

    if (!chapter) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--hyper-accent-rose)';
        statusDiv.textContent = 'Please enter a Chapter or Topic name.';
      }
      return;
    }

    if (statusDiv) {
      statusDiv.style.color = 'var(--hyper-accent-amber)';
      statusDiv.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI is crafting ${this.selectedQuestionType.toUpperCase()} questions for ${chapter}...`;
    }

    try {
      const res = await API.post('/quiz/generate', {
        subject: subject,
        chapter: chapter,
        num_questions: 5,
        quiz_type: this.selectedQuestionType
      });

      if (res && res.success && res.data.quiz) {
        this.currentQuiz = res.data.quiz;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.timeTakenSeconds = 0;
        this.startQuizRunner();
      } else {
        if (statusDiv) {
          statusDiv.style.color = 'var(--hyper-accent-rose)';
          statusDiv.textContent = res.message || 'Failed to generate quiz.';
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--hyper-accent-rose)';
        statusDiv.textContent = `Error: ${e.message}`;
      }
    }
  },

  startQuizRunner() {
    const area = document.getElementById('quizRunnerArea');
    if (!area || !this.currentQuiz) return;

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeTakenSeconds++;
      const timerEl = document.getElementById('quizTimerVal');
      if (timerEl) {
        const mins = Math.floor(this.timeTakenSeconds / 60);
        const secs = this.timeTakenSeconds % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);

    this.renderQuestion();
  },

  renderQuestion() {
    const area = document.getElementById('quizRunnerArea');
    if (!area || !this.currentQuiz) return;

    const questions = this.currentQuiz.questions || [];
    const total = questions.length;
    const q = questions[this.currentQuestionIndex];
    const qId = String(q.id);

    area.innerHTML = `
      <div class="hyper-card" style="margin-top: 1.5rem;">
        <!-- Header Info Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--hyper-border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div>
            <span class="hyper-badge hyper-badge-cyan">Question ${this.currentQuestionIndex + 1} of ${total}</span>
            <span style="font-weight: 700; margin-left: 0.75rem; color: var(--hyper-text-primary);">${this.currentQuiz.title}</span>
          </div>

          <div style="font-weight: 700; color: var(--hyper-accent-amber); font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-stopwatch"></i> <span id="quizTimerVal">00:00</span>
          </div>
        </div>

        <!-- Question Title -->
        <h3 style="font-weight: 700; font-size: 1.2rem; margin-bottom: 1.5rem; line-height: 1.5; color: var(--hyper-text-primary);">${q.question}</h3>

        <!-- Options Container -->
        <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2rem;">
          ${q.options.map((opt, idx) => {
            const isSelected = this.userAnswers[qId] === idx;
            return `
              <div class="hyper-card hyper-card-interactive" style="padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; border: 1.5px solid ${isSelected ? 'var(--hyper-accent-cyan)' : 'var(--hyper-border-subtle)'}; background: ${isSelected ? 'var(--hyper-accent-cyan-light)' : 'var(--hyper-bg-surface)'};" onclick="QuizModule.selectAnswer('${qId}', ${idx})">
                <div style="width: 26px; height: 26px; border-radius: 50%; border: 2px solid ${isSelected ? 'var(--hyper-accent-cyan)' : 'var(--hyper-text-muted)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: var(--hyper-accent-cyan);">
                  ${String.fromCharCode(65 + idx)}
                </div>
                <div style="font-size: 0.95rem; color: var(--hyper-text-primary);">${opt}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button class="hyper-btn hyper-btn-glass" ${this.currentQuestionIndex === 0 ? 'disabled' : ''} onclick="QuizModule.prevQuestion()">
            <i class="fa-solid fa-chevron-left"></i> Previous
          </button>

          ${this.currentQuestionIndex === total - 1 ? 
            `<button class="hyper-btn hyper-btn-cyan" onclick="QuizModule.submitQuiz()">
              <i class="fa-solid fa-check-double"></i> Submit Quiz
            </button>` :
            `<button class="hyper-btn hyper-btn-primary" onclick="QuizModule.nextQuestion()">
              Next Question <i class="fa-solid fa-chevron-right"></i>
            </button>`
          }
        </div>
      </div>
    `;
  },

  selectAnswer(qId, idx) {
    this.userAnswers[qId] = idx;
    this.renderQuestion();
  },

  nextQuestion() {
    if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderQuestion();
    }
  },

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderQuestion();
    }
  },

  async submitQuiz() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const area = document.getElementById('quizRunnerArea');
    if (area) {
      area.innerHTML = `
        <div class="hyper-card" style="text-align: center; padding: 3rem;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: var(--hyper-accent-cyan); margin-bottom: 1rem;"></i>
          <h3>Evaluating Quiz & Generating AI Explanations...</h3>
        </div>
      `;
    }

    try {
      const res = await API.post('/quiz/submit', {
        quiz_id: this.currentQuiz.id || this.currentQuiz._id,
        answers: this.userAnswers,
        time_taken: this.timeTakenSeconds
      });

      if (res && res.success && res.data.result) {
        this.renderScorecard(res.data.result);
      }
    } catch (e) {
      console.error('Submit quiz error:', e);
    }
  },

  renderScorecard(result) {
    const area = document.getElementById('quizRunnerArea');
    if (!area) return;

    const breakdown = result.answers_breakdown || [];

    area.innerHTML = `
      <div class="hyper-card" style="margin-top: 1.5rem;">
        <div style="text-align: center; padding: 1.5rem; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-lg); margin-bottom: 2rem;">
          <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--hyper-accent-emerald);">${result.score} / ${result.total} Marks</h2>
          <div style="font-size: 1.1rem; color: var(--hyper-text-secondary); margin-top: 0.35rem;">Accuracy: <strong style="color: var(--hyper-accent-cyan);">${result.accuracy}%</strong> • Time: ${Math.floor(result.time_taken / 60)}m ${result.time_taken % 60}s</div>
          <div style="margin-top: 0.75rem;"><span class="hyper-badge hyper-badge-emerald">+${result.score * 10} XP Points Earned!</span></div>
        </div>

        <h3 style="font-weight: 700; margin-bottom: 1rem; color: var(--hyper-text-primary);"><i class="fa-solid fa-lightbulb" style="color: var(--hyper-accent-amber);"></i> AI Answer Explanations</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${breakdown.map((item, i) => `
            <div class="hyper-card" style="padding: 1.25rem; border-left: 4px solid ${item.is_correct ? 'var(--hyper-accent-emerald)' : 'var(--hyper-accent-rose)'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--hyper-text-primary);">Q${i + 1}: ${item.question}</span>
                <span style="font-size: 0.8rem; font-weight: 700; color: ${item.is_correct ? 'var(--hyper-accent-emerald)' : 'var(--hyper-accent-rose)'};">
                  ${item.is_correct ? 'Correct (+1)' : 'Incorrect'}
                </span>
              </div>
              
              <div style="font-size: 0.88rem; color: var(--hyper-text-secondary); margin-top: 0.5rem; background: var(--hyper-bg-surface); padding: 0.75rem; border-radius: var(--hyper-radius-sm);">
                <strong style="color: var(--hyper-accent-cyan);">AI Explanation:</strong> ${item.explanation}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async renderLeaderboard() {
    const container = document.getElementById('quizTabArea');
    if (!container) return;

    try {
      const res = await API.get('/quiz/leaderboard');
      if (res && res.success && res.data && res.data.leaderboard) {
        container.innerHTML = `
          <div class="hyper-card">
            <div class="hyper-card-header">
              <div class="hyper-card-title">
                <i class="fa-solid fa-trophy" style="color: var(--hyper-accent-amber);"></i> Global Student Leaderboard
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${res.data.leaderboard.map((user, idx) => `
                <div class="hyper-card hyper-card-interactive" style="padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: ${idx === 0 ? 'var(--hyper-accent-amber)' : (idx === 1 ? '#94a3b8' : '#b45309')}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                      ${idx + 1}
                    </div>
                    <div>
                      <div style="font-weight: 700; font-size: 0.95rem; color: var(--hyper-text-primary);">${user.name}</div>
                      <div style="font-size: 0.78rem; color: var(--hyper-text-muted);">${user.student_class || 'Class 10'} • Streak: ${user.study_streak || 0} Days</div>
                    </div>
                  </div>
                  <div style="font-weight: 800; font-size: 1.1rem; color: var(--hyper-accent-cyan);">${user.total_points || 0} XP</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.log('Leaderboard error:', e);
    }
  }
};
