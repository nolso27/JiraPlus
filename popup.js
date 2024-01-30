let tabId;

function notify() {
  chrome.tabs.create({ url: 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)', active: false}, function (newTab) {
    chrome.runtime.sendMessage({ type: 'notify', data: newTab.id });
    tabId = newTab.id;
    chrome.storage.local.set({"notifytab": tabId })
  });
}

window.addEventListener("load", () => {
  // Retrieve stored slider values from long term storage
  chrome.storage.local.get(["volume", "exclusion", "notifyMode", "check"], function (result) {
    // Set the slider values if they exist in storage
    if (result.volume) {
      document.getElementById("volume-slider").value = result.volume;
    }
    if (result.exclusion) {
      document.getElementById("exclusion-slider").value = result.exclusion;
    }
    if (result.notify) {
      document.getElementById("checkbox").checked = result.check;
    }
    if (result.notifyMode) {
      console.log(result.notifyMode)
      tabId = result.notifytab;
    }
  });

  // Save slider values to long term storage when moved
  document.getElementById("volume-slider").addEventListener("input", function () {
    var volumeValue = this.value;
    chrome.storage.local.set({ "volume": volumeValue });
  });

  document.getElementById("exclusion-slider").addEventListener("input", function () {
    var exclusionValue = this.value;
    chrome.storage.local.set({ "exclusion": exclusionValue });
  });

  var checkbox = document.getElementById("checkbox")
  
  checkbox.onclick = function() {notifyModeSwitch()}

  function notifyModeSwitch() {
    if (checkbox.checked) {
      chrome.storage.local.set({ "check": checkbox.checked })
      console.log("ON", checkbox.checked)
      notify();
      
    }

    else {
      chrome.storage.local.set({ "check": checkbox.checked })
      console.log(tabId);
      chrome.tabs.remove(tabId);
      
    }

  }
  
  chrome.tabs.onRemoved.addListener(function (removedTabId) {
    if (removedTabId === tabId) {
      // Notify background script to disable notify mode when tab is closed
      chrome.storage.local.set({ ["notifyMode"]: { modeActive: false } });
      checkbox.checked = false;
      chrome.storage.local.set({ "check": checkbox.checked })
      console.log(checkbox.checked);
    }
  });

});