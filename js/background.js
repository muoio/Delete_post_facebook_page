var wait;
var links;
var answers;
var index_link;


function get_state(){
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get('state', function(data) {
            let control_state = data.state;
            resolve(control_state);
        })
    });
}
function get_links(){
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get('links_answers', function(data) {
            let links_answers = data.links_answers;
            links_answers = links_answers.split('\n');
            let tmp_links = [];

            for (let i=0;i<links_answers.length;++i){
                if(links_answers[i].slice(0,4)=='http')
                    tmp_links.push(links_answers[i]);
            }

            resolve(tmp_links);
        })
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, callback){
    if(message.greeting == 'start'){
        clearTimeout(wait);
	
        let wait_time = parseInt(message.time_run);
        console.log(wait_time)
        wait = setTimeout(async ()=>{
            links = await get_links();
            index_link = 0;
            chrome.tabs.create({url:links[0]});
        }, wait_time);

        chrome.storage.local.set({state:true});
        chrome.runtime.sendMessage({greeting:'state_change'});
    }
    if(message.greeting == 'stop'){
        clearTimeout(wait);
        chrome.storage.local.set({state:false});
        chrome.runtime.sendMessage({greeting:'state_change'});
    }
    callback({});
    return true;
});

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.url && await get_state()){
        let url = changeInfo.url;
        if (url.includes('/onboarding')){
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files:  ["js/coinlist/onboarding.js"]
            }); 
        }

        else if (url.slice(-4) == '/new'){
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files:  ["js/coinlist/new.js"]
            }); 
        }

        else if (url.slice(-11) == '/onboarding'){
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files:  ["js/coinlist/onboarding.js"]
            }); 
        }

        else if (url.slice(-10) == '/residence'){
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files:  ["js/coinlist/residence.js"]
            }); 
        }

        else if (url.slice(-5) == '/quiz'){
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files:  ["js/coinlist/quiz.js"]
            }); 
        }

        else if (url.includes('sales.coinlist.co')){
	   setTimeout(()=>{
	     chrome.tabs.remove(tabId);
	     index_link++;
       	     if (index_link < links.length)
             chrome.tabs.create({url:links[index_link]});
             else{
            	chrome.storage.local.set({state:false});
            	chrome.runtime.sendMessage({greeting:'state_change'});
              }
           },2000);
             
        }
    }
    return true;
});



chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.storage.local.set({country:"India"});
        chrome.storage.local.set({wait_time: 29});
        let links_answers = 
`https://sales.coinlist.co/tribal-option-1/onboarding
https://sales.coinlist.co/tribal-option-2/onboarding
64,066,667
Users in the waiting room for the sale will be given a random spot in the queue when the sale starts. Users who arrive after the sale starts for the sale will be placed behind those in the waiting room
BTC, ETH, USDC, USDT, ALGO, SOL
Option 1: $0.55 per token, $500 limit. Option 2: $0.40 per token, $500 limit
The user's purchase may be canceled and the user may be banned from future CoinList sales
CoinList.co
The user's account will be terminated and all purchases will be canceled`;
        chrome.storage.local.set({links_answers:links_answers});
    }        
    return true;
});

let lifeline;

keepAlive();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}