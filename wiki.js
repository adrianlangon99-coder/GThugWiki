// wiki.js - Shared Character Profile Engine Logic

document.addEventListener('DOMContentLoaded', () => {
  
  // Age Verification Engine Logic
  const ageGate = document.getElementById('age-gate-overlay');
  const bypassBtn = document.getElementById('age-bypass-btn');

  if (ageGate && bypassBtn) {
    const isVerified = localStorage.getItem('thugwiki_age_verified');

    if (!isVerified) {
      ageGate.style.display = 'flex';
    }

    bypassBtn.addEventListener('click', () => {
      localStorage.setItem('thugwiki_age_verified', 'true');
      ageGate.style.display = 'none';
    });
  }

});
