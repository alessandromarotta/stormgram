/* jshint esversion: 6 */
/* jshint multistr: true */

(function(f) {
    window.stormgram = f();
})(function() {

    function loadNextProfile() {
        if(stormgram.roundEnabled && instagramAccounts.length>0) {
            chrome.tabs.onUpdated.addListener(onTabUpdated); // re-enable listener on create and update event
            stormgram.counter++;
            chrome.tabs.update(instagramTabId, {
                //active: true,
                url: "https://www.instagram.com/"+ instagramAccounts[0] 
            }); 
        } else {
            alert('Round completato');
            stormgram.roundEnabled = false; // reset round state
            stormgram.counter=0; // reset counter
            chrome.tabs.remove(instagramTabId); // remove used Instagram tab
            chrome.tabs.onUpdated.addListener(onTabUpdated); // re-enable listener on create and update event
        }
    }

    function getAccountsStored() {
        return JSON.parse(localStorage.getItem("ig_nicks"));
    }

    function updateNickList() {
        instagramAccounts.shift();
        chrome.browserAction.setBadgeText({text: (instagramAccounts.length).toString() });
        localStorage.setItem("ig_nicks", JSON.stringify(instagramAccounts));
    }

    function getFirstInstagramTab() {
        
        chrome.tabs.query({}, function(tabs) {

            let i = 0;
            const fistIgUrl = "https://www.instagram.com/" + instagramAccounts[0];

            while(i < tabs.length && tabs[i].url.indexOf('instagram.com')<0) {i++;}
            if(tabs[i]) {
                instagramTabId = tabs[i].id;
                chrome.tabs.update(instagramTabId, {
                    //active: true,
                    url: fistIgUrl 
                });
            } else
                chrome.tabs.create({
                    url: fistIgUrl
                }, function(tab) {
                    instagramTabId = tab.id;
                });
        });

    }

    function listenChromeMsg(request, sender) {
        if(sender.id === request.id ) {
            switch(request.evt) {
                case "alert":
                    alert(request.msg);
                    break;
                case "console":
                    console.log(request.msg);
                    break;
                case "sendLikesBtn":
                /* case "sendCommentsBtn": */
                    stormgram.roundEnabled = true; // set round state to true
                    functionInvoked = request.evt;
                    instagramAccounts = request.data;
                    getFirstInstagramTab();
                    break;
                case "nextAccount":
                    loadNextProfile();
                    break;
                default:
            }
        }
    }

    function onTabUpdated(tabId, changeInfo, tab) {
        if(stormgram.roundEnabled && tabId===instagramTabId && changeInfo.status==="complete") {
            updateNickList();
            chrome.tabs.onUpdated.removeListener(onTabUpdated);
            chrome.tabs.executeScript(instagramTabId, {
                file: "js/content.js"
            });

        }
            
    }

    let
        instagramAccounts = getAccountsStored() || [],
        instagramTabId = -1,
        functionInvoked = '';

    chrome.browserAction.setBadgeText({text: (instagramAccounts ? instagramAccounts.length.toString() : 0 ) });

    chrome.tabs.onUpdated.addListener(onTabUpdated); // triggered on create and update event
    chrome.extension.onMessage.addListener(listenChromeMsg);
    
    return {
        counter: 1,
        roundEnabled: false,
        getAccountsStored: getAccountsStored,
        checkcurrentRound: function() {
            let roundActive = false;
            if(stormgram.roundEnabled) {
                roundActive = confirm("Round in corso, vuoi interrompere?");
            }
            return roundActive;
        }
    };

});
