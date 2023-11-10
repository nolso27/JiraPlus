if (document.readyState !== 'complete') {
    window.addEventListener('load', afterWindowLoaded);
} else {
    afterWindowLoaded();
}

function afterWindowLoaded() {
    // Everything that needs to happen after the window is fully loaded.
    console.log('test');
    if (window.location.href.includes('jira.benco.com/', '/?jql=')) { // check if tab is on search
        console.log('url')

        // Variables for timeout, observer, and refresh interval
        var timeoutId;
        var observer;
        var refreshInterval = 20000; // 20 seconds in milliseconds

        // Function to process search results
        function processSearchResults() {
            console.log('Search results found');
            // Process the search results here
            console.log(document.getElementsByClassName('issue-list')[0].getElementsByTagName('li'));
            chrome.runtime.sendMessage({ type: 'resultfound', data: document.getElementsByClassName('issue-list')[0].getElementsByTagName('li').length });
        }

        // Watch for changes in the search-results container
        observer = new MutationObserver(function(mutations) {
            console.log('observing');
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Search results are added to the DOM
                    console.log('Search result added');
                    clearTimeout(timeoutId); // Clear previous timeout
                    timeoutId = setTimeout(processSearchResults, 3000); // Set a new timeout
                }
            });
        });

        // Start observing the search-results container
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

        // Set interval for page refresh
        setInterval(function() {
            location.reload(true); // Reload the page
        }, refreshInterval);
    } else {
        // Handle other cases
    }
}
