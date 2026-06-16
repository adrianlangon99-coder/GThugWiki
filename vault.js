// ==========================================
// 1. FIREBASE MODULE IMPORTS & INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_Ackc4JfTZYWJHYNCWxLafnwAsWqJrFQ",
  authDomain: "thugwiki-ffc4f.firebaseapp.com",
  projectId: "thugwiki-ffc4f",
  storageBucket: "thugwiki-ffc4f.firebasestorage.app",
  messagingSenderId: "173306478841",
  appId: "1:173306478841:web:ce40297f76906e6dc6e228"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state variables for tracking downloads
let targetDownloadUrl = "";
let adTimerInterval = null;

// ==========================================
// 2. DOM CONTENT LOADED INTERFACE LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // Announcement Card Button logic
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

  // Discussion Join Buttons
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

  // Profile Dropdown Functionality
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

  // System Changelog Modal Engine
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

  // Kickstart live database stream
  listenToVaultFeed();
});


// ==========================================
// 3. AD-GATE DOWNLOAD HANDLERS (Global Scope Bindings)
// ==========================================
window.triggerAdDownload = function(videoUrl) {
  targetDownloadUrl = videoUrl;
  
  const modal = document.getElementById("download-ad-gate-overlay");
  const actionBtn = document.getElementById("ad-unlock-download-btn");
  
  if (!modal || !actionBtn) return;
  
  let timeLeft = 10;
  actionBtn.disabled = true;
  actionBtn.innerText = `Please Wait (${timeLeft}s)`;
  actionBtn.style.background = "rgba(255,255,255,0.05)";
  actionBtn.style.color = "rgba(255,255,255,0.3)";
  actionBtn.style.border = "1px solid rgba(255,255,255,0.08)";
  actionBtn.style.cursor = "not-allowed";

  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; 

  clearInterval(adTimerInterval);

  adTimerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      actionBtn.innerText = `Please Wait (${timeLeft}s)`;
    } else {
      clearInterval(adTimerInterval);
      actionBtn.disabled = false;
      actionBtn.innerText = "Download Video File Now";
      actionBtn.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
      actionBtn.style.color = "#000000";
      actionBtn.style.border = "none";
      actionBtn.style.cursor = "pointer";
      actionBtn.style.boxShadow = "0 0 16px rgba(251, 191, 36, 0.3)";
      
      actionBtn.onmouseenter = () => { actionBtn.style.transform = "translateY(-1px)"; };
      actionBtn.onmouseleave = () => { actionBtn.style.transform = "translateY(0)"; };

      actionBtn.onclick = () => {
        executeFileDownload(targetDownloadUrl);
        closeDownloadAdGate();
      };
    }
  }, 1000);
};

function executeFileDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  const filename = url.substring(url.lastIndexOf('/') + 1);
  link.setAttribute('download', filename);
  link.target = "_blank";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.closeDownloadAdGate = function() {
  const modal = document.getElementById("download-ad-gate-overlay");
  const actionBtn = document.getElementById("ad-unlock-download-btn");
  
  clearInterval(adTimerInterval);
  if (modal) modal.style.display = "none";
  document.body.style.overflow = ""; 
  
  if (actionBtn) {
    actionBtn.onclick = null; 
  }
};


// ==========================================
// 4. DYNAMIC VAULT ENGINE WITH AUTO AD INJECTION
// ==========================================
function listenToVaultFeed() {
  const feedContainer = document.getElementById("dynamic-vault-feed");
  if (!feedContainer) return;

  const vaultQuery = query(collection(db, "vault_videos"), orderBy("createdAt", "desc"));

  onSnapshot(vaultQuery, (snapshot) => {
    feedContainer.innerHTML = ""; 

    let videoCount = 0;

    snapshot.forEach((doc) => {
      const videoData = doc.data();
      videoCount++;

      const postHTML = `
        <article class="vault-post">
          <div class="post-header">
            <div class="post-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div class="post-meta">
              <span class="post-author">Admin</span>
            </div>
          </div>
          
          <h3 class="post-title">${videoData.title}</h3>
          
          <div class="media-container" style="margin-bottom: 16px;">
            <video class="vault-video" controls playsinline preload="metadata" style="width: 100%; aspect-ratio: 16/9; background: #000000; border-radius: 12px; object-fit: contain; outline: none; border: 1px solid rgba(255, 255, 255, 0.04);"
                   poster="https://res.cloudinary.com/ddrhamsxu/video/upload/q_auto/f_auto/${videoData.posterId}">
              <source src="https://res.cloudinary.com/ddrhamsxu/video/upload/q_auto/f_auto/${videoData.videoId}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="post-actions">
            <div class="action-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span>${videoData.views || '0'}</span>
            </div>

            <button class="action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              <span>${videoData.likes || '0'}</span>
            </button>
            
            <button class="action-btn download" onclick="triggerAdDownload('https://res.cloudinary.com/ddrhamsxu/video/download/q_auto/f_auto/${videoData.downloadId || videoData.videoId}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download</span>
            </button>
          </div>
        </article>
      `;

      feedContainer.insertAdjacentHTML("beforeend", postHTML);

      if (videoCount % 3 === 0) {
        const adCardHTML = `
          <article class="vault-post promoted-post">
            <div class="post-header">
              <div class="post-avatar promoted-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </div>
              <div class="post-meta">
                <span class="post-author">Promoted</span>
              </div>
            </div>
            
            <div class="media-container" style="margin-bottom: 16px; display: flex; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 12px; min-height: 100px; align-items: center; border: 1px solid rgba(255, 255, 255, 0.04);">
              <ins class="eas6a97888e2" data-zoneid="5950890"></ins>
            </div>

            <div class="post-actions">
              <div class="action-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>8.9k</span>
              </div>
              <button class="action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                <span>432</span>
              </button>
              <div class="action-btn download" style="opacity: 0.5; pointer-events: none;">
                <span>Sponsored Slot</span>
              </div>
            </div>
          </article>
        `;
        feedContainer.insertAdjacentHTML("beforeend", adCardHTML);
        
        try {
          (window.AdProvider = window.AdProvider || []).push({"serve": {}});
        } catch(e) { console.error("Ad engine push shift error", e); }
      }
    });
  });
}
