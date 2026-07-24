/* noteX AI - Frontend Configuration & Global State */
const CONFIG = {
  API_BASE_URL: '/api',
  DEFAULT_GRADE: 'Class 10',
  SUPPORTED_GRADES: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ]
};

const APP_STATE = {
  activeView: 'dashboard',
  currentGrade: localStorage.getItem('notex_grade') || CONFIG.DEFAULT_GRADE,
  user: JSON.parse(localStorage.getItem('notex_user')) || null,
  token: localStorage.getItem('notex_token') || null
};
