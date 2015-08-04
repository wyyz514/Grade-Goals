chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    tab.url == "https://horizon.mcgill.ca/pban1/bzsktran.P_Display_Form?user_type=S&tran_type=V"?
    chrome.pageAction.show(tabId):"";
});


chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  if(msg.message == "LOAD")
  {
    var promise = new Promise(function(resolve,reject){
      var resp = "";
      var xhr = new XMLHttpRequest();
      xhr.open("GET",chrome.extension.getURL("partial/gg.html"),true); 
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4)
        {
          resp = xhr.responseText;
          resolve(resp);
        }
      };
      xhr.send();
      return promise;
    })
    .then(function(resp){
      chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,{message:resp},function(response){
      
        });
      });
    });
  } 
});