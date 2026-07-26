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

    const maxRetries = options.retries !== undefined ? options.retries : 2;
    const timeoutMs = options.timeout !== undefined ? options.timeout : 10000;
    let attempt = 0;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      config.signal = controller.signal;

      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        let data;
        try {
            data = await response.json();
        } catch(e) {
            data = { message: "Invalid JSON response from server" };
        }

        if (!response.ok) {
          if (response.status === 401) {
            console.warn(`[API Auth] 401 Unauthorized on ${endpoint}: ${data.message || 'Token missing/invalid'}`);
            if (!options.skipAuthRedirect) {
              this.handleUnauthorized(data.message);
            }
          }
          // Don't retry client errors (4xx) except maybe 429
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(data.message || `HTTP Error ${response.status}`);
          }
          throw new Error(data.message || `HTTP Error ${response.status}`);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        const isTimeout = error.name === 'AbortError';
        const isClientError = error.message.includes('HTTP Error 4'); // Basic check so we don't retry 400s
        
        if (isClientError && !error.message.includes('429')) {
             if (!options.silent) console.warn(`[API Client Error] ${endpoint}:`, error.message);
             throw error;
        }

        if (attempt >= maxRetries) {
          if (!options.silent) {
            console.error(`[API Exception] ${endpoint} failed after ${attempt} retries:`, isTimeout ? "Timeout" : error.message);
          }
          throw new Error(isTimeout ? "Request timed out. Please try again." : error.message);
        }
        
        attempt++;
        if (!options.silent) console.warn(`[API Retry ${attempt}/${maxRetries}] ${endpoint}...`);
        await new Promise(res => setTimeout(res, 1000 * attempt)); // Exponential backoff
      }
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
