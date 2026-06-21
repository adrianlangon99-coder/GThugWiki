// ==========================================
// GLOBAL IDENTITY CHASSIS
// ==========================================
// Holds the true database username globally so uploads and comments never leak Google real names
let secureArchivistHandle = "Anonymous Archivist";

// ==========================================
// SECURITY AUTH GUARD & PROFILE HYDRO SYSTEM
// ==========================================
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'index.html';
  } else {
    console.log("Access Granted. User UID linked:", user.uid);
    const firestoreRef = firebase.firestore();

    firestoreRef.collection('users').doc(user.uid).get().then((profileDoc) => {
      if (profileDoc.exists && profileDoc.data().username) {
        secureArchivistHandle = profileDoc.data().username; 
      } else {
        secureArchivistHandle = user.displayName || "Archivist"; 
      }

      const identityBadge = document.getElementById('commentUserIdentity');
      if (identityBadge) {
        identityBadge.textContent = `Authenticated as: ${secureArchivistHandle}`;
      }

      const accDisplayName = document.getElementById('account-display-name');
      const accEmailAddress = document.getElementById('account-email-address');
      
      if (accDisplayName) accDisplayName.textContent = secureArchivistHandle;
      if (accEmailAddress) accEmailAddress.textContent = user.email;

      const fallbackSvg = document.getElementById('user-display-avatar');
      const profileImg = document.getElementById('user-profile-img');
      
      if (user.photoURL && profileImg) {
        profileImg.src = user.photoURL;
        profileImg.style.display = 'block';
        if (fallbackSvg) fallbackSvg.style.display = 'none';
      }

      // ==========================================
      // LIVE PERSONAL POSTS & STATS TRACKER
      // ==========================================
      const myPostsGrid = document.getElementById('user-posts-feed-grid');
      const karmaScoreBadge = document.getElementById('account-karma-score');
      const uploadsCountBadge = document.getElementById('account-uploads-count');

      const statsRowInline = document.querySelector('.profile-stats-row-layout');
      if (statsRowInline) {
        statsRowInline.style.setProperty('display', 'flex', 'important');
        statsRowInline.style.setProperty('align-items', 'center', 'important');
        statsRowInline.style.setProperty('width', '100%', 'important');
      }

      firestoreRef.collection('community_uploads')
        .where('username', '==', secureArchivistHandle)
        .onSnapshot((myPostsSnapshot) => {
          
          const myTotalUploadsCount = myPostsSnapshot.size;
          const myCalculatedKarma = myTotalUploadsCount * 5;

          if (karmaScoreBadge) karmaScoreBadge.innerText = myCalculatedKarma;
          if (uploadsCountBadge) uploadsCountBadge.innerText = myTotalUploadsCount;

          if (myPostsSnapshot.empty) {
            if (myPostsGrid) {
              myPostsGrid.innerHTML = `
                <div id="no-posts-fallback" class="empty-feed-msg" style="grid-column: 1 / -1; text-align: center; padding: 30px 0; color: #717684;">
                  <p style="margin: 0; font-size: 0.9rem;">No published archive logs yet</p>
                </div>
              `;
            }
            return;
          }

          const personalVideosList = [];
          myPostsSnapshot.forEach(doc => personalVideosList.push(doc.data()));
          personalVideosList.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

          if (myPostsGrid) {
            myPostsGrid.innerHTML = "";
            myPostsGrid.style.setProperty('display', 'grid', 'important');
            myPostsGrid.style.setProperty('grid-template-columns', 'repeat(auto-fill, minmax(160px, 1fr))', 'important');
            myPostsGrid.style.setProperty('gap', '14px', 'important');
            myPostsGrid.style.setProperty('width', '100%', 'important');
          }

          personalVideosList.forEach((post) => {
            const vUrl = post.video_url || "";
            const vTitle = post.title || "Untitled Archive Log";
            const timeTag = post.timestamp || "Archived";
            const thumbSrc = post.thumb_url || vUrl.replace(/\.[^/.]+$/, ".jpg");

            // 🎯 RESTORED PLAYABLE CARD WRAPPER + MOVED DOWNLOAD BUTTON INTO TITLE FLEX ROW
            const userCardHtml = `
              <div class="user-video-card playable-media-card" data-src="${vUrl}" data-title="${vTitle.replace(/"/g, '&quot;')}" data-meta="Uploaded by You • ${timeTag}" style="display: block !important; width: 100% !important; cursor: pointer;">
                <div class="video-preview-box" style="background-image: url('${thumbSrc}'); background-size: cover; background-position: center; height: 100px !important; position: relative !important; border-radius: 8px !important; overflow: hidden !important;">
                  <span class="video-duration-tag" style="position: absolute !important; bottom: 6px !important; right: 6px !important; background: rgba(0,0,0,0.8) !important; padding: 2px 6px !important; border-radius: 4px !important; font-size: 0.7rem !important; color: #fff !important; font-weight: 700 !important;">+5 Karma</span>
                </div>
                <div class="video-card-details" style="padding-top: 8px !important; display: flex !important; align-items: flex-start !important; justify-content: space-between !important; gap: 8px !important; text-align: left !important;">
                  <div style="flex: 1; min-width: 0;">
                    <h4 class="video-card-title" style="margin: 0 !important; font-size: 0.85rem !important; color: #fff !important; line-height: 1.3 !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important;">${vTitle}</h4>
                    <p class="video-card-meta" style="margin: 2px 0 0 0 !important; font-size: 0.75rem !important; color: #717684 !important;">${timeTag}</p>
                  </div>
                  <button type="button" class="vault-download-trigger-btn" 
                          data-download-url="${vUrl}" 
                          data-download-title="${vTitle.replace(/"/g, '&quot;')}"
                          style="background: #1c1e24; border: 1px solid #2b2e3a; border-radius: 6px; color: #8e94a6; padding: 6px 8px; cursor: pointer; flex-shrink: 0; transition: color 0.15s;" 
                          title="Download Log">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </div>
            `;

            myPostsGrid.insertAdjacentHTML('beforeend', userCardHtml);
          });
        });
    }).catch(err => console.error("Database reading lock exception:", err));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  
  const splashScreen = document.getElementById('app-splash-screen');
  if (splashScreen) {
    if (sessionStorage.getItem('forceLoader') === 'true') {
      sessionStorage.removeItem('forceLoader');
      sessionStorage.removeItem('splashShown'); 
    }

    if (sessionStorage.getItem('splashShown') === 'true') {
      splashScreen.style.display = 'none';
    } else {
      splashScreen.classList.remove('gate-dismiss-bounce');
      splashScreen.style.display = 'flex';

      setTimeout(() => {
        splashScreen.classList.add('gate-dismiss-bounce');
        setTimeout(() => {
          splashScreen.style.display = 'none';
        }, 650); 
      }, 3000); 
      
      sessionStorage.setItem('splashShown', 'true');
    }
  }

  const avatarTrigger = document.getElementById('profile-avatar-trigger');
  const dropdownMenu = document.getElementById('profile-dropdown-menu');
  const searchTrigger = document.getElementById('yt-search-trigger');
  const searchBackArrow = document.getElementById('search-back-arrow-btn');
  const searchOverlayBar = document.getElementById('mobile-search-overlay-bar');
  const mainNavContainer = document.getElementById('main-nav-container');
  const mobileSearchInput = document.getElementById('yt-mobile-search-input');
  const searchInputForm = document.querySelector('.search-input-form-wrapper');

  const goToSupportBtn = document.getElementById('go-to-support-btn');
  const backToRulesBtn = document.getElementById('back-to-rules-btn');
  const rulesView = document.getElementById('rules-view-content');
  const supportView = document.getElementById('support-view-content');
  const portalTitle = document.getElementById('portal-title');

  const karmaInfoBtn = document.getElementById('karma-info-trigger');
  const karmaExplBox = document.getElementById('karma-explanation-box');

  if (karmaInfoBtn && karmaExplBox) {
    karmaInfoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      karmaExplBox.style.display = (karmaExplBox.style.display === 'none') ? 'block' : 'none';
    });
  }

  if (searchTrigger && searchBackArrow && searchOverlayBar) {
    searchTrigger.addEventListener('click', () => {
      searchOverlayBar.classList.add('search-is-active');
      if (mainNavContainer) mainNavContainer.style.opacity = '0';
      setTimeout(() => { if (mobileSearchInput) mobileSearchInput.focus(); }, 150);
    });

    searchBackArrow.addEventListener('click', () => {
      searchOverlayBar.classList.remove('search-is-active');
      if (mainNavContainer) mainNavContainer.style.opacity = '1';
      if (mobileSearchInput) mobileSearchInput.value = '';
      
      document.querySelectorAll('.yt-video-card, .yt-channel-card, .user-video-card').forEach(card => {
        card.style.display = '';
      });
    });

    if (searchInputForm) searchInputForm.addEventListener('submit', (e) => e.preventDefault());

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const allCards = document.querySelectorAll('.yt-video-card, .yt-channel-card, .user-video-card');

        allCards.forEach(card => {
          const title = (card.getAttribute('data-title') || card.querySelector('.video-card-title')?.getAttribute('data-title') || "").toLowerCase();
          const text = card.textContent.toLowerCase();
          card.style.display = (title.includes(query) || text.includes(query)) ? '' : 'none';
        });
      });
    }
  }

  if (avatarTrigger && dropdownMenu) {
    avatarTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isActive = dropdownMenu.classList.toggle('is-active');
      avatarTrigger.setAttribute('aria-expanded', isActive);
    });

    document.addEventListener('click', (event) => {
      if (!dropdownMenu.contains(event.target) && !avatarTrigger.contains(event.target)) {
        dropdownMenu.classList.remove('is-active');
        avatarTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const initPortalInstance = (triggerId, overlayId, closeId) => {
    const trigger = document.getElementById(triggerId);
    const overlay = document.getElementById(overlayId);
    const closeBtn = document.getElementById(closeId);

    if (trigger && overlay && closeBtn) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdownMenu = document.getElementById('profile-dropdown-menu');
        const avatarTrigger = document.getElementById('profile-avatar-trigger');
        if (dropdownMenu) dropdownMenu.classList.remove('is-active');
        if (avatarTrigger) avatarTrigger.setAttribute('aria-expanded', 'false');
        
        overlay.classList.add('is-open');
        document.body.classList.add('modal-open');
      });

      const terminateModalView = () => {
        overlay.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        if (overlayId === 'rules-modal-overlay') {
          setTimeout(() => {
            if (rulesView && supportView && portalTitle) {
              supportView.style.display = 'none';
              rulesView.style.display = 'block';
              portalTitle.innerText = 'Platform Rules';
            }
            const nestedSupportForm = document.getElementById('portal-support-form');
            if (nestedSupportForm) nestedSupportForm.reset();
          }, 200);
        }
      };

      closeBtn.addEventListener('click', terminateModalView);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) terminateModalView(); });
    }
  };

  initPortalInstance('yt-upload-trigger', 'upload-modal-overlay', 'close-upload-btn');
  initPortalInstance('open-account-trigger', 'account-modal-overlay', 'close-account-btn');
  initPortalInstance('open-rules-trigger', 'rules-modal-overlay', 'close-rules-btn');
  initPortalInstance('open-invite-trigger', 'invite-modal-overlay', 'close-invite-btn');
  initPortalInstance('open-support-trigger', 'support-modal-overlay', 'close-support-btn');
  initPortalInstance('see-all-thugs-btn', 'thugs-modal-overlay', 'close-thugs-btn');
  initPortalInstance('see-all-videos-btn', 'videos-modal-overlay', 'close-videos-btn');
  initPortalInstance('see-all-audio-btn', 'audio-modal-overlay', 'close-audio-btn');
  initPortalInstance('see-all-creators-btn', 'creators-modal-overlay', 'close-creators-btn');
  initPortalInstance('see-all-thugs-toggle', 'all-thugs-modal-overlay', 'close-all-thugs-btn');

  const triggerCustomSignout = document.getElementById('trigger-custom-signout');
  const abortSignoutBtn = document.getElementById('abort-signout-btn');
  const executeSignout = document.getElementById('execute-signout-btn');
  const profileMainState = document.getElementById('profile-main-state');
  const profileConfirmState = document.getElementById('profile-confirm-state');
  const accountPortalHeading = document.getElementById('account-portal-heading');
  const accountOverlayWindow = document.getElementById('account-modal-overlay');

  if (triggerCustomSignout && abortSignoutBtn && executeSignout && profileMainState && profileConfirmState) {
    triggerCustomSignout.addEventListener('click', () => {
      profileMainState.style.display = 'none';
      profileConfirmState.style.display = 'block';
      if (accountPortalHeading) accountPortalHeading.innerText = 'Confirm Sign Out';
    });

    const revertProfileViewState = () => {
      profileConfirmState.style.display = 'none';
      profileMainState.style.display = 'block';
      if (accountPortalHeading) accountPortalHeading.innerText = 'My Profile';
    };

    abortSignoutBtn.addEventListener('click', revertProfileViewState);
    executeSignout.addEventListener('click', () => {
      executeSignout.disabled = true;
      executeSignout.innerText = "Signing out...";
      firebase.auth().signOut().then(() => {
        if (accountOverlayWindow) accountOverlayWindow.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        sessionStorage.removeItem('splashShown');
        window.location.href = 'index.html';
      }).catch((error) => {
        alert(`Sign Out Fault: ${error.message}`);
        executeSignout.disabled = false;
        executeSignout.innerText = "Sign Out";
      });
    });

    const closeAccountBtn = document.getElementById('close-account-btn');
    if (closeAccountBtn) closeAccountBtn.addEventListener('click', () => setTimeout(revertProfileViewState, 250));
    if (accountOverlayWindow) accountOverlayWindow.addEventListener('click', (e) => { if (e.target === accountOverlayWindow) setTimeout(revertProfileViewState, 250); });
  }

  // ==========================================
  // YOUTUBE CINEMATIC THEATER CONTROLLER
  // ==========================================
  const theaterModal = document.getElementById('yt-theater-modal');
  const theaterVideo = document.getElementById('theater-video-player');
  const theaterTitle = document.getElementById('theater-title');
  const theaterSubtitle = document.getElementById('theater-subtitle');
  const closeTheaterBtn = document.getElementById('close-theater-btn');
  const emojiContainer = document.getElementById('theater-emoji-container');
  const commentForm = document.getElementById('theater-comment-form');
  const newCommentField = document.getElementById('new-comment-field');
  const commentsFeed = document.getElementById('theater-comments-feed');
  const totalCommentsCounter = document.getElementById('comments-total-counter');

  const db = firebase.firestore();
  let activeVideoKey = "";
  let unsubscribeRealtimeFeed = null; 
  let localUserReactions = {};       

  const getDocIdFromUrl = (url) => btoa(url).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');

  const renderTheaterAddonData = (docData) => {
    if (emojiContainer) {
      const emojiButtons = emojiContainer.querySelectorAll('.emoji-react-btn');
      const reactions = docData.reactions || { "🔥": 0, "😂": 0, "👑": 0, "😱": 0, "💯": 0 };
      emojiButtons.forEach(btn => {
        const emojiSymbol = btn.getAttribute('data-emoji');
        const countBadge = btn.querySelector('.react-count');
        if (countBadge) countBadge.innerText = reactions[emojiSymbol] || 0;
        if (localUserReactions[emojiSymbol]) btn.classList.add('user-has-reacted');
        else btn.classList.remove('user-has-reacted');
      });
    }

    if (commentsFeed && totalCommentsCounter) {
      commentsFeed.innerHTML = "";
      const commentsList = docData.comments || [];
      totalCommentsCounter.innerText = commentsList.length;
      const displayComments = [...commentsList].reverse();
      displayComments.forEach(cmt => {
        const initialChar = cmt.username ? cmt.username.charAt(0).toUpperCase() : "A";
        commentsFeed.insertAdjacentHTML('beforeend', `
          <div class="comment-node-card">
            <div class="comment-mini-avatar">${initialChar}</div>
            <div class="comment-msg-details">
              <h5 class="comment-user-headline">${cmt.username} <span>${cmt.timestamp}</span></h5>
              <p class="comment-body-string">${cmt.body}</p>
            </div>
          </div>
        `);
      });
    }
  };

  document.addEventListener('click', (e) => {
    // 🛑 THE EXPLICIT BAIL-OUT GUARD: If they clicked a download button, DO NOT open the video player!
    if (e.target.closest('.vault-download-trigger-btn')) return;

    const card = e.target.closest('.playable-media-card');
    if (!card) return;

    e.preventDefault();
    if (unsubscribeRealtimeFeed) { unsubscribeRealtimeFeed(); unsubscribeRealtimeFeed = null; }

    const mediaSrc = card.getAttribute('data-src');
    const titleText = card.getAttribute('data-title');
    const metaText = card.getAttribute('data-meta');

    if (!mediaSrc || !theaterModal || !theaterVideo) return;
    activeVideoKey = mediaSrc;
    localUserReactions = {}; 

    if (theaterTitle) theaterTitle.textContent = titleText || "Untitled";
    if (theaterSubtitle) theaterSubtitle.textContent = metaText || "Loading...";
    if (commentsFeed) commentsFeed.innerHTML = ""; 
    if (totalCommentsCounter) totalCommentsCounter.innerText = "0";

    theaterVideo.src = mediaSrc;
    const docId = getDocIdFromUrl(activeVideoKey);

    unsubscribeRealtimeFeed = db.collection('video_metadata').doc(docId).onSnapshot((doc) => {
      if (doc.exists) renderTheaterAddonData(doc.data());
      else {
        const freshRecord = { reactions: { "🔥": 0, "😂": 0, "👑": 0, "😱": 0, "💯": 0 }, comments: [] };
        db.collection('video_metadata').doc(docId).set(freshRecord);
        renderTheaterAddonData(freshRecord);
      }
    });

    theaterModal.classList.add('is-open');
    document.body.classList.add('modal-open');
    theaterVideo.play().catch(err => console.log("Playback engine waiting...", err));
  });

  const terminateTheaterSession = () => {
    if (!theaterModal || !theaterVideo) return;
    theaterModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    theaterVideo.pause();
    theaterVideo.src = ''; 
    if (unsubscribeRealtimeFeed) { unsubscribeRealtimeFeed(); unsubscribeRealtimeFeed = null; }
    activeVideoKey = ""; 
  };

  if (closeTheaterBtn) closeTheaterBtn.addEventListener('click', terminateTheaterSession);

  if (emojiContainer) {
    emojiContainer.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.emoji-react-btn');
      if (!targetBtn || !activeVideoKey) return;
      const emojiSymbol = targetBtn.getAttribute('data-emoji');
      const docRef = db.collection('video_metadata').doc(getDocIdFromUrl(activeVideoKey));

      if (localUserReactions[emojiSymbol]) {
        docRef.update({ [`reactions.${emojiSymbol}`]: firebase.firestore.FieldValue.increment(-1) });
        localUserReactions[emojiSymbol] = false;
      } else {
        docRef.update({ [`reactions.${emojiSymbol}`]: firebase.firestore.FieldValue.increment(1) });
        localUserReactions[emojiSymbol] = true;
      }
    });
  }

  if (commentForm && newCommentField) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const textString = newCommentField.value.trim();
      if (!textString || !activeVideoKey) return;

      const newCommentData = { username: secureArchivistHandle, timestamp: "Just now", body: textString, created_at: Date.now() };
      const docRef = db.collection('video_metadata').doc(getDocIdFromUrl(activeVideoKey));

      docRef.get().then((doc) => {
        if (!doc.exists) return docRef.set({ reactions: { "🔥": 0, "😂": 0, "👑": 0, "😱": 0, "💯": 0 }, comments: [newCommentData] });
        else return docRef.update({ comments: firebase.firestore.FieldValue.arrayUnion(newCommentData) });
      }).then(() => {
        newCommentField.value = "";
        if (commentsFeed) commentsFeed.scrollTop = 0;
      }).catch(() => alert("Database blocked comment dispatch."));
    });
  }

  // ==========================================
  // CLOUDINARY USER UPLOADS REAL-TIME FEED
  // ==========================================
  const cloudinaryVideoFeed = document.getElementById('cloudinary-video-feed');
  if (cloudinaryVideoFeed) {
    db.collection('community_uploads').orderBy('created_at', 'desc').onSnapshot((snapshot) => {
      if (snapshot.empty) {
        cloudinaryVideoFeed.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: #717684;">
            <p style="margin: 0; font-size: 0.95rem;">The vault is currently vacant.</p>
            <span style="font-size: 0.8rem; opacity: 0.7;">Be the first to upload an archive log!</span>
          </div>
        `;
        return;
      }

      cloudinaryVideoFeed.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const videoUrl = data.video_url || "";
        const videoTitle = data.title || "Untitled Archive Log";
        const uploaderName = data.username || "Anonymous";
        const timeTag = data.timestamp || "Just now";
        const duration = data.duration || "0:30";
        const thumbSource = data.thumb_url || videoUrl.replace(/\.[^/.]+$/, ".jpg");

        // 🎯 RESTORED PLAYABLE CARD WRAPPER + MOVED DOWNLOAD BUTTON INTO TITLE FLEX ROW
        cloudinaryVideoFeed.insertAdjacentHTML('beforeend', `
          <div class="user-video-card playable-media-card" data-src="${videoUrl}" data-title="${videoTitle.replace(/"/g, '&quot;')}" data-meta="Uploaded by ${uploaderName} • ${timeTag}" style="cursor: pointer;">
            <div class="video-preview-box" style="background-image: url('${thumbSource}'); background-size: cover; background-position: center;">
              <span class="video-duration-tag">${duration}</span>
            </div>
            <div class="video-card-details" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-top: 8px;">
              <div style="flex: 1; min-width: 0; text-align: left;">
                <h4 class="video-card-title">${videoTitle}</h4>
                <p class="video-card-meta">Uploaded by ${uploaderName} • ${timeTag}</p>
              </div>
              <button type="button" class="vault-download-trigger-btn" 
                      data-download-url="${videoUrl}" 
                      data-download-title="${videoTitle.replace(/"/g, '&quot;')}"
                      style="background: #1c1e24; border: 1px solid #2b2e3a; border-radius: 6px; color: #8e94a6; padding: 6px 8px; cursor: pointer; flex-shrink: 0; transition: color 0.15s;" 
                      title="Download Archive Log">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>
        `);
      });
    }, () => { cloudinaryVideoFeed.innerHTML = `<p style="color: #ff4757;">Vault connection failed.</p>`; });
  }

  // ==========================================
  // CLOUDINARY DIRECT VIDEO UPLOAD SYSTEM
  // ==========================================
  const uploadFormNode = document.getElementById('vault-video-upload-form');
  const filePickerNode = document.getElementById('vault-file-picker');
  const dropzoneNode = document.getElementById('dropzone-trigger');
  const statusTextNode = document.getElementById('upload-status-text');
  const filenameBadgeNode = document.getElementById('upload-file-name-badge');
  const uploadTitleNode = document.getElementById('vault-upload-title-field');
  const uploadSubmitBtnNode = document.getElementById('vault-upload-submit-btn');

  const CLOUDINARY_CLOUD_NAME = "dffke1zqo"; 
  const CLOUDINARY_PRESET_NAME = "ThugWiki"; 

  if (uploadFormNode && filePickerNode && dropzoneNode) {
    let targetUploadBlob = null;
    dropzoneNode.addEventListener('click', () => filePickerNode.click());
    filePickerNode.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        targetUploadBlob = e.target.files[0];
        if (statusTextNode) statusTextNode.innerText = "Video Selected! 🎬";
        if (filenameBadgeNode) filenameBadgeNode.innerText = `${targetUploadBlob.name} (${(targetUploadBlob.size / (1024 * 1024)).toFixed(2)} MB)`;
      }
    });

    uploadFormNode.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!targetUploadBlob) return alert("Please select a video file first!");

      uploadSubmitBtnNode.disabled = true; uploadSubmitBtnNode.innerText = "Uploading File (0%)..."; uploadSubmitBtnNode.style.opacity = "0.5";

      const formPayload = new FormData(); formPayload.append('file', targetUploadBlob); formPayload.append('upload_preset', CLOUDINARY_PRESET_NAME);
      const xhrStream = new XMLHttpRequest(); xhrStream.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, true);

      xhrStream.upload.onprogress = (event) => { if (event.lengthComputable) uploadSubmitBtnNode.innerText = `Uploading File (${Math.floor((event.loaded / event.total) * 100)}%)...`; };

      xhrStream.onload = () => {
        if (xhrStream.status === 200) {
          const finishedSecureUrl = JSON.parse(xhrStream.responseText).secure_url;
          db.collection('community_uploads').add({ title: uploadTitleNode.value.trim(), video_url: finishedSecureUrl, username: secureArchivistHandle, timestamp: "Just now", created_at: Date.now() })
            .then(() => {
              uploadFormNode.reset(); targetUploadBlob = null;
              if (statusTextNode) statusTextNode.innerText = "Select video file to upload";
              if (filenameBadgeNode) filenameBadgeNode.innerText = "or drag and drop archive logs";
              uploadSubmitBtnNode.disabled = false; uploadSubmitBtnNode.innerText = "Publish"; uploadSubmitBtnNode.style.opacity = "1";
              document.getElementById('upload-modal-overlay')?.classList.remove('is-open'); document.body.classList.remove('modal-open');
            }).catch(() => { alert("Database sync broke."); uploadSubmitBtnNode.disabled = false; uploadSubmitBtnNode.innerText = "Publish"; uploadSubmitBtnNode.style.opacity = "1"; });
        } else { alert("Upload failed. Verify unsigned preset."); uploadSubmitBtnNode.disabled = false; uploadSubmitBtnNode.innerText = "Publish"; uploadSubmitBtnNode.style.opacity = "1"; }
      };
      xhrStream.onerror = () => { alert("Network error."); uploadSubmitBtnNode.disabled = false; uploadSubmitBtnNode.innerText = "Publish"; uploadSubmitBtnNode.style.opacity = "1"; };
      xhrStream.send(formPayload);
    });
  }

  if (goToSupportBtn && backToRulesBtn && rulesView && supportView && portalTitle) {
    goToSupportBtn.addEventListener('click', () => { rulesView.style.display = 'none'; supportView.style.display = 'block'; portalTitle.innerText = 'Contact Support'; });
    backToRulesBtn.addEventListener('click', () => { supportView.style.display = 'none'; rulesView.style.display = 'block'; portalTitle.innerText = 'Platform Rules'; });
  }

  const handleTicketSubmission = (formElement, userEmailId, userMsgId, submitBtn) => {
    if (!formElement || !submitBtn) return; 
    formElement.addEventListener('submit', function(e) {
      e.preventDefault(); submitBtn.disabled = true; const originalBtnText = submitBtn.innerText; submitBtn.innerText = "Transmitting..."; submitBtn.style.opacity = "0.5";
      const emailField = document.getElementById(userEmailId); const msgField = document.getElementById(userMsgId);

      fetch('https://discord.com/api/webhooks/1514451678714400849/Q0kcv5jT5bfxTrGo8oxpanL09TDOlREPckGtkxv7lAjaLT0ut4hCpnf0FQSPYXIaUm-n', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "ThugWiki Support Desk", embeds: [{ title: "🚨 New Support Ticket Created", color: 391166, fields: [{ name: "👤 User Account Info / Email", value: emailField?.value || "Anonymous", inline: true }, { name: "💬 Logged Message Detail", value: msgField?.value || "No message detailed.", inline: false }], timestamp: new Date().toISOString() }] })
      }).then(response => {
        if (response.ok) {
          alert("Support ticket dispatched successfully!"); formElement.reset(); submitBtn.disabled = false; submitBtn.innerText = originalBtnText; submitBtn.style.opacity = "1";
          document.getElementById('support-modal-overlay')?.classList.remove('is-open'); document.getElementById('rules-modal-overlay')?.classList.remove('is-open'); document.body.classList.remove('modal-open');
        } else throw new Error('Rejection');
      }).catch(() => { alert('Delivery timed out.'); submitBtn.disabled = false; submitBtn.innerText = originalBtnText; submitBtn.style.opacity = "1"; });
    });
  };

  handleTicketSubmission(document.getElementById('ticket-submission-form'), 'ticket-username', 'ticket-message', document.getElementById('ticket-submit-btn'));
  handleTicketSubmission(document.getElementById('portal-support-form'), 'support-email', 'support-msg', document.getElementById('portal-support-form')?.querySelector('button[type="submit"]'));

  const copyLinkBtn = document.getElementById('copy-link-btn'); const shareTextBtn = document.getElementById('share-text-btn'); const targetUrl = "https://www.thugwiki.com";
  if (copyLinkBtn) copyLinkBtn.addEventListener('click', () => { navigator.clipboard.writeText(targetUrl).then(() => { copyLinkBtn.innerHTML = `Copied!`; setTimeout(() => copyLinkBtn.innerHTML = `Copy Link`, 2000); }); });
  if (shareTextBtn) shareTextBtn.addEventListener('click', () => { if (navigator.share) navigator.share({ title: 'ThugWiki Hub', url: targetUrl }); else window.location.href = `sms:?&body=Check out ThugWiki: ${encodeURIComponent(targetUrl)}`; });

  const seeAllThugsToggle = document.getElementById('see-all-thugs-toggle'); const allThugsWideView = document.getElementById('all-thugs-wide-view');
  if (seeAllThugsToggle && allThugsWideView) seeAllThugsToggle.addEventListener('click', () => { allThugsWideView.style.display = (allThugsWideView.style.display === 'none') ? 'block' : 'none'; });

  // ==========================================
  // BLOB-STREAM DIRECT VIDEO DOWNLOAD ENGINE
  // ==========================================
  document.addEventListener('click', (e) => {
    const downloadBtn = e.target.closest('.vault-download-trigger-btn');
    if (!downloadBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const rawVideoLink = downloadBtn.getAttribute('data-download-url');
    const displayVideoTitle = downloadBtn.getAttribute('data-download-title') || 'archive-log';
    if (!rawVideoLink) return alert("Resource endpoint broken.");

    const internalBtnMarkup = downloadBtn.innerHTML;
    downloadBtn.style.opacity = '0.5'; downloadBtn.disabled = true;

    fetch(rawVideoLink)
      .then(res => { if (!res.ok) throw new Error(); return res.blob(); })
      .then(blobData => {
        const virtualBlobUrl = window.URL.createObjectURL(blobData);
        const processingAnchorNode = document.createElement('a');
        processingAnchorNode.style.display = 'none'; processingAnchorNode.href = virtualBlobUrl; processingAnchorNode.download = displayVideoTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.mp4';
        document.body.appendChild(processingAnchorNode); processingAnchorNode.click();
        window.URL.revokeObjectURL(virtualBlobUrl); document.body.removeChild(processingAnchorNode);
        downloadBtn.style.opacity = '1'; downloadBtn.disabled = false; downloadBtn.innerHTML = internalBtnMarkup;
      }).catch(() => { window.open(rawVideoLink, '_blank'); downloadBtn.style.opacity = '1'; downloadBtn.disabled = false; downloadBtn.innerHTML = internalBtnMarkup; });
  });

  document.addEventListener('gesturestart', (e) => e.preventDefault());
});
