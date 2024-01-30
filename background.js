// Function to listen for notify message
function listenForNotify() {
    console.log('BG: Listening for notify message');
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === 'notify') {
            console.log('BG: Notify button was pressed');
            var notifyProperties = { modeActive: null, notifyTab: null, isTicketActive: null };
            notifyProperties.modeActive = true;
            notifyProperties.notifyTab = message.data;
            console.log('BG: Notify properties', notifyProperties);
            chrome.storage.local.set({ "notifyMode": notifyProperties });
            notifyMode();
        }
    });
}

// Function to handle notify mode
function notifyMode() {
    let exclusionAmount = 0; // Amount of tickets to exclude from the new ticket notifier. I.e. if amount is 3, 4 tickets must be in to notify
    console.log('BG: Entered notify mode');
    // Listen for resultfound message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'resultfound') {
            let resultLength = message.data;
            console.log(`BG: Result found! ${resultLength} tickets`);
            chrome.storage.local.get(["exclusion"], function (result) {
                if (result.exclusion) {
                    console.log('BG: Retrieved exclusion:', result.exclusion);
                    exclusionAmount = result.exclusion;
                    if (resultLength > exclusionAmount) {
                        console.log(`BG: ${resultLength} tickets found, and ${exclusionAmount} ticket(s) excluded. Creating notification and playing sound.`);
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
        console.log('BG: Notification created');
        // Placeholder comment: Handle notification creation callback if needed
    });
}

// Function to play sound
async function playSound(source = 'notif1.mp3') {
    // Retrieve stored volume value from long term storage
    chrome.storage.local.get(["volume"], function (result) {
        let volume = result.volume || 0.5; // Set default volume to 0.5 if not found in storage
        console.log(`BG: Volume set to ${volume}`);
        // Create the offscreen document if it doesn't already exist
        createOffscreen().then(() => {
            console.log('BG: Sending message to play sound');
            chrome.runtime.sendMessage({ play: { source, volume } });
        });
    });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    console.log('BG: Creating offscreen document');
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'testing' // Placeholder comment: Provide specific details for using the API
    });
}

// Check the value of notifyMode in storage
chrome.storage.local.get(['notifyMode']).then((result) => {
    console.log('BG: Notify mode data retrieved from storage:', result.notifyMode);
    if (typeof(result === "undefined")) {
        console.log('BG: Notify mode not found in storage. Initiating listener.');
        listenForNotify();
    }
    if (result.notifyMode.modeActive === false || result.notifyMode.modeActive === null) {
        listenForNotify();
    }
    if (result.notifyMode.modeActive) {
        console.log('BG: Notify mode active. Initiating notifyMode.');
        notifyMode();
    }
});
