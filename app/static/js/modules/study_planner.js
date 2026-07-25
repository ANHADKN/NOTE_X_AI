/* noteX AI - Study Planner Controller (Hyper Pro) */
const StudyPlannerModule = {
  activeTab: 'today',

  async render(container) {
    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.18)); border-color: rgba(99, 102, 241, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-cyan" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-brain"></i> ML Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Study Planner & Timetable</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Personalized for <strong style="color: var(--hyper-accent-cyan);">${typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10'}</strong>. Powered by ML Weak-Topic Detection & Performance Prediction.
              </p>
            </div>

            <!-- Tab Switcher -->
            <div style="display: flex; gap: 0.5rem; background: var(--hyper-bg-surface); padding: 0.35rem; border-radius: var(--hyper-radius-md); border: 1px solid var(--hyper-border-subtle);">
              <button id="tabTodayBtn" class="hyper-btn hyper-btn-primary hyper-btn-sm" onclick="StudyPlannerModule.switchTab('today')">Today's Plan</button>
              <button id="tabWeekBtn" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="StudyPlannerModule.switchTab('week')">Weekly Timetable</button>
              <button id="tabMonthBtn" class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="StudyPlannerModule.switchTab('month')">Exam Roadmap</button>
            </div>
          </div>
        </div>

        <!-- Dynamic Content Area -->
        <div id="plannerTabContent" class="hyper-col-12">
          <div style="text-align: center; padding: 2rem; color: var(--hyper-text-muted);">Loading Study Plan...</div>
        </div>
      </div>
    `;

    await this.loadTabContent('today');
  },

  async switchTab(tab) {
    this.activeTab = tab;
    
    document.getElementById('tabTodayBtn').className = tab === 'today' ? 'hyper-btn hyper-btn-primary hyper-btn-sm' : 'hyper-btn hyper-btn-glass hyper-btn-sm';
    document.getElementById('tabWeekBtn').className = tab === 'week' ? 'hyper-btn hyper-btn-primary hyper-btn-sm' : 'hyper-btn hyper-btn-glass hyper-btn-sm';
    document.getElementById('tabMonthBtn').className = tab === 'month' ? 'hyper-btn hyper-btn-primary hyper-btn-sm' : 'hyper-btn hyper-btn-glass hyper-btn-sm';

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
            <div class="hyper-bento-grid">
              <!-- ML Score Predictor KPI -->
              <div class="hyper-card hyper-col-4">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-amber-light); color: var(--hyper-accent-amber); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="fa-solid fa-brain"></i>
                  </div>
                  <div>
                    <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-amber);">${pred.predicted_score_percentage || '89'}%</div>
                    <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">ML Predicted Exam Score (${pred.predicted_grade || 'A'})</div>
                  </div>
                </div>
              </div>

              <!-- Recommended Daily Target -->
              <div class="hyper-card hyper-col-4">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-cyan-light); color: var(--hyper-accent-cyan); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <div style="font-size: 1.6rem; font-weight: 800;">${data.recommended_hours || 3.0}h</div>
                    <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Recommended Daily Target</div>
                  </div>
                </div>
              </div>

              <!-- Days Remaining -->
              <div class="hyper-card hyper-col-4">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-rose-light); color: var(--hyper-accent-rose); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="fa-solid fa-hourglass-half"></i>
                  </div>
                  <div>
                    <div style="font-size: 1.6rem; font-weight: 800;">${data.days_remaining || 30} Days</div>
                    <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Days to Board Exam</div>
                  </div>
                </div>
              </div>

              <!-- AI Recommendation Banner -->
              <div class="hyper-card hyper-col-12" style="border-left: 4px solid var(--hyper-accent-cyan);">
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.35rem; color: var(--hyper-text-primary); display: flex; align-items: center; gap: 0.5rem;">
                  <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--hyper-accent-cyan);"></i> AI Recommendation Engine
                </div>
                <p style="color: var(--hyper-text-secondary); font-size: 0.9rem;">${data.recommendation_reason || 'Focus 50% of your time on high-priority weak topics before final revisions.'}</p>
              </div>

              <!-- Tasks Checklist -->
              <div class="hyper-card hyper-col-12">
                <div class="hyper-card-header">
                  <div class="hyper-card-title">
                    <i class="fa-solid fa-list-check" style="color: var(--hyper-accent-primary);"></i> Today's Study Tasks
                  </div>
                  <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="StudyPlannerModule.regeneratePlan()">
                    <i class="fa-solid fa-rotate"></i> Regenerate
                  </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${(data.today_tasks || []).map(task => `
                    <div class="hyper-card hyper-card-interactive" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; ${task.is_completed ? 'opacity: 0.6;' : ''}">
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <span style="font-weight: 700; font-size: 0.95rem; color: var(--hyper-text-primary); ${task.is_completed ? 'text-decoration: line-through;' : ''}">${task.subject}: ${task.topic}</span>
                          ${task.is_weak_topic ? '<span class="hyper-badge hyper-badge-rose">Weak Topic</span>' : ''}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--hyper-text-muted); margin-top: 0.25rem;">Allocated: ${task.allocated_minutes} Mins</div>
                      </div>

                      ${task.is_completed ? 
                        '<span style="color: var(--hyper-accent-emerald); font-weight: 600; font-size: 0.9rem;"><i class="fa-solid fa-circle-check"></i> Completed (+25 XP)</span>' :
                        `<button class="hyper-btn hyper-btn-primary hyper-btn-sm" onclick="StudyPlannerModule.completeTask('${task.task_id}')">
                          Mark Done
                        </button>`
                      }
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-accent-rose); padding: 2rem;">Failed to load today's plan: ${e.message}</div>`;
      }
    } else if (tab === 'week') {
      try {
        const res = await API.get('/study-plan/week');
        if (res && res.success && res.data) {
          container.innerHTML = `
            <div class="hyper-card hyper-col-12">
              <div class="hyper-card-header">
                <div class="hyper-card-title">
                  <i class="fa-solid fa-calendar-days" style="color: var(--hyper-accent-primary);"></i> 7-Day Weekly Timetable Matrix
                </div>
              </div>
              <div class="hyper-bento-grid">
                ${(res.data.weekly_timetable || []).map(day => `
                  <div class="hyper-card hyper-col-4" style="padding: 1rem;">
                    <h4 style="font-weight: 800; font-size: 1rem; color: var(--hyper-accent-cyan); margin-bottom: 0.75rem; border-bottom: 1px solid var(--hyper-border-subtle); padding-bottom: 0.35rem;">${day.day}</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                      ${day.slots.map(slot => `
                        <div style="font-size: 0.85rem;">
                          <div style="font-weight: 600; color: var(--hyper-text-primary);">${slot.time}</div>
                          <div style="color: var(--hyper-accent-primary); font-weight: 500;">${slot.subject}</div>
                          <div style="color: var(--hyper-text-muted); font-size: 0.78rem;">${slot.activity}</div>
                        </div>
                      `).join('<hr style="border: 0; border-top: 1px solid var(--hyper-border-subtle);">')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-accent-rose); padding: 2rem;">Error loading weekly timetable.</div>`;
      }
    } else if (tab === 'month') {
      try {
        const res = await API.get('/study-plan/month');
        if (res && res.success && res.data) {
          container.innerHTML = `
            <div class="hyper-card hyper-col-12">
              <div class="hyper-card-header">
                <div class="hyper-card-title">
                  <i class="fa-solid fa-flag" style="color: var(--hyper-accent-rose);"></i> Exam Milestone Roadmap
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${(res.data.exam_milestones || []).map(m => `
                  <div class="hyper-card hyper-card-interactive" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--hyper-accent-primary);">
                    <div>
                      <h4 style="font-weight: 700; font-size: 1rem; color: var(--hyper-text-primary);">${m.milestone}</h4>
                      <div style="font-size: 0.85rem; color: var(--hyper-text-muted); margin-top: 0.25rem;">Target Window: ${m.timeframe}</div>
                    </div>
                    <span class="hyper-badge hyper-badge-primary">${m.timeframe}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      } catch (e) {
        container.innerHTML = `<div style="text-align: center; color: var(--hyper-accent-rose); padding: 2rem;">Error loading monthly roadmap.</div>`;
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
