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

function notifyMode() {
    console.log('Entering notifyMode function');

    var timeoutId;
    var observer;
    var refreshInterval = 30000; // How long it takes for it to recheck for new tickets
    var originalTitle = document.title;
    var notifyModeTitle = 'Tab is in Notify Mode';
    var toggleTitle = false; // Flag to toggle between original and notify mode titles
    var toggleTitleInterval; // Variable to store the interval ID for title toggling
    

    function toggleTitleText() {
        document.title = toggleTitle ? originalTitle : notifyModeTitle;
        toggleTitle = !toggleTitle;
    }

    function processSearchResults() {
        console.log('Processing search results...');

        // Process the search results here
        var liElements = document.querySelectorAll('.issue-list li');
        chrome.runtime.sendMessage({ type: 'resultfound', data: liElements.length });

        chrome.storage.local.get(["exclusion"], function (result) {
            if (result.exclusion) {
                console.log('Retrieved exclusion:', result.exclusion);
                exclusionAmount = result.exclusion;
                if (liElements.length > exclusionAmount) {
                    console.log(`New ticket found (${liElements.length} > ${exclusionAmount})`);
                    document.title = 'ALERT: New Ticket Found!';

                    // Prompt the user with a popup
                    var userResponse = false;

                    function closePrompt() {
                        clearInterval(promptInterval);

                        if (userResponse) {
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

                    // Clear the title toggling interval if a new ticket is found
                    // bell.svg

                    clearInterval(toggleTitleInterval);
                } else {
                    console.log('No new tickets found');
                    // Reset the toggleTitle flag if no new ticket is found
                    toggleTitle = false;
                    // Clear the title toggling interval
                    clearInterval(toggleTitleInterval);
                    // Start the interval for title toggling if not already started
                    toggleTitleInterval = setInterval(toggleTitleText, 2000);
                }
            }
        });
    }

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
            // Clear the title toggling interval
            clearInterval(toggleTitleInterval);
            // Start the interval for title toggling if not already started
            toggleTitleInterval = setInterval(toggleTitleText, 2000);
        } else {
            console.log('Issue list already populated');
            processSearchResults();
        }
    } else {
        
        
        console.log('No results container found');
    }

    // Set the refresh interval outside the if condition
    setInterval(function () {
        console.log('Refreshing page...');
        // Clear all intervals and timeouts
        clearInterval(toggleTitleInterval);
        clearTimeout(timeoutId);
        location.reload(true);
    }, refreshInterval);

    // Handle visibility change
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            console.log('Page is visible, triggering search results processing...');
            // Page is visible, trigger the search results processing
            processSearchResults();
        }
    });
}

function jiraSearch() {
    console.log('Window loaded');
    chrome.storage.local.get(['notifyMode']).then((result) => {
        console.log("Notify mode active?", result.notifyMode.modeActive);
        if (result.notifyMode.modeActive) {
            try{
                updateHTML();
            } catch {}
            
            notifyMode();
        } else {
            // window.location.href = 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)'
            console.log('Notify mode not active. Redirecting to default page...');
        }
    });
}

function updateHTML() {
    document.querySelector(".no-results.no-results-message").style.backgroundImage = `url(${chrome.runtime.getURL('bell.svg')})`;
    document.getElementById("header").remove();
    document.getElementById("navigator-sidebar").remove();
    document.getElementsByClassName("issue-search-header")[0].remove();
    document.querySelector(".no-results.no-results-message h2").innerHTML = "You are in notify mode. You will hear a ding when we find a ticket.";
    document.querySelector(".no-results.no-results-message p").innerHTML = 'Nothing to see here.';
    document.querySelector(".navigator-content.empty-results").style.display = "flex";
    document.querySelector(".navigator-content.empty-results").style.alignItems = "center";
    document.querySelector(".navigator-content.empty-results").style.justifyContent = "center";
    document.querySelectorAll('[rel="shortcut icon"]')[0].href = chrome.runtime.getURL('icon.png');
}

function jiraBrowse() {
    // Get the div with the ID customfield-panel-1

    var acctNum = document.getElementById("customfield_12210-val").textContent.replace(/^\D+/g, '').trim();
    var div1 = document.querySelector('.module.toggle-wrap');
    div1.insertAdjacentHTML('afterend', `<div class="module toggle-wrap"><div class="mod-header"><button class="aui-button toggle-title" aria-label="Jira+" aria-controls="Jira+-module" aria-expanded="true" resolved=""><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><g fill="none" fill-rule="evenodd"><path d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z" fill="#344563"></path></g></svg></button><h4 class="toggle-title" id="details-module-label">Jira+</h4><ul class="ops"></ul></div><div class=" active-pane"> <ul class="property-list"> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Ticket History:</label> </strong> <div data-fieldtype="textfield" class="value"> <a id="ticket-history" href='https://jira.benco.com/issues/?jql=project = BEN AND "Account Number" ~ "${acctNum}"'>Click Here</a> </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Place holder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li>   </ul> </div></div>`);
    document.getElementById('ticket-history').onclick = function(){chrome.storage.local.set({ "notifyMode": { modeActive: false } });}


}