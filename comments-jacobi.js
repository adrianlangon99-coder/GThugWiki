import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc,
  addDoc, 
  getDoc,
  setDoc,
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

// Admin Editing UI Selectors
const adminWorkspaceTray = document.getElementById("admin-workspace-tray");
const editPageBtn = document.getElementById("edit-current-lore-btn");
const savePageBtn = document.getElementById("save-current-lore-btn");
const bioTextContainer = document.getElementById("wiki-bio-text");

// Unique identifier path for this profile (FIXED FOR JACOBI)
const pageId = "jacobi-lore"; 
let currentDisplayName = "Anonymous Guest";
let isAdmin = false;

// ========================================================
// TEAM ACCESS CONTROL WHITELIST (Your UID is active)
// ========================================================
const adminUidWhitelist = [
  "c597pc8i0JSJ2gt9iA5WnXyc7n22", 
  "null",     
  "null"          
];

// ==========================================
// 1. Live Lore Data Loader Engine
// ==========================================
async function loadPageContent() {
  if (!bioTextContainer) return;
  
  try {
    const docRef = doc(db, "wikis", pageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().biography) {
      // Pull dynamic HTML text layers straight out of cloud collections
      bioTextContainer.innerHTML = docSnap.data().biography;
    } else {
      console.log("No custom cloud biography found. Keeping standard HTML fallback content active.");
    }
  } catch (error) {
    console.error("Error loading lore data node:", error);
  }
}

// Fire data synchronization on load
loadPageContent();

// ==========================================
// 2. Auth Event State Listener (CLEANED & FIXED)
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Strictly uses chosen profile name, NEVER leaks account emails
    currentDisplayName = user.displayName || "Anonymous Thug";
    
    if (userIdentityHeader) {
      userIdentityHeader.innerHTML = `Posting as: <span style="color: #3b82f6; font-weight: 700;">${currentDisplayName}</span>`;
    }
    if (guestStatusBadge) guestStatusBadge.style.display = "none";
    
    if (commentTextArea) commentTextArea.disabled = false;
    if (submitCommentBtn) submitCommentBtn.disabled = false;

    // Secure Admin access validation
    if (adminUidWhitelist.includes(user.uid)) {
      isAdmin = true;
      console.log("Admin signature verified. Launching panel controls...");
      if (adminWorkspaceTray) adminWorkspaceTray.style.display = "block";
    } else {
      isAdmin = false;
      if (adminWorkspaceTray) adminWorkspaceTray.style.display = "none";
    }

  } else {
    // Safe guest fallback layout rules
    currentDisplayName = "Anonymous Guest";
    isAdmin = false;
    if (userIdentityHeader) {
      userIdentityHeader.innerHTML = `Posting as: <span style="color: rgba(255,255,255,0.4); font-weight: 700;">Anonymous Guest</span>`;
    }
    if (guestStatusBadge) guestStatusBadge.style.display = "inline";
    
    if (commentTextArea) commentTextArea.disabled = false; 
    if (submitCommentBtn) submitCommentBtn.disabled = false;
    if (adminWorkspaceTray) adminWorkspaceTray.style.display = "none";
  }
});

// ==========================================
// 3. Admin Inline Page Editing Functions
// ==========================================
if (editPageBtn && savePageBtn && bioTextContainer) {
  
  // Activate inline document editing
  editPageBtn.addEventListener("click", () => {
    if (!isAdmin) return;

    bioTextContainer.contentEditable = "true";
    bioTextContainer.style.border = "1px dashed #3b82f6";
    bioTextContainer.style.padding = "14px";
    bioTextContainer.style.borderRadius = "12px";
    bioTextContainer.style.background = "rgba(59, 130, 246, 0.02)";
    bioTextContainer.focus();

    // Toggle dashboard actions
    editPageBtn.style.display = "none";
    savePageBtn.style.display = "block";
  });

  // Commit text inputs straight into Firestore
  savePageBtn.addEventListener("click", async () => {
    if (!isAdmin) return;

    const updatedText = bioTextContainer.innerHTML;

    try {
      savePageBtn.disabled = true;
      savePageBtn.innerText = "Saving...";

      // Write layout mutations straight to server node keys
      await setDoc(doc(db, "wikis", pageId), {
        biography: updatedText,
        lastUpdatedBy: auth.currentUser.uid,
        lastUpdatedTime: serverTimestamp()
      }, { merge: true });

      // Kill editing layouts cleanly
      bioTextContainer.contentEditable = "false";
      bioTextContainer.style.border = "none";
      bioTextContainer.style.background = "none";
      bioTextContainer.style.padding = "0";

      // Reset button layouts
      savePageBtn.style.display = "none";
      savePageBtn.disabled = false;
      savePageBtn.innerText = "Save Changes";
      editPageBtn.style.display = "block";

      alert("Lore archive updated successfully across all system nodes!");
    } catch (error) {
      console.error("Firestore write transaction error:", error);
      alert("Database push failed. Please verify security parameters.");
      savePageBtn.disabled = false;
      savePageBtn.innerText = "Save Changes";
    }
  });
}

// ==========================================
// 4. Real-Time Snapshot Feed Listener
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
    const formattedTime = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'}) : 'Just now';
    
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
// 5. Document Submission Handler
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
      submitCommentBtn.disabled = true;
      commentTextArea.disabled = true;
      submitCommentBtn.innerText = "Processing...";

      await addDoc(collection(db, "wikis", pageId, "comments"), payload);
      commentTextArea.value = "";
    } catch (error) {
      console.error("Firestore database push failure:", error);
      alert("Connection error. The archive pipeline could not write your file.");
    } finally {
      submitCommentBtn.disabled = false;
      commentTextArea.disabled = false;
      submitCommentBtn.innerText = "Post Comment";
      commentTextArea.focus();
    }
  });
}
