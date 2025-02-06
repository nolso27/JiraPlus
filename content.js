function main() {
  if (document.readyState !== 'complete') {
    if (window.location.href.startsWith("https://jira.benco.com/") && window.location.href.includes("?jql=")) {
      window.addEventListener('load', jiraSearch);
    } else if (window.location.href.startsWith("https://jira.benco.com/browse/")) {
      console.log("Content script injected into a Jira browse page");
      chrome.storage.local.get(['extensionStates']).then((result) => {
        console.log("Initial storage state in browse page:", result);
      });
      window.addEventListener('load', jiraBrowse);
    }
  } else {
    jiraSearch();
  }
}



function jiraSearch() {
console.log('Window loaded');
chrome.storage.local.get(['extensionStates']).then((result) => {
  console.log("Notify mode active?", result.extensionStates.notifyMode.modeActive);
  if (result.extensionStates.notifyMode.modeActive) {
    chrome.runtime.sendMessage({ type: 'getWindowId' }, (response) => {
      if (response.error) {
        console.error('Error getting window ID:', response.error);
        return;
      }
      const currentWindowId = response.windowId;
      const storedWindowId = result.extensionStates.workingWindow.windowId;
      console.log('Current window ID:', currentWindowId);
      console.log('Stored working window ID:', storedWindowId);
      if (currentWindowId === storedWindowId) {
        try {
          searchHTML();
          notifyMode(0); // Argument is the number of times the function has been called
          console.log('Window ID matches working window!');
        } catch (e) {
          console.error("Could not finish updating page content: ", e);
        }
      } else {
        console.log('Window ID does not match working window. Notify mode will not be enabled.');
        // var acctNum = document.getElementById("customfield_12210-val").textContent.replace(/^\D+/g, '').trim();
        // var div1 = document.querySelector('.module.toggle-wrap');
        // div1.insertAdjacentHTML('afterend', `<div class="module toggle-wrap"><div class="mod-header"><button class="aui-button toggle-title" aria-label="Jira+" aria-controls="Jira+-module" aria-expanded="true" resolved=""><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><g fill="none" fill-rule="evenodd"><path d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z" fill="#344563"></path></g></svg></button><h4 class="toggle-title" id="details-module-label">Jira+</h4><ul class="ops"></ul></div><div class= "mod-content"><div id="customfieldmodule"><div class="aui-tabs horizontal-tabs" id="customfield-tabs" role="application"><div class=" active-pane"> <ul class="property-list"> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Ticket History:</label> </strong> <div data-fieldtype="textfield" class="value"> <a id="ticket-history" href='https://jira.benco.com/issues/?jql=project = BEN AND "Account Number" ~ "${acctNum}" ORDER BY created DESC'>Click Here</a> </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Place holder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li>   </ul> </div></div></div></div></div>`);
      }
    });
  } else {
    console.log('Notify mode not active. Redirecting to default page...');
  }
});
}

function jiraBrowse() {
chrome.storage.local.get(['extensionStates'], function (result) {
  console.log('Initial state in jiraBrowse:', result);
  var acctNum = document.getElementById("customfield_12210-val").textContent.replace(/^\D+/g, '').trim();
  var div1 = document.querySelector('.module.toggle-wrap');
  div1.insertAdjacentHTML('afterend', `<div class="module toggle-wrap"><div class="mod-header"><button class="aui-button toggle-title" aria-label="Jira+" aria-controls="Jira+-module" aria-expanded="true" resolved=""><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><g fill="none" fill-rule="evenodd"><path d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z" fill="#344563"></path></g></svg></button><h4 class="toggle-title" id="details-module-label">Jira+</h4><ul class="ops"></ul></div><div class= "mod-content"><div id="customfieldmodule"><div class="aui-tabs horizontal-tabs" id="customfield-tabs" role="application"><div class=" active-pane"> <ul class="property-list"> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Ticket History:</label> </strong> <div data-fieldtype="textfield" class="value"> <a id="ticket-history" href='https://jira.benco.com/issues/?jql=project in (BSS, BEN, LO, MSS, TS, OVE) AND cf[12210] ~ "${acctNum}" ORDER BY created DESC' target="_blank">Click Here</a> </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Place holder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li>   </ul> </div></div></div></div></div>`);  
});
}





function notifyMode(pass) {
  if (pass > 5) {
    location.reload(true);
  }
  var timeToWait = 500; 
  // Set the refresh interval outside the if condition
  setTimeout(function () {
    if (document.getElementsByClassName('search-results').length > 0) {
      console.log('There are search results loading');
      if (document.getElementsByClassName('issue-list')[0].getElementsByTagName('li').length === 0) {
        console.log(document.getElementsByClassName('issue-list')[0]);
        console.log('Issue list not yet populated');
        pass = pass + 1;
        notifyMode(pass);
      } else {
        console.log('Issue list already populated');
        processSearchResults();
      }
    } else {
      console.log('No results container found');
    }
  }, timeToWait);
  console.log('Entering notifyMode function');

  var refreshInterval = 20000; 
  // Set the refresh interval outside the if condition
  setTimeout(function () {
    console.log('Refreshing page...');
    // Clear all intervals and timeouts
    location.reload(true);
  }, refreshInterval);
}

