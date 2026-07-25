/* noteX AI - Premium Premium Dashboard (Bento Grid Redesign Phase 2) */
const DashboardModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    // 1. Initial Skeleton Loading State
    container.innerHTML = this.getSkeletonHTML();

    // Simulate API fetch / loading delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const timeOfDay = new Date().getHours() < 12 ? 'Good Morning' : (new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening');
    const userStr = localStorage.getItem('notex_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Student' };
    const studentGrade = typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10';

    container.innerHTML = `
      <div class="premium-bento-grid">
        
        <!-- 1. Hero Section (Span 12) -->
        <div class="bento-card span-12 bento-hero">
          <div class="hero-content">
            <h1 class="hero-title">${timeOfDay},<br><span style="color: #4F46E5;">${user.name || 'Student'}! 👋</span></h1>
            <p class="hero-subtitle">Ready to conquer your ${studentGrade} curriculum today? Ask AI anything or pick up where you left off.</p>
            
            <div class="hero-search-box">
              <i data-lucide="bot" style="color: #4F46E5; width: 22px; height: 22px; margin-right: 0.5rem;"></i>
              <input type="text" id="dashHeroInput" class="hero-search-input" placeholder="Generate notes, create a quiz, or ask a question..." onkeypress="if(event.key==='Enter') DashboardModule.handleHeroSubmit()">
              <button class="hero-search-btn" onclick="DashboardModule.handleHeroSubmit()">
                <i data-lucide="arrow-right" style="width: 20px;"></i>
              </button>
            </div>
          </div>

          <!-- Lottie Player for Premium Animation -->
          <div style="width: 35%; max-width: 300px; display: flex; justify-content: center; align-items: center;">
            <lottie-player 
              src="https://lottie.host/80a22a3f-1d42-4f3d-b2b9-dc7a0ea6f140/Q5n3kG3uGk.json" 
              background="transparent" 
              speed="1" 
              style="width: 100%; height: 100%;" 
              loop 
              autoplay>
            </lottie-player>
          </div>
        </div>

        <!-- 2. Continue Learning (Span 8) -->
        <div class="bento-card span-8">
          <div class="bento-header">
            <div class="bento-title">
              <div class="bento-icon-box bg-purple-light"><i data-lucide="play-circle"></i></div>
              Continue Learning
            </div>
          </div>
          
          <div class="continue-card" onclick="location.hash='#flashcards'">
            <div>
              <h4 style="font-weight: 800; font-size: 1.15rem; color: #0F172A; margin-bottom: 0.25rem;">Physics: Thermodynamics</h4>
              <div style="font-size: 0.85rem; color: #64748B;">Active Recall Deck • 12 Cards Remaining</div>
            </div>
            <button class="hyper-btn hyper-btn-primary" style="border-radius: 100px; padding: 0.5rem 1.25rem; background: #4F46E5;">Resume</button>
          </div>
          
          <div class="continue-card" style="margin-top: 1rem; border-left-color: #0EA5E9; cursor: pointer;" onclick="location.hash='#quizzes'">
            <div>
              <h4 style="font-weight: 800; font-size: 1.15rem; color: #0F172A; margin-bottom: 0.25rem;">Chemistry: Organic Compounds</h4>
              <div style="font-size: 0.85rem; color: #64748B;">Practice Quiz • 80% Mastery</div>
            </div>
            <button class="hyper-btn" style="border-radius: 100px; padding: 0.5rem 1.25rem; background: #F1F5F9; color: #0F172A; border: none;">Review</button>
          </div>
        </div>

        <!-- 3. Daily Goal & Streak (Span 4) -->
        <div class="bento-card span-4" style="display: flex; flex-direction: column; justify-content: center;">
          <div class="bento-header">
            <div class="bento-title">
              <div class="bento-icon-box bg-amber-light"><i data-lucide="target"></i></div>
              Daily Goal
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div class="counter-value">2.5<span style="font-size: 1.2rem; color: #94A3B8;">/3h</span></div>
            <div class="counter-label">Study Time Target</div>
            
            <div class="premium-progress-bg">
              <div class="premium-progress-fill" style="width: 83%;"></div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-around; border-top: 1px solid #E2E8F0; padding-top: 1rem;">
            <div style="text-align: center;">
              <div class="counter-value" style="font-size: 1.4rem; font-weight: 800; color: #F43F5E;">🔥 <span id="dashStreakCounter">0</span></div>
              <div style="font-size: 0.75rem; color: #64748B; font-weight: 700; text-transform: uppercase;">Day Streak</div>
            </div>
            <div style="width: 1px; background: #E2E8F0;"></div>
            <div style="text-align: center;">
              <div class="counter-value" style="font-size: 1.4rem; font-weight: 800; color: #0EA5E9;">⚡ <span id="dashXpCounter">0</span></div>
              <div style="font-size: 0.75rem; color: #64748B; font-weight: 700; text-transform: uppercase;">Total XP</div>
            </div>
          </div>
        </div>

        <!-- 4. AI Recommendations (Span 6) -->
        <div class="bento-card span-6">
          <div class="bento-header">
            <div class="bento-title">
              <div class="bento-icon-box bg-emerald-light"><i data-lucide="sparkles"></i></div>
              AI Recommendations
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <p style="font-size: 0.85rem; color: #64748B; margin-bottom: 0.5rem;">Based on your recent quiz scores, our AI suggests reviewing these topics:</p>
            <div class="continue-card" style="padding: 1rem; border-left-color: #22C55E;" onclick="location.hash='#notes'">
              <div style="display: flex; align-items: center; gap: 0.85rem;">
                <div class="bento-icon-box bg-emerald-light"><i data-lucide="trending-up"></i></div>
                <div>
                  <h4 style="font-weight: 700; font-size: 0.95rem; color: #0F172A;">Mathematics: Trigonometry</h4>
                  <div style="font-size: 0.75rem; color: #64748B;">Generate AI Notes</div>
                </div>
              </div>
            </div>
            <div class="continue-card" style="padding: 1rem; border-left-color: #F43F5E;" onclick="location.hash='#chat'">
              <div style="display: flex; align-items: center; gap: 0.85rem;">
                <div class="bento-icon-box bg-rose-light"><i data-lucide="help-circle"></i></div>
                <div>
                  <h4 style="font-weight: 700; font-size: 0.95rem; color: #0F172A;">Physics: Optics</h4>
                  <div style="font-size: 0.75rem; color: #64748B;">Ask AI Tutor for an explanation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Recent Activity (Span 6) -->
        <div class="bento-card span-6">
          <div class="bento-header">
            <div class="bento-title">
              <div class="bento-icon-box" style="background: rgba(15, 23, 42, 0.05); color: #0F172A;"><i data-lucide="clock"></i></div>
              Recent Activity
            </div>
          </div>
          
          <div class="recent-activity-list">
            <div class="activity-item">
              <div class="activity-icon bg-cyan-light"><i data-lucide="file-text"></i></div>
              <div style="flex-grow: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #0F172A;">Generated Biology Notes</div>
                <div style="font-size: 0.75rem; color: #64748B;">Chapter 4: Cell Structure</div>
              </div>
              <span style="font-size: 0.75rem; color: #94A3B8; font-weight: 600;">2h ago</span>
            </div>
            <div class="activity-item">
              <div class="activity-icon bg-amber-light"><i data-lucide="check-circle"></i></div>
              <div style="flex-grow: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #0F172A;">Completed Quiz</div>
                <div style="font-size: 0.75rem; color: #64748B;">Chemistry: Acids & Bases (90%)</div>
              </div>
              <span style="font-size: 0.75rem; color: #94A3B8; font-weight: 600;">Yesterday</span>
            </div>
            <div class="activity-item">
              <div class="activity-icon bg-purple-light"><i data-lucide="layers"></i></div>
              <div style="flex-grow: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #0F172A;">Flashcards Review</div>
                <div style="font-size: 0.75rem; color: #64748B;">History: World War II</div>
              </div>
              <span style="font-size: 0.75rem; color: #94A3B8; font-weight: 600;">Yesterday</span>
            </div>
          </div>
        </div>

        <!-- 6. Quick Actions (Span 6) -->
        <div class="bento-card span-6">
          <div class="bento-header">
            <div class="bento-title">
              <div class="bento-icon-box bg-sky-light"><i data-lucide="layout-grid"></i></div>
              AI Tools & Quick Actions
            </div>
          </div>
          
          <div class="quick-action-grid">
            <div class="quick-action-tile" onclick="location.hash='#notes'">
              <div class="action-tile-icon bg-purple-light"><i data-lucide="sticky-note"></i></div>
              <div>
                <div class="action-tile-text">Generate Notes</div>
                <div class="action-tile-sub">Smart summaries</div>
              </div>
            </div>
            <div class="quick-action-tile" onclick="location.hash='#quizzes'">
              <div class="action-tile-icon bg-amber-light"><i data-lucide="help-circle"></i></div>
              <div>
                <div class="action-tile-text">Practice Quiz</div>
                <div class="action-tile-sub">Test knowledge</div>
              </div>
            </div>
            <div class="quick-action-tile" onclick="location.hash='#rag'">
              <div class="action-tile-icon bg-rose-light"><i data-lucide="file-text"></i></div>
              <div>
                <div class="action-tile-text">PDF Chat</div>
                <div class="action-tile-sub">Talk to your book</div>
              </div>
            </div>
            <div class="quick-action-tile" onclick="location.hash='#flashcards'">
              <div class="action-tile-icon bg-emerald-light"><i data-lucide="layers"></i></div>
              <div>
                <div class="action-tile-text">Flashcards</div>
                <div class="action-tile-sub">Active recall</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Performance Analytics (Span 6) -->
        <div class="bento-card span-6">
          <div class="bento-header">
            <div class="bento-title">
              <div class="bento-icon-box bg-cyan-light"><i data-lucide="bar-chart-3"></i></div>
              Mastery Progress
            </div>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; padding: 1rem 0;">
            <div style="position: relative; width: 120px; height: 120px;">
              <svg width="120" height="120" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#F1F5F9" stroke-width="12" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="#0EA5E9" stroke-width="12" stroke-dasharray="339.29" stroke-dashoffset="50.89" stroke-linecap="round" style="transition: stroke-dashoffset 1s ease-out;" />
              </svg>
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 1.6rem; font-weight: 800; color: #0EA5E9;">85%</span>
              </div>
            </div>
            
            <div style="flex-grow: 1;">
              <div style="margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: #0F172A;">Science</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: #0EA5E9;">92%</span>
                </div>
                <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 6px;">
                  <div style="width: 92%; height: 100%; background: #0EA5E9; border-radius: 6px;"></div>
                </div>
              </div>
              
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: #0F172A;">Mathematics</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: #4F46E5;">78%</span>
                </div>
                <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 6px;">
                  <div style="width: 78%; height: 100%; background: #4F46E5; border-radius: 6px;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Re-initialize lucide icons for the new HTML
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Trigger Animated Counters
    this.animateValue("dashStreakCounter", 0, 12, 1500);
    this.animateValue("dashXpCounter", 0, 850, 2000);
  },

  getSkeletonHTML() {
    return `
      <div class="premium-bento-grid">
        <div class="bento-card span-12 bento-hero" style="background: #FFFFFF;">
          <div class="hero-content" style="width: 60%;">
            <div class="skeleton-box skeleton-title" style="height: 48px;"></div>
            <div class="skeleton-box skeleton-text" style="height: 20px; width: 90%;"></div>
            <div class="skeleton-box skeleton-text" style="height: 20px; width: 70%; margin-bottom: 2rem;"></div>
            <div class="skeleton-box" style="height: 56px; border-radius: 100px; width: 100%;"></div>
          </div>
          <div style="width: 35%; display: flex; justify-content: center; align-items: center;">
             <div class="skeleton-box" style="width: 200px; height: 200px; border-radius: 50%;"></div>
          </div>
        </div>
        <div class="bento-card span-8">
          <div class="skeleton-box skeleton-title"></div>
          <div class="skeleton-box" style="height: 80px; border-radius: 16px; margin-bottom: 1rem;"></div>
          <div class="skeleton-box" style="height: 80px; border-radius: 16px;"></div>
        </div>
        <div class="bento-card span-4" style="display: flex; flex-direction: column; align-items: center;">
          <div class="skeleton-box skeleton-title" style="align-self: flex-start;"></div>
          <div class="skeleton-box skeleton-circle" style="width: 100px; height: 100px; margin: 1rem 0;"></div>
          <div class="skeleton-box skeleton-text short"></div>
        </div>
      </div>
    `;
  },

  animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },

  handleHeroSubmit() {
    const input = document.getElementById('dashHeroInput');
    if (!input || !input.value.trim()) return;
    
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.pendingChatQuery = input.value.trim();
    } else {
      sessionStorage.setItem('pending_chat_query', input.value.trim());
    }
    
    window.location.hash = '#chat';
  }
};

window.DashboardModule = DashboardModule;
