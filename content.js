try {
    document.querySelector(".no-results.no-results-message").style.backgroundImage = `url(${chrome.runtime.getURL('bell.svg')})`;
} catch {}


if (document.readyState !== 'complete') {
    window.addEventListener('load', afterWindowLoaded);
} else {
    afterWindowLoaded();
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

function afterWindowLoaded() {
<<<<<<< HEAD
    chrome.storage.local.get(['notifyMode']).then((result) => {
        console.log(result.notifyMode);
=======
    console.log('Window loaded');
    chrome.storage.local.get(['notifyMode']).then((result) => {
        console.log("Notify mode active?", result.notifyMode.modeActive);
>>>>>>> working
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
    document.getElementById("header").remove();
    document.getElementById("navigator-sidebar").remove();
    document.getElementsByClassName("issue-search-header")[0].remove();
    document.querySelector(".no-results.no-results-message h2").innerHTML = "You are in notify mode. You will hear a ding when we find a ticket.";
    document.querySelector(".no-results.no-results-message p").innerHTML = 'Nothing to see here.';
    document.querySelector(".navigator-content.empty-results").style.display = "flex";
    document.querySelector(".navigator-content.empty-results").style.alignItems = "center";
    document.querySelector(".navigator-content.empty-results").style.justifyContent = "center";
}