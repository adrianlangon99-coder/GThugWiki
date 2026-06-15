document.addEventListener('DOMContentLoaded', () => {
  const reportForm = document.getElementById('report-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  // Hardcoded Discord Webhook Destination
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1514451678714400849/Q0kcv5jT5bfxTrGo8oxpanL09TDOlREPckGtkxv7lAjaLT0ut4hCpnf0FQSPYXIaUm-n";

  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    formStatus.style.display = 'none';
    formStatus.className = 'form-status';
    
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';

    const reason = document.getElementById('report-reason').value;
    const details = document.getElementById('report-details').value;

    // Red-coded Embed Payload (15158332 = Crimson Red)
    const payload = {
      embeds: [{
        title: "🚩 High Priority Content Flag",
        color: 15158332, 
        fields: [
          { name: "Violation Category", value: reason, inline: false },
          { name: "Report Evidence / Explanation", value: details, inline: false }
        ],
        footer: { text: "ThugWiki Automation Security" },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        formStatus.innerText = "Thank you. The report has been delivered safely.";
        formStatus.className = 'form-status success';
        reportForm.reset();
      } else {
        throw new Error('Network failure response code.');
      }
    } catch (error) {
      console.error('Submission processing failure:', error);
      formStatus.innerText = "Could not send report. Please check your network connection.";
      formStatus.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Submit Report';
      formStatus.style.display = 'block';
    }
  });
});
