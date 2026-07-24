/* noteX AI - Unified My Library Module Controller (Pro) */
const LibraryModule = {
  activeTab: 'all',
  searchQuery: '',

  async render(container) {
    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;">📚 My Study Library</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Unified repository of all your Uploaded PDFs, AI Notes, Flashcards, Quizzes, Study Plans & Chat Transcripts.</p>
            </div>

            <!-- Search Input -->
            <div style="position: relative; min-width: 260px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1rem; top: 0.85rem; color: var(--text-secondary);"></i>
              <input type="text" id="librarySearchInput" class="glass-input" placeholder="Search by title or subject..." style="padding-left: 2.5rem; border-radius: 20px;" oninput="LibraryModule.handleSearch(this.value)">
            </div>
          </div>

          <!-- Category Filter Tabs -->
          <div style="display: flex; gap: 0.5rem; margin-top: 1.25rem; flex-wrap: wrap;">
            <button id="libTab_all" class="btn-glass" onclick="LibraryModule.switchTab('all')">All Assets</button>
            <button id="libTab_pdfs" class="btn-glass-secondary" onclick="LibraryModule.switchTab('pdfs')">📄 PDFs</button>
            <button id="libTab_notes" class="btn-glass-secondary" onclick="LibraryModule.switchTab('notes')">📝 Notes</button>
            <button id="libTab_flashcards" class="btn-glass-secondary" onclick="LibraryModule.switchTab('flashcards')">🧠 Flashcards</button>
            <button id="libTab_quizzes" class="btn-glass-secondary" onclick="LibraryModule.switchTab('quizzes')">❓ Quizzes</button>
            <button id="libTab_plans" class="btn-glass-secondary" onclick="LibraryModule.switchTab('plans')">📅 Study Plans</button>
            <button id="libTab_chats" class="btn-glass-secondary" onclick="LibraryModule.switchTab('chats')">💬 Chat History</button>
          </div>
        </div>

        <!-- Dynamic Content Area -->
        <div id="libraryTabContent">
          <div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading assets from MongoDB...</div>
        </div>
      </div>

      <!-- Preview Modal Container -->
      <div id="libraryPreviewModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; padding: 1.5rem;">
        <div class="glass-card section-card" style="width: 100%; max-width: 680px; max-height: 80vh; display: flex; flex-direction: column; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <h3 id="previewModalTitle" style="font-weight: 700; font-size: 1.2rem;">Asset Preview</h3>
            <button class="btn-glass-secondary" style="padding: 0.25rem 0.6rem;" onclick="LibraryModule.closePreview()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="previewModalBody" style="overflow-y: auto; flex: 1; line-height: 1.6; font-size: 0.92rem; color: var(--text-primary);"></div>
        </div>
      </div>
    `;

    await this.loadAssets();
  },

  async switchTab(tab) {
    this.activeTab = tab;
    ['all', 'pdfs', 'notes', 'flashcards', 'quizzes', 'plans', 'chats'].forEach(t => {
      const btn = document.getElementById(`libTab_${t}`);
      if (btn) btn.className = t === tab ? 'btn-glass' : 'btn-glass-secondary';
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
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            ${res.data.assets.map(asset => this.renderAssetCard(asset)).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `<div style="text-align: center; padding: 3rem; color: var(--text-secondary);">No study assets found in this category.</div>`;
      }
    } catch (e) {
      container.innerHTML = `<div style="text-align: center; color: var(--accent-rose); padding: 2rem;">Error fetching library assets from MongoDB.</div>`;
    }
  },

  renderAssetCard(asset) {
    const iconMap = {
      pdf: 'fa-file-pdf',
      note: 'fa-pen-to-square',
      flashcard: 'fa-layer-group',
      quiz: 'fa-circle-question',
      plan: 'fa-calendar-days',
      chat: 'fa-comments'
    };
    const icon = iconMap[asset.type] || 'fa-folder';

    return `
      <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; border-top: 3px solid var(--accent-cyan);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <i class="fa-solid ${icon}" style="font-size: 1.6rem; color: var(--accent-cyan);"></i>
            <span class="grade-badge-selector" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;">${asset.type.toUpperCase()}</span>
          </div>
          <h4 style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--text-primary);">${asset.title}</h4>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${asset.subject} • ${new Date(asset.created_at).toLocaleDateString()}</div>
          <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">${asset.details}</div>
        </div>

        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          <button class="btn-glass-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="LibraryModule.previewAsset('${asset.type}', '${asset.id}', \`${encodeURIComponent(asset.title)}\`, \`${encodeURIComponent(asset.content || asset.details)}\`)">
            <i class="fa-solid fa-eye"></i> Preview
          </button>

          <button class="btn-glass-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="LibraryModule.renameAsset('${asset.type}', '${asset.id}', \`${encodeURIComponent(asset.title)}\`)">
            <i class="fa-solid fa-pen"></i> Rename
          </button>

          <button class="btn-glass-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.78rem; color: var(--accent-rose);" onclick="LibraryModule.deleteAsset('${asset.type}', '${asset.id}')">
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

  async renameAsset(type, id, oldTitleEnc) {
    const oldTitle = decodeURIComponent(oldTitleEnc);
    const newTitle = prompt("Enter new title for this asset:", oldTitle);
    if (newTitle && newTitle.trim()) {
      try {
        await API.request(`/library/asset/${type}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: newTitle.trim() })
        });
        await this.loadAssets();
      } catch (e) {
        alert("Rename failed: " + e.message);
      }
    }
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
