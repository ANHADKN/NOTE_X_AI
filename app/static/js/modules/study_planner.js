/* noteX AI - ML Study Planner & Calendar Engine (Light Education Theme) */
const StudyPlannerModule = {
  currentView: 'weekly',

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(14, 165, 233, 0.08)); border-color: rgba(16, 185, 129, 0.25); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-emerald" style="margin-bottom: 0.5rem;"><i data-lucide="calendar"></i> ML Planner Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Interactive Study Planner & Timetable</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Adaptive exam revision timetables with drag & drop task scheduling.
              </p>
            </div>
            
            <button class="hyper-btn hyper-btn-emerald" onclick="StudyPlannerModule.generateNewPlan()">
              <i data-lucide="plus-circle"></i> Create Study Plan
            </button>
          </div>
        </div>

        <!-- Telemetry Cards & Progress Rings -->
        <div class="hyper-card hyper-col-12" style="background: #FFFFFF; border-color: #CBD5E1;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="font-size: 0.78rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Predicted Board Score</div>
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--hyper-accent-emerald); margin-top: 0.25rem;">92.4%</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">Confidence: 95.8%</div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="font-size: 0.78rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Study Velocity</div>
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--hyper-accent-primary); margin-top: 0.25rem;">3.8 hrs/day</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">Optimal Velocity</div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="font-size: 0.78rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Goal Completion</div>
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--hyper-accent-amber); margin-top: 0.25rem;">78%</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">14/18 Modules Done</div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: var(--hyper-radius-sm);">
              <div style="font-size: 0.78rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Active Study Streak</div>
              <div style="font-size: 2.2rem; font-weight: 800; color: var(--hyper-accent-rose); margin-top: 0.25rem;">🔥 7 Days</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">+50 XP Multiplier</div>
            </div>
          </div>
        </div>

        <!-- Calendar Controls & View Switcher -->
        <div class="hyper-col-12" style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; border: 1px solid #CBD5E1; padding: 0.85rem 1.25rem; border-radius: var(--hyper-radius-md);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--hyper-text-primary);" id="calendarTitle">Weekly Study Schedule</h3>
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm active" id="btnWeeklyView" onclick="StudyPlannerModule.switchView('weekly')">Weekly View</button>
            <button class="hyper-btn hyper-btn-glass hyper-btn-sm" id="btnMonthlyView" onclick="StudyPlannerModule.switchView('monthly')">Monthly View</button>
          </div>
        </div>

        <!-- Weekly & Monthly Calendar Grid Stage -->
        <div class="hyper-col-12" id="plannerCalendarStage">
          ${this.renderWeeklyViewHTML()}
        </div>

        <!-- Drag & Drop Task Matrix -->
        <div class="hyper-card hyper-col-8">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="grip-vertical" style="color: var(--hyper-accent-primary); width: 18px;"></i> Interactive Task Kanban Board
            </div>
            <span class="hyper-badge hyper-badge-primary">Drag & Drop Ready</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem;" id="kanbanBoard">
            <!-- To Do Column -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm);" ondragover="event.preventDefault()" ondrop="StudyPlannerModule.handleDrop(event, 'todo')">
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--hyper-text-secondary); margin-bottom: 0.65rem; text-transform: uppercase;">📋 To Do (2)</div>
              <div id="todoList" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div class="hyper-card" draggable="true" ondragstart="StudyPlannerModule.handleDragStart(event, 'task-1')" style="padding: 0.75rem; cursor: grab; background: #FFFFFF; border-left: 3px solid var(--hyper-accent-primary);">
                  <div style="font-weight: 700; font-size: 0.84rem; color: var(--hyper-text-primary);">Optics Snell's Law Review</div>
                  <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">Physics • 45 mins</div>
                </div>
                <div class="hyper-card" draggable="true" ondragstart="StudyPlannerModule.handleDragStart(event, 'task-2')" style="padding: 0.75rem; cursor: grab; background: #FFFFFF; border-left: 3px solid var(--hyper-accent-amber);">
                  <div style="font-weight: 700; font-size: 0.84rem; color: var(--hyper-text-primary);">Quadratic Equations Practice</div>
                  <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">Maths • 60 mins</div>
                </div>
              </div>
            </div>

            <!-- In Progress Column -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm);" ondragover="event.preventDefault()" ondrop="StudyPlannerModule.handleDrop(event, 'in_progress')">
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--hyper-text-secondary); margin-bottom: 0.65rem; text-transform: uppercase;">⚡ In Progress (1)</div>
              <div id="inProgressList" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div class="hyper-card" draggable="true" ondragstart="StudyPlannerModule.handleDragStart(event, 'task-3')" style="padding: 0.75rem; cursor: grab; background: #FFFFFF; border-left: 3px solid var(--hyper-accent-cyan);">
                  <div style="font-weight: 700; font-size: 0.84rem; color: var(--hyper-text-primary);">Chemical Reactions MCQ</div>
                  <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">Chemistry • 30 mins</div>
                </div>
              </div>
            </div>

            <!-- Completed Column -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.85rem; border-radius: var(--hyper-radius-sm);" ondragover="event.preventDefault()" ondrop="StudyPlannerModule.handleDrop(event, 'completed')">
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--hyper-text-secondary); margin-bottom: 0.65rem; text-transform: uppercase;">✅ Completed (2)</div>
              <div id="completedList" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div class="hyper-card" style="padding: 0.75rem; background: #FFFFFF; border-left: 3px solid var(--hyper-accent-emerald); opacity: 0.8;">
                  <div style="font-weight: 700; font-size: 0.84rem; color: var(--hyper-text-primary); text-decoration: line-through;">Cell Respiration Diagrams</div>
                  <div style="font-size: 0.75rem; color: var(--hyper-text-muted);">Biology • Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Suggestions & Motivational Card -->
        <div class="hyper-card hyper-col-4">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="sparkles" style="color: var(--hyper-accent-amber); width: 18px;"></i> AI Smart Suggestions
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="background: #FFFBEB; border-left: 4px solid var(--hyper-accent-amber); padding: 0.85rem; border-radius: var(--hyper-radius-xs); font-size: 0.85rem; color: var(--hyper-text-primary); line-height: 1.5;">
              💡 <strong>AI Tip:</strong> Schedule a 45-minute revision block for <strong>Acids & Bases</strong> today to boost predicted board score to 94.2%.
            </div>

            <div style="background: #F0F9FF; border-left: 4px solid var(--hyper-accent-primary); padding: 0.85rem; border-radius: var(--hyper-radius-xs); font-size: 0.85rem; color: var(--hyper-text-primary); line-height: 1.5;">
              ⚡ <strong>Motivational Boost:</strong> "Success is the sum of small efforts, repeated day in and day out."
            </div>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  switchView(view) {
    this.currentView = view;
    const btnWeekly = document.getElementById('btnWeeklyView');
    const btnMonthly = document.getElementById('btnMonthlyView');
    const stage = document.getElementById('plannerCalendarStage');
    const title = document.getElementById('calendarTitle');

    if (view === 'weekly') {
      if (btnWeekly) btnWeekly.classList.add('active');
      if (btnMonthly) btnMonthly.classList.remove('active');
      if (title) title.textContent = 'Weekly Study Schedule';
      if (stage) stage.innerHTML = this.renderWeeklyViewHTML();
    } else {
      if (btnMonthly) btnMonthly.classList.add('active');
      if (btnWeekly) btnWeekly.classList.remove('active');
      if (title) title.textContent = 'Monthly Study Calendar';
      if (stage) stage.innerHTML = this.renderMonthlyViewHTML();
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  renderWeeklyViewHTML() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return `
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.65rem;">
        ${days.map((d, i) => `
          <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: var(--hyper-radius-sm); padding: 0.85rem; min-height: 140px;">
            <div style="font-weight: 800; font-size: 0.88rem; color: ${i === 2 ? 'var(--hyper-accent-primary)' : 'var(--hyper-text-primary)'}; margin-bottom: 0.5rem; text-align: center;">
              ${d} ${i + 21}
            </div>
            <div style="background: #F1F5F9; border-radius: var(--hyper-radius-xs); padding: 0.4rem; font-size: 0.75rem; font-weight: 600; color: var(--hyper-accent-primary); margin-bottom: 0.35rem;">
              ⚡ Physics (2h)
            </div>
            ${i % 2 === 0 ? `<div style="background: #ECFDF5; border-radius: var(--hyper-radius-xs); padding: 0.4rem; font-size: 0.75rem; font-weight: 600; color: var(--hyper-accent-emerald);">🧪 Chemistry (1h)</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  renderMonthlyViewHTML() {
    let cellsHTML = '';
    for (let i = 1; i <= 30; i++) {
      cellsHTML += `
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: var(--hyper-radius-xs); padding: 0.5rem; min-height: 70px; font-size: 0.8rem; font-weight: 700; color: var(--hyper-text-primary);">
          ${i}
          ${i === 5 || i === 12 || i === 25 ? `<div style="margin-top: 0.2rem; width: 6px; height: 6px; border-radius: 50%; background: var(--hyper-accent-emerald);"></div>` : ''}
        </div>
      `;
    }
    return `
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
        ${cellsHTML}
      </div>
    `;
  },

  handleDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId);
  },

  handleDrop(e, column) {
    e.preventDefault();
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(`Task updated to '${column.replace('_', ' ').toUpperCase()}'`, 'success');
    }
  },

  generateNewPlan() {
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast("Creating new AI study plan...", "info");
    }
  }
};

window.StudyPlannerModule = StudyPlannerModule;
