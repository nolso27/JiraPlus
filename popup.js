let tabId;
function notify() {
  chrome.tabs.create({ url: 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)', active: true}, function (newTab) {
    chrome.runtime.sendMessage({ type: 'notify', data: newTab.id });
    tabId = newTab.id;
    console.log('POPUP: New tab created for notification. Tab ID:', tabId);
  });
}

window.addEventListener("load", () => {
  var checkbox = document.getElementById("checkbox");
  // Retrieve stored slider values from long term storage
  chrome.storage.local.get(["volume", "exclusion", "notifyMode", "check"], function (result) {
    // Set the slider values if they exist in storage
    if (result.volume) {
      document.getElementById("volume-slider").value = result.volume;
      document.getElementById("volume-tooltip").textContent = (result.volume * 100).toFixed(0) + "%";
    }
    if (result.exclusion) {
      document.getElementById("exclusion-slider").value = result.exclusion;
      document.getElementById("exclusion-tooltip").textContent = (parseInt(result.exclusion) + 1);
    }
    if (result.notify) {
      document.getElementById("checkbox").checked = result.check;
    }
    if (result.notifyMode) {
      console.log('POPUP: Notify mode data retrieved from storage:', result.notifyMode);
      tabId = result.notifyMode.notifyTab;
      checkbox.checked = result.notifyMode.modeActive;
      console.log("Checkbox set to:", result.notifyMode.modeActive)
      
    }
  });

  // Save slider values to long term storage and update tooltips when moved
  document.getElementById("volume-slider").addEventListener("input", function () {
    var volumePercentage = (this.value * 100).toFixed(0); // Calculate the percentage value
    chrome.storage.local.set({ "volume": this.value });
    document.getElementById("volume-tooltip").textContent = volumePercentage + "%"; // Update the tooltip with the percentage value
  });

  document.getElementById("exclusion-slider").addEventListener("input", function () {
    chrome.storage.local.set({ "exclusion": this.value });
    document.getElementById("exclusion-tooltip").textContent = (parseInt(this.value) + 1);
  });

  
  
  checkbox.onclick = function() {notifyModeSwitch();};

  function notifyModeSwitch() {
    if (checkbox.checked) {
      chrome.storage.local.set({ "check": checkbox.checked });
      console.log('POPUP: Notify mode activated. Checkbox checked:', checkbox.checked);
      notify();
    } else {
      chrome.storage.local.set({ "check": checkbox.checked });
      console.log('POPUP: Notify mode deactivated. Tab ID:', tabId);
  
      // Check if the tabId is defined before attempting to close the tab
      if (tabId) {
        chrome.tabs.remove(tabId, function () {
          console.log('POPUP: Tab removed. Notify mode disabled. Checkbox checked:', checkbox.checked);
          // Notify background script to disable notify mode when tab is closed
          chrome.storage.local.set({ "notifyMode": { modeActive: false } });
          checkbox.checked = false;
          chrome.storage.local.set({ "check": checkbox.checked });
        });
      }
    }
  }
  
  
});
// Try to focus notify window when ticket is detected
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === 'resultfound') {
//     chrome.tabs.update(tabId, {active: true});
//   }
// });
