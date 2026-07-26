/* noteX AI - Frontend Configuration & Global State */
const CONFIG = {
  API_BASE_URL: '/api',
  DEFAULT_GRADE: 'Class 10',
  SUPPORTED_GRADES: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ]
};

let cachedUser = null;
try {
  cachedUser = JSON.parse(localStorage.getItem('notex_user'));
} catch (e) {
  localStorage.removeItem('notex_user');
}

const APP_STATE = {
  activeView: 'dashboard',
  currentGrade: localStorage.getItem('notex_grade') || CONFIG.DEFAULT_GRADE,
  user: cachedUser,
  token: localStorage.getItem('notex_token') || null
};
