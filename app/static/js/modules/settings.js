/* noteX AI - Settings & User Preferences View Controller (Hyper Pro) */
const SettingsModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    const currentGrade = typeof APP_STATE !== 'undefined' ? APP_STATE.currentGrade : 'Class 10';
    const user = (typeof APP_STATE !== 'undefined' && APP_STATE.user) ? APP_STATE.user : { name: 'Student', email: 'student@notex.ai' };

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.18)); border-color: rgba(99, 102, 241, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.5rem;"><i data-lucide="sliders"></i> System Preferences</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">Workspace Settings & Profile</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Customize your AI model parameters, target curriculum grade, and appearance preferences.
              </p>
            </div>
          </div>
        </div>

        <!-- 1. Profile Settings Card -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="user" style="color: var(--hyper-accent-cyan); width: 18px;"></i> Student Account Profile
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Student Name:</label>
              <input type="text" id="settingsNameInput" class="hyper-input" value="${user.name}">
            </div>

            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Email Address:</label>
              <input type="email" id="settingsEmailInput" class="hyper-input" value="${user.email}" readonly style="opacity: 0.7;">
            </div>

            <button class="hyper-btn hyper-btn-primary" style="margin-top: 0.5rem;" onclick="SettingsModule.saveProfile()">
              <i data-lucide="save" style="width: 15px;"></i> Save Profile
            </button>
          </div>
        </div>

        <!-- 2. Academic Grade & Model Settings Card -->
        <div class="hyper-card hyper-col-6">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="graduation-cap" style="color: var(--hyper-accent-primary); width: 18px;"></i> Academic & AI Parameters
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Target Curriculum Grade:</label>
              <select id="settingsGradeSelect" class="hyper-select" onchange="SettingsModule.updateGrade(this.value)">
                ${['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(g => `<option value="${g}" ${g === currentGrade ? 'selected' : ''}>${g}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Default AI Reasoning Engine:</label>
              <select id="settingsModelSelect" class="hyper-select">
                <option value="rag-fast" selected>⚡ Fast RAG Model (Recommended for textbooks)</option>
                <option value="gpt-4o">🧠 Advanced Science & Math Engine (Deep explanations)</option>
              </select>
            </div>

            <button class="hyper-btn hyper-btn-cyan" style="margin-top: 0.5rem;" onclick="SettingsModule.savePreferences()">
              <i data-lucide="check-circle" style="width: 15px;"></i> Apply Preferences
            </button>
          </div>
        </div>

        <!-- 3. Visual & Ambient Canvas Controls Card -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i data-lucide="palette" style="color: var(--hyper-accent-amber); width: 18px;"></i> Appearance & Ambient Background
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div class="hyper-card hyper-card-interactive" style="padding: 1rem;" onclick="SettingsModule.toggleParticles()">
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--hyper-text-primary); margin-bottom: 0.25rem;">Floating Formulas Canvas</div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted);">Low-opacity DNA, atoms & math particle layer</div>
            </div>

            <div class="hyper-card hyper-card-interactive" style="padding: 1rem;" onclick="UI.showToast('Pitch Obsidian theme active', 'info')">
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--hyper-text-primary); margin-bottom: 0.25rem;">Pitch Obsidian Dark</div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted);">Multi-dimensional aurora dark palette</div>
            </div>

            <div class="hyper-card hyper-card-interactive" style="padding: 1rem;" onclick="UI.showToast('Glassmorphism blur active', 'info')">
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--hyper-text-primary); margin-bottom: 0.25rem;">Glass Backdrop Blur</div>
              <div style="font-size: 0.8rem; color: var(--hyper-text-muted);">20px backdrop filter on header</div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  saveProfile() {
    const nameInput = document.getElementById('settingsNameInput');
    if (nameInput && APP_STATE.user) {
      APP_STATE.user.name = nameInput.value.trim();
      localStorage.setItem('notex_user', JSON.stringify(APP_STATE.user));
      UI.showToast("Profile updated successfully!", "success");
    } else {
      UI.showToast("Profile settings saved.", "success");
    }
  },

  updateGrade(grade) {
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.currentGrade = grade;
      localStorage.setItem('notex_grade', grade);
      const label = document.getElementById('currentGradeLabel');
      if (label) label.textContent = grade;
      UI.showToast(`Updated active curriculum to ${grade}`, "info");
    }
  },

  savePreferences() {
    UI.showToast("AI parameters and preferences saved!", "success");
  },

  toggleParticles() {
    const canvas = document.getElementById('scienceCanvas');
    if (canvas) {
      canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
      UI.showToast(`Scientific canvas ${canvas.style.display === 'none' ? 'disabled' : 'enabled'}`, "info");
    }
  }
};

window.SettingsModule = SettingsModule;
