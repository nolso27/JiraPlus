function listenForNotify() {
    console.log('listening')
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {   
        if (message.type === 'notify') {
            console.log('button was pressed');
            chrome.storage.session.set({ notifyMode: true });
            chrome.storage.session.set({ notifyTab: message.data })
            notifyMode();

        }
    });
}

function notifyMode() {
    var exclusionAmount = 3;
    console.log('entered notify mode');
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'resultfound') {
            resultLength = message.data;
            console.log('success! ', message.data);
            if(resultLength > exclusionAmount){
                createNotification();
                playSound();
            }
        }
    });
}

function createNotification(){
    var opt = {type: "basic",title: "Your Title",message: "Your message",iconUrl: "icon.png"}
    chrome.notifications.create("notificationName",opt,function(){});
}

async function playSound(source = 'notif1.mp3', volume = .5) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'testing' // details for using the API
    });
}


chrome.storage.session.get(['notifyMode']).then((result) => {
    if (result.notifyMode !== true) {
        listenForNotify();
    }
    if (result.notifyMode) {
        notifyMode();
    }
});