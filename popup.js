function notify() {
  chrome.tabs.create({ url: 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)' }, function (newTab) {
    chrome.runtime.sendMessage({ type: 'notify', data: newTab.id });
  });
}

window.addEventListener("load", () => {
  // Retrieve stored slider values from long term storage
  chrome.storage.local.get(["volume", "exclusion"], function (result) {
    // Set the slider values if they exist in storage
    if (result.volume) {
      document.getElementById("volume-slider").value = result.volume;
    }
    if (result.exclusion) {
      document.getElementById("exclusion-slider").value = result.exclusion;
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

  document.getElementById("notify").onclick = notify;
});