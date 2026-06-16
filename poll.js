import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

// Your exact selected 6 questions (1, 2, 5, 6, 7, 10)
const pollDatabase = [
  { q: "Who is your favorite thug?", opts: ["Yes King", "Duke Cage", "Tom Pearl", "Dreamybull"] },
  { q: "How many thugs do you know?", opts: ["1-2", "2-5", "5-10", "10+"] },
  { q: "Who has the most legendary soundbite on the site?", opts: ["Yes King", "Dreamybull", "Coach Mike", "Brandon Curington"] },
  { q: "How did you first discover the archive community?", opts: ["TikTok FYP", "Twitter/X Feed", "Discord Server Invite", "Reddit Links"] },
  { q: "Which section needs an immediate archive expansion?", opts: ["More TikTok Creators", "Deeper Classic Lore", "Expanded Audio Soundboards", "High-Quality Video Vaults"] },
  { q: "Should we add a user submission panel for new clips?", opts: ["Yes, immediately", "No, keep it Admin only", "Only for verified users", "Undecided"] }
];

const now = new Date();
const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
const activePollIndex = dayOfYear % pollDatabase.length;
const activePoll = pollDatabase[activePollIndex];
const pollId = `daily-poll-${activePollIndex}`;

const questionHeader = document.getElementById("poll-question-text");
const optionsContainer = document.getElementById("poll-options-container");

function initPollStream() {
  if (!questionHeader || !optionsContainer) return;
  
  questionHeader.innerText = activePoll.q;
  const pollDocRef = doc(db, "polls", pollId);
  
  onSnapshot(pollDocRef, (docSnap) => {
    let votes = {};
    if (docSnap.exists()) votes = docSnap.data().votes || {};
    
    let totalVotes = 0;
    activePoll.opts.forEach(opt => totalVotes += (votes[opt] || 0));

    optionsContainer.innerHTML = "";
    const hasVoted = localStorage.getItem(`voted-${pollId}`);

    activePoll.opts.forEach(opt => {
      const voteCount = votes[opt] || 0;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

      const row = document.createElement("div");
      row.style.position = "relative";
      row.style.width = "100%";


      if (hasVoted) {
        row.innerHTML = `
          <div style="width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 14px 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; font-size: 0.95rem;">
            <div style="position: absolute; top:0; left:0; bottom:0; width: ${percentage}%; background: rgba(59, 130, 246, 0.08); transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);"></div>
            <span style="color: rgba(255,255,255,0.85); font-weight: 600; z-index: 2;">${opt}</span>
            <span style="color: #fbbf24; font-weight: 800; font-family: monospace; z-index: 2; font-size: 1rem;">${percentage}%</span>
          </div>
        `;
      } else {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.style.width = "100%";
        btn.style.background = "rgba(255,255,255,0.03)";
        btn.style.border = "1px solid rgba(255,255,255,0.08)";
        btn.style.color = "#ffffff";
        btn.style.padding = "14px 18px";
        btn.style.borderRadius = "12px";
        btn.style.textAlign = "left";
        btn.style.fontWeight = "700";
        btn.style.fontSize = "0.95rem";
        btn.style.cursor = "pointer";

        btn.addEventListener("click", () => handleVoteSubmit(opt));
        row.appendChild(btn);
      }
      optionsContainer.appendChild(row);
    });
  });
}

async function handleVoteSubmit(selectedOption) {
  const pollDocRef = doc(db, "polls", pollId);
  localStorage.setItem(`voted-${pollId}`, "true");

  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(pollDocRef);
      let currentVotes = {};
      if (sfDoc.exists()) currentVotes = sfDoc.data().votes || {};
      currentVotes[selectedOption] = (currentVotes[selectedOption] || 0) + 1;
      transaction.set(pollDocRef, { votes: currentVotes }, { merge: true });
    });
  } catch (error) {
    console.error(error);
    localStorage.removeItem(`voted-${pollId}`);
  }
}

initPollStream();
