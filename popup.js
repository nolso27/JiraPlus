function notify() {
  chrome.tabs.create({url: 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)'},function(newTab) {
    chrome.runtime.sendMessage({ type: 'notify', data: newTab.id});
    });
    
}

window.addEventListener("load", () => {
  document.getElementById("notify").onclick = notify;
});