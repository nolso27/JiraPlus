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
                searchHTML();
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
    console.log('Entering notifyMode function')

    var timeoutId;
    var observer;
    var refreshInterval = 20000; // How long it takes for it to recheck for new tickets

    // Initialize the observer here
    observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            console.log('Search result added');
            if (mutation.addedNodes.length > 0) {
                console.log(mutation.addedNodes);
                clearTimeout(timeoutId);
                timeoutId = setTimeout(processSearchResults, 500); // If no new results are found in .5 seconds process results.
            }
        });
    });

    if (document.getElementsByClassName('search-results').length > 0) {
        console.log('There are search results loading')
        if (document.getElementsByClassName('issue-list')[0].getElementsByTagName('li').length === 0) {
            console.log(document.getElementsByClassName('issue-list')[0]);
            observer.observe(document.getElementsByClassName('list-content')[0], { childList: true});
        } else {
            console.log('Issue list already populated');
            processSearchResults();
        }
    } else {
        console.log('No results container found');
    }

    //    
    

    // Set the refresh interval outside the if condition
    setInterval(function () {
        console.log('Refreshing page...');
        // Clear all intervals and timeouts
        clearTimeout(timeoutId);
        location.reload(true);
    }, refreshInterval);
}

function processSearchResults() {
    
    console.log('Processing search results...');
    // Process the search results here
    var liElements = document.querySelectorAll('.issue-list li');

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

function jiraBrowse() {
    // Get the div with the ID customfield-panel-1

    var acctNum = document.getElementById("customfield_12210-val").textContent.replace(/^\D+/g, '').trim();
    var div1 = document.querySelector('.module.toggle-wrap');
    div1.insertAdjacentHTML('afterend', `<div class="module toggle-wrap"><div class="mod-header"><button class="aui-button toggle-title" aria-label="Jira+" aria-controls="Jira+-module" aria-expanded="true" resolved=""><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><g fill="none" fill-rule="evenodd"><path d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z" fill="#344563"></path></g></svg></button><h4 class="toggle-title" id="details-module-label">Jira+</h4><ul class="ops"></ul></div><div class= "mod-content"><div id="customfieldmodule"><div class="aui-tabs horizontal-tabs" id="customfield-tabs" role="application"><div class=" active-pane"> <ul class="property-list"> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Ticket History:</label> </strong> <div data-fieldtype="textfield" class="value"> <a id="ticket-history" href='https://jira.benco.com/issues/?jql=project = BEN AND "Account Number" ~ "${acctNum}" ORDER BY created DESC'>Click Here</a> </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Placeholder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li> <li id="rowForcustomfield_12210" class="item"> <div class="wrap"> <strong title="Account Number" class="name"> <label for="customfield_12210">Place holder</label> </strong> <div data-fieldtype="textfield" class="value"> placeholder </div> </div> </li>   </ul> </div></div></div></div></div>`);
    document.getElementById('ticket-history').onclick = disableNotify;
}

function searchHTML() {
    document.getElementsByClassName("issue-search-header")[0].remove();
    document.getElementById("header").remove();
    document.getElementById("navigator-sidebar").remove();
    document.getElementsByClassName("navigator-sidebar collapsed")[0].remove();


    var results = document.getElementsByClassName("simple-issue-list"); // Check if there are search results
    console.log(results.length)
    if (results.length === 0) {
        document.querySelector(".no-results.no-results-message").style.backgroundImage = `url(${bellSvg})`;
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
    }
}

function getSelectedLink() {
    disableNotify();
    window.location.href = document.getElementsByClassName("focused")[0].getElementsByClassName('splitview-issue-link')[0].href; 
}

function disableNotify() {
    chrome.storage.local.set({ "notifyMode": { modeActive: false } });
}

function resultHTML(exclusion, resultLength) {
    
    if (resultLength > exclusion) {
        document.getElementsByClassName("search-results")[0].insertAdjacentHTML("afterend", `<div class="no-results no-results-message" style="position:relative;background-image: url(&quot;${bellGif}&quot;); margin-top: 10%;"><a class="ticketlink"style="position:absolute;width: 140px;height:160px;top: 0;left: 0; right: 0;margin-left: auto; margin-right: auto;"></a><h2>We found a ticket! Click <a class="ticketlink">here</a> or the bell above to continue to the selected ticket.</h2><p class="no-results-hint">NOTE: This will end notify mode.</p></div>`)
        document.getElementsByClassName("ticketlink")[0].onclick = getSelectedLink;
        document.getElementsByClassName("ticketlink")[1].onclick = getSelectedLink;
    } else {
        document.getElementsByClassName("search-results")[0].insertAdjacentHTML("afterend", `<div class="no-results no-results-message" style="background-image: url(&quot;${bellSvg}&quot;); margin-top: 10%;"><h2>You are in notify mode. You will hear a ding when we find more tickets than your set amount.</h2><p class="no-results-hint">Amount of tickets are not equal or greater than set amount. Check extension window to adjust if necessary.</p></div>  `)

    }
}

