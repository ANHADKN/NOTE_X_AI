/* noteX AI - Minimal AI Overview Dashboard Module Controller (V4) */
const DashboardModule = {
  async render(container) {
    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-cyan);"></i> AI Learning Overview</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Curriculum Target: <strong style="color: var(--accent-cyan);">${APP_STATE.currentGrade}</strong>. Track your progress, recent chats, and daily AI recommendations.</p>
            </div>
            <button class="btn-glass" onclick="location.hash = '#chat'">
              <i class="fa-solid fa-robot"></i> Open AI Tutor Chat
            </button>
          </div>
        </div>

        <!-- Metrics KPI Grid -->
        <div class="metrics-grid" style="margin-bottom: 1.5rem;">
          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15);"><i class="fa-solid fa-bullseye"></i></div>
            <div>
              <div class="metric-val" id="dashGoalVal">3.5 Hours</div>
              <div class="metric-label">Today's Goal</div>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-emerald); background: rgba(16, 185, 129, 0.15);"><i class="fa-solid fa-fire"></i></div>
            <div>
              <div class="metric-val" id="dashStreakVal">7 Days</div>
              <div class="metric-label">Study Streak</div>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-indigo); background: rgba(99, 102, 241, 0.15);"><i class="fa-solid fa-chart-line"></i></div>
            <div>
              <div class="metric-val" id="dashProgressVal">84.5%</div>
              <div class="metric-label">Learning Progress</div>
            </div>
          </div>
        </div>

        <!-- Main Content 2-Column Grid -->
        <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
          <!-- Left Column -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Continue Learning -->
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-circle-play" style="color: var(--accent-cyan); margin-right: 0.5rem;"></i> Continue Learning</span>
              </div>
              
              <div class="glass-card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent-cyan);">
                <div>
                  <h4 style="font-weight: 700; font-size: 1.05rem;">Science: Chemical Reactions and Equations</h4>
                  <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Active Recall Flashcards • 5 Cards Remaining</div>
                </div>
                <button class="btn-glass" onclick="location.hash = '#flashcards'">
                  Resume Session
                </button>
              </div>
            </div>

            <!-- Recent Chats -->
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-comments" style="color: var(--accent-indigo); margin-right: 0.5rem;"></i> Recent AI Chats</span>
                <button class="btn-glass-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;" onclick="location.hash = '#chat'">View All</button>
              </div>
              <div id="dashRecentChatsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Loading recent conversations...</div>
              </div>
            </div>

            <!-- Recent PDFs -->
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-file-pdf" style="color: var(--accent-rose); margin-right: 0.5rem;"></i> Recent PDFs</span>
                <button class="btn-glass-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;" onclick="location.hash = '#library'">View Library</button>
              </div>
              <div id="dashRecentPdfsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Loading documents...</div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Today's AI Suggestions -->
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-lightbulb" style="color: var(--accent-amber); margin-right: 0.5rem;"></i> Today's AI Suggestions</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; background: var(--surface); padding: 0.85rem; border-radius: 8px; border-left: 3px solid var(--accent-amber);">
                  💡 Practice 5 MCQs on <strong>Electricity</strong> to boost your predicted exam score to A+.
                </div>
                <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; background: var(--surface); padding: 0.85rem; border-radius: 8px; border-left: 3px solid var(--accent-cyan);">
                  ⚡ Complete a 15-minute revision on <strong>Chemical Reactions</strong> today.
                </div>
              </div>
            </div>

            <!-- Weak Topics Priority -->
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-rose); margin-right: 0.5rem;"></i> Weak Topics Priority</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div class="glass-card" style="padding: 0.85rem; border-left: 3px solid var(--accent-rose);">
                  <div style="font-weight: 700; font-size: 0.9rem;">Physics: Electromagnetism</div>
                  <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">Accuracy: 45% • High Priority</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadDashboardData();
  },

  async loadDashboardData() {
    try {
      // Load recent PDFs
      const docRes = await API.get('/rag/documents');
      const docContainer = document.getElementById('dashRecentPdfsList');
      if (docContainer) {
        if (docRes && docRes.success && docRes.data && docRes.data.documents && docRes.data.documents.length > 0) {
          docContainer.innerHTML = docRes.data.documents.slice(0, 3).map(doc => `
            <div class="glass-card" style="padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fa-solid fa-file-pdf" style="font-size: 1.4rem; color: var(--accent-rose);"></i>
                <div>
                  <div style="font-weight: 600; font-size: 0.88rem;">${doc.filename}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${doc.num_pages} Pages • Indexed</div>
                </div>
              </div>
              <button class="btn-glass-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;" onclick="location.hash = '#rag'">Search</button>
            </div>
          `).join('');
        } else {
          docContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1rem; font-size: 0.85rem;">No recent PDFs uploaded.</div>`;
        }
      }

      // Load recent chats
      const chatRes = await API.get('/chat/conversations');
      const chatContainer = document.getElementById('dashRecentChatsList');
      if (chatContainer) {
        if (chatRes && chatRes.success && chatRes.data && chatRes.data.conversations && chatRes.data.conversations.length > 0) {
          chatContainer.innerHTML = chatRes.data.conversations.slice(0, 3).map(conv => `
            <div class="glass-card" style="padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fa-solid fa-message" style="font-size: 1.2rem; color: var(--accent-indigo);"></i>
                <div>
                  <div style="font-weight: 600; font-size: 0.88rem;">${conv.title || 'Study Session'}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">Active Session</div>
                </div>
              </div>
              <button class="btn-glass-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;" onclick="location.hash = '#chat'">Resume</button>
            </div>
          `).join('');
        } else {
          chatContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1rem; font-size: 0.85rem;">No recent chat history.</div>`;
        }
      }
    } catch (e) {
      console.log('Dashboard load error:', e);
    }
  }
};
