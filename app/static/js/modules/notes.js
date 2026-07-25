/* noteX AI - AI Smart Notes & Formula Sheet Generator (Production Edition) */
const NotesModule = {
  notesCache: [],
  activeSubjectFilter: 'All',

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(14, 165, 233, 0.08)); border-color: rgba(139, 92, 246, 0.25); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Notes Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">Smart AI Notes & Formula Sheets</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Generate structured subject notes, formula cheat sheets, and board exam summaries powered by Groq AI.
              </p>
            </div>
          </div>
        </div>

        <!-- Note Generation Form Card -->
        <div class="hyper-card hyper-col-12">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
                <select id="noteSubjectSelect" class="hyper-select">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Chapter / Topic Title:</label>
                <input type="text" id="noteChapterInput" class="hyper-input" placeholder="e.g. Newton's Laws, Ionization Enthalpy, Differentiation...">
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Note Format:</label>
                <select id="noteFormatSelect" class="hyper-select">
                  <option value="Smart Summary">Smart Summary</option>
                  <option value="Formula Sheet">Formula Cheat Sheet</option>
                  <option value="Key Concepts">Key Concepts & Definitions</option>
                  <option value="Smart Notes">Smart Study Notes</option>
                  <option value="Revision Notes">Exam Revision Notes</option>
                  <option value="Exam Notes">High-Yield Exam Notes</option>
                </select>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button id="generateNoteBtn" class="hyper-btn hyper-btn-primary" onclick="NotesModule.generateNote()">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Note
              </button>
            </div>
          </div>
        </div>

        <!-- Subject Filter Tabs & Title -->
        <div class="hyper-col-12" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--hyper-text-primary);">Saved Subject Notes</h3>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn active" data-subject="All" onclick="NotesModule.filterBySubject('All', this)">All</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Physics" onclick="NotesModule.filterBySubject('Physics', this)">Physics</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Chemistry" onclick="NotesModule.filterBySubject('Chemistry', this)">Chemistry</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Mathematics" onclick="NotesModule.filterBySubject('Mathematics', this)">Mathematics</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Biology" onclick="NotesModule.filterBySubject('Biology', this)">Biology</button>
          </div>
        </div>

        <!-- Notes List Viewport (Dynamic Cards) -->
        <div class="hyper-col-12" id="notesListContainer">
          <div style="text-align: center; color: var(--hyper-text-muted); padding: 3rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading saved notes from database...</div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    await this.loadNotes();
  },

  async loadNotes() {
    try {
      const res = await API.get('/notes/list');
      const container = document.getElementById('notesListContainer');
      if (!container) return;

      if (res && res.success && res.data && res.data.notes) {
        this.notesCache = res.data.notes;
        this.renderNotesList();
      } else {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-text-muted); padding: 3rem;">No notes saved yet. Generate your first note above!</div>`;
      }
    } catch (err) {
      console.error("[NotesModule] Load error:", err);
      const container = document.getElementById('notesListContainer');
      if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-accent-rose); padding: 2rem;">Unable to load notes. Please check connection.</div>`;
      }
    }
  },

  filterBySubject(subject, btn) {
    this.activeSubjectFilter = subject;
    document.querySelectorAll('.note-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderNotesList();
  },

  renderNotesList() {
    const container = document.getElementById('notesListContainer');
    if (!container) return;

    let filtered = this.notesCache;
    if (this.activeSubjectFilter && this.activeSubjectFilter !== 'All') {
      filtered = this.notesCache.filter(n => (n.subject || '').toLowerCase() === this.activeSubjectFilter.toLowerCase());
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--hyper-text-muted); padding: 3rem; background: var(--hyper-bg-surface); border-radius: var(--hyper-radius-md); border: 1px dashed var(--hyper-border-subtle);">
          <i class="fa-solid fa-sticky-note" style="font-size: 2.5rem; color: var(--hyper-text-muted); margin-bottom: 0.75rem;"></i>
          <p>No notes found for <strong>${this.activeSubjectFilter}</strong>.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
        ${filtered.map(note => `
          <div class="hyper-card hyper-card-interactive" id="note_card_${note.id}" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="hyper-badge hyper-badge-primary">${note.subject || 'General'}</span>
                <span class="hyper-badge hyper-badge-cyan">${note.note_type || note.format || 'Smart Notes'}</span>
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--hyper-text-primary); margin-bottom: 0.75rem;">${note.chapter || note.title || 'Untitled Topic'}</h3>
              
              <!-- Formatted Markdown & LaTeX Note Body -->
              <div class="hyper-bubble-ai" style="font-size: 0.88rem; color: var(--hyper-text-primary); line-height: 1.6; padding: 1.15rem; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-sm); max-height: 380px; overflow-y: auto;">
                ${this.formatMarkdown(note.content || note.text || '')}
              </div>
            </div>

            <!-- Action Toolbar (Copy, PDF, Markdown, Delete) -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem;">
              <div style="font-size: 0.72rem; color: var(--hyper-text-muted);">
                Class: ${note.student_class || 'Class 10'}
              </div>
              <div style="display: flex; gap: 0.4rem;">
                <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="NotesModule.copyNote(this)" title="Copy text">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.downloadMarkdown('${note.id}')" title="Download Markdown .md">
                  <i class="fa-solid fa-file-code"></i> .MD
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.downloadPDF('${note.id}')" title="Download Printable PDF">
                  <i class="fa-solid fa-file-pdf"></i> .PDF
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.deleteNote('${note.id}')" title="Delete Note" style="color: var(--hyper-accent-rose);">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Render KaTeX math in note cards
    this.renderKaTeXMath(container);

    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }
  },

  async generateNote() {
    const subject = document.getElementById('noteSubjectSelect')?.value || 'Physics';
    const chapter = document.getElementById('noteChapterInput')?.value.trim();
    const noteType = document.getElementById('noteFormatSelect')?.value || 'Smart Summary';
    const btn = document.getElementById('generateNoteBtn');

    if (!chapter) {
      if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Please enter a Chapter or Topic title.', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating ${noteType}...`;
    }

    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(`Generating ${noteType} for ${subject} (${chapter})...`, 'info');
    }

    try {
      const res = await API.post('/notes/generate', {
        subject: subject,
        chapter: chapter,
        note_type: noteType
      });

      if (res && res.success && res.data && res.data.note) {
        const newNote = res.data.note;
        
        // Prevent duplicate cards
        this.notesCache = this.notesCache.filter(n => n.id !== newNote.id);
        this.notesCache.unshift(newNote);

        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(`${noteType} generated successfully for ${chapter}!`, 'success');
        }

        document.getElementById('noteChapterInput').value = '';
        this.renderNotesList();
      } else {
        throw new Error(res.message || 'Failed to generate note.');
      }
    } catch (err) {
      console.error("[NotesModule] Generate Error:", err);
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Note generation failed.', 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Note`;
      }
    }
  },

  copyNote(btn) {
    const card = btn.closest('.hyper-card');
    const content = card ? card.querySelector('.hyper-bubble-ai') : null;
    if (content) {
      navigator.clipboard.writeText(content.innerText).then(() => {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
        setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`; }, 2000);
      });
    }
  },

  downloadMarkdown(noteId) {
    const note = this.notesCache.find(n => n.id === noteId);
    if (!note) return;
    const text = `# ${note.subject}: ${note.chapter}\nFormat: ${note.note_type}\nClass: ${note.student_class}\n\n${note.content}`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteX_Note_${note.subject}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async downloadPDF(noteId) {
    const note = this.notesCache.find(n => n.id === noteId);
    if (!note) return;

    try {
      const res = await API.post('/notes/export', {
        title: `${note.subject} — ${note.chapter}`,
        content: this.formatMarkdown(note.content)
      });

      if (res && res.success && res.data && res.data.html_payload) {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(res.data.html_payload);
          printWin.document.close();
          printWin.onload = function() {
            printWin.print();
          };
        }
      }
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Failed to export PDF.', 'error');
    }
  },

  async deleteNote(noteId) {
    try {
      await API.request(`/notes/${noteId}`, { method: 'DELETE' });
      this.notesCache = this.notesCache.filter(n => n.id !== noteId);
      this.renderNotesList();
      if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Note deleted.', 'info');
    } catch (err) {
      console.error("Delete note error:", err);
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

  formatMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined') {
      try {
        return marked.parse(text);
      } catch (err) {}
    }
    return text
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
};

window.NotesModule = NotesModule;
