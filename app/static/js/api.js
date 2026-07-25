/* noteX AI - Unified Fetch API Client with Automatic JWT Authorization Header Injection */
const API = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    // Automatically retrieve stored JWT token from localStorage or APP_STATE
    const token = localStorage.getItem('notex_token') || 
                  sessionStorage.getItem('notex_token') || 
                  (typeof APP_STATE !== 'undefined' ? APP_STATE.token : null);
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Inject Authorization: Bearer <token> to every protected API request
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (typeof APP_STATE !== 'undefined') {
        APP_STATE.token = token;
      }
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized globally: redirect/prompt login instead of raw error
        if (response.status === 401) {
          console.warn(`[API Auth] 401 Unauthorized on ${endpoint}: ${data.message || 'Token missing/invalid'}`);
          
          if (!options.skipAuthRedirect) {
            this.handleUnauthorized(data.message);
          }
        }
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      if (!options.silent) {
        console.warn(`[API Exception] ${endpoint}:`, error.message);
      }
      throw error;
    }
  },

  handleUnauthorized(message = 'Please log in to access this feature.') {
    // Clear stale session
    localStorage.removeItem('notex_token');
    localStorage.removeItem('notex_user');
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.token = null;
      APP_STATE.user = null;
    }

    // Trigger Auth UI modal or prompt
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(message, 'error');
    }

    if (typeof AuthModal !== 'undefined' && AuthModal.show) {
      AuthModal.show('login');
    } else if (typeof Auth !== 'undefined' && Auth.clearSession) {
      Auth.clearSession();
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
};
