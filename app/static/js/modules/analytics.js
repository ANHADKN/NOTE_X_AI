/* noteX AI - AI Analytics & ML Engine View Controller (Hyper Pro) */
const AnalyticsModule = {
  studyChart: null,
  masteryChart: null,

  async render(container) {
    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.18)); border-color: rgba(6, 182, 212, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-cyan" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-chart-pie"></i> ML Analytics</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Learning Telemetry & Insights</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Real-time Performance Prediction & Weak Topic Detection for <strong style="color: var(--hyper-accent-cyan);">${typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10'}</strong>.
              </p>
            </div>
          </div>
        </div>

        <!-- Metrics KPI Cards -->
        <div class="hyper-card hyper-col-4">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-cyan-light); color: var(--hyper-accent-cyan); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800;" id="analyticsMasteryVal">--%</div>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Subject Mastery Index</div>
            </div>
          </div>
        </div>

        <div class="hyper-card hyper-col-4">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-emerald-light); color: var(--hyper-accent-emerald); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              <i class="fa-solid fa-brain"></i>
            </div>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800;" id="analyticsRetentionVal">--%</div>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Memory Retention Rate</div>
            </div>
          </div>
        </div>

        <div class="hyper-card hyper-col-4">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-amber-light); color: var(--hyper-accent-amber); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              <i class="fa-solid fa-trophy"></i>
            </div>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-amber);" id="analyticsPredictedVal">--%</div>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">ML Predicted Exam Grade</div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-clock-rotate-left" style="color: var(--hyper-accent-cyan);"></i> Weekly Study Hours
            </div>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="studyHoursChartCanvas"></canvas>
          </div>
        </div>

        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-bullseye" style="color: var(--hyper-accent-primary);"></i> Subject Mastery Radar
            </div>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="subjectMasteryChartCanvas"></canvas>
          </div>
        </div>

        <!-- Weak Topics & Recommendations -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-triangle-exclamation" style="color: var(--hyper-accent-rose);"></i> ML Detected Focus Topics
            </div>
          </div>
          <div id="analyticsWeakTopicsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem;">Analyzing quiz history...</div>
          </div>
        </div>

        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--hyper-accent-amber);"></i> AI Study Recommendations
            </div>
          </div>
          <div id="analyticsRecommendationsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; color: var(--hyper-text-muted); padding: 1rem;">Generating recommendations...</div>
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
        <div class="hyper-card hyper-card-interactive" style="padding: 0.85rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--hyper-accent-rose);">
          <div>
            <div style="font-weight: 700; font-size: 0.92rem; color: var(--hyper-text-primary);">${item.subject}: ${item.topic}</div>
            <div style="font-size: 0.78rem; color: var(--hyper-text-muted); margin-top: 0.2rem;">Quiz Accuracy: ${item.accuracy}% • Priority: High</div>
          </div>
          <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="location.hash = '#quizzes'">
            Practice Quiz
          </button>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<div style="text-align: center; color: var(--hyper-accent-emerald); padding: 1rem;">No critical weak topics detected! Keep up the great work.</div>`;
    }
  },

  renderRecommendations(recommendations) {
    const container = document.getElementById('analyticsRecommendationsList');
    if (!container) return;

    container.innerHTML = recommendations.map(rec => `
      <div class="hyper-card" style="padding: 0.85rem; border-left: 4px solid var(--hyper-accent-amber); display: flex; gap: 0.75rem; align-items: flex-start;">
        <i class="fa-solid fa-lightbulb" style="color: var(--hyper-accent-amber); font-size: 1.1rem; margin-top: 0.15rem;"></i>
        <div style="font-size: 0.85rem; color: var(--hyper-text-primary); line-height: 1.5;">${rec}</div>
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
