// Function to listen for notify message
function listenForNotify() {
    console.log('listening');
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === 'notify') {
            console.log('button was pressed');
            var notifyProperties = {modeActive: null, notifyTab: null, isTicketActive: null}
            notifyProperties.modeActive = true;
            notifyProperties.notifyTab = message.data;
            console.log('notifyProperties', notifyProperties);
            chrome.storage.local.set({ "notifyMode": notifyProperties});
            notifyMode();
        }
    });
}

// Function to handle notify mode
function notifyMode() {
    let exclusionAmount = 0; // Amount of tickets to exclude from the new ticket notifier. I.e. if amount is 3, 4 tickets must be in to notify
    console.log('entered notify mode');
    // Listen for resultfound message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'resultfound') {
            let resultLength = message.data;
            console.log('success! ', message.data);
            chrome.storage.local.get(["exclusion"], function (result) {
                if (result.exclusion) {
                    console.log('retrieved exclusion: ', result.exclusion);
                    exclusionAmount = result.exclusion;
                    if (resultLength > exclusionAmount) {
                        console.log(resultLength + ' and ' + exclusionAmount);
                        createNotification();
                        playSound();

                    }
                }
            });
        }
    });
}

// Function to create notification
function createNotification() {
    let opt = {
        type: "basic",
        title: "Jira+",
        message: "A new ticket is in!",
        iconUrl: "icon.png"
    };
    chrome.notifications.create("notificationName", opt, function () {
        // Placeholder comment: Handle notification creation callback if needed
    });
}

// Function to play sound
async function playSound(source = 'notif1.mp3') {
    // Retrieve stored volume value from long term storage
    chrome.storage.local.get(["volume"], function (result) {
        let volume = result.volume || 0.5; // Set default volume to 0.5 if not found in storage
          // Create the offscreen document if it doesn't already exist
        createOffscreen().then(() => {
            chrome.runtime.sendMessage({ play: { source, volume } });
        });
    });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'testing' // Placeholder comment: Provide specific details for using the API
    });
}

// Check the value of notifyMode in storage
chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

chrome.storage.local.get(['notifyMode']).then((result) => {
    console.log(result.notifyMode)
    if (result.notifyMode == null) {
        
        listenForNotify();
    }
    if (result.notifyMode.modeActive) {
        notifyMode();
    }
});