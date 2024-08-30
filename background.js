chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'notify') {
        console.log('BG: Notify button was pressed');
        chrome.storage.local.get('extensionStates', (result) => {
            const extensionStates = result.extensionStates || {};
            extensionStates.notifyMode = {
                modeActive: true,
            };
            extensionStates.workingWindow = {
                windowId: message.data
            };
            chrome.storage.local.set({ extensionStates }, () => {
                chrome.storage.local.get('extensionStates', (result) => {
                    console.log('BG: Updated storage state after notify:', result);
                });
            });
        });
        try {
            chrome.browserAction.setIcon({ path: 'icon.png', windowId: message.data });
        } catch (e) {
            console.error(e);
        }
    }

    if (message.type === 'resultfound') {
        console.log(`BG: Result found!`);
        // createNotification();
        playSound();
    }

    if (message.type === 'getWindowId') {
        if (sender.tab) {
            sendResponse({ windowId: sender.tab.windowId });
        } else {
            sendResponse({ error: 'No tab information available' });
        }
    }
});
chrome.windows.onRemoved.addListener(function (removedWindowId) {
    chrome.storage.local.get(['extensionStates'], function (result) {
        if (result) {
            if (removedWindowId === result.extensionStates.workingWindow.windowId) {
                // Notify background script to disable notify mode when tab is closed
                chrome.storage.local.set({
                    extensionStates: {
                        notifyMode: {
                            modeActive: false
                        },
                        workingWindow: {
                            windowId: 0
                        }
                    }
                });
                console.log('BG: Notify mode disabled due to window removal:', removedWindowId);
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



