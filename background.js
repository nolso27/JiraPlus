chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) { // 
    if (message.type === 'notify') {
        console.log('BG: Notify button was pressed');
        var notifyProperties = { modeActive: null, notifyTab: null};
        notifyProperties.modeActive = true;
        notifyProperties.notifyTab = message.data;
        console.log('BG: Notify properties', notifyProperties);
        chrome.storage.local.set({ "notifyMode": notifyProperties });
        console.log(message.data)
        try {
            chrome.browserAction.setIcon({ path: 'icon.png', tabId: message.data});
        } catch (e) {
            console.error(e);
        }
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'resultfound') {
        console.log("TEST")
        console.log(`BG: Result found!`);

        chrome.tabs.update(result.notifyMode.tabId, {active: true});
        // createNotification();

        // playSound();
    }
});


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



