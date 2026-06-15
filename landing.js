document.addEventListener('DOMContentLoaded', () => {

  // 1. Sticky Nav Background Blur Effect
  const nav = document.getElementById('top-nav');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // 2. Scroll Fade-In Animation Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Triggers when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add the class that animates it in
        entry.target.classList.add('show-element');
        // Stop observing once it has animated in
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Grab all sections marked as hidden and observe them
  const hiddenElements = document.querySelectorAll('.hidden-element');
  hiddenElements.forEach(el => observer.observe(el));

});
