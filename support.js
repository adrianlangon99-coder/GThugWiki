document.addEventListener('DOMContentLoaded', () => {
  const supportForm = document.getElementById('support-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  // Your specific Discord Webhook
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1514451678714400849/Q0kcv5jT5bfxTrGo8oxpanL09TDOlREPckGtkxv7lAjaLT0ut4hCpnf0FQSPYXIaUm-n";

  supportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide previous status
    formStatus.style.display = 'none';
    formStatus.className = 'form-status';
    
    // Set button to loading state
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    // Collect form data
    const email = document.getElementById('email').value;
    const issue = document.getElementById('issue').value;
    const message = document.getElementById('message').value;

    // Build the Discord Embed Payload
    const payload = {
      embeds: [{
        title: "🚨 New Support Ticket",
        color: 9133302, // ThugWiki Purple
        fields: [
          { name: "Email", value: email, inline: true },
          { name: "Issue Type", value: issue, inline: true },
          { name: "Message", value: message }
        ],
        footer: { text: "ThugWiki Support System" },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      // Send the POST request to Discord
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Success State
        formStatus.innerText = "Message sent successfully. We will be in touch!";
        formStatus.className = 'form-status success';
        supportForm.reset();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      // Error State
      console.error('Webhook Error:', error);
      formStatus.innerText = "Failed to send message. Please try again later.";
      formStatus.className = 'form-status error';
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerText = 'Send Message';
      formStatus.style.display = 'block';
    }
  });
});
