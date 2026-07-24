/* noteX AI - Study Planner View Controller */
const StudyPlannerModule = {
  activeTab: 'today',

  async render(container) {
    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;">AI Study Planner & ML Timetable</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Personalized for <strong style="color: var(--accent-cyan);">${APP_STATE.currentGrade}</strong>. Powered by ML Weak-Topic Detection & Performance Prediction.</p>
            </div>

            <!-- Tab Switcher -->
            <div style="display: flex; gap: 0.5rem; background: var(--surface); padding: 0.35rem; border-radius: 12px; border: 1px solid var(--border-color);">
              <button id="tabTodayBtn" class="btn-glass" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="StudyPlannerModule.switchTab('today')">Today's Plan</button>
              <button id="tabWeekBtn" class="btn-glass-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="StudyPlannerModule.switchTab('week')">Weekly Timetable</button>
              <button id="tabMonthBtn" class="btn-glass-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="StudyPlannerModule.switchTab('month')">Exam Roadmap</button>
            </div>
          </div>
        </div>

        <!-- Dynamic Content Container -->
        <div id="plannerTabContent">
          <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading Study Plan...</div>
        </div>
      </div>
    `;

    await this.loadTabContent('today');
  },

  async switchTab(tab) {
    this.activeTab = tab;
    
    document.getElementById('tabTodayBtn').className = tab === 'today' ? 'btn-glass' : 'btn-glass-secondary';
    document.getElementById('tabWeekBtn').className = tab === 'week' ? 'btn-glass' : 'btn-glass-secondary';
    document.getElementById('tabMonthBtn').className = tab === 'month' ? 'btn-glass' : 'btn-glass-secondary';

    await this.loadTabContent(tab);
  },

  async loadTabContent(tab) {
    const container = document.getElementById('plannerTabContent');
    if (!container) return;

    if (tab === 'today') {
      try {
        const res = await API.get('/study-plan/today');
        if (res && res.success && res.data) {
          const data = res.data;
          const pred = data.prediction || {};

          container.innerHTML = `
            <!-- Top Recommendation Banner & ML Prediction -->
            <div class="metrics-grid" style="margin-bottom: 1.5rem;">
              <div class="glass-card metric-card">
                <div class="metric-icon" style="color: var(--accent-amber); background: rgba(245, 158, 11, 0.15);"><i class="fa-solid fa-brain"></i></div>
                <div>
                  <div class="metric-val" style="color: var(--accent-amber);">${pred.predicted_score_percentage || '89'}%</div>
                  <div class="metric-label">ML Predicted Exam Score (${pred.predicted_grade || 'A'})</div>
                </div>
              </div>

              <div class="glass-card metric-card">
                <div class="metric-icon" style="color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15);"><i class="fa-solid fa-clock"></i></div>
                <div>
                  <div class="metric-val">${data.recommended_hours || 3.0}h</div>
                  <div class="metric-label">Recommended Daily Target</div>
                </div>
              </div>

              <div class="glass-card metric-card">
                <div class="metric-icon" style="color: var(--accent-rose); background: rgba(244, 63, 94, 0.15);"><i class="fa-solid fa-hourglass-half"></i></div>
                <div>
                  <div class="metric-val">${data.days_remaining || 30} Days</div>
                  <div class="metric-label">Days to Board Exam</div>
                </div>
              </div>
            </div>

            <!-- Recommendation Reason -->
            <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.5rem; border-left: 4px solid var(--accent-cyan);">
              <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.35rem;"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-cyan);"></i> AI Recommendation Engine</div>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">${data.recommendation_reason || 'Focus 50% of your time on high-priority weak topics before final revisions.'}</p>
            </div>

            <!-- Today's Tasks Checklist -->
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-list-check" style="color: var(--accent-indigo); margin-right: 0.5rem;"></i> Today's Study Tasks</span>
                <button class="btn-glass-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="StudyPlannerModule.regeneratePlan()">
                  <i class="fa-solid fa-rotate"></i> Regenerate
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${(data.today_tasks || []).map(task => `
                  <div class="glass-card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; ${task.is_completed ? 'opacity: 0.6;' : ''}">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 700; font-size: 0.95rem; ${task.is_completed ? 'text-decoration: line-through;' : ''}">${task.subject}: ${task.topic}</span>
                        ${task.is_weak_topic ? '<span class="suggested-chip" style="font-size:0.7rem; padding:0.1rem 0.5rem; background:rgba(244,63,94,0.15); color:var(--accent-rose); border-color:var(--accent-rose);">Weak Topic</span>' : ''}
                      </div>
                      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">Allocated: ${task.allocated_minutes} Mins</div>
                    </div>

                    ${task.is_completed ? 
                      '<span style="color: var(--accent-emerald); font-weight: 600; font-size: 0.9rem;"><i class="fa-solid fa-circle-check"></i> Completed (+25 XP)</span>' :
                      `<button class="btn-glass" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;" onclick="StudyPlannerModule.completeTask('${task.task_id}')">
                        Mark Done
                      </button>`
                    }
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; color: var(--accent-rose); padding: 2rem;">Failed to load today's plan: ${e.message}</div>`;
      }
    } else if (tab === 'week') {
      try {
        const res = await API.get('/study-plan/week');
        if (res && res.success && res.data) {
          container.innerHTML = `
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-calendar-days" style="color: var(--accent-indigo); margin-right: 0.5rem;"></i> 7-Day Weekly Timetable</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                ${(res.data.weekly_timetable || []).map(day => `
                  <div class="glass-card" style="padding: 1rem;">
                    <h4 style="font-weight: 700; font-size: 1rem; color: var(--accent-cyan); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.35rem;">${day.day}</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                      ${day.slots.map(slot => `
                        <div style="font-size: 0.85rem;">
                          <div style="font-weight: 600; color: var(--text-primary);">${slot.time}</div>
                          <div style="color: var(--accent-indigo); font-weight: 500;">${slot.subject}</div>
                          <div style="color: var(--text-secondary); font-size: 0.78rem;">${slot.activity}</div>
                        </div>
                      `).join('<hr style="border: 0; border-top: 1px solid var(--border-color);">')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; color: var(--accent-rose); padding: 2rem;">Error loading weekly timetable.</div>`;
      }
    } else if (tab === 'month') {
      try {
        const res = await API.get('/study-plan/month');
        if (res && res.success && res.data) {
          container.innerHTML = `
            <div class="glass-card section-card">
              <div class="section-title">
                <span><i class="fa-solid fa-flag" style="color: var(--accent-rose); margin-right: 0.5rem;"></i> Exam Milestone Roadmap</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${(res.data.exam_milestones || []).map(m => `
                  <div class="glass-card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent-indigo);">
                    <div>
                      <h4 style="font-weight: 700; font-size: 1rem;">${m.milestone}</h4>
                      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Target Window: ${m.timeframe}</div>
                    </div>
                    <span class="grade-badge-selector">${m.timeframe}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; color: var(--accent-rose); padding: 2rem;">Error loading monthly roadmap.</div>`;
      }
    }
  },

  async completeTask(taskId) {
    try {
      const res = await API.post('/study-plan/complete', { task_id: taskId });
      if (res && res.success) {
        await this.loadTabContent('today');
      }
    } catch (e) {
      console.error('Error completing task:', e);
    }
  },

  async regeneratePlan() {
    try {
      await API.post('/study-plan/generate', {
        daily_hours: 3.5,
        subjects: ["Mathematics", "Science", "Physics", "Chemistry", "English"]
      });
      await this.loadTabContent('today');
    } catch (e) {
      console.error('Error regenerating plan:', e);
    }
  }
};
