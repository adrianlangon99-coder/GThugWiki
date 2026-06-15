document.addEventListener('DOMContentLoaded', () => {
  
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');

    questionBtn.addEventListener('click', () => {
      // Check if the clicked item is already open
      const isOpen = item.classList.contains('is-open');

      // Optional: Close all other open FAQs for a clean accordion experience
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('is-open');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // If it wasn't open, open it now
      if (!isOpen) {
        item.classList.add('is-open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

});
