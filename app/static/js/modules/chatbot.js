/* noteX AI - Conversational AI Assistant & Homepage Experience (V4 Pro) */
const ChatbotModule = {
  currentConversationId: null,
  isGenerating: false,
  abortController: null,
  speechRecognition: null,
  lastUserPrompt: "",

  async render(container) {
    container.innerHTML = `
      <div class="chat-container animate-fade-in">
        <!-- Conversations Sidebar -->
        <div class="chat-sidebar" id="chatSidebar">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
            <button class="btn-glass btn-new-chat" style="flex: 1;" onclick="ChatbotModule.startNewChat()">
              <i class="fa-solid fa-plus"></i> New AI Chat
            </button>
          </div>

          <!-- Search Chats Input -->
          <div style="position: relative; margin-bottom: 0.75rem;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.75rem; top: 0.75rem; color: var(--text-secondary); font-size: 0.8rem;"></i>
            <input type="text" id="searchChatsInput" class="glass-input" placeholder="Search conversations..." style="padding-left: 2rem; font-size: 0.8rem; border-radius: 12px;" oninput="ChatbotModule.filterConversations()">
          </div>

          <div class="conversation-history-label">Recent Study Chats</div>
          <div id="conversationHistoryList" class="conversation-list">
            <div style="text-align: center; color: var(--text-secondary); padding: 1rem; font-size: 0.85rem;">Loading chats...</div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="chat-main-area">
          <!-- Mobile Header Toggle Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4);">
            <button class="btn-glass-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;" onclick="ChatbotModule.toggleSidebarMobile()">
              <i class="fa-solid fa-bars"></i> Chats
            </button>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--accent-cyan);"><i class="fa-solid fa-robot"></i> noteX AI Assistant</div>
            <button class="btn-glass-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;" onclick="ChatbotModule.exportChat()">
              <i class="fa-solid fa-download"></i> Export
            </button>
          </div>

          <!-- Chat Messages Container -->
          <div id="chatMessagesBox" class="chat-messages-box">
            <!-- ChatGPT/Gemini Welcome Experience -->
            <div id="chatWelcomeHero" style="text-align: center; padding: 2.5rem 1rem; max-width: 680px; margin: 0 auto;">
              <div style="font-size: 3.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary);">Hello, Student!</h1>
              <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 1.5rem;">What would you like to learn today?</h3>

              <!-- Suggested Prompt Pills -->
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem;">
                <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Summarize my uploaded Science PDF chapter')">
                  📄 Summarize this PDF
                </button>
                <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Generate 5 MCQs from Chemical Reactions chapter')">
                  🎯 Generate MCQs
                </button>
                <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Create flashcards for Electricity and Magnetism')">
                  🧠 Create Flashcards
                </button>
                <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Explain Newton\'s Laws of Motion with real world examples')">
                  ⚡ Explain Newton's Laws
                </button>
                <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Create a 30-day exam revision study plan')">
                  📅 Prepare Exam Plan
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Input Controls Bar -->
          <div class="chat-input-bar">
            <div style="display: flex; gap: 0.5rem; width: 100%; align-items: center;">
              <!-- Upload PDF Quick Button -->
              <button class="btn-glass-secondary" style="padding: 0.75rem; border-radius: 50%; width: 44px; height: 44px;" title="Upload PDF Document" onclick="location.hash = '#rag'">
                <i class="fa-solid fa-paperclip" style="color: var(--accent-cyan);"></i>
              </button>

              <!-- Main Input Textarea -->
              <input type="text" id="chatInputText" class="glass-input" placeholder="Ask AI anything, generate notes, quizzes, flashcards or study plans..." style="flex: 1; border-radius: 24px; padding: 0.75rem 1.25rem;">

              <!-- Voice Input Button -->
              <button id="voiceInputBtn" class="btn-glass-secondary" style="padding: 0.75rem; border-radius: 50%; width: 44px; height: 44px;" title="Voice Input" onclick="ChatbotModule.toggleVoiceInput()">
                <i class="fa-solid fa-microphone" id="voiceIcon"></i>
              </button>

              <!-- Send / Stop Button -->
              <button id="sendChatBtn" class="btn-glass" style="padding: 0.75rem 1.25rem; border-radius: 24px;" onclick="ChatbotModule.sendMessage()">
                <i class="fa-solid fa-paper-plane" id="sendBtnIcon"></i>
              </button>
            </div>
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

  useSuggestedPrompt(promptText) {
    const input = document.getElementById('chatInputText');
    if (input) {
      input.value = promptText;
      this.sendMessage();
    }
  },

  toggleSidebarMobile() {
    const sidebar = document.getElementById('chatSidebar');
    if (sidebar) sidebar.classList.toggle('open');
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
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1rem; font-size: 0.8rem;">No recent chats.</div>`;
      }
    } catch (e) {
      console.log('Error loading conversations:', e);
    }
  },

  renderConversationList(conversations) {
    const container = document.getElementById('conversationHistoryList');
    if (!container) return;

    container.innerHTML = conversations.map(conv => `
      <div class="conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}" onclick="ChatbotModule.loadConversation('${conv.id}')">
        <i class="fa-solid fa-message"></i>
        <span id="title_${conv.id}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${conv.title || 'Study Session'}</span>
        <div style="display: flex; gap: 0.35rem;">
          <button style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" onclick="event.stopPropagation(); ChatbotModule.renameConversation('${conv.id}')" title="Rename Chat">
            <i class="fa-solid fa-pen" style="font-size: 0.75rem;"></i>
          </button>
          <button style="background: none; border: none; color: var(--accent-rose); cursor: pointer;" onclick="event.stopPropagation(); ChatbotModule.deleteConversation('${conv.id}')" title="Delete Chat">
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

  renameConversation(convId) {
    const titleSpan = document.getElementById(`title_${convId}`);
    if (!titleSpan) return;
    const oldTitle = titleSpan.textContent;
    const newTitle = prompt("Enter new title for this conversation:", oldTitle);
    if (newTitle && newTitle.trim()) {
      titleSpan.textContent = newTitle.trim();
    }
  },

  startNewChat() {
    this.currentConversationId = null;
    const messagesBox = document.getElementById('chatMessagesBox');
    if (messagesBox) {
      messagesBox.innerHTML = `
        <div id="chatWelcomeHero" style="text-align: center; padding: 2.5rem 1rem; max-width: 680px; margin: 0 auto;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary);">Hello, Student!</h1>
          <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 1.5rem;">What would you like to learn today?</h3>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
            <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Summarize my uploaded Science PDF chapter')">📄 Summarize PDF</button>
            <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Generate 5 MCQs from Chemical Reactions chapter')">🎯 Generate MCQs</button>
            <button class="btn-glass-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="ChatbotModule.useSuggestedPrompt('Create flashcards for Electricity and Magnetism')">🧠 Create Flashcards</button>
          </div>
        </div>
      `;
    }
    this.loadConversationHistory();
  },

  async sendMessage() {
    const input = document.getElementById('chatInputText');
    const userText = (input ? input.value : '').strip ? input.value.trim() : '';
    if (!userText || this.isGenerating) return;

    this.lastUserPrompt = userText;
    if (input) input.value = '';
    const messagesBox = document.getElementById('chatMessagesBox');
    
    const welcomeHero = document.getElementById('chatWelcomeHero');
    if (welcomeHero) welcomeHero.remove();

    // Render User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = userText;
    messagesBox.appendChild(userBubble);

    // Render AI Bubble
    const aiBubbleContainer = document.createElement('div');
    aiBubbleContainer.style.marginBottom = '1rem';
    
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble chat-bubble-ai';
    aiBubble.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color: var(--accent-cyan);"></i> Thinking...`;
    aiBubbleContainer.appendChild(aiBubble);
    messagesBox.appendChild(aiBubbleContainer);

    messagesBox.scrollTop = messagesBox.scrollHeight;
    this.isGenerating = true;
    this.updateSendButtonIcon(true);

    try {
      const res = await API.post('/chatbot/message', {
        prompt: userText,
        conversation_id: this.currentConversationId
      });

      if (res && res.success && res.data) {
        this.currentConversationId = res.data.conversation_id;
        const responseContent = res.data.response || '';

        // Simulate typing animation
        await this.typeWriterEffect(aiBubble, responseContent);

        // Action button rendering
        let actionBtnHTML = '';
        if (res.data.action_url && res.data.action_title) {
          actionBtnHTML = `<div style="margin-top: 0.75rem;"><button class="btn-glass" onclick="location.hash = '${res.data.action_url}'">${res.data.action_title}</button></div>`;
        }

        // Action Toolbar (Copy, Regenerate, Voice Output)
        const toolbarHTML = `
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center;">
            <button class="btn-glass-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="ChatbotModule.copyToClipboard(this)" title="Copy text">
              <i class="fa-solid fa-copy"></i> Copy
            </button>
            <button class="btn-glass-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="ChatbotModule.regenerateLastResponse()" title="Regenerate">
              <i class="fa-solid fa-rotate-right"></i> Regenerate
            </button>
            <button class="btn-glass-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="ChatbotModule.speakText(this)" title="Read aloud">
              <i class="fa-solid fa-volume-high"></i> Read
            </button>
          </div>
        `;

        aiBubbleContainer.innerHTML = `
          <div class="chat-bubble chat-bubble-ai">${this.formatMarkdown(responseContent)}${actionBtnHTML}</div>
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
    this.updateSendButtonIcon(false);
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

  updateSendButtonIcon(isGenerating) {
    const icon = document.getElementById('sendBtnIcon');
    if (icon) {
      icon.className = isGenerating ? 'fa-solid fa-stop' : 'fa-solid fa-paper-plane';
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
      const text = bubble.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
        setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`; }, 2000);
      });
    }
  },

  speakText(btn) {
    const bubble = btn.closest('div').previousElementSibling;
    if (bubble && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(bubble.innerText.substring(0, 300));
      window.speechSynthesis.speak(utterance);
    }
  },

  exportChat() {
    const box = document.getElementById('chatMessagesBox');
    if (!box) return;
    const text = box.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteX_AI_Chat_${Date.now()}.txt`;
    a.click();
  },

  async loadConversation(convId) {
    this.currentConversationId = convId;
    const messagesBox = document.getElementById('chatMessagesBox');
    if (!messagesBox) return;

    messagesBox.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading conversation history...</div>`;

    try {
      const res = await API.get(`/chat/conversation/${convId}`);
      if (res && res.success && res.data.conversation) {
        const msgs = res.data.conversation.messages || [];
        messagesBox.innerHTML = '';
        msgs.forEach(m => {
          const bubble = document.createElement('div');
          bubble.className = m.sender === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai';
          bubble.innerHTML = m.sender === 'user' ? m.text : this.formatMarkdown(m.text);
          messagesBox.appendChild(bubble);
        });
        if (typeof hljs !== 'undefined') hljs.highlightAll();
        messagesBox.scrollTop = messagesBox.scrollHeight;
        await this.loadConversationHistory();
      }
    } catch (e) {
      messagesBox.innerHTML = `<div style="color: var(--accent-rose); text-align: center;">Failed to load chat history.</div>`;
    }
  },

  async deleteConversation(convId) {
    try {
      await API.request(`/chat/conversation/${convId}`, { method: 'DELETE' });
      if (this.currentConversationId === convId) this.startNewChat();
      else await this.loadConversationHistory();
    } catch (e) {
      console.error('Delete conversation error:', e);
    }
  },

  toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!this.speechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const input = document.getElementById('chatInputText');
        if (input) input.value = transcript;
        this.toggleVoiceInputIcon(false);
      };

      this.speechRecognition.onerror = () => this.toggleVoiceInputIcon(false);
      this.speechRecognition.onend = () => this.toggleVoiceInputIcon(false);
    }

    this.toggleVoiceInputIcon(true);
    this.speechRecognition.start();
  },

  toggleVoiceInputIcon(isListening) {
    const icon = document.getElementById('voiceIcon');
    if (icon) {
      icon.style.color = isListening ? 'var(--accent-rose)' : 'var(--text-primary)';
    }
  },

  formatMarkdown(text) {
    if (typeof marked !== 'undefined') return marked.parse(text);
    return text.replace(/\n/g, '<br>');
  }
};
