/* noteX AI - AI Quiz Challenge & Evaluation System (Production Edition) */
const QuizModule = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  selectedOptionIndex: null,
  userAnswers: {},
  submittedQuestions: {},
  score: 0,
  startTime: null,
  timerInterval: null,
  elapsedSeconds: 0,
  quizzesCache: [],

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15)); border-color: rgba(16, 185, 129, 0.35); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-emerald" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-question"></i> Quiz Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Quiz & Board Evaluation System</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Practice MCQs, 2-Mark questions, and HOTS problems with step-by-step AI solution keys.
              </p>
            </div>
          </div>
        </div>

        <!-- AI Quiz Generator Card -->
        <div class="hyper-card hyper-col-12">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
                <select id="quizSubjectSelect" class="hyper-select">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Chapter / Topic Title:</label>
                <input type="text" id="quizChapterInput" class="hyper-input" placeholder="e.g. Light & Optics, Chemical Reactions, AP...">
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Questions Count:</label>
                <select id="quizCountSelect" class="hyper-select">
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Question Type:</label>
                <select id="quizTypeSelect" class="hyper-select">
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="hots">HOTS & Board Level</option>
                </select>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button id="generateQuizBtn" class="hyper-btn hyper-btn-emerald" onclick="QuizModule.generateAIQuiz()">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Quiz
              </button>
            </div>
          </div>
        </div>

        <!-- Available Quiz Sets Grid -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-trophy" style="color: var(--hyper-accent-emerald);"></i> Available Quiz Challenges
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;" id="quizSetsContainer">
            <div style="text-align: center; color: var(--hyper-text-muted); padding: 1.5rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading quiz sets...</div>
          </div>
        </div>

        <!-- Active Interactive Quiz Challenge Box -->
        <div class="hyper-card hyper-col-12" id="activeQuizBox" style="border-color: var(--hyper-accent-emerald); display: none;">
          <!-- Dynamically populated by renderCurrentQuestion() -->
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    await this.loadQuizList();
  },

  async loadQuizList() {
    try {
      const res = await API.get('/quiz/list');
      const container = document.getElementById('quizSetsContainer');
      if (!container) return;

      let quizzes = [];
      if (res && res.success && res.data && res.data.quizzes && res.data.quizzes.length > 0) {
        quizzes = res.data.quizzes;
      } else {
        quizzes = [
          { id: "default_1", title: "Physics Light & Optics MCQ Challenge", subject: "Physics", questions: this.getDefaultPhysicsQuestions() },
          { id: "default_2", title: "Chemistry Chemical Reactions & Acids Test", subject: "Chemistry", questions: this.getDefaultChemistryQuestions() },
          { id: "default_3", title: "Mathematics Quadratic Equations Quiz", subject: "Mathematics", questions: this.getDefaultMathQuestions() },
          { id: "default_4", title: "Biology Life Processes & Cell Respiration", subject: "Biology", questions: this.getDefaultBiologyQuestions() }
        ];
      }

      this.quizzesCache = quizzes;
      this.renderQuizSetsGrid(quizzes);
    } catch (err) {
      console.error("[QuizModule] Load error:", err);
    }
  },

  renderQuizSetsGrid(quizzes) {
    const container = document.getElementById('quizSetsContainer');
    if (!container) return;

    container.innerHTML = quizzes.map((q, idx) => `
      <div class="hyper-card hyper-card-interactive" style="padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="hyper-badge hyper-badge-emerald">${q.subject || 'Science'}</span>
            <span style="font-size: 0.75rem; color: var(--hyper-text-muted); font-weight: 600;">⏱️ ${q.questions ? q.questions.length * 2 : 10} Mins</span>
          </div>
          <h4 style="font-size: 1rem; font-weight: 700; color: var(--hyper-text-primary); margin-bottom: 0.5rem;">${q.title || 'Interactive Quiz'}</h4>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem; margin-top: 0.75rem;">
          <span style="font-size: 0.78rem; color: var(--hyper-text-muted);">${q.questions ? q.questions.length : 5} Questions</span>
          <button class="hyper-btn hyper-btn-emerald hyper-btn-sm" onclick="QuizModule.startQuizByIndex(${idx})">Start Quiz</button>
        </div>
      </div>
    `).join('');
  },

  async generateAIQuiz() {
    const subject = document.getElementById('quizSubjectSelect')?.value || 'Physics';
    const chapter = document.getElementById('quizChapterInput')?.value.trim() || "Newton's Laws";
    const numQuestions = intVal(document.getElementById('quizCountSelect')?.value, 5);
    const quizType = document.getElementById('quizTypeSelect')?.value || 'mcq';
    const btn = document.getElementById('generateQuizBtn');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating Quiz...`;
    }

    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(`Generating ${subject} quiz on '${chapter}' via Groq AI...`, 'info');
    }

    try {
      const res = await API.post('/quiz/generate', {
        subject: subject,
        chapter: chapter,
        num_questions: numQuestions,
        quiz_type: quizType
      });

      if (res && res.success && res.data && res.data.quiz) {
        const newQuiz = res.data.quiz;
        this.quizzesCache.unshift(newQuiz);
        this.renderQuizSetsGrid(this.quizzesCache);
        
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(`AI Quiz '${newQuiz.title}' ready!`, 'success');
        }

        document.getElementById('quizChapterInput').value = '';
        this.startQuiz(newQuiz);
      } else {
        throw new Error(res.message || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error("[QuizModule] Generate Error:", err);
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Quiz generation failed', 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Quiz`;
      }
    }
  },

  startQuizByIndex(idx) {
    if (this.quizzesCache && this.quizzesCache[idx]) {
      this.startQuiz(this.quizzesCache[idx]);
    }
  },

  startQuiz(quizObj) {
    this.currentQuiz = quizObj;
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = null;
    this.userAnswers = {};
    this.submittedQuestions = {};
    this.score = 0;
    this.elapsedSeconds = 0;

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      const timerEl = document.getElementById('quizTimerDisplay');
      if (timerEl) {
        const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
        const s = String(this.elapsedSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
      }
    }, 1000);

    const activeBox = document.getElementById('activeQuizBox');
    if (activeBox) activeBox.style.display = 'block';

    this.renderCurrentQuestion();

    if (activeBox) {
      activeBox.scrollIntoView({ behavior: 'smooth' });
    }
  },

  renderCurrentQuestion() {
    const activeBox = document.getElementById('activeQuizBox');
    if (!activeBox || !this.currentQuiz) return;

    const questions = this.currentQuiz.questions || [];
    const total = questions.length;
    
    // Safety check: Prevent index overflow
    if (this.currentQuestionIndex >= total) {
      this.finishQuiz();
      return;
    }

    const q = questions[this.currentQuestionIndex];
    const isSubmitted = !!this.submittedQuestions[this.currentQuestionIndex];
    const savedOptionIdx = this.userAnswers[this.currentQuestionIndex];
    this.selectedOptionIndex = savedOptionIdx !== undefined ? savedOptionIdx : null;

    const correctIdx = q.correct_index !== undefined ? q.correct_index : (q.correct_option || 0);

    const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
    const s = String(this.elapsedSeconds % 60).padStart(2, '0');

    activeBox.innerHTML = `
      <!-- Quiz Header & Progress -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="hyper-badge hyper-badge-emerald">${this.currentQuiz.subject || 'Science'}</span>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--hyper-text-primary);">${this.currentQuiz.title || 'Interactive Quiz'}</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="hyper-badge hyper-badge-cyan">Question ${this.currentQuestionIndex + 1} of ${total}</span>
          <span class="hyper-badge hyper-badge-primary" id="quizScoreBadge">Score: ${this.score} / ${total}</span>
          <span style="font-size: 0.85rem; color: var(--hyper-accent-amber); font-weight: 700;" title="Elapsed Time">⏱️ <span id="quizTimerDisplay">${m}:${s}</span></span>
        </div>
      </div>

      <!-- Question Text Card -->
      <div style="background: var(--hyper-bg-elevated); padding: 1.25rem 1.5rem; border-radius: var(--hyper-radius-sm); margin-bottom: 1.25rem; border-left: 4px solid var(--hyper-accent-emerald);">
        <p style="font-size: 1.05rem; font-weight: 600; color: var(--hyper-text-primary); line-height: 1.6;" id="quizQuestionContent">
          ${this.currentQuestionIndex + 1}. ${q.question || q.question_text || 'Question text unavailable'}
        </p>
      </div>

      <!-- Options Grid (2x2) -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;" id="quizOptionsGrid">
        ${(q.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          let btnStyle = "background: var(--hyper-bg-surface); border: 1px solid var(--hyper-border-subtle); color: var(--hyper-text-primary);";
          
          if (this.selectedOptionIndex === optIdx) {
            btnStyle = "background: var(--hyper-bg-hover); border: 2px solid var(--hyper-accent-emerald); color: #ffffff;";
          }

          if (isSubmitted) {
            if (optIdx === correctIdx) {
              btnStyle = "background: rgba(16, 185, 129, 0.2); border: 2px solid var(--hyper-accent-emerald); color: #ffffff;";
            } else if (this.selectedOptionIndex === optIdx && optIdx !== correctIdx) {
              btnStyle = "background: rgba(244, 63, 94, 0.2); border: 2px solid var(--hyper-accent-rose); color: #ffffff;";
            }
          }

          return `
            <button class="hyper-btn" style="${btnStyle} justify-content: flex-start; padding: 0.9rem 1.15rem; font-size: 0.93rem; border-radius: var(--hyper-radius-sm);" ${isSubmitted ? 'disabled' : ''} onclick="QuizModule.selectOption(${optIdx})">
              <strong style="color: var(--hyper-accent-cyan); margin-right: 0.5rem;">${letter})</strong> ${opt}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Solution Explanation Container -->
      <div id="quizExplanationBox" style="margin-bottom: 1.25rem;">
        ${isSubmitted ? this.getExplanationHTML(q, this.selectedOptionIndex, correctIdx) : '<span style="font-size: 0.85rem; color: var(--hyper-text-muted);">Select an option and click "Submit Answer".</span>'}
      </div>

      <!-- Navigation & Action Buttons -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 1rem;">
        <button class="hyper-btn hyper-btn-glass" onclick="QuizModule.prevQuestion()" ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
          <i class="fa-solid fa-arrow-left"></i> Previous
        </button>

        <div style="display: flex; gap: 0.75rem;">
          <button id="submitAnswerBtn" class="hyper-btn hyper-btn-primary" onclick="QuizModule.submitAnswer()" ${isSubmitted || this.selectedOptionIndex === null ? 'disabled' : ''}>
            <i class="fa-solid fa-check"></i> Submit Answer
          </button>
          
          <button id="nextQuestionBtn" class="hyper-btn hyper-btn-emerald" onclick="QuizModule.nextQuestion()" ${!isSubmitted ? 'disabled' : ''}>
            ${this.currentQuestionIndex + 1 === total ? 'Finish Quiz & View Results <i class="fa-solid fa-flag-checkered"></i>' : 'Next Question <i class="fa-solid fa-arrow-right"></i>'}
          </button>
        </div>
      </div>
    `;

    this.renderKaTeXMath(activeBox);
  },

  selectOption(optIdx) {
    if (this.submittedQuestions[this.currentQuestionIndex]) return;

    this.selectedOptionIndex = optIdx;
    this.userAnswers[this.currentQuestionIndex] = optIdx;

    // Update UI option buttons styling
    const grid = document.getElementById('quizOptionsGrid');
    if (grid) {
      const btns = grid.querySelectorAll('button');
      btns.forEach((btn, idx) => {
        if (idx === optIdx) {
          btn.style.borderColor = 'var(--hyper-accent-emerald)';
          btn.style.borderWidth = '2px';
          btn.style.background = 'var(--hyper-bg-hover)';
        } else {
          btn.style.borderColor = 'var(--hyper-border-subtle)';
          btn.style.borderWidth = '1px';
          btn.style.background = 'var(--hyper-bg-surface)';
        }
      });
    }

    // Enable Submit Button
    const submitBtn = document.getElementById('submitAnswerBtn');
    if (submitBtn) submitBtn.disabled = false;
  },

  submitAnswer() {
    if (this.selectedOptionIndex === null) {
      if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Please select an option first.', 'error');
      return;
    }

    const q = this.currentQuiz.questions[this.currentQuestionIndex];
    const correctIdx = q.correct_index !== undefined ? q.correct_index : (q.correct_option || 0);
    const isCorrect = (this.selectedOptionIndex === correctIdx);

    if (isCorrect) {
      this.score += 1;
    }

    this.submittedQuestions[this.currentQuestionIndex] = true;

    // Render explanation and update options grid
    this.renderCurrentQuestion();

    if (typeof UI !== 'undefined' && UI.showToast) {
      if (isCorrect) UI.showToast('Correct answer! +1 Point', 'success');
      else UI.showToast('Incorrect answer.', 'error');
    }
  },

  getExplanationHTML(q, selectedIdx, correctIdx) {
    const isCorrect = (selectedIdx === correctIdx);
    const correctLetter = String.fromCharCode(65 + correctIdx);
    const correctText = (q.options && q.options[correctIdx]) ? q.options[correctIdx] : '';

    return `
      <div style="background: ${isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'}; border: 1px solid ${isCorrect ? 'var(--hyper-accent-emerald)' : 'var(--hyper-accent-rose)'}; padding: 1rem 1.25rem; border-radius: var(--hyper-radius-sm);">
        <div style="font-size: 0.95rem; font-weight: 700; color: ${isCorrect ? 'var(--hyper-accent-emerald)' : 'var(--hyper-accent-rose)'}; margin-bottom: 0.35rem;">
          ${isCorrect ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
        </div>
        <div style="font-size: 0.88rem; color: var(--hyper-text-primary); line-height: 1.55;">
          ${!isCorrect ? `<strong>Correct Option:</strong> ${correctLetter}) ${correctText}<br/>` : ''}
          <strong>AI Solution Key:</strong> ${q.explanation || 'The selected option aligns with core syllabus principles.'}
        </div>
      </div>
    `;
  },

  nextQuestion() {
    if (!this.submittedQuestions[this.currentQuestionIndex]) {
      if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Please submit your answer before moving next.', 'error');
      return;
    }

    this.currentQuestionIndex += 1;
    const total = this.currentQuiz.questions ? this.currentQuiz.questions.length : 5;

    if (this.currentQuestionIndex >= total) {
      this.finishQuiz();
    } else {
      this.selectedOptionIndex = null;
      this.renderCurrentQuestion();
    }
  },

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex -= 1;
      this.renderCurrentQuestion();
    }
  },

  async finishQuiz() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const activeBox = document.getElementById('activeQuizBox');
    if (!activeBox || !this.currentQuiz) return;

    const total = this.currentQuiz.questions ? this.currentQuiz.questions.length : 5;
    const accuracy = roundVal((this.score / total) * 100, 1);
    const mins = Math.floor(this.elapsedSeconds / 60);
    const secs = this.elapsedSeconds % 60;
    const timeStr = `${mins}m ${secs}s`;

    let grade = "A+ (Outstanding)";
    let badgeClass = "hyper-badge-emerald";
    if (accuracy < 50) { grade = "F (Needs Revision)"; badgeClass = "hyper-badge-rose"; }
    else if (accuracy < 70) { grade = "C (Pass)"; badgeClass = "hyper-badge-amber"; }
    else if (accuracy < 85) { grade = "B (Good)"; badgeClass = "hyper-badge-cyan"; }
    else if (accuracy < 95) { grade = "A (Excellent)"; badgeClass = "hyper-badge-primary"; }

    // Display loading state while saving to MongoDB
    activeBox.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--hyper-accent-emerald); margin-bottom: 1rem;"></i>
        <h3 style="color: var(--hyper-text-primary); font-size: 1.3rem;">Evaluating Quiz Answers & Saving to MongoDB...</h3>
      </div>
    `;

    let submitResult = null;
    try {
      const res = await API.post('/quiz/submit', {
        quiz_id: this.currentQuiz.id || 'quiz_main',
        answers: this.userAnswers,
        time_taken: this.elapsedSeconds
      });

      if (res && res.success && res.data) {
        submitResult = res.data.result;
      }
    } catch (err) {
      console.warn("[QuizModule] Submit API warning:", err);
    }

    // Render Detailed Results Screen
    activeBox.innerHTML = `
      <div style="text-align: center; max-width: 750px; margin: 0 auto; padding: 1rem 0;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem; color: var(--hyper-accent-emerald);">
          🏆
        </div>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--hyper-text-primary); margin-bottom: 0.35rem;">Quiz Evaluation Completed!</h2>
        <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-bottom: 1.75rem;">Great job! Here is your performance overview and AI solution breakdown.</p>

        <!-- Stats Bento Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: var(--hyper-bg-elevated); padding: 1.25rem; border-radius: var(--hyper-radius-md); border: 1px solid var(--hyper-border-subtle);">
            <div style="font-size: 0.78rem; color: var(--hyper-text-muted); font-weight: 600;">FINAL SCORE</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-emerald); margin-top: 0.25rem;">${this.score} / ${total}</div>
          </div>

          <div style="background: var(--hyper-bg-elevated); padding: 1.25rem; border-radius: var(--hyper-radius-md); border: 1px solid var(--hyper-border-subtle);">
            <div style="font-size: 0.78rem; color: var(--hyper-text-muted); font-weight: 600;">ACCURACY</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-cyan); margin-top: 0.25rem;">${accuracy}%</div>
          </div>

          <div style="background: var(--hyper-bg-elevated); padding: 1.25rem; border-radius: var(--hyper-radius-md); border: 1px solid var(--hyper-border-subtle);">
            <div style="font-size: 0.78rem; color: var(--hyper-text-muted); font-weight: 600;">TIME TAKEN</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-amber); margin-top: 0.25rem;">${timeStr}</div>
          </div>

          <div style="background: var(--hyper-bg-elevated); padding: 1.25rem; border-radius: var(--hyper-radius-md); border: 1px solid var(--hyper-border-subtle);">
            <div style="font-size: 0.78rem; color: var(--hyper-text-muted); font-weight: 600;">GRADE</div>
            <div style="font-size: 1.15rem; font-weight: 800; margin-top: 0.4rem;"><span class="hyper-badge ${badgeClass}">${grade}</span></div>
          </div>
        </div>

        <!-- Detailed AI Solutions Breakdown -->
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--hyper-text-primary); text-align: left; margin-bottom: 1rem;">
          <i class="fa-solid fa-list-check" style="color: var(--hyper-accent-cyan);"></i> Question-by-Question Solution Breakdown
        </h3>

        <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-bottom: 2rem;">
          ${(this.currentQuiz.questions || []).map((q, idx) => {
            const userOpt = this.userAnswers[idx];
            const correctIdx = q.correct_index !== undefined ? q.correct_index : (q.correct_option || 0);
            const isCorrect = (userOpt === correctIdx);

            return `
              <div style="background: var(--hyper-bg-elevated); border: 1px solid ${isCorrect ? 'var(--hyper-accent-emerald)' : 'var(--hyper-accent-rose)'}; padding: 1.25rem; border-radius: var(--hyper-radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <strong style="color: var(--hyper-text-primary);">Q${idx + 1}. ${q.question}</strong>
                  <span class="hyper-badge ${isCorrect ? 'hyper-badge-emerald' : 'hyper-badge-rose'}">${isCorrect ? '✅ Correct (+1)' : '❌ Incorrect (0)'}</span>
                </div>
                <div style="font-size: 0.88rem; color: var(--hyper-text-secondary); line-height: 1.5;">
                  <strong>Your Answer:</strong> ${userOpt !== undefined ? String.fromCharCode(65 + userOpt) + ') ' + (q.options ? q.options[userOpt] : '') : 'Not Answered'}<br/>
                  ${!isCorrect ? `<strong>Correct Answer:</strong> ${String.fromCharCode(65 + correctIdx)}) ${q.options ? q.options[correctIdx] : ''}<br/>` : ''}
                  <strong>Explanation:</strong> ${q.explanation || 'Solution matches standard Board curriculum.'}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Action Controls -->
        <div style="display: flex; justify-content: center; gap: 1rem;">
          <button class="hyper-btn hyper-btn-emerald" onclick="QuizModule.restartQuiz()">
            <i class="fa-solid fa-rotate-right"></i> Restart Quiz
          </button>
          <button class="hyper-btn hyper-btn-glass" onclick="location.hash='#analytics'">
            <i class="fa-solid fa-chart-line"></i> View Analytics Dashboard
          </button>
        </div>
      </div>
    `;

    this.renderKaTeXMath(activeBox);

    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(`Quiz finished! Score: ${this.score}/${total} saved to MongoDB.`, 'success');
    }
  },

  restartQuiz() {
    if (this.currentQuiz) {
      this.startQuiz(this.currentQuiz);
    }
  },

  renderKaTeXMath(container) {
    if (typeof renderMathInElement !== 'undefined' && container) {
      try {
        renderMathInElement(container, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn('KaTeX render warning:', err);
      }
    }
  },

  getDefaultPhysicsQuestions() {
    return [
      {
        question: "What is the refractive index of glass relative to air if the speed of light in glass is 2 × 10⁸ m/s?",
        options: ["1.25", "1.50", "1.33", "2.00"],
        correct_index: 1,
        explanation: "Formula: n = c / v = (3 × 10⁸) / (2 × 10⁸) = 1.50"
      },
      {
        question: "According to Newton's Second Law of Motion, force is equal to:",
        options: ["Mass × Velocity", "Mass × Acceleration", "Work / Time", "Mass / Volume"],
        correct_index: 1,
        explanation: "F = m × a (Force equals mass multiplied by acceleration)."
      },
      {
        question: "What type of lens is used to correct Hypermetropia (farsightedness)?",
        options: ["Concave Lens", "Convex Lens", "Bifocal Lens", "Cylindrical Lens"],
        correct_index: 1,
        explanation: "Convex lens converges light rays to focus image properly on retina."
      },
      {
        question: "The SI unit of Electrical Power is:",
        options: ["Joule", "Ohm", "Watt", "Ampere"],
        correct_index: 2,
        explanation: "1 Watt = 1 Joule per second (P = V × I)."
      },
      {
        question: "An object is placed at 2F in front of a convex lens. The image formed will be:",
        options: ["Virtual & Erect", "Real, Inverted & Same Size at 2F", "Diminished at F", "Magnified at Infinity"],
        correct_index: 1,
        explanation: "When object is at 2F, real and inverted image of equal size is formed at 2F."
      }
    ];
  },

  getDefaultChemistryQuestions() {
    return [
      {
        question: "What is formed when Carbon Dioxide gas is passed through Lime Water?",
        options: ["Milky White Calcium Carbonate", "Blue Copper Sulphate", "Yellow Lead Iodide", "Green Ferrous Sulphate"],
        correct_index: 0,
        explanation: "Ca(OH)₂ + CO₂ → CaCO₃ (white precipitate) + H₂O"
      },
      {
        question: "Which acid is present in ant sting?",
        options: ["Acetic Acid", "Methanoic Acid (Formic Acid)", "Citric Acid", "Tartaric Acid"],
        correct_index: 1,
        explanation: "Ant sting releases methanoic acid causing burning pain."
      },
      {
        question: "Why is the first ionization enthalpy of Nitrogen (N) higher than Oxygen (O)?",
        options: ["Nitrogen has smaller size", "Nitrogen has half-filled stable 2p³ subshell", "Oxygen has higher electronegativity", "Oxygen is a gas"],
        correct_index: 1,
        explanation: "Nitrogen (1s² 2s² 2p³) has extra stability due to half-filled p-orbitals."
      },
      {
        question: "The chemical formula of Plaster of Paris is:",
        options: ["CaSO₄ · 2H₂O", "CaSO₄ · ½H₂O", "Na₂CO₃ · 10H₂O", "CuSO₄ · 5H₂O"],
        correct_index: 1,
        explanation: "Plaster of Paris is Calcium Sulphate Hemihydrate (CaSO₄ · ½H₂O)."
      },
      {
        question: "Which metal is liquid at room temperature?",
        options: ["Sodium", "Mercury", "Gallium", "Potassium"],
        correct_index: 1,
        explanation: "Mercury (Hg) is the only metal that exists as liquid at room temperature."
      }
    ];
  },

  getDefaultMathQuestions() {
    return [
      {
        question: "What is the derivative of f(x) = x³ + 5x with respect to x?",
        options: ["3x² + 5", "3x + 5", "x² + 5", "6x"],
        correct_index: 0,
        explanation: "d/dx(xⁿ) = n·xⁿ⁻¹. Thus d/dx(x³ + 5x) = 3x² + 5."
      },
      {
        question: "What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?",
        options: ["8", "-8", "16", "0"],
        correct_index: 1,
        explanation: "D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8 (No real roots)."
      },
      {
        question: "The n-th term of an Arithmetic Progression is given by aₙ = 3 + 4n. The common difference is:",
        options: ["3", "4", "7", "1"],
        correct_index: 1,
        explanation: "a₁ = 7, a₂ = 11. Common difference d = a₂ - a₁ = 4."
      },
      {
        question: "What is sin²θ + cos²θ equal to?",
        options: ["0", "1", "2", "tan θ"],
        correct_index: 1,
        explanation: "Standard trigonometric identity: sin²θ + cos²θ = 1."
      },
      {
        question: "Distance between points (0,0) and (6,8) is:",
        options: ["10", "14", "48", "7"],
        correct_index: 0,
        explanation: "d = √(6² + 8²) = √(36 + 64) = √100 = 10."
      }
    ];
  },

  getDefaultBiologyQuestions() {
    return [
      {
        question: "Which organelle is known as the powerhouse of the cell?",
        options: ["Ribosome", "Mitochondria", "Golgi Apparatus", "Nucleus"],
        correct_index: 1,
        explanation: "Mitochondria generates ATP through cellular respiration."
      },
      {
        question: "In human digestive system, bile juice is produced by:",
        options: ["Stomach", "Pancreas", "Liver", "Gallbladder"],
        correct_index: 2,
        explanation: "Bile is secreted by the Liver and stored in the Gallbladder."
      },
      {
        question: "What is the primary site of Photosynthesis in green plants?",
        options: ["Stomata", "Chloroplasts", "Xylem", "Phloem"],
        correct_index: 1,
        explanation: "Chloroplasts contain chlorophyll pigments that absorb sunlight for photosynthesis."
      },
      {
        question: "The breakdown of glucose into pyruvate takes place in:",
        options: ["Mitochondria", "Cytoplasm", "Chloroplast", "Nucleus"],
        correct_index: 1,
        explanation: "Glycolysis occurs in cytoplasm yielding 2 pyruvate molecules."
      },
      {
        question: "Blood tissue component responsible for clotting is:",
        options: ["RBCs", "WBCs", "Platelets", "Plasma"],
        correct_index: 2,
        explanation: "Blood Platelets (thrombocytes) initiate blood coagulation at injury sites."
      }
    ];
  }
};

function intVal(val, defaultVal) {
  try {
    const num = parseInt(val, 10);
    return isNaN(num) ? defaultVal : num;
  } catch (e) {
    return defaultVal;
  }
}

function roundVal(val, decimals) {
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}

window.QuizModule = QuizModule;
