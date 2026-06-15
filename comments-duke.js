import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your project credentials block
const firebaseConfig = {
  apiKey: "AIzaSyD_Ackc4JfTZYWJHYNCWxLafnwAsWqJrFQ",
  authDomain: "thugwiki-ffc4f.firebaseapp.com",
  projectId: "thugwiki-ffc4f",
  storageBucket: "thugwiki-ffc4f.firebasestorage.app",
  messagingSenderId: "173306478841",
  appId: "1:173306478841:web:ce40297f76906e6dc6e228",
  measurementId: "G-JFWEBT2Z47"
};

// Initialize Google SDKs
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Selection
const commentForm = document.getElementById('commentForm');
const commentTextArea = document.getElementById('commentBody');
const submitCommentBtn = document.getElementById('submitCommentBtn');
const commentsFeed = document.getElementById('commentsFeed');
const userIdentityHeader = document.getElementById('commentUserIdentity');
const guestStatusBadge = document.getElementById('guestStatusBadge');

// Unique identifier path for this profile
const pageId = "duke-lore"; 
let currentDisplayName = "Anonymous Guest";

// ========================================================
// TEAM ACCESS CONTROL WHITELIST (Paste your UIDs here)
// ========================================================
const adminUidWhitelist = [
  "c597pc8i0JSJ2gt9iA5WnXyc7n22", 
  "null",     
  "null"          
];

// ==========================================
// 1. Auth Event State Listener
// ==========================================
onAuthStateChanged(auth, (user) => {
  // Target the hidden HTML administrative menu container
  const adminWorkspaceTray = document.getElementById("admin-workspace-tray");

  if (user) {
    // Read display name or split the email prefix if display name is unassigned
    currentDisplayName = user.displayName || user.email.split('@')[0] || "Authenticated User";
    
    if (userIdentityHeader) {
      userIdentityHeader.innerHTML = `Posting as: <span style="color: #3b82f6; font-weight: 700;">${currentDisplayName}</span>`;
    }
    if (guestStatusBadge) guestStatusBadge.style.display = "none";
    
    // Unlock input mechanisms
    if (commentTextArea) {
      commentTextArea.disabled = false;
      commentTextArea.placeholder = "Share lore info or report a clip breakdown...";
    }
    if (submitCommentBtn) submitCommentBtn.disabled = false;

    // ----------------------------------------------------
    // ADMIN SIGNATURE IDENTITY CHECK
    // ----------------------------------------------------
    if (adminUidWhitelist.includes(user.uid)) {
      console.log("Admin signature verified. Launching panel controls...");
      if (adminWorkspaceTray) {
        adminWorkspaceTray.style.display = "block"; // Opens the edit dashboard panel
      }
    } else {
      // Standard logged-in user: keep admin console safely hidden
      if (adminWorkspaceTray) adminWorkspaceTray.style.display = "none";
    }

  } else {
    currentDisplayName = "Anonymous Guest";
    if (userIdentityHeader) {
      userIdentityHeader.innerHTML = `Posting as: <span style="color: rgba(255,255,255,0.4); font-weight: 700;">Anonymous Guest</span>`;
    }
    if (guestStatusBadge) guestStatusBadge.style.display = "inline";
    
    // Keep inputs active for guests based on your project requirements
    if (commentTextArea) commentTextArea.disabled = false; 
    if (submitCommentBtn) submitCommentBtn.disabled = false;

    // Unauthenticated guest: protect administration interface
    if (adminWorkspaceTray) adminWorkspaceTray.style.display = "none";
  }
});

// ==========================================
// 2. Real-Time Snapshot Feed Listener
// ==========================================
const commentsRef = collection(db, "wikis", pageId, "comments");
const q = query(commentsRef, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  if (!commentsFeed) return;
  commentsFeed.innerHTML = "";
  
  if (snapshot.empty) {
    commentsFeed.innerHTML = `<div style="color: rgba(255,255,255,0.2); text-align: center; padding: 32px; font-size: 0.9rem;">No archive comments posted yet. Be the first to add data.</div>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    
    // Check if cloud clock has stamped the file yet
    const formattedTime = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'}) : 'Just now';
    
    // Run string sanitization to prevent XSS script code injections
    const secureAuthor = data.author.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const secureComment = data.comment.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const card = document.createElement('div');
    card.className = 'wiki-comment-card';
    card.innerHTML = `
      <div class="comment-meta-header">
        <span class="comment-username">${secureAuthor}</span>
        <span class="comment-timestamp">${formattedTime}</span>
      </div>
      <p class="comment-text-content">${secureComment}</p>
    `;
    commentsFeed.appendChild(card);
  });
}, (error) => {
  console.error("Snapshot stream failure:", error);
  if (commentsFeed) {
    commentsFeed.innerHTML = `<div style="color: #f87171; text-align: center; padding: 16px; font-size: 0.85rem;">Failed to synchronize live discussion stream.</div>`;
  }
});

// ==========================================
// 3. Document Submission Handler
// ==========================================
if (commentForm) {
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const commentText = commentTextArea.value.trim();
    if (!commentText) return;

    const payload = {
      author: currentDisplayName,
      comment: commentText,
      timestamp: serverTimestamp()
    };

    try {
      // Freeze form controls to prevent duplicate clicks
      submitCommentBtn.disabled = true;
      commentTextArea.disabled = true;
      submitCommentBtn.innerText = "Processing...";

      // Fire payload straight into the sub-collection folder
      await addDoc(collection(db, "wikis", pageId, "comments"), payload);
      
      // Clear comment body area clean
      commentTextArea.value = "";
    } catch (error) {
      console.error("Firestore database push failure:", error);
      alert("Connection error. The archive pipeline could not write your file.");
    } finally {
      // Unfreeze controls
      submitCommentBtn.disabled = false;
      commentTextArea.disabled = false;
      submitCommentBtn.innerText = "Post Comment";
      commentTextArea.focus();
    }
  });
}
