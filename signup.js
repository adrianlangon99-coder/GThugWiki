// 1. ALL IMPORTS MUST BE AT THE TOP
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// 2. CONFIGURATION (Using your exact updated credentials)
const firebaseConfig = {
  apiKey: "AIzaSyD_Ackc4JfTZYWJHYNCWxLafnwAsWqJrFQ",
  authDomain: "thugwiki-ffc4f.firebaseapp.com",
  projectId: "thugwiki-ffc4f",
  storageBucket: "thugwiki-ffc4f.firebasestorage.app",
  messagingSenderId: "173306478841",
  appId: "1:173306478841:web:ce40297f76906e6dc6e228",
  measurementId: "G-JFWEBT2Z47"
};

// 3. INITIALIZATION
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements matching your updated signup.html layout
  const googleBtn = document.getElementById('google-signup-btn');
  const appleBtn = document.getElementById('apple-signup-btn');

  // Initialize Providers
  const googleProvider = new GoogleAuthProvider();
  const appleProvider = new OAuthProvider('apple.com');

  // Scopes for Apple Sign-In
  appleProvider.addScope('email');
  appleProvider.addScope('name');

  // Unified SSO Auth Handler Function
  async function handleSSOSignup(provider, providerName) {
    try {
      console.log(`Triggering ${providerName} sign-up popup...`);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log(`${providerName} authentication successful:`, user.uid);

      // Check if this user already exists and has a username in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().username) {
        // User already has an account and chose a username -> send straight to app
        console.log("Existing user recognized. Redirecting to dashboard...");
        window.location.href = 'app.html';
      } else {
        // Brand new user, or authenticating for the first time -> route to choose a username
        console.log("New profile detected. Redirecting to username selection...");
        window.location.href = 'choose-username.html';
      }

    } catch (error) {
      console.error(`${providerName} Sign-Up Error:`, error);
      alert(`${providerName} sign-up encountered an error: ` + error.message);
    }
  }

  // Event Listeners for the SSO buttons
  if (googleBtn) {
    googleBtn.addEventListener('click', () => handleSSOSignup(googleProvider, 'Google'));
  }

  if (appleBtn) {
    appleBtn.addEventListener('click', () => handleSSOSignup(appleProvider, 'Apple'));
  }
});
