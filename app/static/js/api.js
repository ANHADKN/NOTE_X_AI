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
        if (response.status === 401) {
          console.warn('Unauthorized session. Please login.');
        }
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};
