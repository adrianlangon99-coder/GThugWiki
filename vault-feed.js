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
            <div class="post-meta"><span class="post-author">Admin</span></div>
          </div>
          <h3 class="post-title">${videoData.title}</h3>
          <div class="media-container" style="margin-bottom: 16px;">
            <video class="vault-video" controls playsinline preload="metadata" style="width: 100%; aspect-ratio: 16/9; background: #000000; border-radius: 12px; object-fit: contain; outline: none; border: 1px solid rgba(255, 255, 255, 0.04);"
                   poster="https://res.cloudinary.com/ddrhamsxu/video/upload/q_auto/f_auto/${videoData.posterId}">
              <source src="https://res.cloudinary.com/ddrhamsxu/video/upload/q_auto/f_auto/${videoData.videoId}" type="video/mp4">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download</span>
            </button>
          </div>
        </article>
      `;

      feedContainer.insertAdjacentHTML("beforeend", postHTML);

      if (videoCount % 3 === 0) {
        const adCardHTML = `
          <article class="vault-post promoted-post">
            <div class="media-container" style="margin-bottom: 16px; display: flex; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 12px; min-height: 100px; align-items: center; border: 1px solid rgba(255, 255, 255, 0.04);">
              <ins class="eas6a97888e2" data-zoneid="5950890"></ins>
            </div>
          </article>
        `;
        feedContainer.insertAdjacentHTML("beforeend", adCardHTML);
        try { (window.AdProvider = window.AdProvider || []).push({"serve": {}}); } catch(e) {}
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', listenToVaultFeed);
