/* noteX AI - AI Analytics & ML Engine View Controller */
const AnalyticsModule = {
  studyChart: null,
  masteryChart: null,

  async render(container) {
    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;">AI Learning Analytics & ML Insights</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Real-time Performance Prediction & Weak Topic Detection for <strong style="color: var(--accent-cyan);">${APP_STATE.currentGrade}</strong>.</p>
            </div>
          </div>
        </div>

        <!-- Metrics KPI Grid -->
        <div class="metrics-grid" style="margin-bottom: 1.5rem;">
          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15);"><i class="fa-solid fa-chart-line"></i></div>
            <div>
              <div class="metric-val" id="analyticsMasteryVal">--%</div>
              <div class="metric-label">Subject Mastery Index</div>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-emerald); background: rgba(16, 185, 129, 0.15);"><i class="fa-solid fa-brain"></i></div>
            <div>
              <div class="metric-val" id="analyticsRetentionVal">--%</div>
              <div class="metric-label">Memory Retention Rate</div>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-amber); background: rgba(245, 158, 11, 0.15);"><i class="fa-solid fa-trophy"></i></div>
            <div>
              <div class="metric-val" id="analyticsPredictedVal" style="color: var(--accent-amber);">--%</div>
              <div class="metric-label">ML Predicted Exam Grade</div>
            </div>
          </div>
        </div>

        <!-- Charts Container Grid -->
        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 1.5rem;">
          <div class="glass-card section-card">
            <div class="section-title">
              <span><i class="fa-solid fa-clock-rotate-left" style="color: var(--accent-cyan); margin-right: 0.5rem;"></i> Weekly Study Hours</span>
            </div>
            <div style="height: 260px; position: relative;">
              <canvas id="studyHoursChartCanvas"></canvas>
            </div>
          </div>

          <div class="glass-card section-card">
            <div class="section-title">
              <span><i class="fa-solid fa-bullseye" style="color: var(--accent-indigo); margin-right: 0.5rem;"></i> Subject Mastery Distribution</span>
            </div>
            <div style="height: 260px; position: relative;">
              <canvas id="subjectMasteryChartCanvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Weak Topics & Recommendations Grid -->
        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr;">
          <!-- Weak Topics Section -->
          <div class="glass-card section-card">
            <div class="section-title">
              <span><i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-rose); margin-right: 0.5rem;"></i> ML Detected Weak Topics</span>
            </div>
            <div id="analyticsWeakTopicsList" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Analyzing quiz history...</div>
            </div>
          </div>

          <!-- Recommendations Section -->
          <div class="glass-card section-card">
            <div class="section-title">
              <span><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--accent-amber); margin-right: 0.5rem;"></i> AI Study Recommendations</span>
            </div>
            <div id="analyticsRecommendationsList" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Generating recommendations...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadAnalyticsData();
  },

  async loadAnalyticsData() {
    try {
      const res = await API.get('/analytics/overview');
      if (res && res.success && res.data.analytics) {
        const a = res.data.analytics;

        document.getElementById('analyticsMasteryVal').textContent = `${a.mastery_score}%`;
        document.getElementById('analyticsRetentionVal').textContent = `${a.retention_rate}%`;
        document.getElementById('analyticsPredictedVal').textContent = `${a.predicted_score}% (${a.predicted_grade || 'A'})`;

        this.renderWeakTopics(a.weak_topics || []);
        this.renderRecommendations(a.recommendations || []);
      }

      const chartRes = await API.get('/analytics/charts-data');
      if (chartRes && chartRes.success && chartRes.data.charts) {
        this.renderCharts(chartRes.data.charts);
      }
    } catch (e) {
      console.log('Analytics loading error:', e);
    }
  },

  renderWeakTopics(topics) {
    const container = document.getElementById('analyticsWeakTopicsList');
    if (!container) return;

    if (topics.length > 0) {
      container.innerHTML = topics.map(item => `
        <div class="glass-card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent-rose);">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">${item.subject}: ${item.topic}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">Quiz Accuracy: ${item.accuracy}% • Priority: High</div>
          </div>

          <button class="btn-glass-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="location.hash = '#quizzes'">
            Practice Quiz
          </button>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<div style="text-align: center; color: var(--accent-emerald); padding: 1rem;">No critical weak topics detected! Keep up the great work.</div>`;
    }
  },

  renderRecommendations(recommendations) {
    const container = document.getElementById('analyticsRecommendationsList');
    if (!container) return;

    container.innerHTML = recommendations.map(rec => `
      <div class="glass-card" style="padding: 1rem; border-left: 4px solid var(--accent-amber); display: flex; gap: 0.75rem; align-items: flex-start;">
        <i class="fa-solid fa-lightbulb" style="color: var(--accent-amber); font-size: 1.1rem; margin-top: 0.15rem;"></i>
        <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5;">${rec}</div>
      </div>
    `).join('');
  },

  renderCharts(data) {
    if (typeof Chart === 'undefined') return;

    const ctx1 = document.getElementById('studyHoursChartCanvas');
    const ctx2 = document.getElementById('subjectMasteryChartCanvas');

    if (ctx1) {
      if (this.studyChart) this.studyChart.destroy();
      this.studyChart = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: data.weekly_study_hours.labels,
          datasets: [{
            label: 'Study Hours',
            data: data.weekly_study_hours.data,
            backgroundColor: 'rgba(6, 182, 212, 0.6)',
            borderColor: 'rgb(6, 182, 212)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    if (ctx2) {
      if (this.masteryChart) this.masteryChart.destroy();
      this.masteryChart = new Chart(ctx2, {
        type: 'radar',
        data: {
          labels: data.subject_mastery.labels,
          datasets: [{
            label: 'Mastery %',
            data: data.subject_mastery.data,
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            borderColor: 'rgb(99, 102, 241)',
            pointBackgroundColor: 'rgb(6, 182, 212)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.1)' },
              grid: { color: 'rgba(255,255,255,0.1)' },
              pointLabels: { color: '#94a3b8', font: { size: 11 } },
              ticks: { display: false }
            }
          }
        }
      });
    }
  }
};
