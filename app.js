

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


const videoRotation = [
  "ScreenRecording_09-01-2025_18-55-00_1_ebmatc",
  "SPOILER_2F836035-8B81-4370-8C4F-9EAB4346DB92_b9n32m",
  "SPOILER_ScreenRecording_02-26-2026_10-29-05_1_wdgxdr"
  // Add more IDs from your list here...
];

function updateSpotlight() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const videoId = videoRotation[dayOfYear % videoRotation.length];

  const container = document.getElementById('spotlight-video');
  if (container) {
    // We inject a standard HTML5 video tag using your Cloudinary base URL
    container.innerHTML = `
      <video width="100%" height="100%" controls playsinline poster="https://res.cloudinary.com/ddrhamsxu/video/upload/q_auto/f_auto/v1781336352/${videoId}.jpg">
        <source src="https://res.cloudinary.com/ddrhamsxu/video/upload/q_auto/f_auto/${videoId}.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }
}


function startCountdown() {
  const timerDisplay = document.getElementById('spotlight-timer');
  
  setInterval(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = midnight - now;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    timerDisplay.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

// Run on load
updateSpotlight();
startCountdown();



  // ==========================================
  // UTILITY INTERACTIVE MODAL ENGINES
  // ==========================================
  const bugOverlay = document.getElementById("bug-modal-overlay");
  const bugTrigger = document.getElementById("open-bug-trigger");
  const bugClose = document.getElementById("close-bug-btn");

  const rulesOverlay = document.getElementById("rules-modal-overlay");
  const rulesTrigger = document.getElementById("open-rules-trigger");
  const rulesClose = document.getElementById("close-rules-btn");

  // Core Open/Close Toggle Logics
  const toggleModal = (modal, displayState) => {
    if (modal) {
      modal.style.display = displayState;
      document.body.style.overflow = displayState === "flex" ? "hidden" : "";
    }
  };

  // Bug Observers
  if (bugTrigger) bugTrigger.addEventListener("click", () => toggleModal(bugOverlay, "flex"));
  if (bugClose) bugClose.addEventListener("click", () => toggleModal(bugOverlay, "none"));
  if (bugOverlay) {
    bugOverlay.addEventListener("click", (e) => { if (e.target === bugOverlay) toggleModal(bugOverlay, "none"); });
  }

  // Rules Observers
  if (rulesTrigger) rulesTrigger.addEventListener("click", () => toggleModal(rulesOverlay, "flex"));
  if (rulesClose) rulesClose.addEventListener("click", () => toggleModal(rulesOverlay, "none"));
  if (rulesOverlay) {
    rulesOverlay.addEventListener("click", (e) => { if (e.target === rulesOverlay) toggleModal(rulesOverlay, "none"); });
  }
