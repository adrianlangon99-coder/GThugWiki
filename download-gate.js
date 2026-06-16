let targetDownloadUrl = "";
let adTimerInterval = null;

window.triggerAdDownload = function(videoUrl) {
  targetDownloadUrl = videoUrl;
  
  const modal = document.getElementById("download-ad-gate-overlay");
  const actionBtn = document.getElementById("ad-unlock-download-btn");
  
  if (!modal || !actionBtn) return;
  
  let timeLeft = 10;
  actionBtn.disabled = true;
  actionBtn.innerText = `Please Wait (${timeLeft}s)`;
  actionBtn.style.background = "rgba(255,255,255,0.05)";
  actionBtn.style.color = "rgba(255,255,255,0.3)";
  actionBtn.style.border = "1px solid rgba(255,255,255,0.08)";
  actionBtn.style.cursor = "not-allowed";

  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; 

  clearInterval(adTimerInterval);

  adTimerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      actionBtn.innerText = `Please Wait (${timeLeft}s)`;
    } else {
      clearInterval(adTimerInterval);
      actionBtn.disabled = false;
      actionBtn.innerText = "Download Video File Now";
      actionBtn.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
      actionBtn.style.color = "#000000";
      actionBtn.style.border = "none";
      actionBtn.style.cursor = "pointer";
      actionBtn.style.boxShadow = "0 0 16px rgba(251, 191, 36, 0.3)";

      actionBtn.onclick = () => {
        executeFileDownload(targetDownloadUrl);
        closeDownloadAdGate();
      };
    }
  }, 1000);
};

function executeFileDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  const filename = url.substring(url.lastIndexOf('/') + 1);
  link.setAttribute('download', filename);
  link.target = "_blank";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.closeDownloadAdGate = function() {
  const modal = document.getElementById("download-ad-gate-overlay");
  const actionBtn = document.getElementById("ad-unlock-download-btn");
  
  clearInterval(adTimerInterval);
  if (modal) modal.style.display = "none";
  document.body.style.overflow = ""; 
  if (actionBtn) actionBtn.onclick = null;
};
