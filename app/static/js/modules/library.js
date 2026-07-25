/* noteX AI - Unified Study Library Controller (Hyper Pro) */
const LibraryModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15)); border-color: rgba(99, 102, 241, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.5rem;"><i data-lucide="folder-open"></i> Knowledge Base</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">Unified Study Library</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Access indexed PDF textbooks, AI notes, active recall flashcards, and practice quizzes.
              </p>
            </div>
            
            <button class="hyper-btn hyper-btn-cyan" onclick="location.hash='#rag'">
              <i data-lucide="upload-cloud"></i> Upload New Document
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="hyper-card hyper-col-12">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="hyper-chip active" id="libTabAll" onclick="LibraryModule.switchTab('all')">All Assets (40)</button>
              <button class="hyper-chip" id="libTabPdfs" onclick="LibraryModule.switchTab('pdf')">📄 PDFs (5)</button>
              <button class="hyper-chip" id="libTabNotes" onclick="LibraryModule.switchTab('note')">📝 AI Notes (10)</button>
              <button class="hyper-chip" id="libTabQuizzes" onclick="LibraryModule.switchTab('quiz')">🎯 Quizzes (5)</button>
              <button class="hyper-chip" id="libTabFlashcards" onclick="LibraryModule.switchTab('flashcard')">🧠 Flashcards (20)</button>
            </div>

            <div style="position: relative; width: 280px;">
              <i data-lucide="search" style="position: absolute; left: 0.75rem; top: 0.65rem; width: 16px; height: 16px; color: var(--hyper-text-muted);"></i>
              <input type="text" id="libSearchInput" class="hyper-input" placeholder="Search by title or topic..." style="padding-left: 2.3rem;" onkeyup="LibraryModule.filterSearch()">
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="hyper-col-12" id="libraryTabContent">
          ${this.getFallbackLibraryHTML()}
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  activeTab: 'all',

  switchTab(tab) {
    this.activeTab = tab;
    ['libTabAll', 'libTabPdfs', 'libTabNotes', 'libTabQuizzes', 'libTabFlashcards'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active');
    });
    const currentBtn = document.getElementById(`libTab${tab.charAt(0).toUpperCase() + tab.slice(1)}s`) || document.getElementById('libTabAll');
    if (currentBtn) currentBtn.classList.add('active');

    this.renderAssets();
  },

  getFallbackAssets() {
    return [
      // 5 Sample PDFs
      { id: 'pdf-1', type: 'pdf', title: 'NCERT_Class10_Physics_Light_Reflection_Refraction.pdf', pages: 18, subject: 'Physics', date: '2026-07-24' },
      { id: 'pdf-2', type: 'pdf', title: 'CBSE_Class10_Chemistry_Chemical_Reactions_Equations.pdf', pages: 14, subject: 'Chemistry', date: '2026-07-23' },
      { id: 'pdf-3', type: 'pdf', title: 'Class10_Mathematics_Quadratic_Equations_Formulas.pdf', pages: 22, subject: 'Mathematics', date: '2026-07-22' },
      { id: 'pdf-4', type: 'pdf', title: 'Biology_Class10_Life_Processes_Diagrams.pdf', pages: 16, subject: 'Biology', date: '2026-07-20' },
      { id: 'pdf-5', type: 'pdf', title: 'SocialScience_Class10_Nationalism_In_India.pdf', pages: 20, subject: 'History', date: '2026-07-18' },

      // 10 AI Notes
      { id: 'note-1', type: 'note', title: 'Snell\'s Law & Refractive Index Derivations', subject: 'Physics', format: 'Formula Sheet', date: '2026-07-24' },
      { id: 'note-2', type: 'note', title: 'Balancing Chemical Equations & Redox Reactions', subject: 'Chemistry', format: 'Key Concepts', date: '2026-07-23' },
      { id: 'note-3', type: 'note', title: 'Quadratic Formula & Nature of Roots', subject: 'Mathematics', format: 'Formula Sheet', date: '2026-07-22' },
      { id: 'note-4', type: 'note', title: 'Human Digestive System & Enzyme Action', subject: 'Biology', format: 'Smart Summary', date: '2026-07-21' },
      { id: 'note-5', type: 'note', title: 'Non-Cooperation Movement & Dandi March Chronology', subject: 'History', format: 'Timeline Notes', date: '2026-07-20' },
      { id: 'note-6', type: 'note', title: 'Ohm\'s Law & Resistors in Series/Parallel', subject: 'Physics', format: 'Formula Sheet', date: '2026-07-19' },
      { id: 'note-7', type: 'note', title: 'Periodic Table Trends & Valency Calculations', subject: 'Chemistry', format: 'Smart Summary', date: '2026-07-18' },
      { id: 'note-8', type: 'note', title: 'Arithmetic Progression Formula Sheet', subject: 'Mathematics', format: 'Formula Sheet', date: '2026-07-17' },
      { id: 'note-9', type: 'note', title: 'Respiration in Human Beings vs Plants', subject: 'Biology', format: 'Key Concepts', date: '2026-07-16' },
      { id: 'note-10', type: 'note', title: 'Federalism & Power Sharing in Modern India', subject: 'Civics', format: 'Smart Summary', date: '2026-07-15' },

      // 5 Quiz Sets
      { id: 'quiz-1', type: 'quiz', title: 'Physics Light & Optics MCQ & HOTS Challenge', questions: 10, subject: 'Physics', duration: '25 Mins' },
      { id: 'quiz-2', type: 'quiz', title: 'Chemistry Chemical Reactions & Acids Test', questions: 10, subject: 'Chemistry', duration: '20 Mins' },
      { id: 'quiz-3', type: 'quiz', title: 'Mathematics Quadratic Equations & AP Quiz', questions: 10, subject: 'Mathematics', duration: '30 Mins' },
      { id: 'quiz-4', type: 'quiz', title: 'Biology Life Processes & Nutrition Quiz', questions: 10, subject: 'Biology', duration: '20 Mins' },
      { id: 'quiz-5', type: 'quiz', title: 'Social Science Indian Freedom Struggle Quiz', questions: 10, subject: 'History', duration: '15 Mins' },

      // 20 Flashcard Decks
      { id: 'fc-1', type: 'flashcard', title: 'Snell\'s Law & Refractive Index', subject: 'Physics', count: 1 },
      { id: 'fc-2', type: 'flashcard', title: 'Focal Length of Spherical Mirror', subject: 'Physics', count: 1 },
      { id: 'fc-3', type: 'flashcard', title: 'Power of Lens Unit (Dioptre)', subject: 'Physics', count: 1 },
      { id: 'fc-4', type: 'flashcard', title: 'Exothermic Reaction Examples', subject: 'Chemistry', count: 1 },
      { id: 'fc-5', type: 'flashcard', title: 'Endothermic Reaction Mechanics', subject: 'Chemistry', count: 1 },
      { id: 'fc-6', type: 'flashcard', title: 'Quadratic Discriminant Formula', subject: 'Mathematics', count: 1 },
      { id: 'fc-7', type: 'flashcard', title: 'Real & Equal Roots Condition', subject: 'Mathematics', count: 1 },
      { id: 'fc-8', type: 'flashcard', title: 'Sum of Roots Formula (-b/a)', subject: 'Mathematics', count: 1 },
      { id: 'fc-9', type: 'flashcard', title: 'Product of Roots Formula (c/a)', subject: 'Mathematics', count: 1 },
      { id: 'fc-10', type: 'flashcard', title: 'Site of Photosynthesis (Chloroplasts)', subject: 'Biology', count: 1 },
      { id: 'fc-11', type: 'flashcard', title: 'Bile Juice Functions', subject: 'Biology', count: 1 },
      { id: 'fc-12', type: 'flashcard', title: 'Ohm\'s Law Formula (V = IR)', subject: 'Physics', count: 1 },
      { id: 'fc-13', type: 'flashcard', title: 'Resistors in Series Formula', subject: 'Physics', count: 1 },
      { id: 'fc-14', type: 'flashcard', title: 'Resistors in Parallel Formula', subject: 'Physics', count: 1 },
      { id: 'fc-15', type: 'flashcard', title: 'Joule\'s Law of Heating', subject: 'Physics', count: 1 },
      { id: 'fc-16', type: 'flashcard', title: 'Universal Indicator Color at pH 7', subject: 'Chemistry', count: 1 },
      { id: 'fc-17', type: 'flashcard', title: 'Neutralization Reaction Formula', subject: 'Chemistry', count: 1 },
      { id: 'fc-18', type: 'flashcard', title: 'Dandi March Date & Year (1930)', subject: 'History', count: 1 },
      { id: 'fc-19', type: 'flashcard', title: 'Nth Term of AP Formula', subject: 'Mathematics', count: 1 },
      { id: 'fc-20', type: 'flashcard', title: 'Sum of First N Natural Numbers', subject: 'Mathematics', count: 1 }
    ];
  },

  renderAssets() {
    const container = document.getElementById('libraryTabContent');
    if (!container) return;

    const query = (document.getElementById('libSearchInput')?.value || '').toLowerCase();
    const assets = this.getFallbackAssets().filter(item => {
      const matchType = this.activeTab === 'all' || item.type === this.activeTab;
      const matchQuery = item.title.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query);
      return matchType && matchQuery;
    });

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
        ${assets.map(item => this.renderAssetCard(item)).join('')}
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  renderAssetCard(item) {
    const iconMap = {
      pdf: { icon: 'file-text', color: 'var(--hyper-accent-rose)', badge: 'hyper-badge-rose', label: 'PDF Document' },
      note: { icon: 'sticky-note', color: 'var(--hyper-accent-primary)', badge: 'hyper-badge-primary', label: 'AI Note' },
      quiz: { icon: 'help-circle', color: 'var(--hyper-accent-emerald)', badge: 'hyper-badge-emerald', label: 'Practice Quiz' },
      flashcard: { icon: 'layers', color: 'var(--hyper-accent-amber)', badge: 'hyper-badge-amber', label: 'Flashcard' }
    };
    const meta = iconMap[item.type] || iconMap.note;

    return `
      <div class="hyper-card hyper-card-interactive" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="${meta.icon}" style="color: ${meta.color}; width: 20px; height: 20px;"></i>
              <span class="hyper-badge ${meta.badge}">${meta.label}</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--hyper-text-muted); font-weight: 600;">${item.subject}</span>
          </div>

          <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--hyper-text-primary); line-height: 1.4; margin-bottom: 0.5rem;">
            ${item.title}
          </h4>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem;">
          <span style="font-size: 0.78rem; color: var(--hyper-text-muted);">
            ${item.pages ? item.pages + ' Pages' : (item.questions ? item.questions + ' Questions' : (item.format || 'Indexed Card'))}
          </span>
          <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash='#${item.type === 'pdf' ? 'rag' : (item.type === 'quiz' ? 'quizzes' : (item.type === 'flashcard' ? 'flashcards' : 'notes'))}'">
            Open <i data-lucide="arrow-right" style="width: 14px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  filterSearch() {
    this.renderAssets();
  },

  getFallbackLibraryHTML() {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
        ${this.getFallbackAssets().map(item => this.renderAssetCard(item)).join('')}
      </div>
    `;
  }
};

window.LibraryModule = LibraryModule;
