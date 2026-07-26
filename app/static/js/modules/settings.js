/* noteX AI - Premium 11-Tab Settings View Controller */

const SettingsModule = {
  activeTab: 'profile',

  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    // Use current user from APP_STATE or fetch via API in real app
    const user = (typeof APP_STATE !== 'undefined' && APP_STATE.user) ? APP_STATE.user : { name: 'Student', email: 'student@school.edu', phone: '', role: 'student', plan: 'Free' };

    container.innerHTML = `
      <div class="settings-layout fade-in">
        <!-- Sidebar Navigation -->
        <aside class="settings-sidebar">
          <div class="settings-nav-group">
            <div class="settings-nav-title">Personal</div>
            <button class="settings-nav-item ${this.activeTab === 'profile' ? 'active' : ''}" onclick="SettingsModule.switchTab('profile')">
              <i data-lucide="user"></i> Profile
            </button>
            <button class="settings-nav-item ${this.activeTab === 'account' ? 'active' : ''}" onclick="SettingsModule.switchTab('account')">
              <i data-lucide="circle-user"></i> Account
            </button>
            <button class="settings-nav-item ${this.activeTab === 'security' ? 'active' : ''}" onclick="SettingsModule.switchTab('security')">
              <i data-lucide="shield-check"></i> Security
            </button>
          </div>
          
          <div class="settings-nav-group">
            <div class="settings-nav-title">App Settings</div>
            <button class="settings-nav-item ${this.activeTab === 'ai' ? 'active' : ''}" onclick="SettingsModule.switchTab('ai')">
              <i data-lucide="brain-circuit"></i> AI Preferences
            </button>
            <button class="settings-nav-item ${this.activeTab === 'appearance' ? 'active' : ''}" onclick="SettingsModule.switchTab('appearance')">
              <i data-lucide="palette"></i> Appearance
            </button>
            <button class="settings-nav-item ${this.activeTab === 'notifications' ? 'active' : ''}" onclick="SettingsModule.switchTab('notifications')">
              <i data-lucide="bell"></i> Notifications
            </button>
          </div>

          <div class="settings-nav-group">
            <div class="settings-nav-title">Data & Integrations</div>
            <button class="settings-nav-item ${this.activeTab === 'storage' ? 'active' : ''}" onclick="SettingsModule.switchTab('storage')">
              <i data-lucide="hard-drive"></i> Storage
            </button>
            <button class="settings-nav-item ${this.activeTab === 'integrations' ? 'active' : ''}" onclick="SettingsModule.switchTab('integrations')">
              <i data-lucide="blocks"></i> Integrations
            </button>
          </div>

          <div class="settings-nav-group">
            <div class="settings-nav-title">System</div>
            <button class="settings-nav-item ${this.activeTab === 'billing' ? 'active' : ''}" onclick="SettingsModule.switchTab('billing')">
              <i data-lucide="credit-card"></i> Billing
            </button>
            <button class="settings-nav-item ${this.activeTab === 'privacy' ? 'active' : ''}" onclick="SettingsModule.switchTab('privacy')">
              <i data-lucide="lock"></i> Privacy
            </button>
            <button class="settings-nav-item ${this.activeTab === 'advanced' ? 'active' : ''}" onclick="SettingsModule.switchTab('advanced')">
              <i data-lucide="settings-2"></i> Advanced
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="settings-content-area" id="settingsContentArea">
          ${this.getTabContent(this.activeTab, user)}
        </main>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    this.render(); // Re-render to update sidebar active state & content
  },

  getTabContent(tabId, user) {
    const tabs = {
      profile: `
        <h2 class="settings-section-title">Profile Profile</h2>
        <p class="settings-section-desc">Manage your public profile information, bio, and avatar.</p>
        
        <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem;">
          <img id="profileAvatarPreview" src="${user.profile_photo || ''}" style="display: ${user.profile_photo ? 'block' : 'none'}; width: 100px; height: 100px; border-radius: 50%; object-fit: cover;" />
          <div id="profileAvatarPlaceholder" style="display: ${user.profile_photo ? 'none' : 'flex'}; width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--hyper-accent-primary), var(--hyper-accent-cyan)); align-items: center; justify-content: center; font-size: 2.5rem; color: #fff; font-weight: bold;">
            ${user.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <input type="file" id="avatarUploadInput" style="display: none;" accept="image/*" onchange="SettingsModule.handleAvatarUpload(event)" />
            <button class="hyper-btn hyper-btn-outline" onclick="document.getElementById('avatarUploadInput').click()"><i data-lucide="upload"></i> Upload New Photo</button>
            <span style="font-size: 0.8rem; color: var(--hyper-text-muted);">JPG, GIF or PNG. Max size of 800K</span>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Full Name</h4>
            <p>Your name as it appears across NoteX AI.</p>
          </div>
          <div class="settings-form-control">
            <input type="text" id="settingsName" class="hyper-input" value="${user.name || ''}" placeholder="Jane Doe" />
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Public Username</h4>
            <p>Your unique NoteX handle (e.g. @janedoe).</p>
          </div>
          <div class="settings-form-control">
            <input type="text" id="settingsUsername" class="hyper-input" value="${user.username || ''}" placeholder="username" />
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Bio</h4>
            <p>A short bio to display on your profile.</p>
          </div>
          <div class="settings-form-control">
            <textarea id="settingsBio" class="hyper-input" rows="3" placeholder="Tell us about your studies...">${user.bio || ''}</textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
          <button class="hyper-btn hyper-btn-primary" id="saveProfileBtn" onclick="SettingsModule.saveSettings('Profile')"><i data-lucide="save"></i> Save Profile</button>
        </div>
      `,
      account: `
        <h2 class="settings-section-title">Account Settings</h2>
        <p class="settings-section-desc">Manage your email, phone, and account data.</p>
        
        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Email Address</h4>
            <p>The email associated with your account.</p>
          </div>
          <div class="settings-form-control">
            <input type="email" class="hyper-input" value="${user.email}" readonly />
            <button class="hyper-btn hyper-btn-outline hyper-btn-sm" style="margin-top: 0.5rem;"><i data-lucide="mail"></i> Change Email</button>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Phone Number</h4>
            <p>Used for SMS OTP verification and recovery.</p>
          </div>
          <div class="settings-form-control">
            <input type="tel" id="settingsPhone" class="hyper-input" value="${user.phone || ''}" placeholder="+1 (555) 000-0000" />
            <button class="hyper-btn hyper-btn-outline hyper-btn-sm" style="margin-top: 0.5rem;" onclick="SettingsModule.verifyPhone()"><i data-lucide="smartphone"></i> Verify Phone</button>
          </div>
        </div>

        <div class="settings-danger-zone">
          <h4>Danger Zone</h4>
          <p style="margin-bottom: 1rem;">Permanently delete your account and all associated data.</p>
          <button class="hyper-btn hyper-btn-primary" style="background: #EF4444; border-color: #EF4444;"><i data-lucide="trash-2"></i> Delete Account</button>
        </div>
      `,
      security: `
        <h2 class="settings-section-title">Security & Passwords</h2>
        <p class="settings-section-desc">Keep your account secure with 2FA and active session management.</p>
        
        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Change Password</h4>
            <p>Update your password to keep your account safe.</p>
          </div>
          <div class="settings-form-control" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <input type="password" class="hyper-input" placeholder="Current Password" />
            <input type="password" class="hyper-input" placeholder="New Password" />
            <button class="hyper-btn hyper-btn-outline"><i data-lucide="key"></i> Update Password</button>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Two-Factor Authentication (2FA)</h4>
            <p>Add an extra layer of security using an authenticator app or SMS.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox">
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Active Sessions</h4>
            <p>Review devices currently logged into your account.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <button class="hyper-btn hyper-btn-outline"><i data-lucide="log-out"></i> Logout All Devices</button>
          </div>
        </div>
      `,
      ai: `
        <h2 class="settings-section-title">AI Preferences</h2>
        <p class="settings-section-desc">Customize how NoteX AI responds and processes data.</p>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Default AI Model</h4>
            <p>Choose the engine used for Chat and Flashcards.</p>
          </div>
          <div class="settings-form-control">
            <select class="hyper-select">
              <option value="rag-fast">⚡ NoteX Fast (RAG Optimized)</option>
              <option value="gpt-4o">🧠 Advanced Science Engine (Deep Math)</option>
            </select>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>AI Streaming Responses</h4>
            <p>Watch the AI type its response in real-time.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox" checked>
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Smart Context Memory</h4>
            <p>Allow the AI to remember your previous questions to improve future answers.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox" checked>
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      `,
      appearance: `
        <h2 class="settings-section-title">Appearance</h2>
        <p class="settings-section-desc">Customize the look and feel of your NoteX workspace.</p>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Theme Mode</h4>
            <p>Select your preferred color scheme.</p>
          </div>
          <div class="settings-form-control">
            <select class="hyper-select" onchange="document.documentElement.setAttribute('data-theme', this.value)">
              <option value="light">☀️ Light Theme (Default)</option>
              <option value="dark">🌙 Dark Obsidian Theme</option>
            </select>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Floating Particles Background</h4>
            <p>Show floating math and science symbols in the app background.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox" checked onchange="SettingsModule.toggleCanvas(this.checked)">
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      `,
      notifications: `
        <h2 class="settings-section-title">Notifications</h2>
        <p class="settings-section-desc">Manage how and when we alert you.</p>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Email Study Reminders</h4>
            <p>Receive daily or weekly emails to keep up your study streak.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox" checked>
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Security Alerts</h4>
            <p>Get notified about new logins from unrecognized devices.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox" checked disabled>
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      `,
      storage: `
        <h2 class="settings-section-title">Storage & Files</h2>
        <p class="settings-section-desc">Manage your uploaded PDFs, notes, and cloud storage.</p>

        <div class="settings-form-row" style="flex-direction: column; align-items: flex-start; border: none; padding-bottom: 0;">
          <div style="width: 100%; display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">Storage Used</span>
            <span>120 MB / 1 GB <span class="settings-badge">Free Plan</span></span>
          </div>
          <div class="settings-usage-bar" style="width: 100%;">
            <div class="settings-usage-fill" style="width: 12%;"></div>
          </div>
        </div>
        
        <div style="margin-top: 2rem;">
          <button class="hyper-btn hyper-btn-outline"><i data-lucide="download-cloud"></i> Export All Notes & Chats</button>
        </div>
      `,
      integrations: `
        <h2 class="settings-section-title">App Integrations</h2>
        <p class="settings-section-desc">Connect external services to NoteX AI.</p>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Google Drive</h4>
            <p>Import PDFs and textbooks directly from Google Drive.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <button class="hyper-btn hyper-btn-outline">Connect Drive</button>
          </div>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Notion Export</h4>
            <p>Export your generated notes directly to a Notion workspace.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <button class="hyper-btn hyper-btn-outline">Connect Notion</button>
          </div>
        </div>
      `,
      billing: `
        <h2 class="settings-section-title">Billing & Subscription</h2>
        <p class="settings-section-desc">Manage your AI usage quotas and plan upgrades.</p>

        <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1)); border: 1px solid var(--hyper-accent-primary); border-radius: 16px; padding: 2rem; margin-bottom: 2rem;">
          <h3 style="margin-bottom: 0.5rem; color: var(--hyper-text-primary);">NoteX Pro <span class="settings-badge">Active</span></h3>
          <p style="color: var(--hyper-text-secondary); margin-bottom: 1.5rem;">You have unlimited RAG generations and 500 GPT-4o queries remaining this month.</p>
          <button class="hyper-btn hyper-btn-primary">Manage Subscription</button>
        </div>

        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Payment History</h4>
            <p>View your past invoices and receipts.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <button class="hyper-btn hyper-btn-outline">View Invoices</button>
          </div>
        </div>
      `,
      privacy: `
        <h2 class="settings-section-title">Privacy</h2>
        <p class="settings-section-desc">Control what data is shared and how it is used.</p>
        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>AI Model Training</h4>
            <p>Allow NoteX to use your anonymized chat interactions to improve our models.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <label class="settings-toggle">
              <input type="checkbox">
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      `,
      advanced: `
        <h2 class="settings-section-title">Advanced Settings</h2>
        <p class="settings-section-desc">Developer options and dangerous actions.</p>
        <div class="settings-form-row">
          <div class="settings-form-label">
            <h4>Generate API Key</h4>
            <p>Create a personal access token for programmatic access to NoteX AI.</p>
          </div>
          <div class="settings-form-control" style="text-align: right;">
            <button class="hyper-btn hyper-btn-outline"><i data-lucide="key"></i> Create Key</button>
          </div>
        </div>
      `
    };

    return tabs[tabId] || tabs['profile'];
  },

  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof UI !== 'undefined') UI.showToast("Uploading avatar...", "info");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Direct fetch due to FormData requirements
      const token = localStorage.getItem('notex_token');
      const response = await fetch('/api/auth/user/upload-avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const res = await response.json();

      if (res && res.success) {
        if (typeof UI !== 'undefined') UI.showToast("Avatar updated successfully", "success");
        const preview = document.getElementById('profileAvatarPreview');
        const placeholder = document.getElementById('profileAvatarPlaceholder');
        if (preview && placeholder) {
          preview.src = res.data.url;
          preview.style.display = 'block';
          placeholder.style.display = 'none';
        }
        if (typeof APP_STATE !== 'undefined' && APP_STATE.user) {
          APP_STATE.user.profile_photo = res.data.url;
          localStorage.setItem('notex_user', JSON.stringify(APP_STATE.user));
          if (typeof Auth !== 'undefined') Auth.updateUI();
        }
      } else {
        throw new Error(res.message);
      }
    } catch (e) {
      if (typeof UI !== 'undefined') UI.showToast(e.message || "Avatar upload failed", "error");
    }
  },

  async verifyPhone() {
    const phone = document.getElementById('settingsPhone').value;
    if (!phone) return;
    try {
      await API.post('/auth/send-phone-otp', { phone });
      UI.showToast("OTP sent to your phone via SMS (Mock).", "success");
      const otp = prompt("Enter the 6-digit OTP sent to your phone:");
      if (otp) {
        await API.post('/auth/verify-phone-otp', { phone, otp });
        UI.showToast("Phone verified successfully!", "success");
        await this.saveSettings('Account', { phone, phone_verified: true });
      }
    } catch(e) {
      UI.showToast(e.message || "Verification failed.", "error");
    }
  },

  async saveSettings(section, additionalData = {}) {
    const btnId = section === 'Profile' ? 'saveProfileBtn' : null;
    if (btnId) document.getElementById(btnId).innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    
    let payload = { ...additionalData };

    if (section === 'Profile') {
      payload.name = document.getElementById('settingsName')?.value;
      payload.username = document.getElementById('settingsUsername')?.value;
      payload.bio = document.getElementById('settingsBio')?.value;
    }

    try {
      const res = await API.put('/auth/user/settings', payload);
      if (res.success) {
        if (typeof UI !== 'undefined') {
          UI.showToast(`Successfully saved ${section} settings.`, 'success');
        }
        if (typeof APP_STATE !== 'undefined' && APP_STATE.user) {
          Object.assign(APP_STATE.user, payload);
          localStorage.setItem('notex_user', JSON.stringify(APP_STATE.user));
          if (typeof Auth !== 'undefined') Auth.updateUI();
        }
      }
    } catch (e) {
      if (typeof UI !== 'undefined') UI.showToast(e.message || "Failed to save settings.", "error");
    } finally {
      if (btnId) document.getElementById(btnId).innerHTML = `<i data-lucide="save"></i> Save Profile`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  toggleCanvas(checked) {
    const canvas = document.getElementById('scienceCanvas');
    if (canvas) {
      canvas.style.display = checked ? 'block' : 'none';
    }
  }
};

window.SettingsModule = SettingsModule;
