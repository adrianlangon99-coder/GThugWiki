document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Announcement Card Button logic
  // ==========================================
  const actionButtons = document.querySelectorAll('.card-action-btn');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = e.target.innerText;
      
      if (buttonText === 'Report Issue') {
        console.log('Redirecting to Bug Report page...');
        // window.location.href = '/report';
      } else if (buttonText === 'Read Rules') {
        console.log('Redirecting to Rules page...');
        // window.location.href = '/rules';
      }
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
  // 3. Profile Dropdown Functionality
  // ==========================================
  const avatarTrigger = document.getElementById('profile-avatar-trigger');
  const dropdownMenu = document.getElementById('profile-dropdown-menu');

  if (avatarTrigger && dropdownMenu) {
    avatarTrigger.addEventListener('click', (event) => {
      event.stopPropagation(); 
      const isActive = dropdownMenu.classList.toggle('is-active');
      avatarTrigger.setAttribute('aria-expanded', isActive);
    });

    document.addEventListener('click', (event) => {
      const clickedInsideTrigger = event.target.closest('#profile-avatar-trigger');
      const clickedInsideMenu = dropdownMenu.contains(event.target);

      if (!clickedInsideMenu && !clickedInsideTrigger) {
        dropdownMenu.classList.remove('is-active');
        avatarTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    const menuItems = dropdownMenu.querySelectorAll('.dropdown-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        console.log(`Navigating to: ${item.textContent.trim()}`);
      });
    });
  }

  // ==========================================
  // 4. System Changelog Modal Engine
  // ==========================================
  const overlay = document.getElementById("update-modal-overlay");
  const openTrigger = document.getElementById("open-updates-trigger");
  const closeBtn = document.getElementById("close-updates-btn");

  // Open overlay toggle
  if (openTrigger && overlay) {
    openTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden"; // Block background scrolling
    });
  }

  // Safe window closure function
  const closeUpdatesModal = () => {
    if (overlay) {
      overlay.style.display = "none";
      document.body.style.overflow = ""; // Re-enable scroll behaviors
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeUpdatesModal);

  // Close automatically if user taps on the dark background mask area
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeUpdatesModal();
    });
  }

}); // Clean single ending wrapper for the entire file
