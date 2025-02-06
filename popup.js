let workingWindowId;

function notify() {
  chrome.windows.create({
    url: 'https://jira.benco.com/issues/?jql=pproject = BEN AND status = Untriaged AND assignee in (EMPTY) ORDER BY created ASC',
    type: 'popup',
    state: 'maximized'
  }, (newWindow) => {
    chrome.runtime.sendMessage({ type: 'notify', data: newWindow.id });
    workingWindowId = newWindow.id;
    console.log('POPUP: New tab created for notification. Tab ID:', newWindow.id);
    chrome.storage.local.get(["extensionStates"], (result) => {
      const extensionStates = result.extensionStates || {};
      extensionStates.workingWindow = extensionStates.workingWindow || {};
      extensionStates.workingWindow.windowId = newWindow.id;
      chrome.storage.local.set({ extensionStates });
    });
  });
}

function notifyModeSwitch() {
  const checkbox = document.getElementById("checkbox");
  if (checkbox.checked) {
    console.log('POPUP: Notify mode activated. Checkbox checked:', checkbox.checked);
    notify();
  } else {
    console.log('POPUP: Notify mode deactivated. Tab ID:', workingWindowId);

    // Check if the windowId is defined before attempting to close the tab
    if (workingWindowId) {
      chrome.windows.remove(workingWindowId, () => {
        console.log('POPUP: Tab removed. Notify mode disabled. Checkbox checked:', checkbox.checked);
        // Notify background script to disable notify mode when tab is closed
        chrome.storage.local.get(["extensionStates"], (result) => {
          const extensionStates = result.extensionStates || {};
          extensionStates.notifyMode = extensionStates.notifyMode || {};
          extensionStates.notifyMode.modeActive = false;
          extensionStates.workingWindow = extensionStates.workingWindow || {};
          delete extensionStates.workingWindow.windowId;
          chrome.storage.local.set({ extensionStates });
        });
        checkbox.checked = false;
        chrome.storage.local.set({ check: checkbox.checked });
      });
    } else {
      console.error('POPUP: workingWindowId is not defined.');
    }
  }
}

// Retrieve the workingWindowId from storage when the popup is loaded
window.addEventListener("load", () => {
  console.log("Popup loaded");
  const checkbox = document.getElementById("checkbox");

  // Retrieve stored slider values from long term storage
  chrome.storage.local.get(["volume", "exclusion", "extensionStates"], (result) => {
    console.log('POPUP: Retrieved initial storage:', result);

    if (result.volume) {
      document.getElementById("volume-slider").value = result.volume;
      document.getElementById("volume-tooltip").textContent = (result.volume * 100).toFixed(0) + "%";
    }
    if (result.exclusion) {
      document.getElementById("exclusion-slider").value = result.exclusion;
      document.getElementById("exclusion-tooltip").textContent = (parseInt(result.exclusion) + 1);
    }
    if (result.extensionStates) {
      console.log('POPUP: State mode data retrieved from storage:', result.extensionStates);
      workingWindowId = result.extensionStates.workingWindow.windowId;
      console.log('POPUP: Retrieved workingWindowId from storage:', workingWindowId);
      checkbox.checked = result.extensionStates.notifyMode.modeActive;
      console.log("Checkbox set to:", result.extensionStates.notifyMode.modeActive);
    }

    if (!result.volume) {
      document.getElementById("volume-tooltip").textContent = (document.getElementById("volume-slider").value * 100).toFixed(0) + "%";
      chrome.storage.local.set({ volume: document.getElementById("volume-slider").value });
    }
    if (!result.exclusion) {
      document.getElementById("exclusion-tooltip").textContent = (parseInt(document.getElementById("exclusion-slider").value) + 1);
      chrome.storage.local.set({ exclusion: document.getElementById("exclusion-slider").value });
    }
    if (!result.extensionStates) {
      chrome.storage.local.set({
        extensionStates: {
          notifyMode: {
            modeActive: false,
          },
          workingWindow: {
            windowId: workingWindowId
          }
        }
      });
    }
  });

  // Save slider values to long term storage and update tooltips when moved
  document.getElementById("volume-slider").addEventListener("input", function () {
    const volumePercentage = (this.value * 100).toFixed(0); // Calculate the percentage value
    chrome.storage.local.set({ volume: this.value });
    document.getElementById("volume-tooltip").textContent = volumePercentage + "%"; // Update the tooltip with the percentage value
  });

  document.getElementById("exclusion-slider").addEventListener("input", function () {
    chrome.storage.local.set({ exclusion: this.value });
    document.getElementById("exclusion-tooltip").textContent = (parseInt(this.value) + 1);
  });

  checkbox.onclick = notifyModeSwitch;
});

chrome.windows.onRemoved.addListener(function (removedWindowId) {
  chrome.storage.local.get(['extensionStates'], function (result) {
    if (result && result.extensionStates && result.extensionStates.workingWindow) {
      if (removedWindowId === result.extensionStates.workingWindow.windowId) {
        document.getElementById("checkbox").checked = false;
        chrome.storage.local.get(["extensionStates"], (result) => {
          const extensionStates = result.extensionStates || {};
          extensionStates.notifyMode = extensionStates.notifyMode || {};
          extensionStates.notifyMode.modeActive = false;
          extensionStates.workingWindow = extensionStates.workingWindow || {};
          delete extensionStates.workingWindow.windowId;
          chrome.storage.local.set({ extensionStates });
        });
      }
    }
  });
});

// Try to focus notify window when ticket is detected
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === 'resultfound') {
//     chrome.tabs.update(windowId, {active: true});
//   }
// });