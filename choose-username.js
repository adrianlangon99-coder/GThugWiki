import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Your exact configuration block
const firebaseConfig = {
  apiKey: "AIzaSyD_Ackc4JfTZYWJHYNCWxLafnwAsWqJrFQ",
  authDomain: "thugwiki-ffc4f.firebaseapp.com",
  projectId: "thugwiki-ffc4f",
  storageBucket: "thugwiki-ffc4f.firebasestorage.app",
  messagingSenderId: "173306478841",
  appId: "1:173306478841:web:ce40297f76906e6dc6e228",
  measurementId: "G-JFWEBT2Z47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Secure check: Make sure a user is actually authenticated via SSO to view this page
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Authenticated profile active:", user.uid);
  } else {
    // If someone tries to access this page directly without logging in, kick them back to login
    console.warn("No authenticated session found. Redirecting to login page...");
    window.location.href = "login.html";
  }
});

// Handle Username Submission
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username');
const errorBox = document.getElementById('username-error');
const submitBtn = document.getElementById('submit-btn');

if (usernameForm) {
  usernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    const chosenUsername = usernameInput.value.trim();

    // Visual feedback for save execution
    submitBtn.innerText = "Saving profile...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    if (errorBox) errorBox.style.display = "none";

    try {
      // Save profile documentation directly link to their specific authenticated unique ID
      await setDoc(doc(db, "users", currentUser.uid), {
        username: chosenUsername,
        email: currentUser.email || "No email shared",
        createdAt: new Date().toISOString()
      }, { merge: true });

      console.log("Username saved successfully to Firestore profile document!");
      
      // Send them to the live dashboard
      window.location.href = "app.html";

    } catch (error) {
      console.error("Firestore database write failure:", error);
      
      // Reset button UI
      submitBtn.innerText = "Save & Enter";
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";

      if (errorBox) {
        errorBox.style.display = "block";
        errorBox.innerText = "Database error: " + error.message;
      }
    }
  });
}
