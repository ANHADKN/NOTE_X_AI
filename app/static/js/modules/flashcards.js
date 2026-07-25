/* noteX AI - Active Recall Flashcards Controller (3D Flip & Spaced Repetition) */
const FlashcardsModule = {
  currentIndex: 0,
  isFlipped: false,
  streakCount: 7,

  cards: [
    { id: 1, subject: "Physics", q: "What is Snell's Law formula for light refraction?", a: "n₁ sin(θ₁) = n₂ sin(θ₂)" },
    { id: 2, subject: "Physics", q: "How are focal length and radius of curvature related?", a: "f = R / 2" },
    { id: 3, subject: "Physics", q: "What is the SI unit for Power of Lens?", a: "Dioptre (D), where D = 1 / f (in meters)" },
    { id: 4, subject: "Chemistry", q: "Define Exothermic Reaction with an example.", a: "A chemical reaction that releases heat energy. E.g., Respiration." },
    { id: 5, subject: "Chemistry", q: "Define Endothermic Reaction with an example.", a: "A reaction that absorbs thermal energy. E.g., Photosynthesis." },
    { id: 6, subject: "Mathematics", q: "What is the formula for Quadratic Discriminant (D)?", a: "D = b² - 4ac" },
    { id: 7, subject: "Mathematics", q: "What condition yields Real & Equal roots?", a: "Discriminant D = 0 (b² - 4ac = 0)" },
    { id: 8, subject: "Mathematics", q: "What is the Sum of Roots formula for ax² + bx + c = 0?", a: "α + β = -b / a" },
    { id: 9, subject: "Mathematics", q: "What is the Product of Roots formula for ax² + bx + c = 0?", a: "α · β = c / a" },
    { id: 10, subject: "Biology", q: "Where does Photosynthesis take place in plant cells?", a: "Chloroplasts containing Chlorophyll pigment" },
    { id: 11, subject: "Biology", q: "What are the two main functions of Bile Juice?", a: "1. Emulsification of fats\n2. Making acidic food alkaline in small intestine" },
    { id: 12, subject: "Physics", q: "State Ohm's Law mathematical relation.", a: "V = I · R (Voltage = Current × Resistance)" },
    { id: 13, subject: "Physics", q: "Formula for equivalent resistance of 3 resistors in Series?", a: "R_eq = R₁ + R₂ + R₃" },
    { id: 14, subject: "Physics", q: "Formula for equivalent resistance of 3 resistors in Parallel?", a: "1/R_eq = 1/R₁ + 1/R₂ + 1/R₃" },
    { id: 15, subject: "Physics", q: "State Joule's Law of Heating formula.", a: "H = I² · R · t" },
    { id: 16, subject: "Chemistry", q: "Color of Universal Indicator in neutral solution (pH 7)?", a: "Green" },
    { id: 17, subject: "Chemistry", q: "Write the general formula for a Neutralization reaction.", a: "Acid + Base → Salt + Water" },
    { id: 18, subject: "History", q: "On what date did Mahatma Gandhi start the Dandi Salt March?", a: "March 12, 1930" },
    { id: 19, subject: "Mathematics", q: "Formula for N-th term of an Arithmetic Progression?", a: "a_n = a + (n - 1)d" },
    { id: 20, subject: "Mathematics", q: "Formula for the sum of first N natural numbers?", a: "S_n = [ n(n + 1) ] / 2" }
  ],

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(14, 165, 233, 0.08)); border-color: rgba(245, 158, 11, 0.25); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-amber" style="margin-bottom: 0.5rem;"><i data-lucide="layers"></i> Active Recall Deck</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">3D Active Recall Flashcard Decks</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Spaced repetition revision stage with 3D flip card memory training.
              </p>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <span class="hyper-badge hyper-badge-amber" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;">🔥 ${this.streakCount} Day Memory Streak</span>
            </div>
          </div>
        </div>

        <!-- Progress Indicator Bar -->
        <div class="hyper-col-12" style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: var(--hyper-radius-md); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1; margin-right: 1.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: var(--hyper-text-secondary); margin-bottom: 0.35rem;">
              <span>Session Progress</span>
              <span id="fcProgressText">Card 1 of 20 (5%)</span>
            </div>
            <div style="width: 100%; height: 8px; background: #F1F5F9; border-radius: var(--hyper-radius-full); overflow: hidden;">
              <div id="fcProgressBar" style="width: 5%; height: 100%; background: linear-gradient(90deg, var(--hyper-accent-amber), var(--hyper-accent-primary)); transition: width 0.3s ease;"></div>
            </div>
          </div>
          <span class="hyper-badge hyper-badge-primary" id="fcSubjectBadge">Physics</span>
        </div>

        <!-- 3D Card Stage -->
        <div class="hyper-col-12" style="display: flex; justify-content: center; padding: 1rem 0;">
          <div style="perspective: 1000px; width: 100%; max-width: 650px; height: 320px; cursor: pointer;" onclick="FlashcardsModule.flipCard()">
            <div id="fc3DCard" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.08); border-radius: var(--hyper-radius-lg);">
              <!-- Front Face (Question) -->
              <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: #FFFFFF; border: 2px solid var(--hyper-accent-amber); border-radius: var(--hyper-radius-lg); padding: 2.5rem 2rem; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center;">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--hyper-accent-amber); text-transform: uppercase; letter-spacing: 0.05em;">QUESTION (Click to flip 3D)</div>
                <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--hyper-text-primary); line-height: 1.5;" id="fcQuestionText">
                  ${this.cards[0].q}
                </h3>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted);">💡 Click card or press Spacebar to reveal solution key</div>
              </div>

              <!-- Back Face (Answer) -->
              <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg); background: #F8FAFC; border: 2px solid var(--hyper-accent-primary); border-radius: var(--hyper-radius-lg); padding: 2.5rem 2rem; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center;">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--hyper-accent-primary); text-transform: uppercase; letter-spacing: 0.05em;">ANSWER & SOLUTION</div>
                <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--hyper-accent-primary); line-height: 1.5;" id="fcAnswerText">
                  ${this.cards[0].a}
                </h3>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted);">Rate difficulty below to schedule spaced recall</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Difficulty Ratings Bar -->
        <div class="hyper-col-12" style="display: flex; justify-content: center; gap: 0.85rem; flex-wrap: wrap;">
          <button class="hyper-btn hyper-btn-glass" onclick="FlashcardsModule.rateCard('hard')" style="color: var(--hyper-accent-rose); border-color: rgba(255,107,107,0.3);">🔴 Hard (1 Day)</button>
          <button class="hyper-btn hyper-btn-glass" onclick="FlashcardsModule.rateCard('medium')" style="color: var(--hyper-accent-amber); border-color: rgba(245,158,11,0.3);">🟡 Medium (3 Days)</button>
          <button class="hyper-btn hyper-btn-glass" onclick="FlashcardsModule.rateCard('easy')" style="color: var(--hyper-accent-emerald); border-color: rgba(16,185,129,0.3);">🟢 Easy (7 Days)</button>
          <button class="hyper-btn hyper-btn-primary" onclick="FlashcardsModule.nextCard()">Next Card <i data-lucide="arrow-right" style="width: 16px;"></i></button>
        </div>

        <!-- 20 Cards Overview Deck Grid -->
        <div class="hyper-card hyper-col-12" style="margin-top: 1rem;">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="layers" style="color: var(--hyper-accent-amber); width: 18px;"></i> All Spaced Recall Cards (20)
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem;">
            ${this.cards.map((c, i) => `
              <div class="hyper-card hyper-card-interactive" style="padding: 1rem; border-left: 3px solid var(--hyper-accent-amber); background: #FFFFFF;" onclick="FlashcardsModule.jumpToCard(${i})">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <span class="hyper-badge hyper-badge-amber">Card ${i + 1}</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--hyper-text-muted);">${c.subject}</span>
                </div>
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--hyper-text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${c.q}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.currentIndex = 0;
    this.isFlipped = false;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  flipCard() {
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById('fc3DCard');
    if (cardEl) {
      cardEl.style.transform = this.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
  },

  updateCardStage() {
    this.isFlipped = false;
    const cardEl = document.getElementById('fc3DCard');
    if (cardEl) {
      cardEl.style.transform = 'rotateY(0deg)';
    }

    const card = this.cards[this.currentIndex];
    const qText = document.getElementById('fcQuestionText');
    const aText = document.getElementById('fcAnswerText');
    const badge = document.getElementById('fcSubjectBadge');
    const progText = document.getElementById('fcProgressText');
    const progBar = document.getElementById('fcProgressBar');

    if (qText) qText.textContent = card.q;
    if (aText) aText.textContent = card.a;
    if (badge) badge.textContent = card.subject;
    
    const pct = Math.round(((this.currentIndex + 1) / this.cards.length) * 100);
    if (progText) progText.textContent = `Card ${this.currentIndex + 1} of ${this.cards.length} (${pct}%)`;
    if (progBar) progBar.style.width = `${pct}%`;
  },

  nextCard() {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.updateCardStage();
  },

  jumpToCard(idx) {
    this.currentIndex = idx;
    this.updateCardStage();
    window.scrollTo({ top: 150, behavior: 'smooth' });
  },

  rateCard(rating) {
    if (typeof UI !== 'undefined' && UI.showToast) {
      const msg = rating === 'easy' ? 'Scheduled for 7 days revision!' : (rating === 'medium' ? 'Scheduled for 3 days revision!' : 'Scheduled for 1 day revision!');
      UI.showToast(`Card rated ${rating.toUpperCase()} — ${msg}`, 'success');
    }
    this.nextCard();
  }
};

window.FlashcardsModule = FlashcardsModule;
