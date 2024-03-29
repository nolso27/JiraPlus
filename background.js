
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { // 
    if (message.type === 'notify') {
        console.log('BG: Notify button was pressed');
        chrome.storage.local.set({ "notifyMode":  { modeActive: true, notifyTab: message.data} });
        try {
            chrome.browserAction.setIcon({ path: 'icon.png', tabId: message.data});
        } catch (e) {
            console.error(e);
        }
    }

    if (message.type === 'resultfound') {
        console.log(`BG: Result found!`);
        // createNotification();

        playSound();
    }

});



chrome.tabs.onRemoved.addListener(function (removedTabId) {
    chrome.storage.local.get(['notifyMode'], function (result) {
        if(result){
            if (removedTabId === result.notifyMode.notifyTab) {
                // Notify background script to disable notify mode when tab is closed
                chrome.storage.local.set({ ["notifyMode"]: { modeActive: false } });
                checkbox.checked = false;
                chrome.storage.local.set({ "check": checkbox.checked });
                console.log('POPUP: Tab removed. Notify mode disabled. Checkbox checked:', checkbox.checked);
              }
        }
        


    });

});


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

// Function to create notification
// function createNotification() {
//     let opt = {
//         type: "basic",
//         title: "Jira+",
//         message: "A new ticket is in!",
//         iconUrl: "icon.png"
//     };
//     chrome.notifications.create("notificationName", opt, function () {
//         console.log('BG: Notification created');
//         // Placeholder comment: Handle notification creation callback if needed
//     });
// }

// Create the offscreen document if it doesn't already exist



