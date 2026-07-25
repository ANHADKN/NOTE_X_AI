/* noteX AI - Smart Notes Module Controller (Hyper Pro) */
const NotesModule = {
  selectedNoteType: 'Smart Notes',

  async render(container) {
    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Banner -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.2)); border-color: rgba(99, 102, 241, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Generator</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">Smart AI Notes & Formula Sheets</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Curriculum Grade: <strong style="color: var(--hyper-accent-cyan);">${typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10'}</strong>. High-yield summaries, key concepts, and exam notes.
              </p>
            </div>
          </div>
        </div>

        <!-- Creator Card -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-sliders" style="color: var(--hyper-accent-cyan);"></i> Select Note Format & Subject
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Format Pills -->
            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
              <button class="hyper-btn hyper-btn-primary hyper-btn-sm note-format-btn" onclick="NotesModule.selectFormat('Smart Notes', this)">📄 Smart Notes</button>
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-format-btn" onclick="NotesModule.selectFormat('Short Notes', this)">📝 Short Notes</button>
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-format-btn" onclick="NotesModule.selectFormat('Key Notes', this)">✨ Key Notes</button>
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-format-btn" onclick="NotesModule.selectFormat('Revision Notes', this)">📋 Revision Notes</button>
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-format-btn" onclick="NotesModule.selectFormat('Formula Notes', this)">🧠 Formula Sheet</button>
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm note-format-btn" onclick="NotesModule.selectFormat('Exam Notes', this)">❓ Exam Notes</button>
            </div>

            <!-- Subject & Topic Inputs -->
            <div style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 1rem; align-items: flex-end;">
              <div>
                <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
                <select id="noteSubjectSelect" class="hyper-select">
                  <option value="Science" selected>Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Chapter / Topic Name:</label>
                <input type="text" id="noteChapterInput" class="hyper-input" placeholder="e.g. Electricity, Quadratic Equations, Acids and Bases...">
              </div>

              <button id="generateNoteBtn" class="hyper-btn hyper-btn-primary" onclick="NotesModule.handleGenerate()">
                <i class="fa-solid fa-microchip"></i> Generate Note
              </button>
            </div>

            <div id="noteGenStatus" style="font-size: 0.85rem; text-align: center;"></div>
          </div>
        </div>

        <!-- Saved Notes Bento Grid -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-book-bookmark" style="color: var(--hyper-accent-primary);"></i> Saved Notes Collection
            </div>
          </div>

          <div id="notesLibraryGrid" class="hyper-bento-grid">
            <div style="text-align: center; color: var(--hyper-text-muted); padding: 1.5rem; grid-column: span 12;">Loading saved notes...</div>
          </div>
        </div>
      </div>
    `;

    await this.loadNotesLibrary();
  },

  selectFormat(format, btn) {
    this.selectedNoteType = format;
    document.querySelectorAll('.note-format-btn').forEach(b => b.className = 'hyper-btn hyper-btn-glass hyper-btn-sm note-format-btn');
    btn.className = 'hyper-btn hyper-btn-primary hyper-btn-sm note-format-btn';
  },

  async handleGenerate() {
    const chapterInput = document.getElementById('noteChapterInput');
    const subjectSelect = document.getElementById('noteSubjectSelect');
    const statusDiv = document.getElementById('noteGenStatus');

    const chapter = chapterInput ? chapterInput.value.trim() : '';
    const subject = subjectSelect ? subjectSelect.value : 'Science';

    if (!chapter) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--hyper-accent-rose)';
        statusDiv.textContent = 'Please enter a Chapter or Topic name.';
      }
      return;
    }

    if (statusDiv) {
      statusDiv.style.color = 'var(--hyper-accent-cyan)';
      statusDiv.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating ${this.selectedNoteType} for ${chapter}...`;
    }

    try {
      const res = await API.post('/notes/generate', {
        chapter: chapter,
        subject: subject,
        note_type: this.selectedNoteType
      });

      if (res && res.success) {
        if (statusDiv) {
          statusDiv.style.color = 'var(--hyper-accent-emerald)';
          statusDiv.textContent = res.message;
        }
        if (chapterInput) chapterInput.value = '';
        await this.loadNotesLibrary();
      } else {
        if (statusDiv) {
          statusDiv.style.color = 'var(--hyper-accent-rose)';
          statusDiv.textContent = res.message || 'Failed to generate note.';
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--hyper-accent-rose)';
        statusDiv.textContent = `Error: ${e.message}`;
      }
    }
  },

  async loadNotesLibrary() {
    const container = document.getElementById('notesLibraryGrid');
    if (!container) return;

    try {
      const res = await API.get('/notes/list');
      if (res && res.success && res.data && res.data.notes && res.data.notes.length > 0) {
        container.innerHTML = res.data.notes.map(note => `
          <div class="hyper-card hyper-card-interactive hyper-col-4" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <span class="hyper-badge hyper-badge-primary">${note.note_type}</span>
                <span style="font-size: 0.75rem; color: var(--hyper-text-muted);">${note.subject}</span>
              </div>
              <h4 style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--hyper-text-primary);">${note.chapter}</h4>
              <div style="font-size: 0.85rem; color: var(--hyper-text-secondary); max-height: 110px; overflow: hidden; line-height: 1.5;">
                ${ChatbotModule.formatMarkdown(note.content.substring(0, 180))}...
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem;">
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="NotesModule.exportPDF('${note.chapter.replace(/'/g, "\\'")}', '${note.id || note._id}')">
                <i class="fa-solid fa-file-pdf" style="color: var(--hyper-accent-rose);"></i> Export PDF
              </button>

              <button class="hyper-btn hyper-btn-danger hyper-btn-sm" onclick="NotesModule.deleteNote('${note.id || note._id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-text-muted); padding: 1.5rem; grid-column: span 12;">No saved notes in library. Generate your first note above!</div>`;
      }
    } catch (e) {
      console.log('Error loading notes:', e);
    }
  },

  async exportPDF(chapter, noteId) {
    try {
      const res = await API.post('/notes/export', { title: `${chapter} Notes`, content: "Generated Note Content" });
      if (res && res.success && res.data.html_payload) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(res.data.html_payload);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (e) {
      console.error('Export PDF error:', e);
    }
  },

  async deleteNote(noteId) {
    try {
      await API.request(`/notes/${noteId}`, { method: 'DELETE' });
      await this.loadNotesLibrary();
    } catch (e) {
      console.error('Delete note error:', e);
    }
  }
};
