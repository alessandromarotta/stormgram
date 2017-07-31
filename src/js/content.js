/* jshint esversion: 6 */
/* jshint multistr: true */

(function() {

    function randomWaitTime(initialTime) {
        return (initialTime + Math.floor((Math.random() * 250) + 1));
    }

    function nextAccount() {
        setTimeout(function() {
            chrome.extension.sendMessage({
                id: chrome.runtime.id,
                evt: "nextAccount",
            });
        }, randomWaitTime(1000) );
    }

    let i=0;

    const
        currentAccount = document.URL.split('/')[3],
        aElements = document.getElementsByTagName("a");

    while(i < aElements.length && aElements[i].href.indexOf("?taken-by="+currentAccount)<0) {i++;}

    if(aElements[i] && aElements[i].href.indexOf("?taken-by="+currentAccount)>-1) {
        aElements[i].click();
        setTimeout(function() {
            let likeBtn = document.querySelector('._tk4ba._1tv0k');
            if(likeBtn.children[0].classList.contains('coreSpriteHeartOpen')) {
                likeBtn.click();
            }
            nextAccount();
        }, randomWaitTime(1000) );
    } else {
        nextAccount();
    }

})();