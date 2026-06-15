import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Your exact Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_Ackc4JfTZYWJHYNCWxLafnwAsWqJrFQ",
  authDomain: "thugwiki-ffc4f.firebaseapp.com",
  projectId: "thugwiki-ffc4f",
  storageBucket: "thugwiki-ffc4f.firebasestorage.app",
  messagingSenderId: "173306478841",
  appId: "1:173306478841:web:ce40297f76906e6dc6e228",
  measurementId: "G-JFWEBT2Z47"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const usernameEl = document.getElementById('display-username');
const emailEl = document.getElementById('display-email');
const dateEl = document.getElementById('display-date');
const logoutBtn = document.getElementById('logout-btn');

// 1. Authenticate and Fetch Data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Look up their custom profile document in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Inject data into the UI
        usernameEl.innerText = data.username || "No Username Setup";
        emailEl.innerText = data.email || user.email;
        
        // Format the ISO date string to a clean, readable format (e.g., "Oct 24, 2026")
        if (data.createdAt) {
          const date = new Date(data.createdAt);
          dateEl.innerText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
          dateEl.innerText = "Unknown";
        }
      } else {
        usernameEl.innerText = "Profile Not Found";
        emailEl.innerText = "Go to setup";
      }
    } catch (error) {
      console.error("Error fetching profile database:", error);
      usernameEl.innerText = "Error loading profile";
    }
  } else {
    // If they aren't logged in, boot them to login
    window.location.href = 'login.html';
  }
});

// 2. Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Adds a quick visual tap state
    logoutBtn.innerText = "Signing out...";
    logoutBtn.style.opacity = "0.7";
    
    signOut(auth).then(() => {
      // Firebase successfully destroyed the session
      window.location.href = 'login.html';
    }).catch((error) => {
      console.error("Sign out error:", error);
      alert("Failed to sign out. Check console.");
      logoutBtn.innerText = "Sign Out";
      logoutBtn.style.opacity = "1";
    });
  });
}
