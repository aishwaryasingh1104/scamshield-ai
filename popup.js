document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scan-btn');
  const btnText = scanBtn.querySelector('.btn-text');
  const loader = scanBtn.querySelector('.loader');

  const urlDisplay = document.getElementById('url-display');
  const riskScoreDiv = document.getElementById('risk-score');
  const scoreNumber = document.getElementById('score-number');
  const progressBar = document.getElementById('progress-bar');
  const statusRow = document.getElementById('status-row');
  const statusText = document.getElementById('status-text');
  const confidenceRow = document.getElementById('confidence-row');
  const confidenceText = document.getElementById('confidence-text');
  const diagnosticsPanel = document.getElementById('diagnostics-panel');
  const reasonsList = document.getElementById('reasons-list');

  // Load active tab immediately
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const urlObj = new URL(tabs[0].url);
        urlDisplay.textContent = urlObj.hostname;
      } catch (e) {
        urlDisplay.textContent = 'Invalid URL format';
      }
    }
  });

  scanBtn.addEventListener('click', async () => {
    btnText.textContent = 'Running ML Model...';
    loader.classList.remove('hidden');
    scanBtn.disabled = true;

    // Hide panels for animation reset
    riskScoreDiv.classList.add('hidden');
    statusRow.classList.add('hidden');
    confidenceRow.classList.add('hidden');
    diagnosticsPanel.classList.add('hidden');
    reasonsList.innerHTML = '';
    progressBar.style.width = '0%';

    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        // Simulate ML Model inference time
        setTimeout(() => {
          runMLPrediction(tab.url);
          btnText.textContent = 'Run ML Analysis Again';
          loader.classList.add('hidden');
          scanBtn.disabled = false;
        }, 800);
      } else {
        urlDisplay.textContent = 'Cannot access this page';
        resetButton();
      }
    } catch (error) {
      console.error('Scan failed:', error);
      urlDisplay.textContent = 'Error scanning page';
      resetButton();
    }
  });

  function resetButton() {
    btnText.textContent = 'Run ML Analysis';
    loader.classList.add('hidden');
    scanBtn.disabled = false;
  }

  /**
   * ML Logic: Simulated Logistic Regression Classifier
   * 
   * In a real logistic regression model, we calculate a "z" score
   * by taking the sum of our features multiplied by their learned weights.
   * We then pass "z" through a Sigmoid function to get a probability between 0 and 1.
   * 
   * Formula: P(Phishing) = 1 / (1 + e^-z)
   * where z = w0 + (w1 * feature1) + (w2 * feature2) + ...
   */
  function runMLPrediction(url) {
    const reasons = [];
    const lowerUrl = url.toLowerCase();

    // Feature Extraction
    let f_length = url.length > 75 ? 1 : 0;

    // Extract hostname properly to count dots and hyphens safely
    let hostname = "";
    let isHttps = 0;
    try {
      const urlObj = new URL(url);
      hostname = urlObj.hostname.toLowerCase();
      isHttps = urlObj.protocol === 'https:' ? 1 : 0;
    } catch (e) {
      // Fallback if URL is malformed
      hostname = url;
    }

    const f_dots = (hostname.match(/\./g) || []).length > 3 ? 1 : 0;
    const f_hyphens = (hostname.match(/-/g) || []).length > 2 ? 1 : 0;
    const f_atSymbol = url.includes('@') ? 1 : 0;

    const scamWords = ['free', 'login', 'verify', 'gift', 'offer', 'bank', 'update'];
    const f_suspiciousWords = scamWords.filter(word => lowerUrl.includes(word)).length;

    const suspiciousTLDs = ['.xyz', '.top', '.click', '.shop'];
    const f_riskyTld = suspiciousTLDs.some(tld => hostname.endsWith(tld)) ? 1 : 0;
    const f_noHttps = isHttps === 1 ? 0 : 1; // Feature is 1 if NOT secure

    // Document Extracted Features for UI
    if (f_length) reasons.push({ text: "Suspiciously long URL", type: "negative" });
    if (f_dots) reasons.push({ text: "Excessive subdomains (many dots)", type: "negative" });
    if (f_hyphens) reasons.push({ text: "Excessive hyphens in domain", type: "negative" });
    if (f_atSymbol) reasons.push({ text: "Contains '@' symbol (obfuscation risk)", type: "negative" });
    if (f_suspiciousWords > 0) reasons.push({ text: `Found ${f_suspiciousWords} phishing keyword(s)`, type: "negative" });
    if (f_riskyTld) reasons.push({ text: "Uses high-risk Top Level Domain", type: "negative" });

    if (f_noHttps) {
      reasons.push({ text: "Not using secure HTTPS", type: "negative" });
    } else {
      reasons.push({ text: "HTTPS enabled (Secure connection)", type: "positive" });
    }

    // Logistic Regression Weights (Trained parameters)
    const w_bias = -3.5;            // Default bias (assume safe)
    const w_length = 0.8;           // Penalty for long URLs
    const w_dots = 1.2;             // Penalty for deep subdomains
    const w_hyphens = 1.5;          // Penalty for dash-heavy domains
    const w_atSymbol = 4.0;         // Huge penalty for '@' credential spoofing
    const w_suspiciousWords = 1.1;  // Penalty per scam word
    const w_riskyTld = 2.0;         // Penalty for cheap/spammy TLDs
    const w_noHttps = 5.0;          // Huge penalty for lack of SSL

    // Calculate z (Log-odds)
    let z = w_bias
      + (w_length * f_length)
      + (w_dots * f_dots)
      + (w_hyphens * f_hyphens)
      + (w_atSymbol * f_atSymbol)
      + (w_suspiciousWords * f_suspiciousWords)
      + (w_riskyTld * f_riskyTld)
      + (w_noHttps * f_noHttps);

    // Apply Sigmoid Function: 1 / (1 + e^-z)
    // This squashes the z score into a probability between 0 and 1.
    const probability = 1 / (1 + Math.exp(-z));

    // Convert probability to a 0-100 Risk Score %
    const riskScore = Math.min(Math.round(probability * 100), 100);

    // Calculate Model Confidence
    // In binary classification, confidence is highest when probability is near 0 or 1.
    // It is lowest when probability is near 0.5 (the decision boundary).
    // Formula: | P - 0.5 | * 2 * 100
    const confidenceScore = Math.round(Math.abs(probability - 0.5) * 2 * 100);

    // If perfectly safe (very negative z), log safe diagnostics
    if (riskScore < 10) {
      if (f_suspiciousWords === 0) reasons.push({ text: "No suspicious keywords detected", type: "positive" });
      if (f_dots === 0 && f_hyphens === 0 && !f_riskyTld) reasons.push({ text: "Standard domain structure", type: "positive" });
    }

    displayResults(riskScore, confidenceScore, reasons);
  }

  function displayResults(score, confidence, reasons) {
    riskScoreDiv.classList.remove('hidden');
    statusRow.classList.remove('hidden');
    confidenceRow.classList.remove('hidden');
    diagnosticsPanel.classList.remove('hidden');

    progressBar.className = 'progress-bar';
    statusText.className = 'value status-badge';

    // Animate score from 0
    let currentScore = 0;
    const interval = setInterval(() => {
      scoreNumber.textContent = currentScore;
      if (currentScore >= score) {
        clearInterval(interval);
        scoreNumber.textContent = score;
      } else {
        currentScore += Math.ceil((score - currentScore) / 10) || 1;
      }
    }, 30);

    // Animate progress bar width
    setTimeout(() => {
      // Ensure at minimum 3% width so the bar is slightly visible even at 0% score
      progressBar.style.width = Math.max(score, 3) + '%';
    }, 50);

    // Set Confidence
    confidenceText.textContent = `${confidence}%`;

    // Set styling and labels based on risk thresholds
    if (score >= 60) {
      progressBar.classList.add('danger');
      statusText.classList.add('danger');
      statusText.textContent = 'Dangerous 🚨';
    } else if (score >= 20) {
      progressBar.classList.add('warning');
      statusText.classList.add('warning');
      statusText.textContent = 'Suspicious ⚠️';
    } else {
      progressBar.classList.add('safe');
      statusText.classList.add('safe');
      statusText.textContent = 'Safe ✅';
    }

    // Populate diagnostics list
    reasons.forEach(reason => {
      const li = document.createElement('li');
      li.className = `reason-item ${reason.type}`;
      li.textContent = reason.text;
      reasonsList.appendChild(li);
    });
  }
});
