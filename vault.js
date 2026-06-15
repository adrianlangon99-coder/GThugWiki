document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Announcement Card Button logic
  const actionButtons = document.querySelectorAll('.card-action-btn');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = e.target.innerText;
      
      // Basic routing logic depending on which button was clicked
      if (buttonText === 'Report Issue') {
        console.log('Redirecting to Bug Report page...');
        // window.location.href = '/report';
      } else if (buttonText === 'Read Rules') {
        console.log('Redirecting to Rules page...');
        // window.location.href = '/rules';
      }
    });
  });

  // 2. Discussion Join Buttons
  const joinButtons = document.querySelectorAll('.join-btn');
  
  joinButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const btn = e.target;
      if (btn.innerText === 'Join') {
        btn.innerText = 'Joined';
        btn.style.background = '#10b981'; // Turn green upon joining
        btn.style.color = '#ffffff';
      } else {
        btn.innerText = 'Join';
        btn.style.background = '#ffffff';
        btn.style.color = '#0b0b0e';
      }
    });
  });

  // 3. Profile Dropdown Functionality
  const avatarTrigger = document.getElementById('profile-avatar-trigger');
  const dropdownMenu = document.getElementById('profile-dropdown-menu');

  if (avatarTrigger && dropdownMenu) {
    // Toggle visibility when clicking the avatar
    avatarTrigger.addEventListener('click', (event) => {
      event.stopPropagation(); // Stops event from bubbling up to document
      const isActive = dropdownMenu.classList.toggle('is-active');
      avatarTrigger.setAttribute('aria-expanded', isActive);
    });

    // Automatically dismiss menu when clicking anywhere else on the screen
    document.addEventListener('click', (event) => {
      if (!dropdownMenu.contains(event.target) && event.target !== avatarTrigger) {
        dropdownMenu.classList.remove('is-active');
        avatarTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Handle option link routing safely
    const menuItems = dropdownMenu.querySelectorAll('.dropdown-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // Custom route processing can be added here before loading next page
        console.log(`Navigating to: ${item.textContent.trim()}`);
      });
    });
  }

});
