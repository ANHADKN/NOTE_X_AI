/* noteX AI - Auth State Manager */
const Auth = {
  setSession(user, token, refreshToken) {
    APP_STATE.user = user;
    APP_STATE.token = token;
    localStorage.setItem('notex_user', JSON.stringify(user));
    localStorage.setItem('notex_token', token);
    if (refreshToken) {
      localStorage.setItem('notex_refresh_token', refreshToken);
    }
    this.updateUI();
  },

  clearSession() {
    APP_STATE.user = null;
    APP_STATE.token = null;
    localStorage.removeItem('notex_user');
    localStorage.removeItem('notex_token');
    localStorage.removeItem('notex_refresh_token');
    this.updateUI();
  },

  updateUI() {
    const authBtnText = document.getElementById('authBtnText');
    if (authBtnText) {
      if (APP_STATE.user) {
        authBtnText.textContent = APP_STATE.user.name || 'Student Profile';
      } else {
        authBtnText.textContent = 'Login / Register';
      }
    }
  }
};
