const UI = {
  showToast(message, type = 'info') {
    let container = document.getElementById('hyperToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hyperToastContainer';
      container.className = 'hyper-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `hyper-toast hyper-toast-${type}`;
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
  const navItems = document.querySelectorAll('.hyper-nav-item');
  const commandModal = document.getElementById('commandPaletteModal');

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Update Initial Class Label
  if (currentGradeLabel && typeof APP_STATE !== 'undefined') {
    currentGradeLabel.textContent = APP_STATE.currentGrade || 'Class 10';
  }

  // Keyboard Command Palette Listener (`⌘K` / `Ctrl+K`)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (commandModal) {
        commandModal.style.display = commandModal.style.display === 'flex' ? 'none' : 'flex';
        if (commandModal.style.display === 'flex') {
          document.getElementById('commandPaletteInput')?.focus();
        }
      }
    } else if (e.key === 'Escape' && commandModal) {
      commandModal.style.display = 'none';
    }
  });

  // Grade Modal Controls
  if (classSelectorBtn && gradeModal) {
    classSelectorBtn.addEventListener('click', () => {
      gradeModal.style.display = 'flex';
    });
  }

  if (closeGradeModal && gradeModal) {
    closeGradeModal.addEventListener('click', () => {
      gradeModal.style.display = 'none';
    });
  }

  // Class Selection Handler
  document.querySelectorAll('.grade-opt-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const selectedGrade = e.target.getAttribute('data-grade') || e.target.getAttribute('data-class');
      if (selectedGrade && typeof APP_STATE !== 'undefined') {
        APP_STATE.currentGrade = selectedGrade;
        localStorage.setItem('notex_grade', selectedGrade);
        if (currentGradeLabel) currentGradeLabel.textContent = selectedGrade;
        if (gradeModal) gradeModal.style.display = 'none';

        if (APP_STATE.token) {
          try {
            await API.post('/auth/update-class', { student_class: selectedGrade });
          } catch (err) {
            console.error('Failed to update class on server:', err);
          }
        }

        router();
      }
    });
  });

  // SPA Router
  async function router() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.activeView = hash;
    }

    navItems.forEach(item => {
      if (item.getAttribute('data-view') === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    switch (hash) {
      case 'chat':
      case 'chatbot':
        if (window.ChatbotModule) await ChatbotModule.render(container);
        break;
      case 'dashboard':
        if (window.DashboardModule) await DashboardModule.render(container);
        break;
      case 'library':
        if (window.LibraryModule) await LibraryModule.render(container);
        break;
      case 'rag':
        if (window.RAGModule) await RAGModule.render(container);
        break;
      case 'study-plan':
        if (window.StudyPlannerModule) await StudyPlannerModule.render(container);
        break;
      case 'notes':
        if (window.NotesModule) await NotesModule.render(container);
        break;
      case 'quizzes':
        if (window.QuizModule) await QuizModule.render(container);
        break;
      case 'flashcards':
        if (window.FlashcardsModule) await FlashcardsModule.render(container);
        break;
      case 'analytics':
        if (window.AnalyticsModule) await AnalyticsModule.render(container);
        break;
      case 'admin':
        if (window.AdminModule) await AdminModule.render(container);
        break;
      default:
        if (window.DashboardModule) await DashboardModule.render(container);
        break;
    }

    // Refresh Lucide Icons after view render
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  window.addEventListener('hashchange', router);
  router();
});
