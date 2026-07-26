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

window.addEventListener('error', function(event) {
  console.error('[Global Error]', event.error);
  const targetContainer = document.getElementById('app-view-container');
  if (targetContainer) {
    targetContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--hyper-text-secondary); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--hyper-bg-base);">
        <i data-lucide="alert-triangle" style="width: 64px; height: 64px; color: var(--hyper-accent-rose); margin-bottom: 1rem;"></i>
        <h2 style="color: var(--hyper-text-primary); margin-bottom: 0.5rem;">Something went wrong</h2>
        <p style="margin-bottom: 1.5rem; max-width: 400px;">We encountered an unexpected error. Don't worry, your data is safe.</p>
        <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.85rem; color: var(--hyper-accent-rose); margin-bottom: 2rem; max-width: 600px; text-align: left; overflow: auto; border: 1px solid rgba(239, 68, 68, 0.2);">
            ${event.message || 'Unknown Error'}
        </div>
        <button class="hyper-btn hyper-btn-primary" onclick="window.location.reload()">Reload Application</button>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('[Unhandled Promise Rejection]', event.reason);
  UI.showToast("An unexpected background error occurred.", "error");
});

document.addEventListener('DOMContentLoaded', () => {
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

  // Update Auth Profile UI
  if (typeof Auth !== 'undefined' && Auth.updateUI) {
    Auth.updateUI();
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

  // Role-Based SPA Router with Security Guarding
  async function router() {
    const targetContainer = document.getElementById('app-view-container');
    if (!targetContainer) return;

    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (typeof APP_STATE !== 'undefined') {
      APP_STATE.activeView = hash;
    }

    const navItems = document.querySelectorAll('.nx30-nav-item, .hyper-dock-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const token = localStorage.getItem('notex_token');
    
    // Auth route guarding
    if (!token && !['login', 'register', 'forgot-password'].includes(hash)) {
      window.location.hash = '#login';
      return;
    }
    
    // Redirect authenticated users away from auth pages
    if (token && ['login', 'register', 'forgot-password'].includes(hash)) {
      window.location.hash = '#dashboard';
      return;
    }

    try {
      switch (hash) {
        case 'login':
        case 'register':
        case 'forgot-password':
          if (typeof AuthViewModule !== 'undefined') await AuthViewModule.render(targetContainer, hash);
          break;
        case 'chat':
        case 'chatbot':
          if (typeof ChatbotModule !== 'undefined') await ChatbotModule.render(targetContainer);
          break;
        case 'dashboard':
          if (typeof DashboardModule !== 'undefined') await DashboardModule.render(targetContainer);
          break;
        case 'library':
          if (typeof LibraryModule !== 'undefined') await LibraryModule.render(targetContainer);
          break;
        case 'rag':
          if (typeof RAGModule !== 'undefined') await RAGModule.render(targetContainer);
          break;
        case 'study-plan':
          if (typeof StudyPlannerModule !== 'undefined') await StudyPlannerModule.render(targetContainer);
          break;
        case 'notes':
          if (typeof NotesModule !== 'undefined') await NotesModule.render(targetContainer);
          break;
        case 'quizzes':
          if (typeof QuizModule !== 'undefined') await QuizModule.render(targetContainer);
          break;
        case 'flashcards':
          if (typeof FlashcardsModule !== 'undefined') await FlashcardsModule.render(targetContainer);
          break;
        case 'analytics':
          if (typeof AnalyticsModule !== 'undefined') await AnalyticsModule.render(targetContainer);
          break;
        case 'settings':
          if (typeof SettingsModule !== 'undefined') await SettingsModule.render(targetContainer);
          break;
        case 'admin':
          // Security Guard: Admin route only accessible if logged-in user has role === 'admin'
          const currentUser = APP_STATE.user || JSON.parse(localStorage.getItem('notex_user') || 'null');
          if (currentUser && currentUser.role === 'admin') {
            if (typeof AdminModule !== 'undefined') await AdminModule.render(targetContainer);
          } else {
            UI.showToast("Admin access restricted. Admin login required.", "error");
            window.location.hash = '#dashboard';
            if (typeof DashboardModule !== 'undefined') await DashboardModule.render(targetContainer);
          }
          break;
        default:
          if (typeof DashboardModule !== 'undefined') await DashboardModule.render(targetContainer);
          break;
      }
    } catch (routeErr) {
      console.error(`[Router Error] Failed to render view '${hash}':`, routeErr);
      targetContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--hyper-text-secondary);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--hyper-accent-rose); margin-bottom: 1rem;"></i>
          <h2 style="color: var(--hyper-text-primary); margin-bottom: 0.5rem;">Unable to load page</h2>
          <p style="margin-bottom: 1.5rem;">${routeErr.message || 'An error occurred while loading this view.'}</p>
          <button class="hyper-btn hyper-btn-primary" onclick="location.hash='#dashboard'">Return to Dashboard</button>
        </div>
      `;
    }

    // Refresh Lucide Icons after view render
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  window.addEventListener('hashchange', router);
  router();
});