function processSearchResults() {

  console.log('Processing search results...');
  // Process the search results here
  var liElements = document.querySelectorAll('.issue-list li');
  console.log(liElements);
  liElements[0].click();
  

  // Start checking for the loading element to disappear
  console.log(loadingDetails());

  liElements.forEach((element) => {
    element.onclick = function () {
      console.log(loadingDetails());
    };
    var issueName = element.querySelector('.issue-link-summary').textContent;
    console.log('Issue name:', issueName);
  });

  chrome.storage.local.get(["exclusion"], function (result) {
    if (result.exclusion) {
      console.log('Retrieved exclusion:', result.exclusion);
      exclusionAmount = result.exclusion;
      if (liElements.length > exclusionAmount) {
        console.log(`New ticket found (${liElements.length} > ${exclusionAmount})`);

        // Send a message to the background script
        chrome.runtime.sendMessage({ type: 'resultfound' });
        


      } else {
        console.log('No new tickets found');
      }
      resultHTML(exclusionAmount, liElements.length);
    }
  });
}

var bellSvg = chrome.runtime.getURL('bell.svg');
var bellGif = chrome.runtime.getURL('bell.gif');


function searchHTML() {
  var listView = document.querySelector('a[data-layout-key="list-view"]');
  var splitView = document.querySelector('a[data-layout-key="split-view"]');
  try {
    if (listView.querySelector('.aui-icon.aui-icon-small.aui-iconfont-success')) {
    console.log('List view is active');
    console.warn('List view is not currently supported. Switching to split view...');
    splitView.click();
    } else {
      console.log('Split view is active');
      // listView.click();
    }
  } catch {
    console.warn('No view found');
  }
  try {
    document.getElementById("header").remove();
  } catch {
    location.reload(true);
  }
  document.getElementsByClassName("issue-search-header")[0].remove();
  document.getElementById("navigator-sidebar").remove();
  try {
    document.getElementsByClassName("navigator-sidebar collapsed")[0].remove();
  }
  catch (e) {
    console.log("No sidebar to remove");
  }  

  var timeToWait = 500; 
  // Set the refresh interval outside the if condition
  setTimeout(function () {
    console.log('Checking for new tickets...');
    // Clear all intervals and timeouts
    var results = document.querySelector(".issue-list"); // Check if there are search results
    console.log('There are this many search results:', results);
    if (!results) {

      // Format split view
      document.querySelector(".no-results.no-results-message").style.backgroundImage = `url(${bellSvg})`;
      document.querySelector(".no-results.no-results-message h2").innerHTML = "You are in notify mode. You will hear a ding when we find a ticket. Closing this window will disable notify mode.";
      document.querySelector(".no-results.no-results-message p").innerHTML = 'This widnow can be safely minimized.';
      document.querySelector(".navigator-content.empty-results").style.display = "flex";
      document.querySelector(".navigator-content.empty-results").style.alignItems = "center";
      document.querySelector(".navigator-content.empty-results").style.justifyContent = "center";
      document.querySelectorAll('[rel="shortcut icon"]')[0].href = chrome.runtime.getURL('icon.png')
      document.documentElement.style.height = '100vh';
      document.body.style.height = '100vh';
      document.querySelector("#page").style.height = "100%";
      document.querySelector("#content").style.height = "100%"

        // FOR LIST VIEW:
        //
        // document.querySelector(".no-results.no-results-message").style.backgroundImage = `url(${bellSvg})`;
        // document.querySelector(".no-results.no-results-message h2").innerHTML = "You are in notify mode. You will hear a ding when we find a ticket. Closing this window will disable notify mode.";
        // document.querySelector(".no-results.no-results-message p").innerHTML = 'This widnow can be safely minimized.';
        // document.querySelector(".navigator-content.empty-results").style.display = "flex";
        // document.querySelector(".navigator-content.empty-results").style.alignItems = "center";
        // document.querySelector(".navigator-content.empty-results").style.justifyContent = "center";
        // document.querySelectorAll('[rel="shortcut icon"]')[0].href = chrome.runtime.getURL('icon.png')
        // document.documentElement.style.height = '100vh';
        // document.body.style.height = '100vh';
        // document.querySelector("#page").style.height = "100%";
        // document.querySelector("#content").style.height = "100%";
    } else {
      console.log('There are search results');
      document.getElementsByClassName("list-ordering")[0].remove();
      document.getElementsByClassName("inline-issue-create-container")[0].remove();
      document.getElementsByClassName("pagination-view")[0].remove();
      document.getElementsByClassName("detail-panel")[0].style.display = 'none';
        // document.getElementsByClassName("inline-issue-create-container")[0].remove();
        // document.getElementsByClassName("pagination-view")[0].remove();
        // document.getElementsByClassName("detail-panel")[0].remove();
    }
  }, timeToWait);
} 

