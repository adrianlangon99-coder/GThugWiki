document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Announcement Card Buttons
  // ==========================================
  const actionButtons = document.querySelectorAll('.card-action-btn');
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = e.target.innerText;
      if (buttonText === 'Report Issue') console.log('Redirecting to Bug Report...');
      if (buttonText === 'Read Rules') console.log('Redirecting to Rules...');
    });
  });

  // ==========================================
  // 2. Discussion Join Buttons
  // ==========================================
  const joinButtons = document.querySelectorAll('.join-btn');
  joinButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const btn = e.target;
      if (btn.innerText === 'Join') {
        btn.innerText = 'Joined';
        btn.style.background = '#10b981'; 
        btn.style.color = '#ffffff';
      } else {
        btn.innerText = 'Join';
        btn.style.background = '#ffffff';
        btn.style.color = '#0b0b0e';
      }
    });
  });

  // ==========================================
  // 3. Profile Dropdown & Admin Gate Logic
  // ==========================================
  const avatarTrigger = document.getElementById('profile-avatar-trigger');
  const dropdownMenu = document.getElementById('profile-dropdown-menu');

  // A more robust way to handle the admin link, even if it loads late
  function unlockAdminLink() {
    const adminLink = document.querySelector('.admin-only-link');
    const isAdmin = localStorage.getItem('thug_admin_authenticated');
    
    if (isAdmin === 'true' && adminLink) {
      adminLink.style.display = 'flex';
    }
  }

  // Run immediately
  unlockAdminLink();

  // Watch for changes in case the menu is rendered dynamically
  const observer = new MutationObserver(unlockAdminLink);
  if (dropdownMenu) {
    observer.observe(dropdownMenu, { childList: true, subtree: true });
  }

  if (avatarTrigger && dropdownMenu) {
    avatarTrigger.addEventListener('click', (event) => {
      event.stopPropagation(); 
      const isActive = dropdownMenu.classList.toggle('is-active');
      avatarTrigger.setAttribute('aria-expanded', isActive);
      // Re-run the unlock just to be safe when the menu opens
      unlockAdminLink();
    });

    document.addEventListener('click', (event) => {
      const clickedInsideTrigger = event.target.closest('#profile-avatar-trigger');
      if (!dropdownMenu.contains(event.target) && !clickedInsideTrigger) {
        dropdownMenu.classList.remove('is-active');
        avatarTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==========================================
  // 4. System Changelog Modal Engine
  // ==========================================
  const overlay = document.getElementById("update-modal-overlay");
  const openTrigger = document.getElementById("open-updates-trigger");
  const closeBtn = document.getElementById("close-updates-btn");

  if (openTrigger && overlay) {
    openTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden"; 
    });
  }

  const closeUpdatesModal = () => {
    if (overlay) {
      overlay.style.display = "none";
      document.body.style.overflow = ""; 
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeUpdatesModal);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeUpdatesModal();
    });
  }
});
