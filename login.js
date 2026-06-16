import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Updated Firebase configuration using your exact updated credentials
const firebaseConfig = {
  apiKey: "AIzaSyD_Ackc4JfTZYWJHYNCWxLafnwAsWqJrFQ",
  authDomain: "thugwiki-ffc4f.firebaseapp.com",
  projectId: "thugwiki-ffc4f",
  storageBucket: "thugwiki-ffc4f.firebasestorage.app",
  messagingSenderId: "173306478841",
  appId: "1:173306478841:web:ce40297f76906e6dc6e228",
  measurementId: "G-JFWEBT2Z47"
};

// Initialize Firebase Core, Auth, and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements matching your updated login.html layout
  const googleBtn = document.getElementById('google-login-btn');
  const appleBtn = document.getElementById('apple-login-btn');
  const errorBox = document.getElementById('login-error');

  // Initialize Providers
  const googleProvider = new GoogleAuthProvider();
  const appleProvider = new OAuthProvider('apple.com');

  // Scopes for Apple Sign-In (Gets basic profile data)
  appleProvider.addScope('email');
  appleProvider.addScope('name');

  // Unified SSO Handler Function
  async function handleSSOLogin(provider, providerName) {
    // Reset UI error state on click
    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.innerText = '';
    }

    try {
      console.log(`Triggering ${providerName} sign-in popup...`);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log(`${providerName} authentication successful:`, user.uid);
      
      // Look up the authenticated user's ID inside your Firestore database
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // Routing logic: Check if they already went through the "Choose Username" phase
      if (userDoc.exists() && userDoc.data().username) {
        
        // --- ADD THIS ADMIN CHECK ---
        // Your Admin UIDs
        const adminUidWhitelist = ["c597pc8i0JSJ2gt9iA5WnXyc7n22"]; 
        
        if (adminUidWhitelist.includes(user.uid)) {
          localStorage.setItem('thug_admin_authenticated', 'true');
          console.log("Admin privileges active.");
        } else {
          localStorage.removeItem('thug_admin_authenticated');
        }
        // ----------------------------

        console.log("Existing user recognized. Redirecting to dashboard...");
        window.location.href = 'app.html'; 
      }
 else {
        console.log("New profile or missing username detected. Redirecting to username setup...");
        window.location.href = 'choose-username.html';
      }

    } catch (error) {
      console.error(`${providerName} login error:`, error);
      
      if (errorBox) {
        errorBox.style.display = 'block';
        
        // Handle common popup interruptions cleanly
        if (error.code === 'auth/popup-closed-by-user') {
          errorBox.innerText = "Sign-in window closed before finishing.";
        } else if (error.code === 'auth/network-request-failed') {
          errorBox.innerText = "Network timeout. Check your mobile connection.";
        } else {
          errorBox.innerText = `${providerName} error: ${error.message}`;
        }
      }
    }
  }

  // Event Listeners for the buttons
  if (googleBtn) {
    googleBtn.addEventListener('click', () => handleSSOLogin(googleProvider, 'Google'));
  }

  if (appleBtn) {
    appleBtn.addEventListener('click', () => handleSSOLogin(appleProvider, 'Apple'));
  }
});
