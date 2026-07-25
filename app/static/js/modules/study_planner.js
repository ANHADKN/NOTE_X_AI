/* noteX AI - ML Study Planner Controller (Hyper Pro) */
const StudyPlannerModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.18)); border-color: rgba(16, 185, 129, 0.35); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-emerald" style="margin-bottom: 0.5rem;"><i data-lucide="calendar"></i> ML Predictor Engine</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">AI Study Planner & Timetable</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Adaptive exam revision timetables with predicted score tracking (92.4% Target).
              </p>
            </div>
            
            <button class="hyper-btn hyper-btn-emerald" onclick="StudyPlannerModule.generateNewPlan()">
              <i data-lucide="plus-circle"></i> Create New Study Plan
            </button>
          </div>
        </div>

        <!-- ML Score Predictor Telemetry Card -->
        <div class="hyper-card hyper-col-12" style="background: rgba(10, 14, 23, 0.8); border-color: var(--hyper-accent-emerald);">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
            <div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Predicted Board Score</div>
              <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-emerald); margin-top: 0.25rem;">92.4%</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">Confidence: 95.8%</div>
            </div>

            <div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Study Velocity</div>
              <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-cyan); margin-top: 0.25rem;">3.8 hrs/day</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">Optimal Pace</div>
            </div>

            <div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Weak Topics Identified</div>
              <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-amber); margin-top: 0.25rem;">2 Topics</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">Acids & Integration</div>
            </div>

            <div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted); text-transform: uppercase; font-weight: 700;">Active Study Streak</div>
              <div style="font-size: 2.25rem; font-weight: 800; color: var(--hyper-accent-rose); margin-top: 0.25rem;">🔥 7 Days</div>
              <div style="font-size: 0.75rem; color: var(--hyper-text-secondary);">+50 XP Multiplier</div>
            </div>
          </div>
        </div>

        <!-- 5 Study Plans Section -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="list-checks" style="color: var(--hyper-accent-emerald); width: 18px;"></i> Active Academic Revision Plans (5)
            </div>
          </div>

          <div id="plannerTabContent" style="display: flex; flex-direction: column; gap: 1rem;">
            ${this.get5PlansHTML()}
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  get5Plans() {
    return [
      {
        id: 'plan-1',
        title: "Physics Board Exam 7-Day Sprint Plan",
        subject: "Physics",
        days: 7,
        hours: 14,
        target: "88% Score Target",
        progress: 71,
        tasks: [
          "Day 1: Optics, Snell's Law & Refractive Index (2 hrs)",
          "Day 2: Lenses & Mirror Formula Calculations (2 hrs)",
          "Day 3: Ohm's Law & Resistors in Series/Parallel (2 hrs)",
          "Day 4: Joule's Heating Effect & Power Units (2 hrs)"
        ]
      },
      {
        id: 'plan-2',
        title: "Chemistry Reaction Mechanisms 5-Day Plan",
        subject: "Chemistry",
        days: 5,
        hours: 10,
        target: "90% Score Target",
        progress: 60,
        tasks: [
          "Day 1: Balancing Chemical Equations (2 hrs)",
          "Day 2: Types of Reactions - Redox, Combination, Decomposition (2 hrs)",
          "Day 3: Acids, Bases & pH Scale Universal Indicator (2 hrs)"
        ]
      },
      {
        id: 'plan-3',
        title: "Mathematics Quadratic & AP 10-Day Mastery Plan",
        subject: "Mathematics",
        days: 10,
        hours: 20,
        target: "95% Score Target",
        progress: 80,
        tasks: [
          "Day 1-3: Quadratic Equations & Discriminant Method (6 hrs)",
          "Day 4-6: Arithmetic Progressions & Sum Formulas (6 hrs)",
          "Day 7-10: Board Exam Previous Year Sample Papers (8 hrs)"
        ]
      },
      {
        id: 'plan-4',
        title: "Biology Diagram & Life Processes 4-Day Plan",
        subject: "Biology",
        days: 4,
        hours: 8,
        target: "88% Score Target",
        progress: 50,
        tasks: [
          "Day 1: Nutrition & Photosynthesis Mechanics (2 hrs)",
          "Day 2: Human Heart & Circulatory System Diagram (2 hrs)",
          "Day 3: Respiration & Excretion in Humans (2 hrs)"
        ]
      },
      {
        id: 'plan-5',
        title: "Comprehensive Term-1 All-Subject Revision Plan",
        subject: "All Subjects",
        days: 14,
        hours: 30,
        target: "92% Score Target",
        progress: 45,
        tasks: [
          "Week 1: Physics & Chemistry Formula & Reaction Drills (15 hrs)",
          "Week 2: Maths PYQs & Social Science Map Work (15 hrs)"
        ]
      }
    ];
  },

  get5PlansHTML() {
    const plans = this.get5Plans();
    return plans.map(plan => `
      <div class="hyper-card hyper-card-interactive" style="padding: 1.25rem; border-left: 4px solid var(--hyper-accent-emerald);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="hyper-badge hyper-badge-emerald">${plan.subject}</span>
              <span class="hyper-badge hyper-badge-cyan">${plan.days} Days • ${plan.hours} Hours</span>
              <span class="hyper-badge hyper-badge-amber">${plan.target}</span>
            </div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--hyper-text-primary);">${plan.title}</h3>
          </div>
          <span style="font-size: 1.25rem; font-weight: 800; color: var(--hyper-accent-emerald);">${plan.progress}%</span>
        </div>

        <div style="width: 100%; height: 6px; background: var(--hyper-bg-elevated); border-radius: var(--hyper-radius-full); margin-bottom: 1rem; overflow: hidden;">
          <div style="width: ${plan.progress}%; height: 100%; background: var(--hyper-accent-emerald); border-radius: var(--hyper-radius-full);"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${plan.tasks.map(t => `
            <div style="font-size: 0.82rem; color: var(--hyper-text-secondary); display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="check-circle-2" style="width: 14px; color: var(--hyper-accent-emerald);"></i> ${t}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  generateNewPlan() {
    UI.showToast("Creating new AI study plan...", "info");
  }
};

window.StudyPlannerModule = StudyPlannerModule;
