/* noteX AI - Production ChatGPT & Gemini Style Conversational Experience */
const ChatbotModule = {
  currentConversationId: null,
  isGenerating: false,
  abortController: null,
  speechRecognition: null,
  lastUserPrompt: "",
  conversationsCache: [],

  async render(container) {
    const currentClass = (typeof APP_STATE !== 'undefined' && APP_STATE.currentGrade) || localStorage.getItem('notex_grade') || 'Class 10';

    container.innerHTML = `
      <div class="hyper-chat-workspace" id="chatWorkspaceContainer">
        <!-- Drag and Drop PDF Overlay -->
        <div id="dragDropOverlay" class="hyper-drag-overlay" style="display: none;">
          <i class="fa-solid fa-file-pdf" style="font-size: 3.5rem; color: var(--hyper-accent-cyan);"></i>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">Drop PDF to Attach to AI Session</h2>
          <p style="color: var(--hyper-text-secondary); font-size: 0.9rem;">Release file to index chunks with ChromaDB RAG Vector Store</p>
        </div>

        <!-- Sidebar Conversations Drawer -->
        <div class="hyper-chat-sidebar" id="chatSidebar">
          <button class="hyper-btn hyper-btn-primary" style="width: 100%; border-radius: var(--hyper-radius-sm);" onclick="ChatbotModule.startNewChat()">
            <i class="fa-solid fa-plus"></i> New AI Thread
          </button>

          <div style="position: relative; margin-top: 0.5rem;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.75rem; top: 0.75rem; color: var(--hyper-text-muted); font-size: 0.8rem;"></i>
            <input type="text" id="searchChatsInput" class="hyper-input" placeholder="Search threads..." style="padding-left: 2.2rem; font-size: 0.8rem; border-radius: var(--hyper-radius-sm);" oninput="ChatbotModule.filterConversations()">
          </div>

          <div style="font-size: 0.72rem; font-weight: 700; color: var(--hyper-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0.5rem 0 0.2rem 0;">Recent Study Threads</div>
          <div id="conversationHistoryList" style="display: flex; flex-direction: column; gap: 0.35rem; overflow-y: auto; flex: 1;">
            <div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem; font-size: 0.82rem;">Loading threads...</div>
          </div>
        </div>

        <!-- Main Chat Feed Area -->
        <div class="hyper-chat-feed">
          <!-- Top Feed Navbar -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.5rem; border-bottom: 1px solid var(--hyper-border-subtle); background: #FFFFFF;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="hyper-badge hyper-badge-primary"><i class="fa-solid fa-bolt"></i> Groq Llama-3.3 AI Tutor</span>
              <span style="font-size: 0.85rem; color: var(--hyper-text-muted);">Grade: <strong id="chatCurriculumGrade" style="color: var(--hyper-accent-primary); font-weight: 700;">${currentClass}</strong></span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.exportFullThreadMarkdown()" title="Export Thread as Markdown">
                <i class="fa-solid fa-download"></i> Export Thread
              </button>
            </div>
          </div>

          <!-- Chat Messages Container -->
          <div id="chatMessagesBox" class="hyper-chat-messages">
            <!-- ChatGPT / Perplexity Style Premium Light Welcome Screen -->
            <div id="chatWelcomeHero" style="text-align: center; padding: 3rem 1rem; max-width: 780px; width: 100%; margin: 0 auto;">
              <div style="width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, var(--hyper-accent-primary), var(--hyper-accent-cyan)); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: #ffffff; margin: 0 auto 1.25rem auto; box-shadow: var(--hyper-shadow-glow-primary);">
                𝝌
              </div>
              <h1 style="font-size: 2.4rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--hyper-text-primary); letter-spacing: -0.03em;">Where curiosity meets mastery</h1>
              <p style="color: var(--hyper-text-secondary); font-size: 1rem; margin-bottom: 2rem;">Ask anything, solve science problems, generate smart notes & quizzes instantly with real-time AI streaming.</p>

              <!-- Glass Input Box in Hero -->
              <div class="hyper-chat-input-card" style="background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 12px 32px -6px rgba(15, 23, 42, 0.08);">
                <textarea id="chatHeroTextarea" class="hyper-chat-textarea" placeholder="Ask AI tutor anything, attach an image, or drag & drop a PDF..." rows="2" onkeydown="ChatbotModule.handleKeyDown(event, true)"></textarea>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.6rem;">
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="location.hash='#rag'"><i class="fa-solid fa-paperclip" style="color: var(--hyper-accent-primary);"></i> Attach PDF</button>
                    <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="ChatbotModule.toggleVoiceInput()"><i class="fa-solid fa-microphone" style="color: var(--hyper-accent-rose);"></i> Voice</button>
                    <span class="hyper-badge hyper-badge-primary"><i class="fa-solid fa-bolt"></i> Live Stream</span>
                  </div>
                  <button class="hyper-btn hyper-btn-primary" onclick="ChatbotModule.sendHeroMessage()">
                    Ask AI <span class="hyper-kbd">↵</span>
                  </button>
                </div>
              </div>

              <!-- Suggested Questions Matrix -->
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; margin-top: 2rem;">
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Explain Newton\'s Three Laws of Motion with real world examples')">
                  ⚡ Newton's Laws of Motion
                </div>
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Generate Smart Notes on Chemical Reactions & Equations')">
                  🎯 Chemical Reactions Smart Notes
                </div>
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Generate 5 MCQs for Science Class 10 with explanations')">
                  ❓ 5 Practice Science MCQs
                </div>
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Create active recall flashcards for Physics Optics')">
                  🧠 Physics Optics Flashcards
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Floating Glass Input Bar -->
          <div id="chatInputBar" style="padding: 1rem 1.5rem; background: #FFFFFF; border-top: 1px solid var(--hyper-border-subtle); display: none; justify-content: center;">
            <div class="hyper-chat-input-card">
              <textarea id="chatInputTextarea" class="hyper-chat-textarea" placeholder="Ask follow-up question or request code... (Shift + Enter for newline)" rows="1" oninput="ChatbotModule.autoResizeTextarea(this)" onkeydown="ChatbotModule.handleKeyDown(event, false)"></textarea>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.5rem;">
                <div style="display: flex; gap: 0.4rem; align-items: center;">
                  <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" title="Attach PDF document" onclick="location.hash='#rag'">
                    <i class="fa-solid fa-paperclip" style="color: var(--hyper-accent-primary);"></i> PDF
                  </button>
                  <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" title="Voice Input" onclick="ChatbotModule.toggleVoiceInput()">
                    <i class="fa-solid fa-microphone" id="voiceInputIcon" style="color: var(--hyper-text-muted);"></i> Voice
                  </button>
                </div>

                <div id="chatActionControls" style="display: flex; align-items: center; gap: 0.5rem;">
                  <button id="sendChatBtn" class="hyper-btn hyper-btn-primary" style="border-radius: var(--hyper-radius-full);" onclick="ChatbotModule.sendMessage()">
                    <i class="fa-solid fa-paper-plane"></i> Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachDragAndDropEvents();
    await this.loadConversationHistory();
  },

  autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  },

  handleKeyDown(e, isHero) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isHero) this.sendHeroMessage();
      else this.sendMessage();
    }
  },

  attachDragAndDropEvents() {
    const workspace = document.getElementById('chatWorkspaceContainer');
    const overlay = document.getElementById('dragDropOverlay');
    if (!workspace || !overlay) return;

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer.types.includes('Files')) {
        overlay.style.display = 'flex';
      }
    });

    overlay.addEventListener('dragleave', (e) => {
      e.preventDefault();
      overlay.style.display = 'none';
    });

    overlay.addEventListener('drop', async (e) => {
      e.preventDefault();
      overlay.style.display = 'none';

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`Uploading '${file.name}' to PDF Assistant RAG...`, 'info');
          }
          window.location.hash = '#rag';
        } else {
          if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast('Please upload a valid PDF document.', 'error');
          }
        }
      }
    });
  },

  toggleVoiceInput() {
    const icon = document.getElementById('voiceInputIcon');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }

    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
      if (icon) icon.style.color = 'var(--hyper-text-muted)';
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = false;
    this.speechRecognition.lang = 'en-US';

    if (icon) icon.style.color = 'var(--hyper-accent-rose)';

    this.speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('chatInputTextarea') || document.getElementById('chatHeroTextarea');
      if (input) {
        input.value += (input.value ? ' ' : '') + transcript;
      }
      if (icon) icon.style.color = 'var(--hyper-text-muted)';
      this.speechRecognition = null;
    };

    this.speechRecognition.onerror = () => {
      if (icon) icon.style.color = 'var(--hyper-text-muted)';
      this.speechRecognition = null;
    };

    this.speechRecognition.start();
  },

  sendHeroMessage() {
    const heroInput = document.getElementById('chatHeroTextarea');
    const val = heroInput ? heroInput.value.trim() : '';
    if (!val) return;
    this.useSuggestedPrompt(val);
  },

  useSuggestedPrompt(promptText) {
    document.getElementById('chatWelcomeHero')?.remove();
    document.getElementById('chatInputBar').style.display = 'flex';
    
    const input = document.getElementById('chatInputTextarea');
    if (input) {
      input.value = promptText;
      this.sendMessage();
    }
  },

  async loadConversationHistory() {
    try {
      const res = await API.get('/chat/conversations');
      const container = document.getElementById('conversationHistoryList');
      if (!container) return;

      if (res && res.success && res.data && res.data.conversations && res.data.conversations.length > 0) {
        this.conversationsCache = res.data.conversations;
        this.renderConversationList(res.data.conversations);
      } else {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem; font-size: 0.82rem;">No recent threads.</div>`;
      }
    } catch (e) {
      console.log('Error loading conversations:', e);
    }
  },

  renderConversationList(conversations) {
    const container = document.getElementById('conversationHistoryList');
    if (!container) return;

    container.innerHTML = conversations.map(conv => `
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.75rem; border-radius: var(--hyper-radius-sm); background: ${conv.id === this.currentConversationId ? 'var(--hyper-bg-elevated)' : 'transparent'}; cursor: pointer; border: 1px solid ${conv.id === this.currentConversationId ? 'var(--hyper-accent-cyan)' : 'transparent'};" onclick="ChatbotModule.loadConversation('${conv.id}')">
        <i class="fa-solid fa-message" style="color: var(--hyper-accent-cyan); font-size: 0.8rem;"></i>
        <span id="title_${conv.id}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; font-size: 0.83rem; color: var(--hyper-text-primary); font-weight: 500;">${conv.title || 'Study Session'}</span>
        <div style="display: flex; gap: 0.35rem;">
          <button style="background: none; border: none; color: var(--hyper-text-muted); cursor: pointer;" onclick="event.stopPropagation(); ChatbotModule.deleteConversation('${conv.id}')">
            <i class="fa-solid fa-trash-can" style="font-size: 0.75rem;"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  filterConversations() {
    const query = (document.getElementById('searchChatsInput')?.value || '').toLowerCase();
    if (!this.conversationsCache) return;
    const filtered = this.conversationsCache.filter(c => (c.title || 'Study Session').toLowerCase().includes(query));
    this.renderConversationList(filtered);
  },

  startNewChat() {
    if (this.isGenerating) this.stopGeneration();
    this.currentConversationId = null;
    this.render(document.getElementById('app-view-container'));
  },

  async sendMessage() {
    const input = document.getElementById('chatInputTextarea');
    const userText = input ? input.value.trim() : '';
    if (!userText || this.isGenerating) return;

    this.lastUserPrompt = userText;
    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }
    const messagesBox = document.getElementById('chatMessagesBox');

    // 1. Render User Message Row (Max 850px)
    const userRow = document.createElement('div');
    userRow.className = 'hyper-user-message-row';
    
    const userBubble = document.createElement('div');
    userBubble.className = 'hyper-bubble-user';
    userBubble.textContent = userText;
    userRow.appendChild(userBubble);
    messagesBox.appendChild(userRow);

    // 2. Render AI Message Row with Avatar Emblem & Shimmer Loading (Max 850px)
    const aiRow = document.createElement('div');
    aiRow.className = 'hyper-ai-message-row';

    const aiAvatar = document.createElement('div');
    aiAvatar.className = 'hyper-ai-avatar';
    aiAvatar.textContent = '𝝌';

    const aiBubbleContainer = document.createElement('div');
    aiBubbleContainer.style.flex = '1';
    
    const aiBubble = document.createElement('div');
    aiBubble.className = 'hyper-bubble-ai';
    aiBubble.innerHTML = `<div class="hyper-loading-shimmer"><span></span><span></span><span></span></div> Thinking... <span class="hyper-typing-cursor"></span>`;
    
    aiBubbleContainer.appendChild(aiBubble);
    aiRow.appendChild(aiAvatar);
    aiRow.appendChild(aiBubbleContainer);
    messagesBox.appendChild(aiRow);

    messagesBox.scrollTop = messagesBox.scrollHeight;
    this.isGenerating = true;

    this.updateControlsState(true);
    this.abortController = new AbortController();

    let fullMarkdownText = "";
    let actionData = null;

    try {
      const token = localStorage.getItem('notex_token') || sessionStorage.getItem('notex_token');

      // Attempt SSE Real-Time Stream
      const response = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          prompt: userText,
          conversation_id: this.currentConversationId,
          session_id: this.currentConversationId
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof Auth !== 'undefined' && Auth.handleUnauthorized) {
            Auth.handleUnauthorized();
          }
        }
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          
          const rawData = trimmed.replace(/^data:\s*/, '');
          if (rawData === '[DONE]') break;

          try {
            const parsed = JSON.parse(rawData);

            const newChunk = parsed.chunk || parsed.token || parsed.text || parsed.response || parsed.full_text || "";
            if (newChunk) {
              fullMarkdownText += newChunk;
              
              aiBubble.innerHTML = this.formatMarkdown(fullMarkdownText) + `<span class="hyper-typing-cursor"></span>`;
              if (typeof hljs !== 'undefined') hljs.highlightAll();
              messagesBox.scrollTop = messagesBox.scrollHeight;
            }

            if (parsed.session_id) {
              this.currentConversationId = parsed.session_id;
            }

            if (parsed.action_url && parsed.action_title) {
              actionData = { url: parsed.action_url, title: parsed.action_title };
            }
          } catch (jsonErr) {}
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        fullMarkdownText += "\n\n*[Generation stopped by user]*";
      } else {
        console.warn("[Chatbot Stream Warning] Stream failed, executing POST fallback:", e.message);
      }
    }

    // Fallback POST if empty
    if (!fullMarkdownText.trim()) {
      try {
        const postRes = await API.post('/chatbot/message', {
          prompt: userText,
          conversation_id: this.currentConversationId,
          session_id: this.currentConversationId
        });

        if (postRes && postRes.success && postRes.data) {
          fullMarkdownText = postRes.data.response || postRes.data.ai_response || postRes.data.text || "";
          if (postRes.data.conversation_id) this.currentConversationId = postRes.data.conversation_id;
          if (postRes.data.action_url && postRes.data.action_title) {
            actionData = { url: postRes.data.action_url, title: postRes.data.action_title };
          }
        }
      } catch (postErr) {
        console.error("[Chatbot POST Error]:", postErr);
      }
    }

    this.isGenerating = false;
    this.updateControlsState(false);

    if (!fullMarkdownText.trim()) {
      fullMarkdownText = "### 📚 noteX AI Tutor\n\nI could not generate a response at this time. Please check your query or try again.";
    }

    // Finalize AI Bubble with Action Button, Follow-up Chips & Multi-Format Export Toolbar
    let actionBtnHTML = '';
    if (actionData && actionData.url && actionData.title) {
      actionBtnHTML = `<div style="margin-top: 0.75rem;"><button class="hyper-btn hyper-btn-primary hyper-btn-sm" onclick="location.hash = '${actionData.url}'">${actionData.title}</button></div>`;
    }

    const followUpChipsHTML = `
      <div class="hyper-followup-chips">
        <div class="hyper-followup-chip" onclick="ChatbotModule.useSuggestedPrompt('Explain this concept with a real world analogy')">💡 Real world analogy</div>
        <div class="hyper-followup-chip" onclick="ChatbotModule.useSuggestedPrompt('Give me 3 practice board exam questions on this')">🎯 3 Practice questions</div>
        <div class="hyper-followup-chip" onclick="ChatbotModule.useSuggestedPrompt('Summarize key takeaways in 3 bullet points')">📝 Key takeaways</div>
      </div>
    `;

    const toolbarHTML = `
      <div style="display: flex; gap: 0.5rem; margin-top: 0.65rem; align-items: center; flex-wrap: wrap;">
        <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.copyToClipboard(this)">
          <i class="fa-solid fa-copy"></i> Copy
        </button>
        <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.regenerateLastResponse()">
          <i class="fa-solid fa-rotate-right"></i> Regenerate
        </button>
        <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.shareMessage(this)" title="Share Response">
          <i class="fa-solid fa-share-nodes"></i> Share
        </button>
        <div style="margin-left: auto; display: flex; gap: 0.35rem;">
          <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="ChatbotModule.exportMessageMarkdown(\`${this.escapeQuotes(fullMarkdownText)}\`)" title="Export as Markdown">
            <i class="fa-solid fa-file-code"></i> .MD
          </button>
          <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="ChatbotModule.exportMessageDOCX(\`${this.escapeQuotes(fullMarkdownText)}\`)" title="Export as Word DOCX">
            <i class="fa-solid fa-file-word"></i> .DOCX
          </button>
          <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="ChatbotModule.exportMessagePDF(\`${this.escapeQuotes(fullMarkdownText)}\`)" title="Export as PDF Document">
            <i class="fa-solid fa-file-pdf"></i> .PDF
          </button>
        </div>
      </div>
    `;

    aiBubbleContainer.innerHTML = `
      <div class="hyper-bubble-ai">${this.formatMarkdown(fullMarkdownText)}${actionBtnHTML}</div>
      ${followUpChipsHTML}
      ${toolbarHTML}
    `;

    this.renderKaTeXMath(aiBubbleContainer);
    if (typeof hljs !== 'undefined') hljs.highlightAll();
    messagesBox.scrollTop = messagesBox.scrollHeight;

    await this.loadConversationHistory();
  },

  escapeQuotes(str) {
    return (str || '').replace(/`/g, '\\`').replace(/\$/g, '\\$');
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

  stopGeneration() {
    if (this.abortController) {
      this.abortController.abort();
      this.isGenerating = false;
      this.updateControlsState(false);
    }
  },

  updateControlsState(generating) {
    const controls = document.getElementById('chatActionControls');
    if (!controls) return;

    if (generating) {
      controls.innerHTML = `
        <button id="stopChatBtn" class="hyper-btn hyper-btn-rose" style="border-radius: var(--hyper-radius-full);" onclick="ChatbotModule.stopGeneration()">
          <i class="fa-solid fa-square"></i> Stop
        </button>
      `;
    } else {
      controls.innerHTML = `
        <button id="sendChatBtn" class="hyper-btn hyper-btn-primary" style="border-radius: var(--hyper-radius-full);" onclick="ChatbotModule.sendMessage()">
          <i class="fa-solid fa-paper-plane"></i> Send
        </button>
      `;
    }
  },

  regenerateLastResponse() {
    if (this.lastUserPrompt) {
      const input = document.getElementById('chatInputTextarea');
      if (input) input.value = this.lastUserPrompt;
      this.sendMessage();
    }
  },

  copyToClipboard(btn) {
    const bubble = btn.closest('div').parentElement.querySelector('.hyper-bubble-ai');
    if (bubble) {
      navigator.clipboard.writeText(bubble.innerText).then(() => {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
        setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`; }, 2000);
      });
    }
  },

  shareMessage(btn) {
    const bubble = btn.closest('div').parentElement.querySelector('.hyper-bubble-ai');
    if (bubble && navigator.share) {
      navigator.share({
        title: 'noteX AI Study Response',
        text: bubble.innerText,
        url: window.location.href
      }).catch(() => {});
    } else {
      this.copyToClipboard(btn);
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('Response copied to clipboard for sharing!', 'success');
      }
    }
  },

  // Export Utilities (.MD, .DOCX, .PDF)
  exportMessageMarkdown(text) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    this.downloadBlob(blob, `noteX_AI_Note_${Date.now()}.md`);
  },

  exportMessageDOCX(text) {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>noteX AI Note</title><style>body{font-family:Arial,sans-serif;line-height:1.6;}</style></head>
      <body><h2>noteX AI Study Session Note</h2><div>${this.formatMarkdown(text)}</div></body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    this.downloadBlob(blob, `noteX_AI_Note_${Date.now()}.docx`);
  },

  exportMessagePDF(text) {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>noteX AI Note Export</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #111; line-height: 1.6; }
            h1, h2, h3 { color: #4f46e5; }
            code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; }
            pre { background: #1e1e2e; color: #fff; padding: 1rem; border-radius: 6px; }
          </style>
        </head>
        <body>
          <h1>noteX AI Study Platform — Note Export</h1>
          <hr/>
          <div>${this.formatMarkdown(text)}</div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  },

  exportFullThreadMarkdown() {
    const box = document.getElementById('chatMessagesBox');
    if (!box) return;
    const blob = new Blob([box.innerText], { type: 'text/markdown;charset=utf-8' });
    this.downloadBlob(blob, `noteX_AI_Full_Thread_${Date.now()}.md`);
  },

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  async loadConversation(convId) {
    if (this.isGenerating) this.stopGeneration();

    this.currentConversationId = convId;
    document.getElementById('chatWelcomeHero')?.remove();
    document.getElementById('chatInputBar').style.display = 'flex';

    const messagesBox = document.getElementById('chatMessagesBox');
    if (!messagesBox) return;

    messagesBox.innerHTML = `<div style="text-align: center; color: var(--hyper-text-muted); padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading thread history...</div>`;

    try {
      const res = await API.get(`/chat/conversation/${convId}`);
      if (res && res.success && res.data.conversation) {
        const msgs = res.data.conversation.messages || [];
        messagesBox.innerHTML = '';
        msgs.forEach((m) => {
          if (m.sender === 'user') {
            const userRow = document.createElement('div');
            userRow.className = 'hyper-user-message-row';

            const userBubble = document.createElement('div');
            userBubble.className = 'hyper-bubble-user';
            userBubble.textContent = m.text;

            userRow.appendChild(userBubble);
            messagesBox.appendChild(userRow);
          } else {
            const aiRow = document.createElement('div');
            aiRow.className = 'hyper-ai-message-row';

            const aiAvatar = document.createElement('div');
            aiAvatar.className = 'hyper-ai-avatar';
            aiAvatar.textContent = '𝝌';

            const aiBubbleContainer = document.createElement('div');
            aiBubbleContainer.style.flex = '1';

            const toolbarHTML = `
              <div style="display: flex; gap: 0.5rem; margin-top: 0.55rem; align-items: center;">
                <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.copyToClipboard(this)">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
              </div>
            `;
            aiBubbleContainer.innerHTML = `
              <div class="hyper-bubble-ai">${this.formatMarkdown(m.text || "No content")}</div>
              ${toolbarHTML}
            `;
            this.renderKaTeXMath(aiBubbleContainer);

            aiRow.appendChild(aiAvatar);
            aiRow.appendChild(aiBubbleContainer);
            messagesBox.appendChild(aiRow);
          }
        });

        if (typeof hljs !== 'undefined') hljs.highlightAll();
        messagesBox.scrollTop = messagesBox.scrollHeight;
        await this.loadConversationHistory();
      }
    } catch (e) {
      messagesBox.innerHTML = `<div style="color: var(--hyper-accent-rose); text-align: center;">Failed to load thread.</div>`;
    }
  },

  async deleteConversation(convId) {
    try {
      await API.request(`/chat/conversation/${convId}`, { method: 'DELETE' });
      if (this.currentConversationId === convId) this.startNewChat();
      else await this.loadConversationHistory();
    } catch (e) {
      console.error('Delete error:', e);
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
