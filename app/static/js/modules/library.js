/* noteX AI - Notion / Arc Style Asset Library (Hyper Pro) */
const LibraryModule = {
  activeTab: 'all',
  searchQuery: '',

  async render(container) {
    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.18)); border-color: rgba(99, 102, 241, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-cyan" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-folder"></i> Repository</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">Unified Study Library</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                All your Uploaded PDFs, AI Notes, Flashcards, Quizzes, Study Plans & Chat Transcripts in one location.
              </p>
            </div>

            <!-- Search Bar -->
            <div style="position: relative; min-width: 280px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1rem; top: 0.85rem; color: var(--hyper-text-muted);"></i>
              <input type="text" id="librarySearchInput" class="hyper-input" placeholder="Search title or subject..." style="padding-left: 2.6rem; border-radius: var(--hyper-radius-full);" oninput="LibraryModule.handleSearch(this.value)">
            </div>
          </div>

          <!-- Category Filter Tabs -->
          <div style="display: flex; gap: 0.5rem; margin-top: 1.25rem; flex-wrap: wrap;">
            <button id="libTab_all" class="hyper-btn hyper-btn-primary hyper-btn-sm" onclick="LibraryModule.switchTab('all')">All Assets</button>
            <button id="libTab_pdfs" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.switchTab('pdfs')">📄 PDFs</button>
            <button id="libTab_notes" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.switchTab('notes')">📝 Notes</button>
            <button id="libTab_flashcards" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.switchTab('flashcards')">🧠 Flashcards</button>
            <button id="libTab_quizzes" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.switchTab('quizzes')">❓ Quizzes</button>
            <button id="libTab_plans" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.switchTab('plans')">📅 Study Plans</button>
            <button id="libTab_chats" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.switchTab('chats')">💬 Chat Threads</button>
          </div>
        </div>

        <!-- Asset Grid Container -->
        <div id="libraryTabContent" class="hyper-col-12">
          <div style="text-align: center; padding: 2rem; color: var(--hyper-text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading assets...</div>
        </div>
      </div>

      <!-- Preview Modal Container -->
      <div id="libraryPreviewModal" class="hyper-modal-backdrop" style="display: none;">
        <div class="hyper-modal-content" style="max-width: 680px; max-height: 80vh; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--hyper-border-subtle); padding-bottom: 0.85rem; margin-bottom: 1rem;">
            <h3 id="previewModalTitle" style="font-weight: 700; font-size: 1.2rem; color: var(--hyper-text-primary);">Asset Preview</h3>
            <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="LibraryModule.closePreview()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="previewModalBody" style="overflow-y: auto; flex: 1; line-height: 1.6; font-size: 0.92rem; color: var(--hyper-text-primary);"></div>
        </div>
      </div>
    `;

    await this.loadAssets();
  },

  async switchTab(tab) {
    this.activeTab = tab;
    ['all', 'pdfs', 'notes', 'flashcards', 'quizzes', 'plans', 'chats'].forEach(t => {
      const btn = document.getElementById(`libTab_${t}`);
      if (btn) btn.className = t === tab ? 'hyper-btn hyper-btn-primary hyper-btn-sm' : 'hyper-btn hyper-btn-glass hyper-btn-sm';
    });

    await this.loadAssets();
  },

  handleSearch(val) {
    this.searchQuery = val.trim();
    this.loadAssets();
  },

  async loadAssets() {
    const container = document.getElementById('libraryTabContent');
    if (!container) return;

    try {
      const res = await API.get(`/library/assets?type=${this.activeTab}&search=${encodeURIComponent(this.searchQuery)}`);
      if (res && res.success && res.data && res.data.assets && res.data.assets.length > 0) {
        container.innerHTML = `
          <div class="hyper-bento-grid">
            ${res.data.assets.map(asset => this.renderAssetCard(asset)).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `<div style="text-align: center; padding: 3rem; color: var(--hyper-text-muted);">No study assets found in this category.</div>`;
      }
    } catch (e) {
      container.innerHTML = `<div style="text-align: center; color: var(--hyper-accent-rose); padding: 2rem;">Error fetching library assets.</div>`;
    }
  },

  renderAssetCard(asset) {
    const iconMap = {
      pdf: 'fa-file-pdf',
      note: 'fa-note-sticky',
      flashcard: 'fa-layer-group',
      quiz: 'fa-circle-question',
      plan: 'fa-calendar-check',
      chat: 'fa-comments'
    };
    const icon = iconMap[asset.type] || 'fa-folder';

    return `
      <div class="hyper-card hyper-card-interactive hyper-col-4" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; border-top: 3px solid var(--hyper-accent-cyan);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <i class="fa-solid ${icon}" style="font-size: 1.5rem; color: var(--hyper-accent-cyan);"></i>
            <span class="hyper-badge hyper-badge-cyan">${asset.type.toUpperCase()}</span>
          </div>
          <h4 style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--hyper-text-primary);">${asset.title}</h4>
          <div style="font-size: 0.8rem; color: var(--hyper-text-muted); margin-bottom: 0.5rem;">${asset.subject} • ${new Date(asset.created_at).toLocaleDateString()}</div>
          <div style="font-size: 0.84rem; color: var(--hyper-text-secondary); line-height: 1.4;">${asset.details}</div>
        </div>

        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="LibraryModule.previewAsset('${asset.type}', '${asset.id}', \`${encodeURIComponent(asset.title)}\`, \`${encodeURIComponent(asset.content || asset.details)}\`)">
            <i class="fa-solid fa-eye"></i> Preview
          </button>
          <button class="hyper-btn hyper-btn-danger hyper-btn-sm" onclick="LibraryModule.deleteAsset('${asset.type}', '${asset.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  },

  previewAsset(type, id, titleEnc, contentEnc) {
    const title = decodeURIComponent(titleEnc);
    const content = decodeURIComponent(contentEnc);
    const modal = document.getElementById('libraryPreviewModal');
    const titleEl = document.getElementById('previewModalTitle');
    const bodyEl = document.getElementById('previewModalBody');

    if (modal && titleEl && bodyEl) {
      titleEl.textContent = title;
      bodyEl.innerHTML = typeof marked !== 'undefined' ? marked.parse(content) : content;
      modal.style.display = 'flex';
    }
  },

  closePreview() {
    const modal = document.getElementById('libraryPreviewModal');
    if (modal) modal.style.display = 'none';
  },

  async deleteAsset(type, id) {
    if (confirm("Are you sure you want to delete this asset from your Library?")) {
      try {
        await API.request(`/library/asset/${type}/${id}`, { method: 'DELETE' });
        await this.loadAssets();
      } catch (e) {
        alert("Delete failed: " + e.message);
      }
    }
  }
};
