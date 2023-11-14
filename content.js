if (document.readyState !== 'complete') {
    window.addEventListener('load', afterWindowLoaded);
} else {
    afterWindowLoaded();
}

function notifyMode() {
    console.log('notify mode');

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
        document.title = notifyModeTitle;
        console.log('Processing search results...');
        // Process the search results here
        var liElements = document.querySelectorAll('.issue-list li');
        chrome.runtime.sendMessage({ type: 'resultfound', data: liElements.length });
        chrome.storage.local.get(["exclusion"], function (result) {
            if (result.exclusion) {
                console.log('retrieved exclusion: ', result.exclusion);
                exclusionAmount = result.exclusion;
                if (liElements.length > exclusionAmount) {
                    console.log(liElements.length + ' and ' + exclusionAmount);
                    console.log('test123');
                    document.title = 'ALERT: New Ticket Found!';
                    // Prompt the user with a popup
                    var userResponse = false;

                    function closePrompt() {
                        clearInterval(promptInterval);

                        if (userResponse) {
                            window.location.href = document.getElementsByClassName('issue-link')[0].innerHTML;
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
                    clearInterval(toggleTitleInterval);
                } else {
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
            processSearchResults();
        }
    } else {
        console.log('No results container found');
    }

    // Set the refresh interval outside the if condition
    setInterval(function () {
        // Clear all intervals and timeouts
        clearInterval(toggleTitleInterval);
        clearTimeout(timeoutId);
        location.reload(true);
    }, refreshInterval);

    // Handle visibility change
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            // Page is visible, trigger the search results processing
            processSearchResults();
        }
    });
}

function afterWindowLoaded() {
    chrome.storage.session.get(['notifyMode']).then((result) => {
        console.log(result.notifyMode);
        if (result.notifyMode.modeActive) {
            notifyMode();
        } else {
            //window.location.href = 'https://jira.benco.com/issues/?jql=project = BEN AND status = Untriaged AND assignee in (EMPTY)'
        }
    });
}
