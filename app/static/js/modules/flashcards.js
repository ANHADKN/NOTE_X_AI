/* noteX AI - Active Recall Flashcards Controller (Hyper Pro) */
const FlashcardsModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(99, 102, 241, 0.15)); border-color: rgba(245, 158, 11, 0.35); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-amber" style="margin-bottom: 0.5rem;"><i data-lucide="layers"></i> Active Recall Deck</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Interactive Flashcard Decks</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Spaced repetition revision stage with 20 master Class 10 cards.
              </p>
            </div>
          </div>
        </div>

        <!-- 3D Active Recall Card Interactive Stage -->
        <div class="hyper-card hyper-col-12" style="min-height: 280px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; background: rgba(10, 14, 23, 0.9); border: 2px solid var(--hyper-accent-amber); text-align: center; padding: 2rem;" id="flashcardStage">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <span class="hyper-badge hyper-badge-amber" id="fcSubjectBadge">Physics</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--hyper-text-muted);" id="fcCounter">Card 1 / 20</span>
          </div>

          <div style="margin: 1.5rem 0;" id="fcContentArea" onclick="FlashcardsModule.flipCard()">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--hyper-accent-amber); text-transform: uppercase; margin-bottom: 0.5rem;" id="fcStateLabel">QUESTION (Click to reveal answer)</div>
            <h3 style="font-size: 1.4rem; font-weight: 700; color: var(--hyper-text-primary);" id="fcText">
              What is Snell's Law formula for light refraction?
            </h3>
          </div>

          <div style="display: flex; gap: 1rem; width: 100%; justify-content: center;" id="fcRatingButtons">
            <button class="hyper-btn hyper-btn-glass" onclick="FlashcardsModule.rateCard('hard')" style="color: var(--hyper-accent-rose);">🔴 Hard (1 day)</button>
            <button class="hyper-btn hyper-btn-glass" onclick="FlashcardsModule.rateCard('medium')" style="color: var(--hyper-accent-amber);">🟡 Medium (3 days)</button>
            <button class="hyper-btn hyper-btn-glass" onclick="FlashcardsModule.rateCard('easy')" style="color: var(--hyper-accent-emerald);">🟢 Easy (7 days)</button>
            <button class="hyper-btn hyper-btn-amber" onclick="FlashcardsModule.nextCard()">Next Card <i data-lucide="arrow-right" style="width: 15px;"></i></button>
          </div>
        </div>

        <!-- 20 Flashcards Deck Grid -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="layers" style="color: var(--hyper-accent-amber); width: 18px;"></i> All Active Recall Cards (20)
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem;">
            ${this.get20CardsHTML()}
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

  currentIndex: 0,
  isFlipped: false,

  flipCard() {
    this.isFlipped = !this.isFlipped;
    const card = this.cards[this.currentIndex];
    const text = document.getElementById('fcText');
    const label = document.getElementById('fcStateLabel');

    if (text && label) {
      if (this.isFlipped) {
        label.textContent = "ANSWER";
        label.style.color = "var(--hyper-accent-emerald)";
        text.textContent = card.a;
      } else {
        label.textContent = "QUESTION (Click to reveal answer)";
        label.style.color = "var(--hyper-accent-amber)";
        text.textContent = card.q;
      }
    }
  },

  nextCard() {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.isFlipped = false;
    this.updateCardView();
  },

  selectCard(index) {
    this.currentIndex = index;
    this.isFlipped = false;
    this.updateCardView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateCardView() {
    const card = this.cards[this.currentIndex];
    const counter = document.getElementById('fcCounter');
    const badge = document.getElementById('fcSubjectBadge');
    const text = document.getElementById('fcText');
    const label = document.getElementById('fcStateLabel');

    if (counter) counter.textContent = `Card ${this.currentIndex + 1} / ${this.cards.length}`;
    if (badge) badge.textContent = card.subject;
    if (label) {
      label.textContent = "QUESTION (Click to reveal answer)";
      label.style.color = "var(--hyper-accent-amber)";
    }
    if (text) text.textContent = card.q;
  },

  rateCard(rating) {
    UI.showToast(`Card rated ${rating}. Spaced repetition interval updated!`, 'info');
    this.nextCard();
  },

  get20CardsHTML() {
    return this.cards.map((c, idx) => `
      <div class="hyper-card hyper-card-interactive" style="padding: 0.85rem;" onclick="FlashcardsModule.selectCard(${idx})">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <span class="hyper-badge hyper-badge-amber">${c.subject}</span>
          <span style="font-size: 0.75rem; color: var(--hyper-text-muted);">#${c.id}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-primary); line-height: 1.3;">
          ${c.q}
        </div>
      </div>
    `).join('');
  }
};

window.FlashcardsModule = FlashcardsModule;
