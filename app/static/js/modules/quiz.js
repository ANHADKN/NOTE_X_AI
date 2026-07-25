/* noteX AI - AI Quiz Challenge System Controller (Hyper Pro) */
const QuizModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15)); border-color: rgba(16, 185, 129, 0.35); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-emerald" style="margin-bottom: 0.5rem;"><i data-lucide="help-circle"></i> Quiz Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Quiz & Board Evaluation System</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Practice MCQs, 2-Mark questions, and HOTS problems with step-by-step AI solution keys.
              </p>
            </div>
          </div>
        </div>

        <!-- 5 Quiz Sets Grid -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="award" style="color: var(--hyper-accent-emerald); width: 18px;"></i> Available Quiz Sets (5)
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
            ${this.get5QuizSetsHTML()}
          </div>
        </div>

        <!-- Active Interactive Quiz Challenge Box -->
        <div class="hyper-card hyper-col-12" id="activeQuizBox" style="border-color: var(--hyper-accent-emerald);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="hyper-badge hyper-badge-emerald" id="quizSubjectBadge">Physics</span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--hyper-text-primary);" id="quizTitleHeader">Physics Light & Optics MCQ Challenge</h3>
            </div>
            <span class="hyper-badge hyper-badge-cyan">Question 1 of 5</span>
          </div>

          <div style="background: var(--hyper-bg-elevated); padding: 1.25rem; border-radius: var(--hyper-radius-sm); margin-bottom: 1.25rem;">
            <p style="font-size: 1.05rem; font-weight: 600; color: var(--hyper-text-primary);" id="quizQuestionText">
              1. What is the refractive index of glass relative to air if the speed of light in glass is 2 × 10⁸ m/s?
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;" id="quizOptionsGrid">
            <button class="hyper-btn hyper-btn-glass" style="justify-content: flex-start; padding: 0.85rem;" onclick="QuizModule.selectOption(0, false)">A) 1.25</button>
            <button class="hyper-btn hyper-btn-glass" style="justify-content: flex-start; padding: 0.85rem;" onclick="QuizModule.selectOption(1, true)">B) 1.50 (Correct)</button>
            <button class="hyper-btn hyper-btn-glass" style="justify-content: flex-start; padding: 0.85rem;" onclick="QuizModule.selectOption(2, false)">C) 1.33</button>
            <button class="hyper-btn hyper-btn-glass" style="justify-content: flex-start; padding: 0.85rem;" onclick="QuizModule.selectOption(3, false)">D) 2.00</button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.82rem; color: var(--hyper-text-muted);" id="quizExplanationText">Select an option to evaluate solution.</span>
            <button class="hyper-btn hyper-btn-emerald" onclick="QuizModule.nextQuizQuestion()">
              Submit & Next <i data-lucide="arrow-right" style="width: 15px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  quizSets: [
    { id: 1, title: "Physics Light & Optics MCQ & HOTS Challenge", subject: "Physics", count: 10, duration: "25 Mins" },
    { id: 2, title: "Chemistry Chemical Reactions & Acids Test", subject: "Chemistry", count: 10, duration: "20 Mins" },
    { id: 3, title: "Mathematics Quadratic Equations & AP Quiz", subject: "Mathematics", count: 10, duration: "30 Mins" },
    { id: 4, title: "Biology Life Processes & Nutrition Quiz", subject: "Biology", count: 10, duration: "20 Mins" },
    { id: 5, title: "Social Science Indian Freedom Struggle Quiz", subject: "History", count: 10, duration: "15 Mins" }
  ],

  get5QuizSetsHTML() {
    return this.quizSets.map(q => `
      <div class="hyper-card hyper-card-interactive" style="padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="hyper-badge hyper-badge-emerald">${q.subject}</span>
            <span style="font-size: 0.75rem; color: var(--hyper-text-muted); font-weight: 600;">⏱️ ${q.duration}</span>
          </div>
          <h4 style="font-size: 1rem; font-weight: 700; color: var(--hyper-text-primary); margin-bottom: 0.5rem;">${q.title}</h4>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem; margin-top: 0.75rem;">
          <span style="font-size: 0.78rem; color: var(--hyper-text-muted);">${q.count} Questions</span>
          <button class="hyper-btn hyper-btn-emerald hyper-btn-sm" onclick="QuizModule.loadQuiz(${q.id})">Start Quiz</button>
        </div>
      </div>
    `).join('');
  },

  selectOption(optIdx, isCorrect) {
    const exp = document.getElementById('quizExplanationText');
    if (exp) {
      if (isCorrect) {
        exp.innerHTML = "✅ <strong style='color: var(--hyper-accent-emerald);'>Correct!</strong> Formula: n = c / v = (3 × 10⁸) / (2 × 10⁸) = 1.50";
      } else {
        exp.innerHTML = "❌ <strong style='color: var(--hyper-accent-rose);'>Incorrect!</strong> Refractive index n = c / v = 1.50";
      }
    }
  },

  loadQuiz(id) {
    const qSet = this.quizSets.find(s => s.id === id);
    if (qSet) {
      document.getElementById('quizTitleHeader').textContent = qSet.title;
      document.getElementById('quizSubjectBadge').textContent = qSet.subject;
      UI.showToast(`Loaded ${qSet.title}`, 'success');
    }
  },

  nextQuizQuestion() {
    UI.showToast("Question submitted! Next question loaded.", "info");
  }
};

window.QuizModule = QuizModule;
