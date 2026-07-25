/* noteX AI - Feature-Rich AI Study Platform Dashboard (Hyper Pro) */
const DashboardModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    const timeOfDay = new Date().getHours() < 12 ? 'Good Morning' : (new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening');
    const studentGrade = typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10';

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- 1. Large Hero Section -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(16, 185, 129, 0.08)); border-color: rgba(14, 165, 233, 0.25); padding: 2.25rem 2.5rem;">
          <div style="max-width: 820px; margin: 0 auto; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(14, 165, 233, 0.25); border-radius: var(--hyper-radius-full); padding: 0.3rem 0.85rem; font-size: 0.8rem; font-weight: 700; color: var(--hyper-accent-primary); margin-bottom: 1rem;">
              <i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> Intelligent Study Assistant • ${studentGrade}
            </div>
            
            <h1 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.04em; color: var(--hyper-text-primary); margin-bottom: 0.4rem;">
              ${timeOfDay}, Student! 👋
            </h1>
            <h2 style="font-size: 1.35rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 1.75rem;">
              What would you like to learn today?
            </h2>

            <!-- 2. Large Centerpiece AI Prompt Box -->
            <div class="hyper-query-card" style="text-align: left; background: #FFFFFF; backdrop-filter: blur(16px); border: 1px solid #CBD5E1; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08); border-radius: var(--hyper-radius-lg); padding: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.85rem;">
                <i data-lucide="bot" style="width: 22px; height: 22px; color: var(--hyper-accent-primary);"></i>
                <input type="text" id="dashHeroInput" class="hyper-input" placeholder="Ask AI anything, generate notes, quizzes, or upload a textbook..." style="border: none; background: transparent; font-size: 1.05rem; padding: 0.4rem 0;" onkeypress="if(event.key==='Enter') DashboardModule.handleHeroSubmit()">
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                  <button class="hyper-chip" style="font-size: 0.78rem;" onclick="location.hash='#notes'">📝 Smart Notes</button>
                  <button class="hyper-chip" style="font-size: 0.78rem;" onclick="location.hash='#quizzes'">🎯 Practice Quiz</button>
                  <button class="hyper-chip" style="font-size: 0.78rem;" onclick="location.hash='#flashcards'">🧠 Flashcards</button>
                  <button class="hyper-chip" style="font-size: 0.78rem;" onclick="location.hash='#rag'">📄 Upload PDF</button>
                </div>
                <button class="hyper-btn hyper-btn-primary" onclick="DashboardModule.handleHeroSubmit()">
                  Ask AI <span class="hyper-kbd">↵</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Learning Progress Ring Card -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="pie-chart" style="color: var(--hyper-accent-cyan); width: 18px;"></i> Learning Progress Index
            </div>
            <span class="hyper-badge hyper-badge-cyan">84.5% Overall</span>
          </div>

          <div class="hyper-progress-ring-container" style="justify-content: center; padding: 0.5rem 0;">
            <svg class="hyper-progress-ring" width="110" height="110">
              <circle class="hyper-progress-ring-bg" stroke-width="9" r="45" cx="55" cy="55" fill="transparent" />
              <circle class="hyper-progress-ring-fill" stroke-width="9" r="45" cx="55" cy="55" fill="transparent" />
            </svg>
            <div>
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--hyper-accent-cyan);">84.5%</div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted);">Curriculum Mastery</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary); margin-top: 0.25rem;">24 / 28 Chapters Mastered</div>
            </div>
          </div>
        </div>

        <!-- 4. Today's Study Goal Card -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="target" style="color: var(--hyper-accent-amber); width: 18px;"></i> Today's Study Goal
            </div>
            <span class="hyper-badge hyper-badge-amber">🔥 7 Day Streak</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-text-primary);">2.5 / 3.5 Hours</span>
              <span style="font-size: 0.85rem; color: var(--hyper-accent-amber); font-weight: 700;">71% Completed</span>
            </div>
            
            <div style="width: 100%; height: 8px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
              <div style="width: 71%; height: 100%; background: linear-gradient(90deg, var(--hyper-accent-amber), var(--hyper-accent-cyan)); border-radius: var(--hyper-radius-full);"></div>
            </div>

            <div style="font-size: 0.8rem; color: var(--hyper-text-muted); line-height: 1.4;">
              ⚡ 1 hour remaining to maintain your 7-day study streak bonus (+50 XP).
            </div>
          </div>
        </div>

        <!-- 5. AI Assistant Quick Card -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="bot" style="color: var(--hyper-accent-primary); width: 18px;"></i> AI Assistant Status
            </div>
            <span class="hyper-badge hyper-badge-emerald">Online</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.9rem; color: var(--hyper-text-primary); font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--hyper-accent-emerald);"></span>
              noteX AI Neural Tutor Ready
            </div>
            <p style="font-size: 0.82rem; color: var(--hyper-text-muted); line-height: 1.4;">
              Ask questions on Science, Maths, Physics, Chemistry or uploaded textbooks for step-by-step solutions.
            </p>
            <button class="hyper-btn hyper-btn-primary hyper-btn-sm" style="width: 100%;" onclick="location.hash='#chat'">
              <i data-lucide="message-square" style="width: 14px;"></i> Start AI Conversation
            </button>
          </div>
        </div>

        <!-- 6. Quick Actions Matrix (6 Items) -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="layout-grid" style="color: var(--hyper-accent-cyan); width: 18px;"></i> Quick Feature Actions
            </div>
          </div>

          <div class="hyper-action-grid">
            <div class="hyper-action-tile" onclick="location.hash='#notes'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-primary-light); color: var(--hyper-accent-primary);">
                <i data-lucide="sticky-note"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Generate Smart Notes</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Key concepts & formulas</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#flashcards'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-cyan-light); color: var(--hyper-accent-cyan);">
                <i data-lucide="layers"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Practice Flashcards</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Active recall review</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#quizzes'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-amber-light); color: var(--hyper-accent-amber);">
                <i data-lucide="help-circle"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">AI Quiz Challenge</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">MCQs, 2-Mark & HOTS</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#rag'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-rose-light); color: var(--hyper-accent-rose);">
                <i data-lucide="file-text"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Upload PDF & RAG</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Textbook grounded Q&A</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#study-plan'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-emerald-light); color: var(--hyper-accent-emerald);">
                <i data-lucide="calendar"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">ML Study Planner</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Daily timetable & prediction</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#analytics'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-primary-light); color: var(--hyper-accent-primary);">
                <i data-lucide="bar-chart-3"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Learning Analytics</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Weak topics & radar charts</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Continue Learning Card -->
        <div class="hyper-card hyper-col-8">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="play-circle" style="color: var(--hyper-accent-cyan); width: 18px;"></i> Continue Learning
            </div>
            <span class="hyper-badge hyper-badge-cyan">Active Topic</span>
          </div>

          <div class="hyper-card hyper-card-interactive" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--hyper-accent-cyan);">
            <div>
              <h4 style="font-weight: 700; font-size: 1.05rem; color: var(--hyper-text-primary);">Physics: Chemical Reactions and Equations</h4>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted); margin-top: 0.2rem;">Active Recall Deck • 5 Cards Remaining • Last studied today</div>
            </div>
            <button class="hyper-btn hyper-btn-cyan hyper-btn-sm" onclick="location.hash='#flashcards'">
              Resume Session
            </button>
          </div>
        </div>

        <!-- 8. AI Suggestions Card -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="lightbulb" style="color: var(--hyper-accent-amber); width: 18px;"></i> AI Smart Suggestions
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.84rem; color: var(--hyper-text-primary); line-height: 1.5; background: var(--hyper-bg-elevated); padding: 0.85rem; border-radius: var(--hyper-radius-sm); border-left: 3px solid var(--hyper-accent-amber);">
              💡 Practice 5 MCQs on <strong>Electricity</strong> to boost your predicted exam score to A+.
            </div>
            <div style="font-size: 0.84rem; color: var(--hyper-text-primary); line-height: 1.5; background: var(--hyper-bg-elevated); padding: 0.85rem; border-radius: var(--hyper-radius-sm); border-left: 3px solid var(--hyper-accent-cyan);">
              ⚡ Complete a 15-minute revision on <strong>Chemical Reactions</strong> today.
            </div>
          </div>
        </div>

        <!-- 9. Learning Analytics Mastery Card -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="bar-chart-3" style="color: var(--hyper-accent-primary); width: 18px;"></i> Learning Analytics Overview
            </div>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash='#analytics'">View All</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.95rem;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 600;">Mathematics</span>
                <span style="color: var(--hyper-accent-cyan); font-weight: 700;">91% Mastery</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 91%; height: 100%; background: var(--hyper-accent-cyan); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 600;">Physics</span>
                <span style="color: var(--hyper-accent-primary); font-weight: 700;">88% Mastery</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 88%; height: 100%; background: var(--hyper-accent-primary); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 600;">Chemistry</span>
                <span style="color: var(--hyper-accent-emerald); font-weight: 700;">82% Mastery</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 82%; height: 100%; background: var(--hyper-accent-emerald); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 10. Recent PDFs Card -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="file-text" style="color: var(--hyper-accent-rose); width: 18px;"></i> Recent PDF Documents
            </div>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash='#library'">Library</button>
          </div>
          <div id="dashRecentPdfsList" style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${this.getFallbackPdfsHTML()}
          </div>
        </div>
      </div>
    `;

    // Immediately trigger Lucide icons so DOM renders icons instantly
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    await this.loadDashboardData();
  },

  handleHeroSubmit() {
    const input = document.getElementById('dashHeroInput');
    const val = input ? input.value.trim() : '';
    if (val) {
      location.hash = '#chat';
      setTimeout(() => {
        if (window.ChatbotModule) {
          ChatbotModule.useSuggestedPrompt(val);
        }
      }, 150);
    }
  },

  getFallbackPdfsHTML() {
    return `
      <div class="hyper-card hyper-card-interactive" style="padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <i data-lucide="file-text" style="width: 20px; color: var(--hyper-accent-rose);"></i>
          <div>
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--hyper-text-primary);">Sample_Notes_Class10.pdf</div>
            <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">14 Pages • Indexed & Ready</div>
          </div>
        </div>
        <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash = '#rag'">Search</button>
      </div>
    `;
  },

  getFallbackChatsHTML() {
    return `
      <div class="hyper-card hyper-card-interactive" style="padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <i data-lucide="message-square" style="width: 18px; color: var(--hyper-accent-primary);"></i>
          <div>
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--hyper-text-primary);">Newton's Laws & Mechanics Review</div>
            <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">Active Session</div>
          </div>
        </div>
        <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash = '#chat'">Resume</button>
      </div>
    `;
  },

  async loadDashboardData() {
    // 1. Fetch Documents (Independent try-catch)
    const docContainer = document.getElementById('dashRecentPdfsList');
    if (docContainer) {
      try {
        const docRes = await API.get('/rag/documents');
        if (docRes && docRes.success && docRes.data && docRes.data.documents && docRes.data.documents.length > 0) {
          docContainer.innerHTML = docRes.data.documents.slice(0, 3).map(doc => `
            <div class="hyper-card hyper-card-interactive" style="padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i data-lucide="file-text" style="width: 20px; color: var(--hyper-accent-rose);"></i>
                <div>
                  <div style="font-weight: 600; font-size: 0.88rem; color: var(--hyper-text-primary);">${doc.filename}</div>
                  <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">${doc.num_pages} Pages • Indexed</div>
                </div>
              </div>
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash = '#rag'">Search</button>
            </div>
          `).join('');
        }
      } catch (e) {
        // Fallback already pre-rendered
      }
    }

    // Refresh Lucide icons for any updated elements
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
};

window.DashboardModule = DashboardModule;
