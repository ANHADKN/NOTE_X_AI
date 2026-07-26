/* noteX AI - Chat UI (Next-Gen OS) */

const ChatbotModule = {
  currentConversationId: null,
  isGenerating: false,
  abortController: null,

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="nx30-chat-container" style="height: 100%; display: flex; flex-direction: column; background: var(--hyper-bg-main);">
        
        <!-- Chat Header -->
        <div style="padding: 1rem 2rem; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px);">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #5B6CFF, #7C5CFF); color: white; display: flex; justify-content: center; align-items: center;">
              <i data-lucide="sparkles"></i>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 1.1rem; font-weight: 600;">NoteX Assistant</h2>
              <p style="margin: 0; font-size: 0.8rem; color: #64748B;">Gemini 3.5 Pro • Online</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" title="Pin Chat"><i data-lucide="pin"></i></button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" title="Export PDF"><i data-lucide="download"></i></button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" title="Share"><i data-lucide="share-2"></i></button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" title="Delete"><i data-lucide="trash-2"></i></button>
          </div>
        </div>

        <div id="chatMessagesBox" class="nx30-chat-messages" style="flex: 1; overflow-y: auto; padding: 2rem; scroll-behavior: smooth;">
          
          <div id="chatWelcomeHero" style="margin:auto; text-align:center; animation: nx30FadeInUp 0.8s ease; padding: 4rem 0;">
            <div style="width:64px; height:64px; border-radius:18px; background:linear-gradient(135deg, var(--nx30-os-primary), var(--nx30-os-secondary)); display:flex; align-items:center; justify-content:center; color:white; font-size:2rem; margin:0 auto 1.5rem auto; box-shadow:0 16px 40px rgba(91,108,255,0.4);"><i data-lucide="brain" style="width:32px;height:32px;"></i></div>
            <h2 style="font-family:var(--nx30-font-heading); font-size:2rem; color:var(--nx30-os-text); margin:0 0 0.5rem 0;">How can I help you today?</h2>
            <p style="color:var(--nx30-os-text-muted); font-size:1.1rem; margin:0;">Start a conversation, upload files, or write code.</p>
            
            <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
              <div class="nx30-sugg-chip">Write a Python script</div>
              <div class="nx30-sugg-chip">Explain APIs</div>
              <div class="nx30-sugg-chip">Generate an image</div>
            </div>
          </div>

        </div>

        <div class="nx30-chat-composer-wrap" style="padding: 0 2rem 2rem 2rem;">
          <div class="nx30-os-composer" style="box-shadow: 0 12px 40px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05); background: white; border-radius: 24px; padding: 1rem;">
            <textarea id="chatInputTextarea" class="nx30-os-textarea" placeholder="Message NoteX AI... (Shift + Enter for newline)" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px';" onkeydown="ChatbotModule.handleKeyDown(event)" style="font-size: 1.1rem; padding: 0.5rem;"></textarea>
            
            <div class="nx30-os-tools" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
              <div class="nx30-os-tools-left" style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="nx30-os-icon-btn" title="Upload Attachment"><i data-lucide="paperclip"></i></button>
                <button class="nx30-os-icon-btn" title="Upload Image"><i data-lucide="image"></i></button>
                <button class="nx30-os-icon-btn" title="Voice Input"><i data-lucide="mic"></i></button>
                
                <div style="width:1px; height:20px; background:rgba(0,0,0,0.1); margin:0 0.5rem;"></div>
                
                <div class="nx30-os-chip nx30-os-chip-primary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;"><i data-lucide="code" style="width:12px;height:12px;"></i> Code Mode</div>
              </div>
              
              <button id="sendChatBtn" class="hyper-btn hyper-btn-primary" onclick="ChatbotModule.sendChatMessage()" style="border-radius: 50%; width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="arrow-up"></i>
              </button>
            </div>
          </div>
          <div style="text-align: center; margin-top: 0.75rem; font-size: 0.75rem; color: #94A3B8;">
            AI can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Check for pending prompt from Dashboard
    const pending = localStorage.getItem('pendingPrompt');
    if (pending) {
      document.getElementById('chatInputTextarea').value = pending;
      localStorage.removeItem('pendingPrompt');
      setTimeout(() => this.sendChatMessage(), 100);
    } else {
      setTimeout(() => {
        const ta = document.getElementById('chatInputTextarea');
        if(ta) ta.focus();
      }, 100);
    }
  },

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendChatMessage();
    }
  },

  formatMarkdown(text) { return typeof marked !== 'undefined' ? marked.parse(text) : text; },

  updateControlsState(generating) {
    const btn = document.getElementById('sendChatBtn');
    if(!btn) return;
    if(generating) {
      btn.innerHTML = `<i data-lucide="square" style="width:16px; height:16px;"></i>`;
      btn.onclick = () => this.stopGeneration();
      btn.style.background = '#FF5A76';
      btn.style.boxShadow = '0 8px 24px rgba(255,90,118,0.4)';
    } else {
      btn.innerHTML = `<i data-lucide="arrow-up" style="width:18px; height:18px;"></i>`;
      btn.onclick = () => this.sendChatMessage();
      btn.style.background = '';
      btn.style.boxShadow = '';
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
  },

  stopGeneration() {
    if(this.abortController) this.abortController.abort();
    this.isGenerating = false;
    this.updateControlsState(false);
  },

  async sendChatMessage() {
    if (this.isGenerating) return;
    const textarea = document.getElementById('chatInputTextarea');
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    
    textarea.value = ''; textarea.style.height = 'auto';
    
    const box = document.getElementById('chatMessagesBox');
    const hero = document.getElementById('chatWelcomeHero');
    if (hero) hero.style.display = 'none';

    // User Message (Modern Bubble)
    const userMsg = document.createElement('div');
    userMsg.className = 'nx30-msg user';
    userMsg.style.display = 'flex';
    userMsg.style.justifyContent = 'flex-end';
    userMsg.style.marginBottom = '1.5rem';
    userMsg.innerHTML = `<div class="nx30-msg-bubble" style="background: #F1F5F9; color: #0F172A; padding: 1rem 1.5rem; border-radius: 20px 20px 0 20px; max-width: 80%; font-size: 1.05rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">${this.formatMarkdown(text)}</div>`;
    box.appendChild(userMsg);

    // AI Message Skeleton
    const aiMsg = document.createElement('div');
    aiMsg.className = 'nx30-msg ai';
    aiMsg.style.display = 'flex';
    aiMsg.style.gap = '1rem';
    aiMsg.style.marginBottom = '1.5rem';
    const aiBubbleId = 'ai-bubble-' + Date.now();
    aiMsg.innerHTML = `
      <div class="nx30-msg-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #5B6CFF, #7C5CFF); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; box-shadow: 0 4px 12px rgba(91,108,255,0.3);">𝝌</div>
      <div style="flex:1; max-width: 85%;">
        <div class="nx30-msg-bubble" id="${aiBubbleId}" style="background: transparent; color: #0F172A; font-size: 1.05rem; line-height: 1.6;">
          <div class="hyper-typing-cursor"></div>
        </div>
        <div class="nx30-msg-actions" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <button class="hyper-btn hyper-btn-glass hyper-btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;"><i data-lucide="copy" style="width:12px;"></i> Copy</button>
          <button class="hyper-btn hyper-btn-glass hyper-btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;"><i data-lucide="refresh-cw" style="width:12px;"></i> Regenerate</button>
          <button class="hyper-btn hyper-btn-glass hyper-btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;"><i data-lucide="volume-2" style="width:12px;"></i> Read Aloud</button>
        </div>
      </div>
    `;
    box.appendChild(aiMsg);
    box.scrollTop = box.scrollHeight;
    if(typeof lucide !== 'undefined') lucide.createIcons();

    this.isGenerating = true;
    this.updateControlsState(true);
    this.abortController = new AbortController();
    
    let fullText = "";
    
    try {
      const token = localStorage.getItem('notex_token');
      const response = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ prompt: text, conversation_id: this.currentConversationId, session_id: this.currentConversationId }),
        signal: this.abortController.signal
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      const bubbleEl = document.getElementById(aiBubbleId);
      bubbleEl.innerHTML = '';
      
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
            const chunk = parsed.token || parsed.text || parsed.response || parsed.full_text || parsed.chunk || "";
            if (chunk) {
              fullText += chunk;
              bubbleEl.innerHTML = this.formatMarkdown(fullText) + `<span class="hyper-typing-cursor"></span>`;
              if (typeof hljs !== 'undefined') hljs.highlightAll();
              box.scrollTop = box.scrollHeight;
            }
            if (parsed.session_id) this.currentConversationId = parsed.session_id;
          } catch(e) {}
        }
      }
      
      bubbleEl.innerHTML = this.formatMarkdown(fullText);
      if (typeof hljs !== 'undefined') hljs.highlightAll();

    } catch (err) {
      if(err.name === 'AbortError') {
        const el = document.getElementById(aiBubbleId);
        if(el) el.innerHTML = this.formatMarkdown(fullText) + `\n\n*[Stopped by user]*`;
      } else {
        const el = document.getElementById(aiBubbleId);
        if(el) el.innerHTML = `<span style="color:#FF5A76;">Error connecting to AI. Please try again.</span>`;
      }
    } finally {
      this.isGenerating = false;
      this.updateControlsState(false);
    }
  }
};

window.ChatbotModule = ChatbotModule;
