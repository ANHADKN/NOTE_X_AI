/* noteX AI - Raycast PDF Dropzone & Grounded RAG Feed (Hyper Pro) */
const RAGModule = {
  activeDocId: null,
  activeDocName: null,

  async render(container) {
    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Left Column: Upload Dropzone & PDF Index -->
        <div class="hyper-col-4" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="hyper-card">
            <div class="hyper-card-header">
              <div class="hyper-card-title">
                <i class="fa-solid fa-cloud-arrow-up" style="color: var(--hyper-accent-cyan);"></i> Upload Study PDF
              </div>
            </div>
            
            <div id="pdfDropZone" class="hyper-card hyper-card-interactive" style="padding: 1.75rem; text-align: center; border: 2px dashed var(--hyper-border-subtle); cursor: pointer;">
              <i class="fa-solid fa-file-pdf" style="font-size: 2.5rem; color: var(--hyper-accent-rose); margin-bottom: 0.75rem;"></i>
              <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; color: var(--hyper-text-primary);">Drop PDF here or click to browse</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">Max size: 16 MB</div>
              <input type="file" id="pdfFileInput" accept=".pdf" style="display: none;">
            </div>

            <div id="uploadStatusMsg" style="margin-top: 0.75rem; font-size: 0.85rem; text-align: center;"></div>
          </div>

          <div class="hyper-card">
            <div class="hyper-card-header">
              <div class="hyper-card-title">
                <i class="fa-solid fa-folder-closed" style="color: var(--hyper-accent-primary);"></i> PDF Library Index
              </div>
            </div>
            <div id="ragDocsList" style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 420px; overflow-y: auto;">
              <div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem;">Loading documents...</div>
            </div>
          </div>
        </div>

        <!-- Right Column: RAG Q&A Feed -->
        <div class="hyper-card hyper-col-8" style="display: flex; flex-direction: column; height: calc(100vh - 120px); max-height: 820px;">
          <div style="padding-bottom: 0.85rem; border-bottom: 1px solid var(--hyper-border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-weight: 800; font-size: 1.15rem; color: var(--hyper-text-primary);">Semantic RAG Search</h3>
              <div style="font-size: 0.85rem; color: var(--hyper-text-muted);">Active Document: <strong id="activeDocTitleLabel" style="color: var(--hyper-accent-cyan);">None Selected</strong></div>
            </div>
            <span class="hyper-badge hyper-badge-primary"><i class="fa-solid fa-layer-group"></i> Chroma Vector Index</span>
          </div>

          <!-- RAG Messages Feed -->
          <div id="ragResultsBox" class="hyper-chat-messages" style="flex: 1; padding: 1.25rem 0;">
            <div class="hyper-bubble-ai">
              Select or upload a PDF document on the left to start asking questions grounded in your textbook!
            </div>
          </div>

          <!-- Input Controls -->
          <div style="display: flex; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--hyper-border-subtle);">
            <input type="text" id="ragQueryInput" class="hyper-input" placeholder="Ask a question about the active PDF..." disabled>
            <button id="sendRagBtn" class="hyper-btn hyper-btn-cyan" disabled>
              <i class="fa-solid fa-magnifying-glass"></i> Search
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    await this.loadUserDocuments();
  },

  attachEvents() {
    const dropZone = document.getElementById('pdfDropZone');
    const fileInput = document.getElementById('pdfFileInput');
    const queryInput = document.getElementById('ragQueryInput');
    const sendBtn = document.getElementById('sendRagBtn');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) this.handleUpload(e.target.files[0]);
      });

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--hyper-accent-cyan)';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--hyper-border-subtle)';
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--hyper-border-subtle)';
        if (e.dataTransfer.files.length > 0) this.handleUpload(e.dataTransfer.files[0]);
      });
    }

    if (sendBtn && queryInput) {
      sendBtn.addEventListener('click', () => this.handleQuery());
      queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleQuery();
      });
    }
  },

  async handleUpload(file) {
    const statusMsg = document.getElementById('uploadStatusMsg');
    if (statusMsg) {
      statusMsg.style.color = 'var(--hyper-accent-cyan)';
      statusMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Vectorizing & Indexing PDF...`;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', 'General');

    try {
      const response = await fetch('/api/rag/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${APP_STATE.token}` },
        body: formData
      });

      const res = await response.json();
      if (response.ok && res.success) {
        if (statusMsg) {
          statusMsg.style.color = 'var(--hyper-accent-emerald)';
          statusMsg.textContent = res.message;
        }
        await this.loadUserDocuments();
        this.selectDocument(res.data.doc_id, res.data.filename);
      } else {
        if (statusMsg) {
          statusMsg.style.color = 'var(--hyper-accent-rose)';
          statusMsg.textContent = res.message || 'Upload failed.';
        }
      }
    } catch (e) {
      if (statusMsg) {
        statusMsg.style.color = 'var(--hyper-accent-rose)';
        statusMsg.textContent = `Upload Error: ${e.message}`;
      }
    }
  },

  async loadUserDocuments() {
    try {
      const res = await API.get('/rag/documents');
      const container = document.getElementById('ragDocsList');
      if (!container) return;

      if (res && res.success && res.data && res.data.documents && res.data.documents.length > 0) {
        container.innerHTML = res.data.documents.map(doc => `
          <div class="hyper-card hyper-card-interactive" style="padding: 0.75rem; display: flex; align-items: center; justify-content: space-between;" onclick="RAGModule.selectDocument('${doc.id}', '${doc.filename.replace(/'/g, "\\'")}')">
            <div>
              <div style="font-weight: 600; font-size: 0.85rem; color: var(--hyper-text-primary); overflow: hidden; text-overflow: ellipsis; max-width: 150px; white-space: nowrap;">${doc.filename}</div>
              <div style="font-size: 0.72rem; color: var(--hyper-text-muted);">${doc.num_pages} Pages • ${doc.num_chunks} Chunks</div>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size: 0.8rem; color: var(--hyper-accent-cyan);"></i>
          </div>
        `).join('');

        if (!this.activeDocId && res.data.documents.length > 0) {
          const first = res.data.documents[0];
          this.selectDocument(first.id, first.filename);
        }
      } else {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem; font-size: 0.85rem;">No PDFs uploaded yet.</div>`;
      }
    } catch (e) {
      console.log('Error loading documents:', e);
    }
  },

  selectDocument(docId, docName) {
    this.activeDocId = docId;
    this.activeDocName = docName;

    const label = document.getElementById('activeDocTitleLabel');
    if (label) label.textContent = docName;

    const queryInput = document.getElementById('ragQueryInput');
    const sendBtn = document.getElementById('sendRagBtn');

    if (queryInput) queryInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;

    const resultsBox = document.getElementById('ragResultsBox');
    if (resultsBox) {
      resultsBox.innerHTML = `
        <div class="hyper-bubble-ai">
          Selected document <strong>${docName}</strong>! Type your question below to retrieve exact page context and citations.
        </div>
      `;
    }
  },

  async handleQuery() {
    const input = document.getElementById('ragQueryInput');
    const query = (input ? input.value : '').trim();

    if (!query || !this.activeDocId) return;

    if (input) input.value = '';

    const resultsBox = document.getElementById('ragResultsBox');

    const userBubble = document.createElement('div');
    userBubble.className = 'hyper-bubble-user';
    userBubble.textContent = query;
    resultsBox.appendChild(userBubble);

    const aiBubble = document.createElement('div');
    aiBubble.className = 'hyper-bubble-ai';
    aiBubble.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color: var(--hyper-accent-cyan);"></i> Retrieving context chunks...`;
    resultsBox.appendChild(aiBubble);
    resultsBox.scrollTop = resultsBox.scrollHeight;

    try {
      const res = await API.post('/rag/query', {
        doc_id: this.activeDocId,
        query: query
      });

      if (res && res.success && res.data) {
        aiBubble.innerHTML = ChatbotModule.formatMarkdown(res.data.answer);
      } else {
        aiBubble.textContent = "Unable to retrieve context for this question.";
      }
    } catch (e) {
      aiBubble.textContent = `RAG Error: ${e.message}`;
    }

    resultsBox.scrollTop = resultsBox.scrollHeight;
  }
};
