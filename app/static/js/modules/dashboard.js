/* noteX AI — Premium Dashboard Module (Light Theme)
   Modern AI SaaS workspace — ChatGPT × Notion AI × Linear quality
*/

const DashboardModule = {

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    // Show skeleton first for premium feel
    container.innerHTML = this.getSkeletonHTML();
    await new Promise(r => setTimeout(r, 650));

    // Greeting logic
    const hr = new Date().getHours();
    const greet = hr < 5 ? 'Good Night 🌙' : hr < 12 ? 'Good Morning ☀️' : hr < 17 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';
    
    const userStr = localStorage.getItem('notex_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Student' };
    const firstName = (user.name || 'Student').split(' ')[0];
    const grade = (typeof APP_STATE !== 'undefined' && APP_STATE.currentGrade) || 'Class 10';

    container.innerHTML = `
      <div class="premium-bento-grid">

        <!-- ════════════════════════════════
             1. HERO — AI Search Section
        ════════════════════════════════ -->
        <div class="dash-card span-12 bento-hero">
          <div class="hero-content">
            <h1 class="hero-title">
              ${greet},<br>
              <span class="hero-gradient">${firstName}!</span>
            </h1>
            <p class="hero-subtitle">
              Ready to master your <strong>${grade}</strong> curriculum?
              Your AI study partner is here to help.
            </p>

            <div class="hero-search-box">
              <i data-lucide="sparkles" style="color:var(--hyper-accent-primary);width:20px;height:20px;flex-shrink:0;"></i>
              <input
                type="text"
                id="dashHeroInput"
                class="hero-search-input"
                placeholder="Ask AI anything… or type a topic to explore"
                aria-label="AI prompt input"
                onkeypress="if(event.key==='Enter') DashboardModule.handleHeroSubmit()">
              <button class="hero-search-btn" onclick="DashboardModule.handleHeroSubmit()" title="Submit">
                <i data-lucide="send" style="width:16px;height:16px;"></i>
              </button>
            </div>

            <div class="hero-chips">
              <div class="hero-chip" onclick="DashboardModule.setPrompt('Summarize this topic: ')">
                <i data-lucide="file-text" style="width:12px;height:12px;"></i> Summarize PDF
              </div>
              <div class="hero-chip" onclick="DashboardModule.setPrompt('Generate Flashcards for ')">
                <i data-lucide="layers" style="width:12px;height:12px;"></i> Flashcards
              </div>
              <div class="hero-chip" onclick="DashboardModule.setPrompt('Explain this concept: ')">
                <i data-lucide="brain-circuit" style="width:12px;height:12px;"></i> Explain Concept
              </div>
              <div class="hero-chip" onclick="DashboardModule.setPrompt('Create a quiz on ')">
                <i data-lucide="help-circle" style="width:12px;height:12px;"></i> Create Quiz
              </div>
            </div>
          </div>

          <!-- Floating decorative icons -->
          <div class="hero-graphics">
            <div class="floating-icon icon-1"><i data-lucide="book-open"></i></div>
            <div class="floating-icon icon-2"><i data-lucide="brain-circuit"></i></div>
            <div class="floating-icon icon-3"><i data-lucide="sparkles"></i></div>
            <div class="floating-icon icon-4"><i data-lucide="atom"></i></div>
          </div>
        </div>

        <!-- ════════════════════════════════
             2. STATISTICS ROW
        ════════════════════════════════ -->
        <div class="span-12">
          <div class="dash-stats-row">
            <div class="dash-mini-stat">
              <div class="dash-icon-box" style="background:var(--hyper-accent-primary-light);color:var(--hyper-accent-primary);width:42px;height:42px;">
                <i data-lucide="clock" style="width:20px;height:20px;"></i>
              </div>
              <div>
                <div class="dash-stat-val" id="dashStudyHours">0h</div>
                <div class="dash-stat-label">Study Hours</div>
              </div>
            </div>
            <div class="dash-mini-stat">
              <div class="dash-icon-box" style="background:var(--hyper-accent-lavender-light);color:var(--hyper-accent-lavender);width:42px;height:42px;">
                <i data-lucide="file-up" style="width:20px;height:20px;"></i>
              </div>
              <div>
                <div class="dash-stat-val" id="dashFilesUp">0</div>
                <div class="dash-stat-label">Files Uploaded</div>
              </div>
            </div>
            <div class="dash-mini-stat">
              <div class="dash-icon-box" style="background:var(--hyper-accent-cyan-light);color:var(--hyper-accent-cyan);width:42px;height:42px;">
                <i data-lucide="message-circle" style="width:20px;height:20px;"></i>
              </div>
              <div>
                <div class="dash-stat-val" id="dashQAsked">0</div>
                <div class="dash-stat-label">Questions Asked</div>
              </div>
            </div>
            <div class="dash-mini-stat">
              <div class="dash-icon-box" style="background:var(--hyper-accent-emerald-light);color:var(--hyper-accent-emerald);width:42px;height:42px;">
                <i data-lucide="sticky-note" style="width:20px;height:20px;"></i>
              </div>
              <div>
                <div class="dash-stat-val" id="dashNotesGen">0</div>
                <div class="dash-stat-label">Notes Generated</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════
             3. QUICK ACTIONS (3×3 grid)
        ════════════════════════════════ -->
        <div class="dash-card span-8">
          <div class="dash-header">
            <div class="dash-title">
              <div class="dash-icon-box" style="background:var(--hyper-accent-primary-light);color:var(--hyper-accent-primary);">
                <i data-lucide="layout-grid"></i>
              </div>
              Quick Actions
            </div>
            <div class="dash-badge" style="background:var(--hyper-accent-primary-light);color:var(--hyper-accent-primary);border-color:rgba(14,165,233,0.3);">9 Tools</div>
          </div>
          <div class="dash-qa-grid">
            ${[
              { icon:'sparkles',    label:'Ask AI',        sub:'Chat with tutor',   c:'primary',  href:'#chat' },
              { icon:'upload',      label:'Upload PDF',    sub:'Talk to your book', c:'lavender', href:'#rag' },
              { icon:'sticky-note', label:'Create Notes',  sub:'AI smart notes',    c:'emerald',  href:'#notes' },
              { icon:'layers',      label:'Flashcards',    sub:'Active recall',     c:'amber',    href:'#flashcards' },
              { icon:'help-circle', label:'Quiz Generator',sub:'Test yourself',     c:'rose',     href:'#quizzes' },
              { icon:'mic',         label:'Voice Chat',    sub:'Speak to AI',       c:'cyan',     href:'#chat' },
              { icon:'file-search', label:'Summarize',     sub:'Key concepts',      c:'primary',  href:'#chat' },
              { icon:'languages',   label:'Translate',     sub:'Simplify content',  c:'rose',     href:'#chat' },
              { icon:'calendar-check',label:'Study Plan',  sub:'Weekly schedule',   c:'lavender', href:'#study-plan' },
            ].map(a => `
              <div class="dash-qa-card" onclick="location.hash='${a.href}'" style="--qa-border:var(--hyper-accent-${a.c})">
                <div class="dash-qa-icon" style="background:var(--hyper-accent-${a.c}-light);color:var(--hyper-accent-${a.c});">
                  <i data-lucide="${a.icon}" style="width:18px;height:18px;"></i>
                </div>
                <div>
                  <div class="dash-qa-text">${a.label}</div>
                  <div class="dash-qa-sub">${a.sub}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ════════════════════════════════
             4. DAILY GOAL CARD
        ════════════════════════════════ -->
        <div class="dash-card span-4">
          <div class="dash-header">
            <div class="dash-title">
              <div class="dash-icon-box" style="background:var(--hyper-accent-amber-light);color:var(--hyper-accent-amber);">
                <i data-lucide="target"></i>
              </div>
              Today's Goal
            </div>
          </div>

          <div style="display:flex;flex-direction:column;align-items:center;padding:0.5rem 0;">
            <div class="dash-goal-ring">
              <svg width="105" height="105" viewBox="0 0 105 105" style="transform:rotate(-90deg);">
                <circle cx="52.5" cy="52.5" r="44" fill="none" stroke="var(--hyper-border-subtle)" stroke-width="8"/>
                <circle cx="52.5" cy="52.5" r="44" fill="none"
                        stroke="url(#goalGrad)" stroke-width="8"
                        stroke-dasharray="276.46" stroke-dashoffset="46.99"
                        stroke-linecap="round"/>
                <defs>
                  <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="var(--hyper-accent-primary)"/>
                    <stop offset="100%" stop-color="var(--hyper-accent-cyan)"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <span style="font-size:1.4rem;font-weight:800;color:var(--hyper-accent-primary);font-family:var(--hyper-font-heading);">83%</span>
              </div>
            </div>
            <div style="text-align:center;margin-top:0.75rem;">
              <div style="font-size:1.25rem;font-weight:800;color:var(--hyper-text-primary);font-family:var(--hyper-font-heading);">
                2.5<span style="font-size:0.9rem;color:var(--hyper-text-muted);font-weight:500;"> / 3h</span>
              </div>
              <div style="font-size:0.7rem;color:var(--hyper-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">Study Time Today</div>
            </div>
          </div>

          <div class="dash-mini-counters">
            <div class="dash-counter-box">
              <div style="font-size:1.2rem;font-weight:800;color:var(--hyper-accent-rose);" id="dashStreakCounter">0</div>
              <div style="font-size:0.65rem;color:var(--hyper-text-muted);text-transform:uppercase;letter-spacing:0.05em;">🔥 Streak</div>
            </div>
            <div class="dash-counter-box">
              <div style="font-size:1.2rem;font-weight:800;color:var(--hyper-accent-primary);" id="dashXpCounter">0</div>
              <div style="font-size:0.65rem;color:var(--hyper-text-muted);text-transform:uppercase;letter-spacing:0.05em;">⚡ XP</div>
            </div>
            <div class="dash-counter-box">
              <div style="font-size:1.2rem;font-weight:800;color:var(--hyper-accent-emerald);">A+</div>
              <div style="font-size:0.65rem;color:var(--hyper-text-muted);text-transform:uppercase;letter-spacing:0.05em;">Grade</div>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════
             5. CONTINUE LEARNING
        ════════════════════════════════ -->
        <div class="dash-card span-6">
          <div class="dash-header">
            <div class="dash-title">
              <div class="dash-icon-box" style="background:var(--hyper-accent-cyan-light);color:var(--hyper-accent-cyan);">
                <i data-lucide="play-circle"></i>
              </div>
              Continue Learning
            </div>
            <a href="#flashcards" class="dash-badge" style="background:var(--hyper-bg-elevated);color:var(--hyper-text-secondary);text-decoration:none;">View All</a>
          </div>

          <div class="dash-continue-list">
            ${[
              { subject:'Physics: Thermodynamics',  type:'Flashcard Deck',          pct:65, color:'var(--hyper-accent-primary)',  action:'Resume', hash:'#flashcards' },
              { subject:'Chemistry: Org. Compounds', type:'Practice Quiz • 80% last', pct:80, color:'var(--hyper-accent-emerald)',  action:'Review', hash:'#quizzes' },
              { subject:'Maths: Trigonometry',       type:'Smart Notes',              pct:45, color:'var(--hyper-accent-lavender)', action:'Open',   hash:'#notes' },
            ].map(item => `
              <div class="dash-continue-card" style="border-left-color:${item.color};" onclick="location.hash='${item.hash}'">
                <div style="flex:1;min-width:0;padding-right:1rem;">
                  <div style="font-weight:700;font-size:0.95rem;color:var(--hyper-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.subject}</div>
                  <div style="font-size:0.75rem;color:var(--hyper-text-muted);margin-top:0.15rem;">${item.type}</div>
                  <div class="dash-progress-bar">
                    <div class="dash-progress-fill" style="width:${item.pct}%;background:${item.color};"></div>
                  </div>
                </div>
                <button class="dash-badge" style="background:var(--hyper-bg-elevated);color:var(--hyper-text-primary);cursor:pointer;padding:0.4rem 0.8rem;">${item.action}</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ════════════════════════════════
             6. RECENT ACTIVITY TIMELINE
        ════════════════════════════════ -->
        <div class="dash-card span-6">
          <div class="dash-header">
            <div class="dash-title">
              <div class="dash-icon-box" style="background:var(--hyper-bg-elevated);color:var(--hyper-text-secondary);">
                <i data-lucide="clock"></i>
              </div>
              Recent Activity
            </div>
          </div>
          <div class="dash-activity-list">
            ${[
              { icon:'file-text',   c:'cyan',     title:'Generated Biology Notes',    sub:'Chapter 4: Cell Structure',  time:'2h ago' },
              { icon:'check-circle',c:'emerald',  title:'Completed Quiz — 90%',       sub:'Chemistry: Acids & Bases',   time:'Yesterday' },
              { icon:'layers',      c:'lavender', title:'Flashcards Review',          sub:'History: World War II',      time:'Yesterday' },
              { icon:'upload',      c:'primary',  title:'Uploaded PDF',               sub:'Physics Textbook — Ch.7',    time:'2d ago' },
            ].map(a => `
              <div class="dash-activity-item">
                <div class="dash-icon-box" style="background:var(--hyper-accent-${a.c}-light);color:var(--hyper-accent-${a.c});">
                  <i data-lucide="${a.icon}"></i>
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:0.9rem;font-weight:700;color:var(--hyper-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title}</div>
                  <div style="font-size:0.75rem;color:var(--hyper-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.sub}</div>
                </div>
                <span class="dash-activity-time">${a.time}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Initialize icons & animations
    if (typeof lucide !== 'undefined') lucide.createIcons();

    this.animateCounter('dashStudyHours',    0, 47,  1800, 'h');
    this.animateCounter('dashFilesUp',       0, 23,  1500);
    this.animateCounter('dashQAsked',        0, 186, 1700);
    this.animateCounter('dashNotesGen',      0, 34,  1600);
    this.animateCounter('dashStreakCounter', 0, 12,  1600);
    this.animateCounter('dashXpCounter',     0, 850, 2000);
  },

  getSkeletonHTML() {
    return `
      <div class="premium-bento-grid">
        <div class="dash-card span-12" style="height:250px;">
          <div class="dash-skeleton" style="width:50%;height:48px;margin-bottom:1rem;"></div>
          <div class="dash-skeleton" style="width:40%;height:20px;margin-bottom:2rem;"></div>
          <div class="dash-skeleton" style="width:60%;height:50px;border-radius:99px;"></div>
        </div>
        <div class="span-12 dash-stats-row">
          ${[1,2,3,4].map(() => `<div class="dash-card dash-skeleton" style="height:100px;"></div>`).join('')}
        </div>
        <div class="dash-card span-8" style="height:350px;"><div class="dash-skeleton" style="width:100%;height:100%;"></div></div>
        <div class="dash-card span-4" style="height:350px;"><div class="dash-skeleton" style="width:100%;height:100%;"></div></div>
      </div>
    `;
  },

  animateCounter(id, start, end, duration, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    let ts = null;
    const step = (now) => {
      if (!ts) ts = now;
      const p = Math.min((now - ts) / duration, 1);
      const ease = 1 - Math.pow(2, -10 * p);
      el.textContent = Math.floor(ease * (end - start) + start) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  setPrompt(text) {
    const inp = document.getElementById('dashHeroInput');
    if (inp) { inp.value = text; inp.focus(); }
  },

  handleHeroSubmit() {
    const inp = document.getElementById('dashHeroInput');
    if (!inp || !inp.value.trim()) return;
    const q = inp.value.trim();
    if (typeof APP_STATE !== 'undefined') APP_STATE.pendingChatQuery = q;
    else sessionStorage.setItem('pending_chat_query', q);
    window.location.hash = '#chat';
  }
};

window.DashboardModule = DashboardModule;
