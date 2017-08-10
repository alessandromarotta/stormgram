/* jshint esversion: 6 */
/* jshint multistr: true */

(function(f) {
    window.stormgram = f();
})(function() {

    function notify(message) {
        chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: '../icons/icon-48.png',
            title: 'Stormgram notification',
            message: message
        }, function(notificationId) {});
    }

    function loadNextProfile() {
        if(instagramAccounts.length>0) {
            if(stormgram.roundEnabled) {
                chrome.tabs.onUpdated.addListener(onTabUpdated); // re-enable listener on create and update event
                stormgram.counter++;
                chrome.tabs.update(instagramTabId, {url: "https://www.instagram.com/" + instagramAccounts[0]}); 
            } else {
                stormgram.roundEnabled = false; // reset round state
                chrome.tabs.remove(instagramTabId); // remove used Instagram tab
                chrome.tabs.onUpdated.addListener(onTabUpdated); // re-enable listener on create and update event
                notify("Round paused!");
            }
        } else {
            stormgram.roundEnabled = false; // reset round state
            stormgram.counter = 0;
            chrome.tabs.remove(instagramTabId); // remove used Instagram tab
            chrome.tabs.onUpdated.addListener(onTabUpdated); // re-enable listener on create and update event
            notify("Round completed!");
        }
    }

    function getAccountsStored() {
        return JSON.parse(localStorage.getItem("ig_nicks"));
    }

    function setAccountsStored(data) {
        localStorage.setItem("ig_nicks", JSON.stringify(data));
    }

    function updateNickList() {
        instagramAccounts.shift();
        chrome.browserAction.setBadgeText({text: (instagramAccounts.length).toString() });
        setAccountsStored(instagramAccounts);
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
                case "notify":
                    notify(request.msg);
                    break;
                case "console":
                    console.log(request.msg);
                    break;
                case "sendLikesBtn":
                    stormgram.roundEnabled = true; // set round state to true
                    instagramAccounts = request.data;
                    getFirstInstagramTab();
                    break;
                case "emptyListBtn":
                    chrome.browserAction.setBadgeText({text: "0"});
                    stormgram.roundEnabled = false;
                    setAccountsStored([]); // reset instagram account array
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
        instagramTabId = -1;

    chrome.browserAction.setBadgeText({text: (instagramAccounts ? instagramAccounts.length.toString() : 0 ) });

    chrome.tabs.onUpdated.addListener(onTabUpdated); // triggered on create and update event
    chrome.extension.onMessage.addListener(listenChromeMsg);
    
    return {
        counter: 0,
        roundEnabled: false,
        getAccountsStored: getAccountsStored,
        checkRoundState: function() {
            if( stormgram.roundEnabled && confirm("Task in progress, do you want to pause it?") ) {
                stormgram.roundEnabled = false;
                return true;
            } else
                return false;
        }
    };

});
