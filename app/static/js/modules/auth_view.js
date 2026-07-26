/* noteX AI - Premium Full-Page Auth View Controller */

const AuthViewModule = {
  async render(container, mode = 'login') {
    if (!container) return;

    // Reset layout for auth view
    const sidebar = document.getElementById('mainSidebar');
    const topnav = document.getElementById('topNavbar');
    if (sidebar) sidebar.style.display = 'none';
    if (topnav) topnav.style.display = 'none';
    
    // Ensure container takes full screen width if sidebar is hidden
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.margin = '0';
    container.style.padding = '0';
    container.style.maxWidth = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.overflow = 'hidden';

    let rightPanelContent = '';

    if (mode === 'login') {
      rightPanelContent = this.getLoginHTML();
    } else if (mode === 'register') {
      rightPanelContent = this.getRegisterHTML();
    } else if (mode === 'forgot-password') {
      rightPanelContent = this.getForgotHTML();
    }

    container.innerHTML = `
      <div class="auth-split-layout">
        <!-- Left Pane: AI Illustration -->
        <div class="auth-left-pane">
          <div class="auth-aurora-bg"></div>
          <div class="auth-particles" id="authParticles"></div>
          <div class="auth-brand">
            <div class="auth-logo"><i data-lucide="brain-circuit"></i> NoteX AI</div>
          </div>
          <div class="auth-hero-content">
            <h1>Master Your Studies with Intelligence.</h1>
            <p>Join the next generation of students using NoteX AI to analyze textbooks, generate quizzes, and boost grades effortlessly.</p>
          </div>
          <!-- Decorative Floating Cards -->
          <div class="auth-floating-card card-1"><i data-lucide="zap"></i> Instant Notes</div>
          <div class="auth-floating-card card-2"><i data-lucide="target"></i> Perfect Scores</div>
          <div class="auth-floating-card card-3"><i data-lucide="sparkles"></i> AI Powered</div>
        </div>
        
        <!-- Right Pane: Glass Form -->
        <div class="auth-right-pane">
          ${rightPanelContent}
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    this.initParticles();
  },

  getLoginHTML() {
    return `
      <div class="auth-glass-form" id="loginForm">
        <div class="auth-form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your NoteX AI account</p>
        </div>
        <form onsubmit="event.preventDefault(); AuthViewModule.handleLogin();">
          <div class="auth-input-group">
            <label>Email, Username, or Phone</label>
            <div class="auth-input-wrapper">
              <i data-lucide="user"></i>
              <input type="text" id="loginEmail" placeholder="student@school.edu or @username" required />
            </div>
          </div>
          <div class="auth-input-group">
            <label>Password</label>
            <div class="auth-input-wrapper">
              <i data-lucide="lock"></i>
              <input type="password" id="loginPassword" placeholder="••••••••" required />
              <button type="button" class="auth-pwd-toggle" onclick="AuthViewModule.togglePassword('loginPassword')">
                <i data-lucide="eye"></i>
              </button>
            </div>
          </div>
          <div class="auth-form-actions">
            <label class="auth-checkbox">
              <input type="checkbox" id="rememberMe" />
              <span>Remember me</span>
            </label>
            <a href="#forgot-password" class="auth-link">Forgot Password?</a>
          </div>
          <button type="submit" class="auth-btn auth-btn-primary" id="loginBtn">
            <span>Sign In</span>
            <i data-lucide="arrow-right"></i>
          </button>
        </form>
        
        <div class="auth-divider"><span>or continue with</span></div>
        
        <div class="auth-social-grid">
          <button class="auth-social-btn" onclick="AuthViewModule.mockOAuth('Google')">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> Google
          </button>
          <button class="auth-social-btn" onclick="AuthViewModule.mockOAuth('Microsoft')">
            <img src="https://www.svgrepo.com/show/475666/microsoft-color.svg" alt="Microsoft"> Microsoft
          </button>
          <button class="auth-social-btn" onclick="AuthViewModule.mockOAuth('GitHub')">
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub"> GitHub
          </button>
        </div>
        
        <p class="auth-footer-text">
          Don't have an account? <a href="#register" class="auth-link-bold">Create Account</a>
        </p>
      </div>
    `;
  },

  getRegisterHTML() {
    return `
      <div class="auth-glass-form" id="registerForm">
        <div class="auth-form-header">
          <h2>Create Account</h2>
          <p>Join NoteX AI and transform your studying</p>
        </div>
        <form onsubmit="event.preventDefault(); AuthViewModule.handleRegister();">
          <div class="auth-input-grid">
            <div class="auth-input-group">
              <label>Full Name</label>
              <div class="auth-input-wrapper">
                <i data-lucide="user"></i>
                <input type="text" id="regName" placeholder="John Doe" required />
              </div>
            </div>
            <div class="auth-input-group">
              <label>Username <span id="usernameStatus" style="font-size:0.75rem; float:right;"></span></label>
              <div class="auth-input-wrapper">
                <i data-lucide="at-sign"></i>
                <input type="text" id="regUsername" placeholder="johndoe" required onblur="AuthViewModule.checkUsername(this.value)" />
              </div>
            </div>
          </div>
          
          <div class="auth-input-grid">
            <div class="auth-input-group">
              <label>Phone Number</label>
              <div class="auth-input-wrapper">
                <i data-lucide="phone"></i>
                <input type="tel" id="regPhone" placeholder="+1 (555) 000-0000" oninput="AuthViewModule.formatPhone(this)" />
              </div>
            </div>
            <div class="auth-input-group">
              <label>Email Address</label>
              <div class="auth-input-wrapper">
                <i data-lucide="mail"></i>
                <input type="email" id="regEmail" placeholder="student@school.edu" required />
              </div>
            </div>
          </div>
          
          <div class="auth-input-group">
            <label>Password</label>
            <div class="auth-input-wrapper">
              <i data-lucide="lock"></i>
              <input type="password" id="regPassword" placeholder="••••••••" required oninput="AuthViewModule.checkPasswordStrength(this.value)" />
              <button type="button" class="auth-pwd-toggle" onclick="AuthViewModule.togglePassword('regPassword')">
                <i data-lucide="eye"></i>
              </button>
            </div>
            <div class="auth-pwd-strength">
              <div class="strength-bar" id="strengthBar"></div>
              <span id="strengthText">Weak</span>
            </div>
          </div>

          <div class="auth-form-actions" style="margin-bottom: 1.5rem;">
            <label class="auth-checkbox">
              <input type="checkbox" id="termsCheck" required />
              <span>I agree to the <a href="#" class="auth-link">Terms</a> & <a href="#" class="auth-link">Privacy Policy</a></span>
            </label>
          </div>
          
          <button type="submit" class="auth-btn auth-btn-primary" id="regBtn">
            <span>Create Account</span>
            <i data-lucide="user-plus"></i>
          </button>
        </form>
        
        <div class="auth-divider"><span>or register with</span></div>
        <button class="auth-google-btn-wide" onclick="AuthViewModule.mockOAuth('Google')">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> Continue with Google
        </button>
        
        <p class="auth-footer-text">
          Already have an account? <a href="#login" class="auth-link-bold">Sign In</a>
        </p>
      </div>
    `;
  },

  getForgotHTML() {
    return `
      <div class="auth-glass-form" id="forgotForm">
        <button class="auth-back-btn" onclick="window.location.hash='#login'"><i data-lucide="arrow-left"></i> Back</button>
        <div class="auth-form-header" style="margin-top: 1rem;">
          <h2>Reset Password</h2>
          <p>We'll send you an OTP to reset your password</p>
        </div>
        <form onsubmit="event.preventDefault(); AuthViewModule.handleForgot();">
          <div class="auth-input-group">
            <label>Registered Email</label>
            <div class="auth-input-wrapper">
              <i data-lucide="mail"></i>
              <input type="email" id="forgotEmail" placeholder="student@school.edu" required />
            </div>
          </div>
          <button type="submit" class="auth-btn auth-btn-primary" id="forgotBtn">
            <span>Send OTP</span>
            <i data-lucide="send"></i>
          </button>
        </form>
      </div>
    `;
  },

  initParticles() {
    const container = document.getElementById('authParticles');
    if (!container) return;
    container.innerHTML = '';
    for(let i=0; i<30; i++) {
      const p = document.createElement('div');
      p.className = 'auth-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 5) + 's';
      p.style.animationDuration = (5 + Math.random() * 10) + 's';
      container.appendChild(p);
    }
  },

  togglePassword(id) {
    const input = document.getElementById(id);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  },

  async checkUsername(username) {
    if (!username) return;
    const status = document.getElementById('usernameStatus');
    status.textContent = 'Checking...';
    status.style.color = 'var(--auth-text-muted)';
    try {
      const res = await API.post('/auth/check-username', { username });
      if (res && res.data && res.data.available) {
        status.textContent = 'Available';
        status.style.color = '#10b981';
      } else {
        status.textContent = 'Taken';
        status.style.color = '#ef4444';
      }
    } catch (e) {
      status.textContent = '';
    }
  },

  formatPhone(input) {
    let cleaned = ('' + input.value).replace(/\D/g, '');
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
    let formatted = cleaned;
    if (cleaned.length > 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length > 3) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else if (cleaned.length > 0) {
      formatted = `(${cleaned}`;
    }
    input.value = formatted;
  },

  checkPasswordStrength(pwd) {
    const bar = document.getElementById('strengthBar');
    const txt = document.getElementById('strengthText');
    if(!bar || !txt) return;
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^A-Za-z0-9]/)) strength++;

    if (pwd.length === 0) {
      bar.style.width = '0%';
      bar.style.background = '#e2e8f0';
      txt.textContent = '';
    } else if (strength < 2) {
      bar.style.width = '33%';
      bar.style.background = '#ef4444';
      txt.textContent = 'Weak';
      txt.style.color = '#ef4444';
    } else if (strength === 2 || strength === 3) {
      bar.style.width = '66%';
      bar.style.background = '#f59e0b';
      txt.textContent = 'Medium';
      txt.style.color = '#f59e0b';
    } else {
      bar.style.width = '100%';
      bar.style.background = '#10b981';
      txt.textContent = 'Strong';
      txt.style.color = '#10b981';
    }
  },

  async handleLogin() {
    const btn = document.getElementById('loginBtn');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    btn.innerHTML = \`<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...\`;
    btn.disabled = true;

    try {
      if (typeof Auth !== 'undefined') {
        await Auth.login(email, password);
        this.cleanupLayout();
        window.location.hash = '#dashboard';
      }
    } catch (e) {
      const form = document.getElementById('loginForm');
      form.classList.add('error-shake');
      setTimeout(() => form.classList.remove('error-shake'), 500);
    } finally {
      btn.innerHTML = \`<span>Sign In</span><i data-lucide="arrow-right"></i>\`;
      btn.disabled = false;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  async handleRegister() {
    const btn = document.getElementById('regBtn');
    const email = document.getElementById('regEmail').value;
    const username = document.getElementById('regUsername').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value;
    
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
    btn.disabled = true;

    try {
      if (typeof Auth !== 'undefined') {
        // Assume Auth API is updated to support username and phone in a real system.
        await Auth.register(name, email, password);
        
        // Mock updating extra fields via settings endpoint after reg
        try {
            await API.put('/auth/user/settings', { username, phone });
        } catch(err) {}

        this.cleanupLayout();
        window.location.hash = '#dashboard';
      }
    } catch (e) {
      const form = document.getElementById('registerForm');
      form.classList.add('error-shake');
      setTimeout(() => form.classList.remove('error-shake'), 500);
    } finally {
      btn.innerHTML = `<span>Create Account</span><i data-lucide="user-plus"></i>`;
      btn.disabled = false;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  async handleForgot() {
    const btn = document.getElementById('forgotBtn');
    const email = document.getElementById('forgotEmail').value;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...`;
    btn.disabled = true;
    try {
      if (typeof Auth !== 'undefined') {
        await Auth.requestPasswordReset(email);
        UI.showToast("OTP sent. Check your email.", "success");
        // In a real app we'd transition to OTP verify mode here.
      }
    } catch (e) {
    } finally {
      btn.innerHTML = `<span>Send OTP</span><i data-lucide="send"></i>`;
      btn.disabled = false;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  mockOAuth(provider) {
    if (provider === 'Google') {
        window.location.href = '/api/auth/google/login';
        return;
    }
    
    UI.showToast(`Redirecting to ${provider} OAuth...`, 'info');
    setTimeout(() => {
        window.location.href = `/api/auth/${provider.toLowerCase()}/login`;
    }, 1500);
  },

  cleanupLayout() {
    const sidebar = document.getElementById('mainSidebar');
    const topnav = document.getElementById('topNavbar');
    const container = document.getElementById('app-view-container');
    if (sidebar) sidebar.style.display = '';
    if (topnav) topnav.style.display = '';
    container.style = '';
  }
};

window.AuthViewModule = AuthViewModule;
