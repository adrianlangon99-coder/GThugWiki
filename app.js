document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Age Gate Gatekeeper Logic
  // ==========================================
  const ageGate = document.getElementById('age-gate-overlay');
  const bypassBtn = document.getElementById('age-bypass-btn');

  if (ageGate && bypassBtn) {
    // Check local storage to see if they've already passed this screen before
    const isVerified = localStorage.getItem('thugwiki_age_verified');

    if (!isVerified) {
      // Keep it visible if they haven't verified
      ageGate.style.display = 'flex';
    }

    // Handle click confirmation event
    bypassBtn.addEventListener('click', () => {
      // Save their consent status inside the browser memory
      localStorage.setItem('thugwiki_age_verified', 'true');
      
      // Instantly drop the blocking layout
      ageGate.style.display = 'none';
    });
  }

  // ==========================================
  // 2. Announcement Card Button logic
  // ==========================================
  const actionButtons = document.querySelectorAll('.card-action-btn');
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = e.target.innerText;
      if (buttonText === 'Report Issue') {
        console.log('Redirecting to Bug Report page...');
      } else if (buttonText === 'Read Rules') {
        console.log('Redirecting to Rules page...');
      }
    });
  });

  // ==========================================
  // 3. Discussion Join Buttons
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
  // 4. Profile Dropdown Functionality
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
  }

  // ==========================================
  // SYSTEM CHANGELOG MODAL ENGINE (Combined Here)
  // ==========================================
  const overlay = document.getElementById("update-modal-overlay");
  const openTrigger = document.getElementById("open-updates-trigger");
  const closeBtn = document.getElementById("close-updates-btn");

  // Open overlay toggle
  if (openTrigger && overlay) {
    openTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden"; // Block background crawling
    });
  }

  // Safe window closure function
  const closeUpdatesModal = () => {
    if (overlay) {
      overlay.style.display = "none";
      document.body.style.overflow = ""; // Re-enable touch inputs
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeUpdatesModal);

  // Close automatically if user taps on the dark background mask area
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeUpdatesModal();
    });
  }
});

// ==========================================
// 5. Copy to Clipboard Utility
// ==========================================
// Kept global outside of DOM scope so inline HTML onclick calls can access it instantly
window.copyToClipboard = function(event) {
  const copyText = document.getElementById("myInviteLink");
  if (!copyText) return;
  
  navigator.clipboard.writeText(copyText.value);
  
  // FIX: Safely targets the button element block even if the user clicks inner text nodes
  const btn = event.target.closest('.archive-btn') || event.target;
  const originalText = btn.innerText;
  btn.innerText = "Copied!";
  
  setTimeout(() => {
    btn.innerText = originalText;
  }, 2000);
}
