/* noteX AI - Admin Panel Module Controller */
const AdminModule = {
  adminToken: null,

  async render(container) {
    if (!this.adminToken) {
      this.renderAdminLogin(container);
      return;
    }

    container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <div class="glass-card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(168, 85, 247, 0.2));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 700;"><i class="fa-solid fa-shield-halved" style="color: var(--accent-rose);"></i> noteX AI Admin Console</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem;">Isolated Administrative Dashboard & User Management Portal.</p>
            </div>
            <button class="btn-glass-secondary" style="color: var(--accent-rose);" onclick="AdminModule.logoutAdmin()">
              <i class="fa-solid fa-right-from-bracket"></i> Admin Logout
            </button>
          </div>
        </div>

        <!-- Admin System Overview Metrics -->
        <div class="metrics-grid" style="margin-bottom: 1.5rem;">
          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-cyan); background: rgba(6, 182, 212, 0.15);"><i class="fa-solid fa-users"></i></div>
            <div>
              <div class="metric-val" id="adminTotalUsersVal">--</div>
              <div class="metric-label">Registered Platform Users</div>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-indigo); background: rgba(99, 102, 241, 0.15);"><i class="fa-solid fa-file-pdf"></i></div>
            <div>
              <div class="metric-val" id="adminTotalDocsVal">--</div>
              <div class="metric-label">Indexed PDF Documents</div>
            </div>
          </div>

          <div class="glass-card metric-card">
            <div class="metric-icon" style="color: var(--accent-emerald); background: rgba(16, 185, 129, 0.15);"><i class="fa-solid fa-server"></i></div>
            <div>
              <div class="metric-val" style="color: var(--accent-emerald);">Healthy</div>
              <div class="metric-label">Flask Server & ChromaDB Status</div>
            </div>
          </div>
        </div>

        <!-- User Management Table -->
        <div class="glass-card section-card" style="margin-bottom: 1.5rem;">
          <div class="section-title">
            <span><i class="fa-solid fa-users-gear" style="color: var(--accent-cyan); margin-right: 0.5rem;"></i> User Management</span>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
                  <th style="padding: 0.75rem;">Name</th>
                  <th style="padding: 0.75rem;">Email</th>
                  <th style="padding: 0.75rem;">Class</th>
                  <th style="padding: 0.75rem;">Role</th>
                  <th style="padding: 0.75rem;">Status</th>
                  <th style="padding: 0.75rem;">Action</th>
                </tr>
              </thead>
              <tbody id="adminUserTableBody">
                <tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--text-secondary);">Loading user accounts...</td></tr>
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
      <div class="glass-card section-card animate-fade-in" style="max-width: 440px; margin: 3rem auto; padding: 2rem; border-top: 4px solid var(--accent-rose);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <i class="fa-solid fa-user-shield" style="font-size: 3rem; color: var(--accent-rose); margin-bottom: 0.75rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 700;">Admin Console Login</h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">Enter Admin Credentials to access system controls.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Admin Email:</label>
            <input type="email" id="adminEmailInput" class="glass-input" placeholder="admin@notex.ai">
          </div>

          <div>
            <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Password:</label>
            <input type="password" id="adminPasswordInput" class="glass-input" placeholder="••••••••">
          </div>

          <button class="btn-glass" style="background: linear-gradient(135deg, var(--accent-rose), var(--accent-indigo)); margin-top: 0.5rem;" onclick="AdminModule.handleAdminLogin()">
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

    const email = (emailInput ? emailInput.value : '').trim();
    const password = passInput ? passInput.value : '';

    if (!email || !password) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--accent-rose)';
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
        const container = document.getElementById('mainContentArea');
        if (container) await this.render(container);
      } else {
        if (statusDiv) {
          statusDiv.style.color = 'var(--accent-rose)';
          statusDiv.textContent = res.message || 'Admin authentication failed.';
        }
      }
    } catch (e) {
      if (statusDiv) {
        statusDiv.style.color = 'var(--accent-rose)';
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
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 0.75rem; font-weight: 600;">${u.name}</td>
              <td style="padding: 0.75rem; color: var(--text-secondary);">${u.email}</td>
              <td style="padding: 0.75rem;">${u.student_class || 'Class 10'}</td>
              <td style="padding: 0.75rem;"><span class="grade-badge-selector" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">${(u.role || 'user').toUpperCase()}</span></td>
              <td style="padding: 0.75rem; color: var(--accent-emerald);">Active</td>
              <td style="padding: 0.75rem;">
                <button class="btn-glass-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--accent-amber);" onclick="AdminModule.toggleUser('${u.id}')">
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
