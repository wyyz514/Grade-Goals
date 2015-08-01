chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    tab.url == "https://horizon.mcgill.ca/pban1/bzsktran.P_Display_Form?user_type=S&tran_type=V"?
    chrome.pageAction.show(tabId):"";
});