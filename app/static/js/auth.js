/* noteX AI - Role-Based Auth State Manager & Auth Modal Controller */
const Auth = {
  setSession(user, token, refreshToken) {
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.user = user;
      APP_STATE.token = token;
    }
    localStorage.setItem('notex_user', JSON.stringify(user));
    localStorage.setItem('notex_token', token);
    if (refreshToken) {
      localStorage.setItem('notex_refresh_token', refreshToken);
    }
    this.updateUI();

    // Redirect Admin users automatically to Admin Dashboard
    if (user && user.role === 'admin') {
      window.location.hash = '#admin';
    }
  },

  clearSession() {
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.user = null;
      APP_STATE.token = null;
    }
    localStorage.removeItem('notex_user');
    localStorage.removeItem('notex_token');
    localStorage.removeItem('notex_refresh_token');
    this.updateUI();
    window.location.hash = '#dashboard';
  },

  handleUnauthorized() {
    this.clearSession();
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast('Please log in to continue.', 'error');
    }
    AuthModal.show('login');
  },

  async login(email, password) {
    try {
      const res = await API.post('/auth/login', { email, password }, { skipAuthRedirect: true });
      if (res && res.success && res.data) {
        this.setSession(res.data.user, res.data.access_token, res.data.refresh_token);
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(`Welcome back, ${res.data.user.name || 'Student'}!`, 'success');
        }
        return res.data;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Login failed', 'error');
      }
      throw err;
    }
  },

  async register(name, email, password, studentClass = 'Class 10') {
    try {
      const res = await API.post('/auth/register', { name, email, password, student_class: studentClass }, { skipAuthRedirect: true });
      if (res && res.success && res.data) {
        this.setSession(res.data.user, res.data.access_token, res.data.refresh_token);
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast('Account registered successfully!', 'success');
        }
        return res.data;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Registration failed', 'error');
      }
      throw err;
    }
  },

  updateUI() {
    const user = (typeof APP_STATE !== 'undefined' && APP_STATE.user) || JSON.parse(localStorage.getItem('notex_user') || 'null');
    const profileSection = document.getElementById('sidebarAuthProfileSection');

    if (profileSection) {
      if (user) {
        // Authenticated Student Profile Pill
        const firstLetter = (user.name || 'Student').charAt(0).toUpperCase();
        profileSection.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem; overflow: hidden;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--hyper-accent-primary), var(--hyper-accent-cyan)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0;">${firstLetter}</div>
              <div style="overflow: hidden;">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--hyper-text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${user.name || 'Student'}</div>
                <div style="font-size: 0.72rem; color: var(--hyper-accent-cyan); font-weight: 500;">${user.student_class || 'Class 10'} • ${user.role || 'student'}</div>
              </div>
            </div>
            <button onclick="Auth.clearSession()" style="background: none; border: none; color: var(--hyper-text-muted); cursor: pointer; padding: 0.35rem;" title="Logout">
              <i class="fa-solid fa-right-from-bracket" style="font-size: 0.85rem;"></i>
            </button>
          </div>
        `;
      } else {
        // Guest User Login / Register Trigger
        profileSection.innerHTML = `
          <button class="hyper-btn hyper-btn-primary hyper-btn-sm" style="width: 100%; border-radius: var(--hyper-radius-sm);" onclick="AuthModal.show('login')">
            <i class="fa-solid fa-user-lock"></i> Login / Register
          </button>
        `;
      }
    }
  }
};

const AuthModal = {
  mode: 'login',

  show(mode = 'login') {
    this.mode = mode;
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const title = document.getElementById('authModalTitle');
    const sub = document.getElementById('authModalSubtitle');
    const nameGrp = document.getElementById('authNameGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const prompt = document.getElementById('authTogglePrompt');
    const link = document.getElementById('authToggleLink');

    if (mode === 'register') {
      if (title) title.textContent = 'Create Student Account';
      if (sub) sub.textContent = 'Sign up for personalized AI study plans and notes.';
      if (nameGrp) nameGrp.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Register Account';
      if (prompt) prompt.textContent = 'Already have an account?';
      if (link) link.textContent = 'Sign In';
    } else {
      if (title) title.textContent = 'Student Account Login';
      if (sub) sub.textContent = 'Sign in to save your AI notes, quizzes & progress.';
      if (nameGrp) nameGrp.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Sign In';
      if (prompt) prompt.textContent = "Don't have an account?";
      if (link) link.textContent = 'Register Now';
    }

    modal.style.display = 'flex';
  },

  hide() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
  },

  toggleMode() {
    this.show(this.mode === 'login' ? 'register' : 'login');
  },

  async submit() {
    const email = document.getElementById('authEmailInput')?.value.trim();
    const password = document.getElementById('authPasswordInput')?.value.trim();
    const name = document.getElementById('authNameInput')?.value.trim();

    if (!email || !password) return;

    try {
      if (this.mode === 'register') {
        await Auth.register(name || 'Student', email, password);
      } else {
        await Auth.login(email, password);
      }
      this.hide();
    } catch (err) {
      // Error handled by Auth functions
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateUI();
});
