const UI = {
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app-view-container');
  const classSelectorBtn = document.getElementById('classSelectorBtn');
  const currentGradeLabel = document.getElementById('currentGradeLabel');
  const gradeModal = document.getElementById('gradeModal');
  const closeGradeModal = document.getElementById('closeGradeModal');
  const navItems = document.querySelectorAll('.nav-item');

  // Update Initial Class Label
  if (currentGradeLabel) {
    currentGradeLabel.textContent = APP_STATE.currentGrade;
  }

  // Grade Modal Controls
  if (classSelectorBtn) {
    classSelectorBtn.addEventListener('click', () => {
      gradeModal.style.display = 'block';
    });
  }

  if (closeGradeModal) {
    closeGradeModal.addEventListener('click', () => {
      gradeModal.style.display = 'none';
    });
  }

  // Class Selection Handler
  document.querySelectorAll('.grade-opt-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const selectedGrade = e.target.getAttribute('data-class');
      if (selectedGrade) {
        APP_STATE.currentGrade = selectedGrade;
        localStorage.setItem('notex_grade', selectedGrade);
        if (currentGradeLabel) currentGradeLabel.textContent = selectedGrade;
        gradeModal.style.display = 'none';

        // Update backend user grade if authenticated
        if (APP_STATE.token) {
          try {
            await API.post('/auth/update-class', { student_class: selectedGrade });
          } catch (err) {
            console.error('Failed to update class on server:', err);
          }
        }

        // Re-render active view
        router();
      }
    });
  });

  // SPA Hash Router
  async function router() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    APP_STATE.activeView = hash;

    // Update active nav link
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Render corresponding view module
    switch (hash) {
      case 'chat':
      case 'chatbot':
        await ChatbotModule.render(container);
        break;
      case 'dashboard':
        await DashboardModule.render(container);
        break;
      case 'library':
        await LibraryModule.render(container);
        break;
      case 'rag':
        await RAGModule.render(container);
        break;
      case 'study-plan':
        await StudyPlannerModule.render(container);
        break;
      case 'notes':
        await NotesModule.render(container);
        break;
      case 'quizzes':
        await QuizModule.render(container);
        break;
      case 'flashcards':
        await FlashcardsModule.render(container);
        break;
      case 'analytics':
        await AnalyticsModule.render(container);
        break;
      case 'admin':
        await AdminModule.render(container);
        break;
      default:
        await ChatbotModule.render(container);
        break;
    }
  }

  window.addEventListener('hashchange', router);
  router();
});
