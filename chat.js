import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// Get Room ID from URL parameters (?room=theorists)
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room') || 'general';

// Set up page header titles based on selection
const roomTitles = {
  theorists: "Lore Theorists Chat",
  hunters: "Audio Hunters Chat",
  archivists: "Meme Archivists Chat"
};
document.getElementById('chat-room-title').innerText = roomTitles[roomId] || "Global Chat";

let currentUsername = "Anonymous";
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');

// 1. Authenticate & Fetch Profile Info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Look up username matching their auth ID
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUsername = userDoc.data().username || "Anon";
    }
    
    // Start listening for messages now that user is loaded
    listenForMessages();
  } else {
    window.location.href = 'login.html';
  }
});

// 2. Stream Messages Real-Time
function listenForMessages() {
  // Queries your database nested sub-collection: rooms -> [roomId] -> messages
  const msgQuery = query(collection(db, "rooms", roomId, "messages"), orderBy("timestamp", "asc"));
  
  onSnapshot(msgQuery, (snapshot) => {
    chatBox.innerHTML = ""; // Clear loader/old nodes
    
    snapshot.forEach((doc) => {
      const msgData = doc.data();
      const isMe = msgData.sender === currentUsername;
      
      const msgBubble = document.createElement('div');
      msgBubble.className = `message-bubble ${isMe ? 'outgoing' : 'incoming'}`;
      
      msgBubble.innerHTML = `
        <span class="msg-meta">${isMe ? 'You' : msgData.sender}</span>
        <div>${escapeHTML(msgData.text)}</div>
      `;
      
      chatBox.appendChild(msgBubble);
    });
    
    // Auto scroll chat view directly to the bottom row on incoming feeds
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// 3. Send Messages to Firestore Database
if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const textToSend = msgInput.value.trim();
    if (!textToSend) return;

    msgInput.value = ""; // Instantly clear input field for fluid typing

    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: textToSend,
        sender: currentUsername,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to write document message:", err);
    }
  });
}

// Safety function to prevent malicious code strings from rendering in user chat boxes
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