function getSelectedLink() {
  disableNotify();
  window.open(document.getElementsByClassName("focused")[0].getElementsByClassName('splitview-issue-link')[0].href, '_blank');
  
}

function disableNotify() {
  chrome.storage.local.get(['extensionStates']), function (result) {
      chrome.storage.local.set({ 
          extensionStates: { 
              notifyMode: {
                  modeActive: false
              },
              workingWindow: {
                  windowId: result.workingWindow.windowId
              }
          }
      });
  }
}

function resultHTML(exclusion, resultLength) {
  
  if (resultLength > exclusion) {
    console.log('Ringing the bell');
      document.getElementsByClassName("search-results")[0].insertAdjacentHTML("afterend", `<div class="no-results no-results-message" style="position:relative;background-image: url(&quot;${bellGif}&quot;); margin-top: 10%;"><a class="ticketlink"style="position:absolute;width: 140px;height:160px;top: 0;left: 0; right: 0;margin-left: auto; margin-right: auto;"></a><h2>We found a ticket! Click <a class="ticketlink">here</a> or the bell above to continue to the selected ticket.</h2><p class="no-results-hint">NOTE: This will end notify mode.</p></div>`);
      document.getElementsByClassName("ticketlink")[0].onclick = getSelectedLink;
      document.getElementsByClassName("ticketlink")[1].onclick = getSelectedLink;
  } else {
    console.log('Not ringing the bell');
      document.getElementsByClassName("search-results")[0].insertAdjacentHTML("afterend", `<div class="no-results no-results-message" style="background-image: url(&quot;${bellSvg}&quot;); margin-top: 10%;"><h2>You are in notify mode. You will hear a ding when we find more tickets than your set amount.</h2><p class="no-results-hint">Amount of tickets are not equal or greater than set amount. Check extension window to adjust if necessary.</p></div>  `)

  }
}


function loadingDetails() {
  const loadingElement = document.querySelector('.loading');
  if (!loadingElement) {
    // Loading element is gone, get the description-val element
    var ticketDescription = document.querySelector('#description-val');
    var ticketAccountNumber = document.querySelector('#customfield_12210-val');
    var ticketAccountName = document.querySelector('#customfield_12616-val');
    var ticketAccountPhoneNumber = document.querySelector('#customfield_12704-val');

    // Check if any fields are null and set content to "Not found"
    var descriptionText = ticketDescription ? ticketDescription.textContent.trim() : "Not found";
    var accountNumberText = ticketAccountNumber ? ticketAccountNumber.textContent.trim() : "Not found";
    var accountNameText = ticketAccountName ? ticketAccountName.textContent.trim() : "Not found";
    var accountPhoneNumberText = ticketAccountPhoneNumber ? ticketAccountPhoneNumber.textContent.trim() : "Not found";

    var focusedElement = document.querySelector('.issue-list li.focused');
    if (focusedElement) {
      var descriptionHTML = `<b>Description</b>: ${descriptionText}<br>
                             <b>Account Number</b>: ${accountNumberText}<br>
                             <b>Account Name</b>: ${accountNameText}<br>
                             <b>Account Phone Number</b>: ${accountPhoneNumberText}`;

      // Remove any existing dropdown
      var existingDropdown = document.querySelector('.description-dropdown');
      if (existingDropdown) {
        existingDropdown.remove();
      }

      // Create a new dropdown div
      var newDiv = document.createElement('div');
      newDiv.classList.add('description-dropdown');
      newDiv.innerHTML = descriptionHTML; 
      newDiv.style.border = '1px solid #ccc';
      newDiv.style.padding = '10px';
      newDiv.style.marginTop = '10px';
      newDiv.style.backgroundColor = '#f9f9f9';

      // Append the new dropdown to the focused element
      focusedElement.appendChild(newDiv);

      // Add click event listener to hide the dropdown when another li is clicked
      document.querySelectorAll('.issue-list li').forEach(li => {
        li.addEventListener('click', function() {
          if (li !== focusedElement) {
            newDiv.remove();
          }
        });
      });
    } else {
      console.log('Focused element not found');
    }
  } else {
    // Loading element is still present, wait and check again
    setTimeout(loadingDetails, 100); // Pass the function reference instead of calling it
  }
}

main();