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
                evt: "alert",
                msg: "Devi incollare nel box di testo l'elenco dei nick preceduti da '@'"
            });
        } else {
            const
                eTarget = e.target,
                instagramAccounts = myNicks.replace(/\s+/g, '').split('@'); // return array
            
            switch(eTarget.id) {
                case "sendLikesBtn":
                    eTarget.removeEventListener('click', delegateEvent, false);
                    instagramAccounts.shift(); // remove the first empty item
                    chrome.extension.sendMessage({
                        id: extensionId,
                        evt: eTarget.id,
                        data: instagramAccounts // array
                    });
                    window.close();
                    break;
                /* case "sendCommentsBtn":
                    chrome.extension.sendMessage({
                        id: extensionId,
                        evt: "alert",
                        msg: "Funzione non ancora implementata"
                    });
                    window.close();
                    break; */
                default:
            }
        }
    }

    chrome.runtime.getBackgroundPage(function(bgWindow) {

        if(bgWindow.stormgram.checkcurrentRound()) {
            bgWindow.stormgram.roundEnabled = false;
            bgWindow.stormgram.counter = 0;
        } else {
            let instagramAccounts = bgWindow.stormgram.getAccountsStored();
            if(instagramAccounts && instagramAccounts.length>0) { // check for stored Instagram accounts
                document.getElementById('myNicksInput').value = instagramAccounts.map(function(ig_account) {
                    return (ig_account='@'+ig_account);
                }).toString().replace(/,/g, '\n'); // \n EOL character
            }
            
        }

        document.getElementById('buttonContainer').addEventListener('click', delegateEvent, false);
        
    });

})();
