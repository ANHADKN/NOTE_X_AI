/* noteX AI - Smart Notes Module Controller */
const NotesModule = {
  selectedNoteType: 'Smart Notes',

  async render(container) {
    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;">AI Smart Notes Generator</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Curriculum Grade: <strong style="color: var(--accent-cyan);">${APP_STATE.currentGrade}</strong>. Generate AI Notes, Key Notes, Formulas, and Summaries.</p>
            </div>
          </div>
        </div>

        <!-- Note Format Selection Toolbar -->
        <div class="glass-card section-card" style="margin-bottom: 2rem;">
          <div class="section-title">
            <span><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-cyan); margin-right: 0.5rem;"></i> Select Note Format</span>
          </div>

          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
            <button class="btn-glass note-format-btn" onclick="NotesModule.selectFormat('Smart Notes', this)">📄 Smart Notes</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('Short Notes', this)">📝 Short Notes</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('Key Notes', this)">✨ Key Notes</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('Revision Notes', this)">📋 Revision Notes</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('Formula Notes', this)">🧠 Formula Sheet</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('One-Page Summary', this)">📚 One-Page Summary</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('Exam Notes', this)">❓ Exam Notes</button>
            <button class="btn-glass-secondary note-format-btn" onclick="NotesModule.selectFormat('Last-Minute Revision', this)">⚡ Last-Minute Revision</button>
          </div>

          <!-- Subject & Chapter Inputs -->
          <div style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
              <select id="noteSubjectSelect" class="glass-input">
                <option value="Science" selected>Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Chapter / Topic Name:</label>
              <input type="text" id="noteChapterInput" class="glass-input" placeholder="e.g. Electricity, Quadratic Equations, Acids and Bases...">
            </div>

            <button id="generateNoteBtn" class="btn-glass" onclick="NotesModule.handleGenerate()">
              <i class="fa-solid fa-microchip"></i> Generate Note
            </button>
          </div>

          <div id="noteGenStatus" style="font-size: 0.85rem; text-align: center; margin-top: 0.75rem;"></div>
        </div>

        <!-- Saved Notes Library Grid -->
        <div class="glass-card section-card">
          <div class="section-title">
            <span><i class="fa-solid fa-book-bookmark" style="color: var(--accent-indigo); margin-right: 0.5rem;"></i> Saved Notes Library</span>
          </div>

          <div id="notesLibraryGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
            <div style="text-align: center; color: var(--text-secondary); padding: 1.5rem; grid-column: 1/-1;">Loading saved notes...</div>
          </div>
        </div>
      </div>
    `;

    await this.loadNotesLibrary();
  },

  selectFormat(format, btn) {
    this.selectedNoteType = format;
    document.querySelectorAll('.note-format-btn').forEach(b => b.className = 'btn-glass-secondary note-format-btn');
    btn.className = 'btn-glass note-format-btn';
  },

  async handleGenerate() {
    const chapterInput = document.getElementById('noteChapterInput');
    const subjectSelect = document.getElementById('noteSubjectSelect');
    const statusDiv = document.getElementById('noteGenStatus');

    const chapter = (chapterInput ? chapterInput.value : '').trim();
    const subject = subjectSelect ? subjectSelect.value : 'Science';

    if (!chapter) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--accent-rose)';
        statusDiv.textContent = 'Please enter a Chapter or Topic name.';
      }
      return;
    }

    if (statusDiv) {
      statusDiv.style.color = 'var(--accent-cyan)';
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
          statusDiv.style.color = 'var(--accent-emerald)';
          statusDiv.textContent = res.message;
        }
        if (chapterInput) chapterInput.value = '';
        await this.loadNotesLibrary();
      } else {
        if (statusDiv) {
          statusDiv.style.color = 'var(--accent-rose)';
          statusDiv.textContent = res.message || 'Failed to generate note.';
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--accent-rose)';
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
          <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <span class="grade-badge-selector" style="font-size: 0.75rem; padding: 0.15rem 0.5rem;">${note.note_type}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">${note.subject}</span>
              </div>
              <h4 style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">${note.chapter}</h4>
              <div style="font-size: 0.85rem; color: var(--text-secondary); max-height: 110px; overflow: hidden; line-height: 1.5;">
                ${ChatbotModule.formatMarkdown(note.content.substring(0, 200))}...
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem;">
              <button class="btn-glass-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="NotesModule.exportPDF('${note.chapter.replace(/'/g, "\\'")}', '${note.id || note._id}')">
                <i class="fa-solid fa-file-pdf" style="color: var(--accent-rose);"></i> Export PDF
              </button>

              <button class="btn-glass-secondary" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; color: var(--accent-rose);" onclick="NotesModule.deleteNote('${note.id || note._id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem; grid-column: 1/-1;">No saved notes in library. Generate your first note above!</div>`;
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
