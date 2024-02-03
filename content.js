if (document.readyState !== 'complete') {
    if (window.location.href.startsWith("https://jira.benco.com/") && window.location.href.includes("?jql=")) {
        window.addEventListener('load', jiraSearch);
    } else if (window.location.href.startsWith("https://jira.benco.com/browse/")) {
        console.log("Content script injected into a Jira browse page");
        window.addEventListener('load', jiraBrowse);
    }
} else {
    jiraSearch();
}


function jiraSearch() {
    console.log('Window loaded');
    chrome.storage.local.get(['notifyMode']).then((result) => {
        console.log("Notify mode active?", result.notifyMode.modeActive);
        if (result.notifyMode.modeActive) {
            try{
                updateHTML();
            } catch (e) {
                console.error("Could not finish updating page content: ", e)
            }
            
            notifyMode();
        } else {
            console.log('Notify mode not active. Redirecting to default page...');
        }
    });
}




function notifyMode() {
    console.log('Entering notifyMode function');

    // Variable to track if notification has already been sent
    var notificationSent = false;

    var timeoutId;
    var observer;
    var refreshInterval = 30000; // How long it takes for it to recheck for new tickets

    // Initialize the observer here
    observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                console.log('Search result added');
                clearTimeout(timeoutId);
                timeoutId = setTimeout(processSearchResults, 5000);
            }
        });
    });

    var elements = document.getElementsByClassName('search-results');
    if (elements.length > 0) {
        if (document.getElementsByClassName('issue-list')[0].getElementsByTagName('li').length === 0) {
            observer.observe(elements[0], { childList: true, subtree: true });
        } else {
            console.log('Issue list already populated');
            processSearchResults();
        }
    } else {
        console.log('No results container found');
    }

    function processSearchResults() {
        
        console.log('Processing search results...');
        // Process the search results here
        var liElements = document.querySelectorAll('.issue-list li');

        chrome.storage.local.get(["exclusion"], function (result) {
            if (result.exclusion) {
                console.log('Retrieved exclusion:', result.exclusion);
                exclusionAmount = result.exclusion;
                if (liElements.length > exclusionAmount && !notificationSent) {
                    console.log(`New ticket found (${liElements.length} > ${exclusionAmount})`);

                    // Send a message to the background script
                    chrome.runtime.sendMessage({ type: 'resultfound' });
                    var audio = new Audio(chrome.runtime.getURL('notif1.mp3 '));
                    audio.play();

                    // Set the notificationSent flag to true
                    notificationSent = true;

                    // Prompt the user with a popup
                    var userResponse = false;
                    
                    // Prompt the user with a popup
                    var userResponse = false;

                    function closePrompt() {
                        clearInterval(promptInterval);

                        if (userResponse) {
                            // Set the notificationSent flag to true

                            chrome.storage.local.set({ "notifyMode": { modeActive: false } });
                            window.location.href = document.getElementsByClassName('splitview-issue-link')[0].href;
                        } else {
                            console.log('User declined to continue or the timeout expired.');
                        }
                    }

                    // Display the prompt and handle user response
                    var promptInterval = setInterval(function () {
                        userResponse = window.confirm('A new ticket has been found. Would you like to open the latest ticket? NOTE: This will end notify mode.');
                        closePrompt();
                    }, 100);
                } else {
                    console.log('No new tickets found or notification already sent');
                }
            }
        });
    }

    

    // Set the refresh interval outside the if condition
    setInterval(function () {
        console.log('Refreshing page...');
        // Clear all intervals and timeouts
        clearTimeout(timeoutId);
        location.reload(true);
    }, refreshInterval);

    // Handle visibility change
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            console.log('Page is visible, triggering search results processing...');
            // Page is visible, trigger the search results processing
            processSearchResults();
        } else {
            console.error("Could not process result: Page did not load in alloted time.")
        }
    });
}


function jiraBrowse() {
    // Get the div with the ID customfield-panel-1

    var acctNum = document.getElementById("customfield_12210-val").textContent.replace(/^\D+/g, '').trim();
    var div1 = document.querySelector('.module.toggle-wrap');
    div1.insertAdjacentHTML('afterend', `<div class="module toggle-wrap"><div class="mod-header"><button class="aui-button toggle-title" aria-label="Jira+" aria-controls="Jira+-module" aria-expanded="true" resolved=""><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><g fill="none" fill-rule="evenodd"><path d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z" fill="#344563"></path></g></svg></button><h4 class="toggle-title" id="details-module-label">Jira+</h4><ul class="ops"></ul></div><div class= "mod-content"><div id="customfieldmodule"><div class="aui-tabs horizontal-tabs" id="customfield-tabs" role="application"><div class=" active-pane"> <ul class="property-list"> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Ticket History:</label> </strong> <div data-fieldtype="textfield" class="value"> <a id="ticket-history" href='https://jira.benco.com/issues/?jql=project = BEN AND "Account Number" ~ "${acctNum}" ORDER BY created DESC'>Click Here</a> </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Place holder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li>   </ul> </div></div></div></div></div>`);
    document.getElementById('ticket-history').onclick = function(){chrome.storage.local.set({ "notifyMode": { modeActive: false } });}
}

function updateHTML() {
    document.getElementsByClassName("issue-search-header")[0].remove();
    document.getElementById("header").remove();
    document.getElementById("navigator-sidebar").remove();
    document.getElementsByClassName("navigator-sidebar collapsed")[0].remove();



    var results = document.getElementsByClassName("simple-issue-list"); // Check if there are search results
    console.log(results.length)
    if (results.length === 0) {
        document.querySelector(".no-results.no-results-message").style.backgroundImage = `url(${chrome.runtime.getURL('bell.png')})`;
        document.querySelector(".no-results.no-results-message h2").innerHTML = "You are in notify mode. You will hear a ding when we find a ticket.";
        document.querySelector(".no-results.no-results-message p").innerHTML = 'Nothing to see here.';
        document.querySelector(".navigator-content.empty-results").style.display = "flex";
        document.querySelector(".navigator-content.empty-results").style.alignItems = "center";
        document.querySelector(".navigator-content.empty-results").style.justifyContent = "center";
        document.querySelectorAll('[rel="shortcut icon"]')[0].href = chrome.runtime.getURL('icon.png')
    } else {
        document.getElementsByClassName("inline-issue-create-container")[0].remove();
        document.getElementsByClassName("pagination-view")[0].remove();
        document.getElementsByClassName("detail-panel")[0].remove();
        document.getElementsByClassName("ui-sidebar")[0].remove();
        document.getElementsByClassName("search-results")[0].insertAdjacentHTML("afterend", '<div class="no-results no-results-message" style="background-image: url(&quot;chrome-extension://nfelnemkdibpebjbbmeloldodgelgiel/bell.gif&quot;); margin-top: 10%;"><h2>We found a ticket!!</h2><p class="no-results-hint">Time to wake up.</p></div>')
        console.log("pushing")
    }
}