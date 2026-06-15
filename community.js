import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 1. FIREBASE SETUP
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

// 2. PROTECT THE ROUTE
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Kick out unauthorized users
    window.location.href = 'login.html';
  } else {
    console.log("Verified Community User:", user.uid);
  }
});

// 3. COMMUNITY UI LOGIC
document.addEventListener('DOMContentLoaded', () => {
  
  const joinButtons = document.querySelectorAll('.hub-btn');

  joinButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const btn = e.target;
      const isJoined = btn.classList.contains('joined');
      
      // Find the specific member count paragraph for THIS card
      const cardContent = btn.closest('.hub-content');
      const countEl = cardContent.querySelector('.member-count');
      
      // Extract the current number from the string (e.g. "124 Members" -> 124)
      let currentCount = parseInt(countEl.innerText.split(' ')[0]);

      if (!isJoined) {
        // User is joining
        btn.classList.add('joined');
        btn.innerText = 'Joined';
        currentCount++; // Bump the number up
      } else {
        // User is leaving
        btn.classList.remove('joined');
        btn.innerText = 'Join Hub';
        currentCount--; // Drop the number back down
      }

      // Update the UI text
      countEl.innerText = `${currentCount} Members`;
    });
  });

});
