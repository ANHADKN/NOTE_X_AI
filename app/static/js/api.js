/* noteX AI - Unified Fetch API Client */
const API = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (APP_STATE.token) {
      headers['Authorization'] = `Bearer ${APP_STATE.token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !options.silent) {
          console.warn(`[API Session] ${endpoint} requires auth.`);
        }
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      if (!options.silent) {
        console.warn(`[API Handled] ${endpoint}:`, error.message);
      }
      throw error;
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
  }
};
