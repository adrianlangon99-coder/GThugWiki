// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDPuASVJUkRu36JPvyZLAWLrn9ddcrxGi8",
  authDomain: "thugwiki-b54ae.firebaseapp.com",
  projectId: "thugwiki-b54ae",
  storageBucket: "thugwiki-b54ae.firebasestorage.app",
  messagingSenderId: "62999591218",
  appId: "1:62999591218:web:b51fb9062a4b147f82bf2b",
  measurementId: "G-2MCQZ28MCF"
};

// Initialize Firebase app instance first
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Now it is 100% safe to initialize Firestore globally!
const db = firebase.firestore();

// ==========================================
// MODAL PRESENTATION HANDLERS
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('is-open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('is-open');
}

function switchModal(closeId, openId) {
  closeModal(closeId);
  setTimeout(() => { openModal(openId); }, 250); // slight delay for smooth transition
}

// Close modal when clicking on the dark background overlay
window.onclick = function(event) {
  if (event.target.classList.contains('custom-portal-overlay')) {
    event.target.classList.remove('is-open');
  }
};

// ==========================================
// FIREBASE AUTHENTICATION PIPELINE (COMPAT)
// ==========================================

// 1. SIGN UP ROUTINE (Traditional Email/Password)
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;
    const username = signupForm.querySelector('input[type="text"]').value.trim();

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user.updateProfile({ displayName: username }).then(() => {
          return db.collection('users').doc(user.uid).set({
            username: username,
            email: email,
            created_at: Date.now()
          });
        });
      })
      .then(() => {
        sessionStorage.setItem('forceLoader', 'true');
        window.location.href = 'app.html';
      })
      .catch((error) => {
        alert(`Signup Failed: ${error.message}`);
      });
  });
}

// 2. LOG IN ROUTINE
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        sessionStorage.setItem('forceLoader', 'true');
        window.location.href = 'app.html';
      })
      .catch((error) => {
        alert(`Login Failed: ${error.message}`);
      });
  });
}

// 3. GOOGLE OAUTH POPUP ROUTINE WITH FORCED USERNAME GATE
function handleGoogleAuth() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("Google Account Verified. Checking database registration profiles...", user.uid);
      
      db.collection('users').doc(user.uid).get()
        .then((profileDoc) => {
          if (profileDoc.exists && profileDoc.data().username) {
            sessionStorage.setItem('forceLoader', 'true');
            window.location.href = 'app.html';
          } else {
            showUsernameGateModal(user);
          }
        })
        .catch((dbError) => {
          console.error("Database reading lock exception:", dbError);
          showUsernameGateModal(user);
        });
    })
    .catch((error) => {
      alert(`Google Authentication Failed: ${error.message}`);
    });
}

// ==========================================
// INTERACTIVE GOOGLE SIGNUP REGISTRATION INTERCEPTOR
// ==========================================
function showUsernameGateModal(user) {
  const gateOverlay = document.getElementById('username-gate-modal');
  const gateForm = document.getElementById('username-gate-form');
  const gateInput = document.getElementById('custom-username-field');
  const gateSubmitBtn = document.getElementById('save-username-btn');

  if (gateOverlay) {
    gateOverlay.style.display = 'flex';
    gateOverlay.classList.add('is-open');
  }

  if (gateForm) {
    gateForm.addEventListener('submit', function handleGateSubmit(e) {
      e.preventDefault();
      
      const chosenHandle = gateInput.value.trim();
      if (!chosenHandle) return alert("Please specify a valid handle identity log.");

      gateSubmitBtn.disabled = true;
      gateSubmitBtn.innerText = "Reserving identity line...";

      user.updateProfile({
        displayName: chosenHandle
      })
      .then(() => {
        return db.collection('users').doc(user.uid).set({
          username: chosenHandle,
          email: user.email || "",
          created_at: Date.now()
        });
      })
      .then(() => {
        sessionStorage.setItem('forceLoader', 'true');
        if (gateOverlay) gateOverlay.style.display = 'none';
        window.location.href = 'app.html';
      })
      .catch((gateErr) => {
        console.error("Identity registration runtime exception:", gateErr);
        alert("Failed to write customized account data profile: " + gateErr.message);
        gateSubmitBtn.disabled = false;
        gateSubmitBtn.innerText = "Complete Setup";
      });
    }, { once: true }); 
  }
}
