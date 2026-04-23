// This is the Background Service Worker.
// It runs invisibly in the background and manages events for the entire extension lifecycle.
// For Chrome Extension Manifest V3, this file is required to be registered as a "service_worker", even if it is mostly empty.

// This 'addListener' listens for the moment the extension is installed or updated in the browser.
chrome.runtime.onInstalled.addListener(() => {
  // We log a message to the service worker console when it successfully installs.
  // You can view this log by going to chrome://extensions and clicking "Inspect views: service worker" under our extension.
  console.log("ScamShield AI successfully installed!");
  console.log("Protecting your browsing experience.");
});
