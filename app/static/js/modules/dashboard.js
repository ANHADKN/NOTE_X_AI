/* noteX AI - Feature-Rich AI Study Platform Dashboard (Bento Grid Redesign) */
const DashboardModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    const timeOfDay = new Date().getHours() < 12 ? 'Good Morning' : (new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening');
    const studentGrade = typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10';

    const quotes = [
      "“Small daily improvements over time lead to stunning results.” — Robin Sharma",
      "“The secret of getting ahead is getting started.” — Mark Twain",
      "“Success is the sum of small efforts, repeated day in and day out.” — Robert Collier",
      "“Believe you can and you're halfway there.” — Theodore Roosevelt"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- 1. Large Welcome Hero Banner -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.09), rgba(139, 92, 246, 0.09), rgba(16, 185, 129, 0.06)); border: 1px solid rgba(14, 165, 233, 0.3); padding: 2.25rem 2.5rem;">
          <div style="max-width: 880px; margin: 0 auto; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: #FFFFFF; border: 1px solid rgba(14, 165, 233, 0.3); border-radius: var(--hyper-radius-full); padding: 0.35rem 0.95rem; font-size: 0.82rem; font-weight: 700; color: var(--hyper-accent-primary); margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);">
              <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> ${studentGrade} Intelligent Learning Workspace
            </div>
            
            <h1 style="font-size: 2.6rem; font-weight: 800; letter-spacing: -0.04em; color: var(--hyper-text-primary); margin-bottom: 0.35rem;">
              ${timeOfDay}, Student! 👋
            </h1>
            <p style="font-size: 0.98rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 1.5rem; font-style: italic;">
              ${randomQuote}
            </p>

            <!-- Centerpiece AI Search Query Input -->
            <div class="hyper-query-card" style="text-align: left; background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 12px 32px -6px rgba(15, 23, 42, 0.08); border-radius: var(--hyper-radius-lg); padding: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.85rem;">
                <i data-lucide="bot" style="width: 24px; height: 24px; color: var(--hyper-accent-primary);"></i>
                <input type="text" id="dashHeroInput" class="hyper-input" placeholder="Ask AI anything, generate notes, practice quizzes, or upload a textbook..." style="border: none; background: transparent; font-size: 1.05rem; padding: 0.4rem 0;" onkeypress="if(event.key==='Enter') DashboardModule.handleHeroSubmit()">
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
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

        <!-- 2. Today's Learning Goal -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="target" style="color: var(--hyper-accent-amber); width: 18px;"></i> Today's Learning Goal
            </div>
            <span class="hyper-badge hyper-badge-amber">Target 3.5h</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-text-primary);">2.5 / 3.5 Hours</span>
              <span style="font-size: 0.85rem; color: var(--hyper-accent-amber); font-weight: 700;">71% Completed</span>
            </div>
            
            <div style="width: 100%; height: 8px; background: #F1F5F9; border-radius: var(--hyper-radius-full); overflow: hidden;">
              <div style="width: 71%; height: 100%; background: linear-gradient(90deg, var(--hyper-accent-amber), var(--hyper-accent-primary)); border-radius: var(--hyper-radius-full);"></div>
            </div>

            <div style="font-size: 0.8rem; color: var(--hyper-text-muted); line-height: 1.4;">
              ⚡ 1 hour remaining to maintain your daily study goal bonus (+50 XP).
            </div>
          </div>
        </div>

        <!-- 3. Overall Study Progress -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="pie-chart" style="color: var(--hyper-accent-primary); width: 18px;"></i> Study Progress Index
            </div>
            <span class="hyper-badge hyper-badge-primary">84.5% Overall</span>
          </div>

          <div class="hyper-progress-ring-container" style="justify-content: center; padding: 0.2rem 0;">
            <svg class="hyper-progress-ring" width="100" height="100">
              <circle class="hyper-progress-ring-bg" stroke-width="8" r="42" cx="50" cy="50" fill="transparent" />
              <circle class="hyper-progress-ring-fill" stroke-width="8" r="42" cx="50" cy="50" fill="transparent" />
            </svg>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-primary);">84.5%</div>
              <div style="font-size: 0.78rem; color: var(--hyper-text-muted);">Curriculum Mastery</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary); margin-top: 0.2rem;">24 / 28 Chapters Mastered</div>
            </div>
          </div>
        </div>

        <!-- 4. Learning Streak & Daily XP -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="flame" style="color: var(--hyper-accent-rose); width: 18px;"></i> Streak & Gamification
            </div>
            <span class="hyper-badge hyper-badge-rose">Active</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm); text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--hyper-accent-rose);">🔥 7 Days</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-muted); font-weight: 600;">Current Streak</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm); text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--hyper-accent-amber);">⚡ 450 XP</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-muted); font-weight: 600;">Daily XP Earned</div>
            </div>
          </div>
        </div>

        <!-- 5. AI Assistant Card -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="bot" style="color: var(--hyper-accent-lavender); width: 18px;"></i> AI Assistant Status
            </div>
            <span class="hyper-badge hyper-badge-emerald">Online</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.88rem; color: var(--hyper-text-primary); font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--hyper-accent-emerald);"></span>
              Groq Llama-3 AI Engine Active
            </div>
            <p style="font-size: 0.8rem; color: var(--hyper-text-muted); line-height: 1.4;">
              Ask doubts, explain concepts step-by-step, or generate notes instantly.
            </p>
            <button class="hyper-btn hyper-btn-primary hyper-btn-sm" style="width: 100%;" onclick="location.hash='#chat'">
              <i data-lucide="message-square" style="width: 14px;"></i> Chat with AI Assistant
            </button>
          </div>
        </div>

        <!-- 6. Continue Learning Card -->
        <div class="hyper-card hyper-col-8">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="play-circle" style="color: var(--hyper-accent-primary); width: 18px;"></i> Continue Learning
            </div>
            <span class="hyper-badge hyper-badge-primary">Active Deck</span>
          </div>

          <div class="hyper-card hyper-card-interactive" style="padding: 1.15rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--hyper-accent-primary); background: #FFFFFF;" onclick="location.hash='#flashcards'">
            <div>
              <h4 style="font-weight: 700; font-size: 1.05rem; color: var(--hyper-text-primary);">Physics: Chemical Reactions and Equations</h4>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted); margin-top: 0.2rem;">Active Recall Deck • 5 Cards Remaining • Last studied today</div>
            </div>
            <button class="hyper-btn hyper-btn-primary hyper-btn-sm">
              Resume Session
            </button>
          </div>
        </div>

        <!-- 7. Quick Feature Actions Matrix -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="layout-grid" style="color: var(--hyper-accent-primary); width: 18px;"></i> Quick Feature Actions
            </div>
          </div>

          <div class="hyper-action-grid">
            <div class="hyper-action-tile" onclick="location.hash='#notes'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-primary-light); color: var(--hyper-accent-primary);">
                <i data-lucide="sticky-note"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Generate AI Notes</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Key concepts & formula sheets</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#flashcards'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-cyan-light); color: var(--hyper-accent-cyan);">
                <i data-lucide="layers"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Practice Flashcards</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Active recall memory review</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#quizzes'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-amber-light); color: var(--hyper-accent-amber);">
                <i data-lucide="help-circle"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">AI Quiz Challenge</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">MCQs, 2-Mark & HOTS questions</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#rag'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-rose-light); color: var(--hyper-accent-rose);">
                <i data-lucide="file-text"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Upload PDF & RAG</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Textbook grounded answers</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#study-plan'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-emerald-light); color: var(--hyper-accent-emerald);">
                <i data-lucide="calendar"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Study Planner</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Daily timetable & schedule</div>
              </div>
            </div>

            <div class="hyper-action-tile" onclick="location.hash='#analytics'">
              <div class="hyper-action-icon" style="background: var(--hyper-accent-lavender-light); color: var(--hyper-accent-lavender);">
                <i data-lucide="bar-chart-3"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">Learning Analytics</div>
                <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.15rem;">Mastery radar & weak topics</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. Subject Cards -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="book-open" style="color: var(--hyper-accent-primary); width: 18px;"></i> Subject Mastery Cards
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">📐 Mathematics</span>
                <span style="color: var(--hyper-accent-primary); font-weight: 700;">91% Mastery</span>
              </div>
              <div style="width: 100%; height: 7px; background: #E2E8F0; border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 91%; height: 100%; background: var(--hyper-accent-primary); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">⚡ Physics</span>
                <span style="color: var(--hyper-accent-cyan); font-weight: 700;">88% Mastery</span>
              </div>
              <div style="width: 100%; height: 7px; background: #E2E8F0; border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 88%; height: 100%; background: var(--hyper-accent-cyan); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">🧪 Chemistry</span>
                <span style="color: var(--hyper-accent-emerald); font-weight: 700;">82% Mastery</span>
              </div>
              <div style="width: 100%; height: 7px; background: #E2E8F0; border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 82%; height: 100%; background: var(--hyper-accent-emerald); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 9. Upcoming Exams & Study Calendar -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="calendar-days" style="color: var(--hyper-accent-rose); width: 18px;"></i> Upcoming Exams & Calendar
            </div>
            <span class="hyper-badge hyper-badge-rose">3 Scheduled</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--hyper-radius-sm); border-left: 3px solid var(--hyper-accent-rose);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--hyper-text-primary);">Mid-Term Physics Assessment</div>
                <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">In 4 Days • Light & Electricity</div>
              </div>
              <span class="hyper-badge hyper-badge-rose">Aug 1</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--hyper-radius-sm); border-left: 3px solid var(--hyper-accent-amber);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--hyper-text-primary);">Mathematics Quiz Challenge</div>
                <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">In 8 Days • Quadratic Equations</div>
              </div>
              <span class="hyper-badge hyper-badge-amber">Aug 5</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--hyper-radius-sm); border-left: 3px solid var(--hyper-accent-emerald);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--hyper-text-primary);">Chemistry Lab Board Test</div>
                <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">In 12 Days • Acids & Bases</div>
              </div>
              <span class="hyper-badge hyper-badge-emerald">Aug 9</span>
            </div>
          </div>
        </div>

        <!-- 10. Achievements & Recent Study Sessions -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="award" style="color: var(--hyper-accent-amber); width: 18px;"></i> Student Achievements
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm); display: flex; align-items: center; gap: 0.75rem;">
              <div style="font-size: 1.8rem;">🏆</div>
              <div>
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--hyper-text-primary);">Quiz Master</div>
                <div style="font-size: 0.72rem; color: var(--hyper-text-muted);">10 Perfect Quiz Scores</div>
              </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm); display: flex; align-items: center; gap: 0.75rem;">
              <div style="font-size: 1.8rem;">📚</div>
              <div>
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--hyper-text-primary);">Bookworm</div>
                <div style="font-size: 0.72rem; color: var(--hyper-text-muted);">25 PDFs Summarized</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 11. Recent Study Sessions & Documents -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="history" style="color: var(--hyper-accent-primary); width: 18px;"></i> Recent Study Sessions
            </div>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash='#library'">Library</button>
          </div>
          <div id="dashRecentPdfsList" style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${this.getFallbackPdfsHTML()}
          </div>
        </div>
      </div>
    `;

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
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--hyper-text-primary);">Class10_Science_Chapter1.pdf</div>
            <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">14 Pages • Indexed & Ready</div>
          </div>
        </div>
        <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash = '#rag'">Search</button>
      </div>
    `;
  },

  async loadDashboardData() {
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
        // Fallback rendered
      }
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
};

window.DashboardModule = DashboardModule;
