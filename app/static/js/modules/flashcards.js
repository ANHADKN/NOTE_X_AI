/* noteX AI - Flashcards Module Controller */
const FlashcardsModule = {
  currentCards: [],
  currentIndex: 0,
  isFlipped: false,
  activeDeckId: null,

  async render(container) {
    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;">AI Interactive Flashcards</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Active Recall & Spaced Repetition for <strong style="color: var(--accent-cyan);">${APP_STATE.currentGrade}</strong>.</p>
            </div>
          </div>
        </div>

        <!-- Creator Form -->
        <div class="glass-card section-card" style="margin-bottom: 2rem;">
          <div class="section-title">
            <span><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-cyan); margin-right: 0.5rem;"></i> Generate New Flashcard Deck</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
              <select id="flashcardSubjectSelect" class="glass-input">
                <option value="Science" selected>Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Topic or Chapter:</label>
              <input type="text" id="flashcardTopicInput" class="glass-input" placeholder="e.g. Periodic Table, Quadratic Formulas, Photosynthesis...">
            </div>

            <button class="btn-glass" onclick="FlashcardsModule.handleGenerateDeck()">
              <i class="fa-solid fa-layer-group"></i> Create Deck
            </button>
          </div>

          <div id="flashcardGenStatus" style="font-size: 0.85rem; text-align: center; margin-top: 0.75rem;"></div>
        </div>

        <!-- Card Runner Area -->
        <div id="flashcardRunnerArea"></div>

        <!-- Saved Decks Library -->
        <div class="glass-card section-card" style="margin-top: 2rem;">
          <div class="section-title">
            <span><i class="fa-solid fa-box-archive" style="color: var(--accent-indigo); margin-right: 0.5rem;"></i> Your Flashcard Decks</span>
          </div>
          <div id="flashcardDecksGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            <div style="text-align: center; color: var(--text-secondary); padding: 1.5rem; grid-column: 1/-1;">Loading saved decks...</div>
          </div>
        </div>
      </div>
    `;

    await this.loadDecksLibrary();
  },

  async handleGenerateDeck() {
    const topicInput = document.getElementById('flashcardTopicInput');
    const subjectSelect = document.getElementById('flashcardSubjectSelect');
    const statusDiv = document.getElementById('flashcardGenStatus');

    const topic = (topicInput ? topicInput.value : '').trim();
    const subject = subjectSelect ? subjectSelect.value : 'Science';

    if (!topic) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--accent-rose)';
        statusDiv.textContent = 'Please enter a topic name.';
      }
      return;
    }

    if (statusDiv) {
      statusDiv.style.color = 'var(--accent-cyan)';
      statusDiv.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating AI Flashcards for ${topic}...`;
    }

    try {
      const res = await API.post('/flashcards/generate', {
        subject: subject,
        topic: topic,
        count: 5
      });

      if (res && res.success && res.data.deck) {
        if (statusDiv) {
          statusDiv.style.color = 'var(--accent-emerald)';
          statusDiv.textContent = res.message;
        }
        if (topicInput) topicInput.value = '';
        await this.loadDecksLibrary();
        this.startReviewSession(res.data.deck.cards, res.data.deck.title);
      } else {
        if (statusDiv) {
          statusDiv.style.color = 'var(--accent-rose)';
          statusDiv.textContent = res.message || 'Failed to generate deck.';
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--accent-rose)';
        statusDiv.textContent = `Error: ${e.message}`;
      }
    }
  },

  async loadDecksLibrary() {
    const container = document.getElementById('flashcardDecksGrid');
    if (!container) return;

    try {
      const res = await API.get('/flashcards/decks');
      if (res && res.success && res.data && res.data.decks && res.data.decks.length > 0) {
        container.innerHTML = res.data.decks.map(deck => `
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
            <div>
              <div style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.35rem;">${deck.subject}</div>
              <h4 style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.35rem;">${deck.title}</h4>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">${deck.card_count || 5} Cards in Deck</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
              <button class="btn-glass" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;" onclick="FlashcardsModule.loadDeckCards('${deck.id}')">
                <i class="fa-solid fa-play"></i> Practice
              </button>

              <button class="btn-glass-secondary" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; color: var(--accent-rose);" onclick="FlashcardsModule.deleteDeck('${deck.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem; grid-column: 1/-1;">No flashcard decks generated yet.</div>`;
      }
    } catch (e) {
      console.log('Error loading decks:', e);
    }
  },

  async loadDeckCards(deckId) {
    try {
      const res = await API.get(`/flashcards/deck/${deckId}`);
      if (res && res.success && res.data.cards) {
        this.startReviewSession(res.data.cards, "Flashcard Session");
      }
    } catch (e) {
      console.error('Error loading cards:', e);
    }
  },

  startReviewSession(cards, title) {
    this.currentCards = cards;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderActiveCard(title);
  },

  renderActiveCard(title) {
    const area = document.getElementById('flashcardRunnerArea');
    if (!area || this.currentCards.length === 0) return;

    const card = this.currentCards[this.currentIndex];
    const total = this.currentCards.length;

    area.innerHTML = `
      <div class="glass-card section-card animate-fade-in" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
          <span style="font-weight: 700; font-size: 1rem; color: var(--accent-cyan);">${title || 'Active Recall Deck'}</span>
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">Card ${this.currentIndex + 1} of ${total}</span>
        </div>

        <!-- Flip Card View -->
        <div class="glass-card" style="padding: 2.5rem; text-align: center; min-height: 220px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; background: linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.8)); border: 2px solid var(--accent-cyan);" onclick="FlashcardsModule.flipCard()">
          <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-amber); margin-bottom: 0.75rem; font-weight: 700;">
            ${this.isFlipped ? 'Answer / Solution (BACK)' : 'Question / Concept (FRONT - Click to Flip)'}
          </div>

          <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); line-height: 1.5;">
            ${this.isFlipped ? card.back : card.front}
          </h3>

          ${this.isFlipped && card.mnemonic ? `
            <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.1); padding: 0.5rem 1rem; border-radius: 8px;">
              💡 <strong>Memory Hook:</strong> ${card.mnemonic}
            </div>
          ` : ''}
        </div>

        <!-- Rating Controls (Only shown when flipped) -->
        ${this.isFlipped ? `
          <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
            <button class="btn-glass" style="background: rgba(16, 185, 129, 0.2); border-color: var(--accent-emerald);" onclick="FlashcardsModule.rateCard('${card.id || card._id}', 'Easy')">
              😊 Easy (+15 XP)
            </button>
            <button class="btn-glass" style="background: rgba(245, 158, 11, 0.2); border-color: var(--accent-amber);" onclick="FlashcardsModule.rateCard('${card.id || card._id}', 'Medium')">
              😐 Medium (+10 XP)
            </button>
            <button class="btn-glass" style="background: rgba(244, 63, 94, 0.2); border-color: var(--accent-rose);" onclick="FlashcardsModule.rateCard('${card.id || card._id}', 'Hard')">
              😓 Hard (+5 XP)
            </button>
          </div>
        ` : `
          <div style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
            Click on the flashcard above to reveal the answer!
          </div>
        `}
      </div>
    `;
  },

  flipCard() {
    this.isFlipped = !this.isFlipped;
    this.renderActiveCard();
  },

  async rateCard(cardId, rating) {
    try {
      await API.post('/flashcards/review', { card_id: cardId, difficulty: rating });
      if (this.currentIndex < this.currentCards.length - 1) {
        this.currentIndex++;
        this.isFlipped = false;
        this.renderActiveCard();
      } else {
        const area = document.getElementById('flashcardRunnerArea');
        if (area) {
          area.innerHTML = `
            <div class="glass-card section-card animate-fade-in" style="text-align: center; padding: 2.5rem;">
              <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: var(--accent-emerald); margin-bottom: 1rem;"></i>
              <h3>Deck Completed! 🎉</h3>
              <p style="color: var(--text-secondary); margin-top: 0.5rem;">Great active recall practice! You've strengthened your memory retention.</p>
            </div>
          `;
        }
      }
    } catch (e) {
      console.error('Rate card error:', e);
    }
  },

  async deleteDeck(deckId) {
    try {
      await API.request(`/flashcards/deck/${deckId}`, { method: 'DELETE' });
      await this.loadDecksLibrary();
    } catch (e) {
      console.error('Delete deck error:', e);
    }
  }
};
