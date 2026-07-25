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

  async requestPasswordReset(email) {
    try {
      const res = await API.post('/auth/forgot-password', { email }, { skipAuthRedirect: true });
      if (res && res.success) {
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(res.message || 'OTP sent to your email!', 'success');
        }
        return res;
      }
      throw new Error(res.message || 'Failed to request OTP');
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Failed to request OTP', 'error');
      }
      throw err;
    }
  },

  async verifyPasswordResetOTP(email, otp_code) {
    try {
      const res = await API.post('/auth/verify-otp', { email, otp_code, purpose: 'forgot_password' }, { skipAuthRedirect: true });
      if (res && res.success) {
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast('OTP verified successfully!', 'success');
        }
        return res;
      }
      throw new Error(res.message || 'OTP verification failed');
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'OTP verification failed', 'error');
      }
      throw err;
    }
  },

  async submitNewPassword(email, otp_code, new_password) {
    try {
      const res = await API.post('/auth/reset-password', { email, otp_code, new_password }, { skipAuthRedirect: true });
      if (res && res.success) {
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(res.message || 'Password reset successfully!', 'success');
        }
        return res;
      }
      throw new Error(res.message || 'Password reset failed');
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Password reset failed', 'error');
      }
      throw err;
    }
  },

  async googleLogin(credential) {
    try {
      const res = await API.post('/auth/google-login', { credential }, { skipAuthRedirect: true });
      if (res && res.success && res.data) {
        this.setSession(res.data.user, res.data.access_token, res.data.refresh_token);
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(`Welcome, ${res.data.user.name || 'Student'}!`, 'success');
        }
        AuthModal.hide();
        return res.data;
      }
      throw new Error(res.message || 'Google Login failed');
    } catch (err) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(err.message || 'Google Login failed', 'error');
      }
      throw err;
    }
  },

  updateUI() {
    const user = (typeof APP_STATE !== 'undefined' && APP_STATE.user) || JSON.parse(localStorage.getItem('notex_user') || 'null');
    const profileSection = document.getElementById('sidebarAuthProfileSection');

    if (profileSection) {
      if (user) {
        const firstLetter = (user.name || 'Student').charAt(0).toUpperCase();
        
        // Display profile photo if available, else show initials
        const avatarHTML = user.profile_photo 
          ? `<img src="${user.profile_photo}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--hyper-accent-primary-light);">`
          : `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--hyper-accent-primary), var(--hyper-accent-cyan)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0;">${firstLetter}</div>`;

        profileSection.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem; overflow: hidden;">
              ${avatarHTML}
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
  mode: 'login', // 'login', 'register', 'forgot', 'verify_otp', 'reset_password', 'success'
  resetEmail: '',
  resetOTP: '',

  show(mode = 'login') {
    this.mode = mode;
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const title = document.getElementById('authModalTitle');
    const sub = document.getElementById('authModalSubtitle');
    const nameGrp = document.getElementById('authNameGroup');
    const pwdGrp = document.getElementById('authPasswordGroup');
    const forgotLink = document.getElementById('authForgotLink');
    const otpGrp = document.getElementById('authOtpGroup');
    const newPwdGrp = document.getElementById('authNewPasswordGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const footerDiv = document.getElementById('authModalFooter');

    // Reset visibility defaults
    if (nameGrp) nameGrp.style.display = 'none';
    if (pwdGrp) pwdGrp.style.display = 'block';
    if (forgotLink) forgotLink.style.display = 'inline-block';
    if (otpGrp) otpGrp.style.display = 'none';
    if (newPwdGrp) newPwdGrp.style.display = 'none';
    if (footerDiv) footerDiv.style.display = 'block';

    if (mode === 'register') {
      if (title) title.textContent = 'Create Student Account';
      if (sub) sub.textContent = 'Sign up for personalized AI study plans and notes.';
      if (nameGrp) nameGrp.style.display = 'block';
      if (forgotLink) forgotLink.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Register Account';
      if (footerDiv) footerDiv.innerHTML = `<span>Already have an account?</span> <a href="javascript:void(0)" onclick="AuthModal.show('login')" style="color: var(--hyper-accent-primary); font-weight: 600; text-decoration: none; margin-left: 0.25rem;">Sign In</a>`;
    } else if (mode === 'forgot') {
      if (title) title.textContent = 'Forgot Password';
      if (sub) sub.textContent = 'Enter your registered email address to receive a 6-digit OTP code.';
      if (pwdGrp) pwdGrp.style.display = 'none';
      if (forgotLink) forgotLink.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Send Verification OTP';
      if (footerDiv) footerDiv.innerHTML = `<a href="javascript:void(0)" onclick="AuthModal.show('login')" style="color: var(--hyper-accent-primary); font-weight: 600; text-decoration: none;">← Back to Sign In</a>`;
    } else if (mode === 'verify_otp') {
      if (title) title.textContent = 'Verify 6-Digit OTP';
      if (sub) sub.textContent = `Enter the verification code sent to ${this.resetEmail}.`;
      if (pwdGrp) pwdGrp.style.display = 'none';
      if (forgotLink) forgotLink.style.display = 'none';
      if (otpGrp) otpGrp.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Verify OTP Code';
      if (footerDiv) footerDiv.innerHTML = `<span>Didn't receive code?</span> <a href="javascript:void(0)" onclick="AuthModal.resendOTP()" style="color: var(--hyper-accent-primary); font-weight: 600; text-decoration: none; margin-left: 0.25rem;">Resend OTP</a>`;
    } else if (mode === 'reset_password') {
      if (title) title.textContent = 'Set New Password';
      if (sub) sub.textContent = 'Enter your new secure password below.';
      if (pwdGrp) pwdGrp.style.display = 'none';
      if (forgotLink) forgotLink.style.display = 'none';
      if (newPwdGrp) newPwdGrp.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Reset Password';
      if (footerDiv) footerDiv.style.display = 'none';
    } else if (mode === 'success') {
      if (title) title.textContent = 'Password Reset Successful!';
      if (sub) sub.textContent = 'Your password has been updated. You can now log in.';
      if (pwdGrp) pwdGrp.style.display = 'none';
      if (forgotLink) forgotLink.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Proceed to Sign In';
      if (footerDiv) footerDiv.style.display = 'none';
    } else {
      // Default Login Mode
      if (title) title.textContent = 'Student Account Login';
      if (sub) sub.textContent = 'Sign in to save your AI notes, quizzes & progress.';
      if (submitBtn) submitBtn.textContent = 'Sign In';
      if (footerDiv) footerDiv.innerHTML = `<span>Don't have an account?</span> <a href="javascript:void(0)" onclick="AuthModal.show('register')" style="color: var(--hyper-accent-primary); font-weight: 600; text-decoration: none; margin-left: 0.25rem;">Register Now</a>`;
    }

    modal.style.display = 'flex';
  },

  hide() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
  },

  async resendOTP() {
    if (!this.resetEmail) return;
    try {
      await Auth.requestPasswordReset(this.resetEmail);
    } catch (err) {}
  },

  async submit() {
    const email = document.getElementById('authEmailInput')?.value.trim();
    const password = document.getElementById('authPasswordInput')?.value.trim();
    const name = document.getElementById('authNameInput')?.value.trim();
    const otpCode = document.getElementById('authOtpInput')?.value.trim();
    const newPassword = document.getElementById('authNewPasswordInput')?.value.trim();
    const submitBtn = document.getElementById('authSubmitBtn');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
    }

    try {
      if (this.mode === 'register') {
        if (!email || !password) return;
        await Auth.register(name || 'Student', email, password);
        this.hide();
      } else if (this.mode === 'forgot') {
        if (!email) return;
        this.resetEmail = email;
        const res = await Auth.requestPasswordReset(email);
        if (res && res.data && res.data.otp_preview) {
          console.log("[Failsafe OTP Preview]:", res.data.otp_preview);
        }
        this.show('verify_otp');
      } else if (this.mode === 'verify_otp') {
        if (!otpCode) return;
        this.resetOTP = otpCode;
        await Auth.verifyPasswordResetOTP(this.resetEmail, otpCode);
        this.show('reset_password');
      } else if (this.mode === 'reset_password') {
        if (!newPassword) return;
        await Auth.submitNewPassword(this.resetEmail, this.resetOTP, newPassword);
        this.show('success');
      } else if (this.mode === 'success') {
        this.show('login');
      } else {
        if (!email || !password) return;
        await Auth.login(email, password);
        this.hide();
      }
    } catch (err) {
      // Handled via toast
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = (this.mode === 'login' ? 'Sign In' : (this.mode === 'register' ? 'Register Account' : 'Continue'));
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateUI();
});

// Global callback for Google Identity Services SDK
window.handleGoogleCredentialResponse = async (response) => {
  if (response && response.credential) {
    try {
      await Auth.googleLogin(response.credential);
    } catch (e) {
      console.error("Google login failed", e);
    }
  }
};
