let tabId

function notify() {
  chrome.tabs.create({ url: 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)', active: false}, function (newTab) {
    chrome.runtime.sendMessage({ type: 'notify', data: newTab.id });
     tabId = newTab.id
  });
}

window.addEventListener("load", () => {
  // Retrieve stored slider values from long term storage
  chrome.storage.local.get(["volume", "exclusion", "notify"], function (result) {
    // Set the slider values if they exist in storage
    if (result.volume) {
      document.getElementById("volume-slider").value = result.volume;
    }
    if (result.exclusion) {
      document.getElementById("exclusion-slider").value = result.exclusion;
    }
    if (result.notify) {
      document.getElementById("checkbox").checked = result.notify;
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
      chrome.storage.local.set({ "notify": checkbox.checked })
      console.log("ON", checkbox.checked)
      notify();
      
    }

    else {
      chrome.storage.local.set({ "notify": checkbox.checked })
      console.log(tabId)
    }

  }

});