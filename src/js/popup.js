/* jshint esversion: 6 */
/* jshint multistr: true */

(function() {

    function delegateEvent(e) {
        const
            extensionId = chrome.runtime.id,
            myNicks = document.getElementById('myNicksInput').value;
        
        if(!myNicks) {
            chrome.extension.sendMessage({
                id: extensionId,
                evt: "notify",
                msg: "Devi incollare nel box di testo l'elenco dei nick preceduti da '@'"
            });
        } else {

            const eTarget = e.target;

            let message = {
                id: extensionId,
                evt: eTarget.id
            };
            
            switch(eTarget.id) {
                case "emptyListBtn":
                    document.getElementById('myNicksInput').value = "";
                    chrome.extension.sendMessage(message);
                    break;
                case "sendLikesBtn":
                    let instagramAccounts = myNicks.replace(/\s+/g, '').split('@'); // return array
                    instagramAccounts.shift(); // remove the first empty item
                    message.data = instagramAccounts;
                    chrome.extension.sendMessage(message);
                    break;
                default:
            }
        }
    }

    chrome.runtime.getBackgroundPage(function(bgWindow) {
        if(bgWindow.stormgram.checkRoundState()) { // check if enabled and prompt to disable it
            window.close();
        } else {
            let instagramAccounts = bgWindow.stormgram.getAccountsStored();
            if(instagramAccounts && instagramAccounts.length>0) { // check for stored Instagram accounts
                document.getElementById('myNicksInput').value = instagramAccounts.map(function(ig_account) {
                    return (ig_account='@'+ig_account);
                }).toString().replace(/,/g, '\n'); // \n EOL character
            }
            document.getElementById('buttonContainer').onclick = delegateEvent;
        }
    });

})();
