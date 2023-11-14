if (document.readyState !== 'complete') {
    window.addEventListener('load', afterWindowLoaded);
} else {
    afterWindowLoaded();
}

function notifyMode() {
    console.log('notify mode');

    var timeoutId;
    var observer;
    var refreshInterval = 10000;

    function processSearchResults() {
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
                }
            }
        });   
            
    }

    observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                console.log('Search result added');
                clearTimeout(timeoutId);
                timeoutId = setTimeout(processSearchResults, 3000);
            }
        });
    });

    var elements = document.getElementsByClassName('search-results');
    if (elements.length > 0) {
        if (document.getElementsByClassName('issue-list')[0].getElementsByTagName('li').length === 0) {
            observer.observe(elements[0], { childList: true, subtree: true });
        } else {
            processSearchResults();
        }
    } else {
        console.log('No results container found');
    }

    setInterval(function () {
        location.reload(true);
    }, refreshInterval);
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
