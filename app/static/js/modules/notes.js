/* noteX AI - Premium AI Smart Notes & Reading Experience Engine */
const NotesModule = {
  notesCache: [],
  activeSubjectFilter: 'All',

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Sticky Action Toolbar Header -->
        <div class="hyper-card hyper-col-12" style="position: sticky; top: 0; z-index: 20; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(16px); border-color: #CBD5E1; padding: 1.25rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.25rem;"><i class="fa-solid fa-book-open"></i> Premium Reading Engine</span>
              <h2 style="font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em;">AI Smart Notes & Exam Study Sheets</h2>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i> Print View</button>
            </div>
          </div>
        </div>

        <!-- Note Generation Input Box -->
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
                  <option value="Smart Summary">Smart Summary & Key Points</option>
                  <option value="Formula Sheet">Formula Cheat Sheet & Equations</option>
                  <option value="Key Concepts">Key Concepts & Definitions</option>
                  <option value="Smart Notes">High-Yield Exam Notes</option>
                  <option value="Revision Notes">Memory Tricks & Exam Tips</option>
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

        <!-- Subject Filter Navigation Tabs -->
        <div class="hyper-col-12" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--hyper-text-primary);">Saved Study Notes</h3>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn active" data-subject="All" onclick="NotesModule.filterBySubject('All', this)">All</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Physics" onclick="NotesModule.filterBySubject('Physics', this)">Physics</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Chemistry" onclick="NotesModule.filterBySubject('Chemistry', this)">Chemistry</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Mathematics" onclick="NotesModule.filterBySubject('Mathematics', this)">Mathematics</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-filter-btn" data-subject="Biology" onclick="NotesModule.filterBySubject('Biology', this)">Biology</button>
          </div>
        </div>

        <!-- Dynamic Notes Reading Viewport -->
        <div class="hyper-col-12" id="notesListContainer">
          <div style="text-align: center; color: var(--hyper-text-muted); padding: 3rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading saved study notes...</div>
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
        <div style="text-align: center; color: var(--hyper-text-muted); padding: 3rem; background: #FFFFFF; border-radius: var(--hyper-radius-md); border: 1px dashed #CBD5E1;">
          <i class="fa-solid fa-sticky-note" style="font-size: 2.5rem; color: var(--hyper-text-muted); margin-bottom: 0.75rem;"></i>
          <p>No notes found for <strong>${this.activeSubjectFilter}</strong>.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${filtered.map(note => `
          <div class="hyper-card" id="note_card_${note.id}" style="background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.06); padding: 1.75rem;">
            <!-- Note Header Sticky Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--hyper-border-subtle); padding-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <span class="hyper-badge hyper-badge-primary">${note.subject || 'General'}</span>
                <span class="hyper-badge hyper-badge-cyan">${note.note_type || 'Smart Notes'}</span>
                <span class="hyper-badge hyper-badge-amber">Class 10</span>
              </div>
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="NotesModule.toggleBookmark('${note.id}', this)" title="Bookmark Note">
                  <i class="fa-regular fa-bookmark" id="bm_icon_${note.id}"></i> Bookmark
                </button>
                <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="NotesModule.copyNote(this)" title="Copy text">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.downloadMarkdown('${note.id}')" title="Download Markdown .MD">
                  <i class="fa-solid fa-file-code"></i> .MD
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.downloadDOCX('${note.id}')" title="Download Word .DOCX">
                  <i class="fa-solid fa-file-word"></i> .DOCX
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.downloadPDF('${note.id}')" title="Download PDF Document">
                  <i class="fa-solid fa-file-pdf"></i> .PDF
                </button>
                <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="NotesModule.deleteNote('${note.id}')" title="Delete Note" style="color: var(--hyper-accent-rose);">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- Main Reading Layout Title -->
            <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-text-primary); margin-bottom: 1.25rem;">${note.chapter || note.title || 'Untitled Topic'}</h2>
            
            <!-- Structured Highlight & Callout Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-bottom: 1.5rem;">
              <div class="note-callout-summary">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--hyper-accent-primary); margin-bottom: 0.25rem;"><i class="fa-solid fa-list-check"></i> AI Summary & Key Points</div>
                <div style="font-size: 0.8rem; color: var(--hyper-text-secondary); font-style: italic;">High-yield key concepts curated for fast revision.</div>
              </div>
              <div class="note-callout-formula">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--hyper-accent-lavender); margin-bottom: 0.25rem;"><i class="fa-solid fa-square-root-variable"></i> Key Formulas</div>
                <div style="font-size: 0.8rem; color: var(--hyper-text-secondary); font-style: italic;">Core mathematical & physics equations.</div>
              </div>
              <div class="note-callout-exam">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--hyper-accent-amber); margin-bottom: 0.25rem;"><i class="fa-solid fa-lightbulb"></i> Exam Tips & Memory Tricks</div>
                <div style="font-size: 0.8rem; color: var(--hyper-text-secondary); font-style: italic;">Mnemonics & board exam pointers.</div>
              </div>
            </div>

            <!-- Reading Body Content -->
            <div class="note-reading-body" style="font-size: 0.98rem; color: var(--hyper-text-primary); line-height: 1.7; background: #FAFAFC; padding: 1.5rem; border-radius: var(--hyper-radius-sm); border: 1px solid #E2E8F0;">
              ${this.formatMarkdown(note.content || note.text || '')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.renderKaTeXMath(container);

    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }
  },

  toggleBookmark(noteId, btn) {
    const icon = document.getElementById(`bm_icon_${noteId}`);
    if (icon) {
      if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        icon.style.color = 'var(--hyper-accent-amber)';
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Note bookmarked!', 'success');
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        icon.style.color = 'inherit';
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Bookmark removed.', 'info');
      }
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
    const content = card ? card.querySelector('.note-reading-body') : null;
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

  downloadDOCX(noteId) {
    const note = this.notesCache.find(n => n.id === noteId);
    if (!note) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${note.subject} — ${note.chapter}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;}</style></head>
      <body><h2>${note.subject}: ${note.chapter}</h2><div>${this.formatMarkdown(note.content)}</div></body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteX_Note_${note.subject}_${Date.now()}.docx`;
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
