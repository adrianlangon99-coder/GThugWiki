document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // ARCHIVE BACK-NAVIGATION INTERACTION CORE
  // ==========================================
  const backBtn = document.querySelector('.back-to-vault-btn');

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      // If setting up a real dynamic router path, you can comment e.preventDefault() out
      e.preventDefault();
      
      // Falls back safely to home index stack
      window.location.href = "app.html";
    });
  }

});


// ==========================================
// YES KING HEART BANNER ENGINE
// ==========================================
function spawnHearts() {
  const container = document.getElementById('heart-container');
  if (!container) return;

  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.innerText = '❤️';
  
  // Random horizontal position
  heart.style.left = Math.random() * 100 + '%';
  // Random animation duration for variety
  heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
  
  container.appendChild(heart);
  
  // Remove heart after animation completes to save memory
  setTimeout(() => heart.remove(), 4000);
}

// Spawn a heart every 600ms
if (document.getElementById('heart-container')) {
  setInterval(spawnHearts, 600);
}
