/* noteX AI - Learning Analytics & Student Telemetry Controller (Hyper Pro) */
const AnalyticsModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(6, 182, 212, 0.15)); border-color: rgba(99, 102, 241, 0.35); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.5rem;"><i data-lucide="bar-chart-3"></i> Performance Telemetry</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Learning Analytics & Mastery Insights</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Real-time subject proficiency, weekly study velocity, and exam score predictions.
              </p>
            </div>
          </div>
        </div>

        <!-- 4 Top Telemetry Metric Cards -->
        <div class="hyper-card hyper-col-3">
          <div style="font-size: 0.8rem; color: var(--hyper-text-muted); font-weight: 700; text-transform: uppercase;">Overall Mastery Index</div>
          <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-cyan); margin: 0.35rem 0;">84.5%</div>
          <div style="font-size: 0.78rem; color: var(--hyper-accent-emerald); font-weight: 600;">▲ +3.2% this week</div>
        </div>

        <div class="hyper-card hyper-col-3">
          <div style="font-size: 0.8rem; color: var(--hyper-text-muted); font-weight: 700; text-transform: uppercase;">Weekly Study Time</div>
          <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-primary); margin: 0.35rem 0;">26.5 Hours</div>
          <div style="font-size: 0.78rem; color: var(--hyper-text-secondary);">Avg: 3.8 hrs/day</div>
        </div>

        <div class="hyper-card hyper-col-3">
          <div style="font-size: 0.8rem; color: var(--hyper-text-muted); font-weight: 700; text-transform: uppercase;">Quiz Accuracy</div>
          <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-amber); margin: 0.35rem 0;">89.2%</div>
          <div style="font-size: 0.78rem; color: var(--hyper-text-secondary);">45 / 50 Correct Answers</div>
        </div>

        <div class="hyper-card hyper-col-3">
          <div style="font-size: 0.8rem; color: var(--hyper-text-muted); font-weight: 700; text-transform: uppercase;">Predicted Board Score</div>
          <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-emerald); margin: 0.35rem 0;">92.4%</div>
          <div style="font-size: 0.78rem; color: var(--hyper-text-secondary);">Confidence: 95.8%</div>
        </div>

        <!-- Subject Mastery Progress Breakdown Card -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="graduation-cap" style="color: var(--hyper-accent-cyan); width: 18px;"></i> Subject Mastery Breakdown
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">Mathematics</span>
                <span style="color: var(--hyper-accent-cyan); font-weight: 800;">91% (10/11 Chapters)</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 91%; height: 100%; background: var(--hyper-accent-cyan); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">Physics</span>
                <span style="color: var(--hyper-accent-primary); font-weight: 800;">88% (8/9 Chapters)</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 88%; height: 100%; background: var(--hyper-accent-primary); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">Biology</span>
                <span style="color: var(--hyper-accent-emerald); font-weight: 800;">86% (6/7 Chapters)</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 86%; height: 100%; background: var(--hyper-accent-emerald); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">Chemistry</span>
                <span style="color: var(--hyper-accent-amber); font-weight: 800;">82% (7/8 Chapters)</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 82%; height: 100%; background: var(--hyper-accent-amber); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.3rem;">
                <span style="color: var(--hyper-text-primary); font-weight: 700;">Social Science</span>
                <span style="color: var(--hyper-accent-rose); font-weight: 800;">78% (7/9 Chapters)</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); overflow: hidden;">
                <div style="width: 78%; height: 100%; background: var(--hyper-accent-rose); border-radius: var(--hyper-radius-full);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Study Hours Chart Card -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="clock" style="color: var(--hyper-accent-primary); width: 18px;"></i> Weekly Study Activity (Hours)
            </div>
          </div>

          <div style="height: 220px; position: relative;">
            <canvas id="studyHoursChartCanvas"></canvas>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    this.renderChart();
  },

  renderChart() {
    const canvas = document.getElementById('studyHoursChartCanvas');
    if (!canvas || typeof Chart === 'undefined') return;

    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Study Hours',
          data: [3.5, 4.2, 3.8, 4.5, 3.0, 5.0, 2.5],
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderColor: '#6366f1',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
};

window.AnalyticsModule = AnalyticsModule;
