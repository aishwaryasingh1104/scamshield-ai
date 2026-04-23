# ScamShield AI

## Premium AI-Powered Phishing Detection Extension

**ScamShield AI** provides real-time protection against phishing, scam, and malicious websites.
It uses a custom lightweight **Machine Learning classifier** running directly inside the browser to instantly analyze the safety of the active tab.

Designed with a premium Cybersecurity SaaS UI, the extension features:

* Glassmorphism modern interface
* Live risk progress bar
* Instant URL analysis
* Confidence score prediction
* 100% client-side privacy

---

# What It Does

## AI Risk Prediction Engine

The extension uses a simulated **Logistic Regression model** to classify suspicious URLs.

It extracts **7 intelligent features** from every website URL and applies weighted scoring to predict fraud probability.

---

## Extracted Features

| Feature             | Description                                         | Risk Level |
| :------------------ | :-------------------------------------------------- | :--------- |
| `f_noHttps`         | Checks if HTTPS security is missing                 | High       |
| `f_riskyTld`        | Detects risky domains like `.xyz`, `.top`, `.click` | High       |
| `f_suspiciousWords` | Finds words like free, login, verify, bank          | Medium     |
| `f_atSymbol`        | Detects `@` obfuscation attacks                     | Critical   |
| `f_dots`            | Excessive subdomains in URL                         | Medium     |
| `f_hyphens`         | Multiple hyphens in domain                          | Medium     |
| `f_length`          | Very long URLs                                      | Low        |

---

# Output Generated

Each scan returns:

* **Risk Score:** `0% – 100%`
* **Threat Level:** Safe / Suspicious / Dangerous
* **Confidence Score:** Prediction certainty
* **Live Diagnostics:** Reasons behind score

---

# ML Logic Explained

The classifier calculates weighted probability using Logistic Regression.

## Formula:

```javascript id="r1"
z = bias
  + (w_length * f_length)
  + (w_dots * f_dots)
  + (w_hyphens * f_hyphens)
  + (w_atSymbol * f_atSymbol)
  + (w_suspiciousWords * f_suspiciousWords)
  + (w_riskyTld * f_riskyTld)
  + (w_noHttps * f_noHttps);
```

Then probability is calculated using Sigmoid Function:

```javascript id="r2"
probability = 1 / (1 + Math.exp(-z));
```

---

# Project Structure

```text id="r3"
ScamShield-AI/
│── manifest.json
│── background.js
│── popup.html
│── style.css
│── popup.js
└── icons/
```

---

# Installation Guide

## Run in Chrome:

1. Open Google Chrome
2. Visit:

```text id="r4"
chrome://extensions/
```

3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the ScamShield AI folder
6. Pin extension from toolbar
7. Open any website and click the icon

---

# Design Highlights

## Premium UI Includes:

* Dark cybersecurity theme
* Smooth animations
* Glassmorphism cards
* Clean Inter typography
* Responsive popup layout

---

# Privacy First

* No browsing history stored
* No server API required
* No user data uploaded
* All analysis happens locally in browser

---

# Tech Stack

| Layer        | Technology                   |
| :----------- | :--------------------------- |
| Logic & ML   | JavaScript (ES6)             |
| Frontend     | HTML5 + CSS3                 |
| Browser APIs | Chrome Extension Manifest V3 |
| UI Font      | Inter                        |

---

# Future Enhancements

* Real ML model training with datasets
* Domain reputation APIs
* Website screenshot fraud detection
* Voice threat alerts
* Browser history threat analytics

---

# Author

**Aishwarya Singh**

---

# Why This Project Stands Out

ScamShield AI combines:

* Cybersecurity
* Machine Learning
* Browser Extension Development
* Beautiful Product UI
* Real-world Problem Solving

A strong portfolio project for internships, hackathons, and tech interviews.
