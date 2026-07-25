/* noteX AI - Perplexity AI & Raycast Style Conversational Hero (Hyper Pro) */
const ChatbotModule = {
  currentConversationId: null,
  isGenerating: false,
  abortController: null,
  speechRecognition: null,
  lastUserPrompt: "",

  async render(container) {
    container.innerHTML = `
      <div class="hyper-chat-workspace">
        <!-- Sidebar Conversations Drawer -->
        <div class="hyper-chat-sidebar" id="chatSidebar">
          <button class="hyper-btn hyper-btn-primary" style="width: 100%;" onclick="ChatbotModule.startNewChat()">
            <i class="fa-solid fa-plus"></i> New AI Thread
          </button>

          <div style="position: relative; margin-top: 0.5rem;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.75rem; top: 0.75rem; color: var(--hyper-text-muted); font-size: 0.8rem;"></i>
            <input type="text" id="searchChatsInput" class="hyper-input" placeholder="Filter threads..." style="padding-left: 2.2rem; font-size: 0.8rem; border-radius: var(--hyper-radius-sm);" oninput="ChatbotModule.filterConversations()">
          </div>

          <div style="font-size: 0.72rem; font-weight: 700; color: var(--hyper-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0.5rem 0 0.2rem 0;">Recent Study Threads</div>
          <div id="conversationHistoryList" style="display: flex; flex-direction: column; gap: 0.35rem; overflow-y: auto; flex: 1;">
            <div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem; font-size: 0.82rem;">Loading threads...</div>
          </div>
        </div>

        <!-- Main Chat Feed Area -->
        <div class="hyper-chat-feed">
          <!-- Top Feed Navbar -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--hyper-border-subtle); background: var(--hyper-bg-surface);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="hyper-badge hyper-badge-cyan"><i class="fa-solid fa-microchip"></i> noteX Engine v4</span>
              <span style="font-size: 0.85rem; color: var(--hyper-text-muted);">Curriculum: <strong>${typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10'}</strong></span>
            </div>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.exportChat()">
              <i class="fa-solid fa-download"></i> Export Thread
            </button>
          </div>

          <!-- Chat Messages Container -->
          <div id="chatMessagesBox" class="hyper-chat-messages">
            <!-- Perplexity AI Hero Experience -->
            <div id="chatWelcomeHero" style="text-align: center; padding: 3rem 1rem; max-width: 720px; margin: 0 auto;">
              <div style="font-size: 3.5rem; margin-bottom: 0.75rem; color: var(--hyper-accent-cyan);">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h1 style="font-size: 2.4rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--hyper-text-primary); letter-spacing: -0.03em;">Where curiosity meets mastery</h1>
              <p style="color: var(--hyper-text-secondary); font-size: 1rem; margin-bottom: 2rem;">Ask anything, solve complex science problems, generate smart notes & quizzes instantly.</p>

              <!-- Perplexity Query Box -->
              <div class="hyper-query-card">
                <input type="text" id="chatHeroInput" class="hyper-input" placeholder="Ask AI tutor anything or generate notes..." style="border: none; background: transparent; font-size: 1.05rem; padding: 0.5rem 0;" onkeypress="if(event.key==='Enter') ChatbotModule.sendHeroMessage()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem;">
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="hyper-badge hyper-badge-primary"><i class="fa-solid fa-bolt"></i> Fast RAG Model</span>
                    <button class="hyper-btn hyper-btn-ghost hyper-btn-sm" onclick="location.hash='#rag'"><i class="fa-solid fa-paperclip"></i> Attach PDF</button>
                  </div>
                  <button class="hyper-btn hyper-btn-primary" onclick="ChatbotModule.sendHeroMessage()">
                    Ask AI <span class="hyper-kbd">↵</span>
                  </button>
                </div>
              </div>

              <!-- Suggested Prompt Chips -->
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; margin-top: 2rem;">
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Explain Newton\'s Laws of Motion with real world examples')">
                  ⚡ Explain Newton's Laws
                </div>
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Generate a 5-question MCQ quiz for Science')">
                  🎯 Generate Quiz
                </div>
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Summarize my uploaded Science PDF chapter')">
                  📄 Summarize PDF
                </div>
                <div class="hyper-chip" onclick="ChatbotModule.useSuggestedPrompt('Create flashcards for Chemical Reactions')">
                  🧠 Create Flashcards
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Chat Input Bar (Shown during active thread) -->
          <div id="chatInputBar" style="padding: 1rem 1.5rem; background: var(--hyper-bg-surface); border-top: 1px solid var(--hyper-border-subtle); display: none; gap: 0.75rem; align-items: center;">
            <button class="hyper-btn hyper-btn-glass" style="padding: 0.65rem; border-radius: var(--hyper-radius-full); width: 42px; height: 42px;" title="Upload PDF" onclick="location.hash='#rag'">
              <i class="fa-solid fa-paperclip" style="color: var(--hyper-accent-cyan);"></i>
            </button>

            <input type="text" id="chatInputText" class="hyper-input" placeholder="Ask follow-up question..." style="flex: 1; border-radius: var(--hyper-radius-full); padding: 0.75rem 1.25rem;">

            <button id="sendChatBtn" class="hyper-btn hyper-btn-primary" style="padding: 0.75rem 1.35rem; border-radius: var(--hyper-radius-full);" onclick="ChatbotModule.sendMessage()">
              <i class="fa-solid fa-paper-plane" id="sendBtnIcon"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    await this.loadConversationHistory();
  },

  attachEvents() {
    const input = document.getElementById('chatInputText');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
  },

  sendHeroMessage() {
    const heroInput = document.getElementById('chatHeroInput');
    const val = heroInput ? heroInput.value.trim() : '';
    if (!val) return;
    
    this.useSuggestedPrompt(val);
  },

  useSuggestedPrompt(promptText) {
    document.getElementById('chatWelcomeHero')?.remove();
    document.getElementById('chatInputBar').style.display = 'flex';
    
    const input = document.getElementById('chatInputText');
    if (input) {
      input.value = promptText;
      this.sendMessage();
    }
  },

  toggleSidebarMobile() {
    const sidebar = document.getElementById('chatSidebar');
    if (sidebar) sidebar.classList.toggle('active');
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
    this.currentConversationId = null;
    this.render(document.getElementById('app-view-container'));
  },

  async sendMessage() {
    const input = document.getElementById('chatInputText');
    const userText = input ? input.value.trim() : '';
    if (!userText || this.isGenerating) return;

    this.lastUserPrompt = userText;
    if (input) input.value = '';
    const messagesBox = document.getElementById('chatMessagesBox');

    // Render User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'hyper-bubble-user';
    userBubble.textContent = userText;
    messagesBox.appendChild(userBubble);

    // Render AI Bubble Container
    const aiBubbleContainer = document.createElement('div');
    aiBubbleContainer.style.marginBottom = '1rem';
    
    const aiBubble = document.createElement('div');
    aiBubble.className = 'hyper-bubble-ai';
    aiBubble.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color: var(--hyper-accent-cyan);"></i> Thinking...`;
    aiBubbleContainer.appendChild(aiBubble);
    messagesBox.appendChild(aiBubbleContainer);

    messagesBox.scrollTop = messagesBox.scrollHeight;
    this.isGenerating = true;

    try {
      const res = await API.post('/chatbot/message', {
        prompt: userText,
        conversation_id: this.currentConversationId
      });

      if (res && res.success && res.data) {
        this.currentConversationId = res.data.conversation_id;
        const responseContent = res.data.response || '';

        await this.typeWriterEffect(aiBubble, responseContent);

        let actionBtnHTML = '';
        if (res.data.action_url && res.data.action_title) {
          actionBtnHTML = `<div style="margin-top: 0.75rem;"><button class="hyper-btn hyper-btn-primary hyper-btn-sm" onclick="location.hash = '${res.data.action_url}'">${res.data.action_title}</button></div>`;
        }

        const toolbarHTML = `
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center;">
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.copyToClipboard(this)">
              <i class="fa-solid fa-copy"></i> Copy
            </button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="ChatbotModule.regenerateLastResponse()">
              <i class="fa-solid fa-rotate-right"></i> Regenerate
            </button>
          </div>
        `;

        aiBubbleContainer.innerHTML = `
          <div class="hyper-bubble-ai">${this.formatMarkdown(responseContent)}${actionBtnHTML}</div>
          ${toolbarHTML}
        `;

        if (typeof hljs !== 'undefined') hljs.highlightAll();
        await this.loadConversationHistory();
      } else {
        aiBubble.textContent = "I could not process this request. Please try again.";
      }
    } catch (e) {
      aiBubble.textContent = `Chat Error: ${e.message}`;
    }

    this.isGenerating = false;
    messagesBox.scrollTop = messagesBox.scrollHeight;
  },

  async typeWriterEffect(element, text) {
    element.innerHTML = '';
    const words = text.split(' ');
    let current = '';

    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      element.innerHTML = this.formatMarkdown(current);
      if (i % 4 === 0) {
        const box = document.getElementById('chatMessagesBox');
        if (box) box.scrollTop = box.scrollHeight;
        await new Promise(r => setTimeout(r, 20));
      }
    }
  },

  regenerateLastResponse() {
    if (this.lastUserPrompt) {
      const input = document.getElementById('chatInputText');
      if (input) input.value = this.lastUserPrompt;
      this.sendMessage();
    }
  },

  copyToClipboard(btn) {
    const bubble = btn.closest('div').previousElementSibling;
    if (bubble) {
      navigator.clipboard.writeText(bubble.innerText).then(() => {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
        setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`; }, 2000);
      });
    }
  },

  exportChat() {
    const box = document.getElementById('chatMessagesBox');
    if (!box) return;
    const blob = new Blob([box.innerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteX_AI_Thread_${Date.now()}.txt`;
    a.click();
  },

  async loadConversation(convId) {
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
        msgs.forEach(m => {
          const bubble = document.createElement('div');
          bubble.className = m.sender === 'user' ? 'hyper-bubble-user' : 'hyper-bubble-ai';
          bubble.innerHTML = m.sender === 'user' ? m.text : this.formatMarkdown(m.text);
          messagesBox.appendChild(bubble);
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
    if (typeof marked !== 'undefined') return marked.parse(text);
    return text.replace(/\n/g, '<br>');
  }
};
