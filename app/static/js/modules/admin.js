/* noteX AI - Admin Console View Controller (Hyper Pro) */
const AdminModule = {
  adminToken: null,

  async render(container) {
    if (!this.adminToken) {
      this.renderAdminLogin(container);
      return;
    }

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(168, 85, 247, 0.2)); border-color: rgba(239, 68, 68, 0.3); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-rose" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-user-shield"></i> Security Portal</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">noteX AI Admin Console</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Isolated Administrative Dashboard & User Management Portal.
              </p>
            </div>
            <button class="hyper-btn hyper-btn-danger hyper-btn-sm" onclick="AdminModule.logoutAdmin()">
              <i class="fa-solid fa-right-from-bracket"></i> Admin Logout
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="hyper-card hyper-col-4">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-cyan-light); color: var(--hyper-accent-cyan); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              <i class="fa-solid fa-users"></i>
            </div>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800;" id="adminTotalUsersVal">--</div>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Registered Users</div>
            </div>
          </div>
        </div>

        <div class="hyper-card hyper-col-4">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-primary-light); color: var(--hyper-accent-primary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              <i class="fa-solid fa-file-pdf"></i>
            </div>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800;" id="adminTotalDocsVal">--</div>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Indexed PDFs</div>
            </div>
          </div>
        </div>

        <div class="hyper-card hyper-col-4">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--hyper-radius-sm); background: var(--hyper-accent-emerald-light); color: var(--hyper-accent-emerald); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              <i class="fa-solid fa-server"></i>
            </div>
            <div>
              <div style="font-size: 1.6rem; font-weight: 800; color: var(--hyper-accent-emerald);">Healthy</div>
              <div style="font-size: 0.82rem; color: var(--hyper-text-muted);">Flask Server & Database Engine</div>
            </div>
          </div>
        </div>

        <!-- User Management Table Card -->
        <div class="hyper-card hyper-col-12">
          <div class="hyper-card-header">
            <div class="hyper-card-title">
              <i class="fa-solid fa-users-gear" style="color: var(--hyper-accent-cyan);"></i> User Management
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--hyper-border-subtle); color: var(--hyper-text-muted);">
                  <th style="padding: 0.85rem;">Name</th>
                  <th style="padding: 0.85rem;">Email</th>
                  <th style="padding: 0.85rem;">Class</th>
                  <th style="padding: 0.85rem;">Role</th>
                  <th style="padding: 0.85rem;">Status</th>
                  <th style="padding: 0.85rem;">Action</th>
                </tr>
              </thead>
              <tbody id="adminUserTableBody">
                <tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--hyper-text-muted);">Loading user accounts...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    await this.loadAdminData();
  },

  renderAdminLogin(container) {
    container.innerHTML = `
      <div class="hyper-card" style="max-width: 440px; margin: 3rem auto; padding: 2rem; border-top: 4px solid var(--hyper-accent-rose);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <i class="fa-solid fa-user-shield" style="font-size: 3rem; color: var(--hyper-accent-rose); margin-bottom: 0.75rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--hyper-text-primary);">Admin Console Login</h2>
          <p style="color: var(--hyper-text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Enter Admin Credentials to access system controls.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Admin Email:</label>
            <input type="email" id="adminEmailInput" class="hyper-input" placeholder="admin@notex.ai">
          </div>

          <div>
            <label style="font-size: 0.85rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Password:</label>
            <input type="password" id="adminPasswordInput" class="hyper-input" placeholder="••••••••">
          </div>

          <button class="hyper-btn hyper-btn-danger" style="margin-top: 0.5rem;" onclick="AdminModule.handleAdminLogin()">
            Authenticate Admin
          </button>

          <div id="adminLoginStatus" style="font-size: 0.85rem; text-align: center;"></div>
        </div>
      </div>
    `;
  },

  async handleAdminLogin() {
    const emailInput = document.getElementById('adminEmailInput');
    const passInput = document.getElementById('adminPasswordInput');
    const statusDiv = document.getElementById('adminLoginStatus');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !password) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--hyper-accent-rose)';
        statusDiv.textContent = 'Please enter admin email and password.';
      }
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const res = await response.json();

      if (response.ok && res.success) {
        this.adminToken = res.data.access_token;
        const container = document.getElementById('app-view-container');
        if (container) await this.render(container);
      } else {
        if (statusDiv) {
          statusDiv.style.color = 'var(--hyper-accent-rose)';
          statusDiv.textContent = res.message || 'Admin authentication failed.';
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--hyper-accent-rose)';
        statusDiv.textContent = `Error: ${e.message}`;
      }
    }
  },

  async loadAdminData() {
    try {
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${this.adminToken}` }
      });
      const sData = await statsRes.json();
      if (sData && sData.success && sData.data.stats) {
        document.getElementById('adminTotalUsersVal').textContent = sData.data.stats.total_users;
        document.getElementById('adminTotalDocsVal').textContent = sData.data.stats.total_documents;
      }

      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${this.adminToken}` }
      });
      const uData = await usersRes.json();
      if (uData && uData.success && uData.data.users) {
        const tbody = document.getElementById('adminUserTableBody');
        if (tbody) {
          tbody.innerHTML = uData.data.users.map(u => `
            <tr style="border-bottom: 1px solid var(--hyper-border-subtle);">
              <td style="padding: 0.85rem; font-weight: 600; color: var(--hyper-text-primary);">${u.name}</td>
              <td style="padding: 0.85rem; color: var(--hyper-text-muted);">${u.email}</td>
              <td style="padding: 0.85rem; color: var(--hyper-text-secondary);">${u.student_class || 'Class 10'}</td>
              <td style="padding: 0.85rem;"><span class="hyper-badge hyper-badge-primary">${(u.role || 'user').toUpperCase()}</span></td>
              <td style="padding: 0.85rem; color: var(--hyper-accent-emerald);">Active</td>
              <td style="padding: 0.85rem;">
                <button class="hyper-btn hyper-btn-glass hyper-btn-sm" style="color: var(--hyper-accent-amber);" onclick="AdminModule.toggleUser('${u.id}')">
                  Toggle Status
                </button>
              </td>
            </tr>
          `).join('');
        }
      }
    } catch (e) {
      console.log('Admin data error:', e);
    }
  },

  async toggleUser(userId) {
    try {
      await fetch(`/api/admin/user/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${this.adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      });
      await this.loadAdminData();
    } catch (e) {
      console.error('Toggle user error:', e);
    }
  },

  logoutAdmin() {
    this.adminToken = null;
    location.hash = '#chat';
  }
};
