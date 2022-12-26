let links_answers = document.getElementById('links_answers');
let country = document.getElementById('country');
let wait_time = document.getElementById('wait_time');
let start = document.getElementById('start');
let stop = document.getElementById('stop');

chrome.storage.local.get(['country','links_answers','wait_time','state'],function(data){
    country.value = data.country;
    links_answers.value = data.links_answers;
    wait_time.value = parseInt(data.wait_time);
    display_state();
});

function display_state(){
    chrome.storage.local.get(['state'], function(data){
        if (data.state){
            start.style.display = 'none';
            stop.style.display = 'block';
        }
        else {
            start.style.display = 'block';
            stop.style.display = 'none';
        }
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, callback){
    if(message.greeting == 'state_change'){    
        display_state();
    }
    callback({});
    return true;
});

start.onclick = function(){
    let time_to_run = wait_time.value*1000*60;
    chrome.runtime.sendMessage({greeting:'start', time_run:time_to_run});
}

stop.onclick = function(){
    chrome.runtime.sendMessage({greeting:'stop'});
}

country.addEventListener('input',function(){
    chrome.storage.local.set({country:country.value});
})

links_answers.addEventListener('input',function(){
    chrome.storage.local.set({links_answers:links_answers.value});
})
wait_time.addEventListener('input',function(){
    chrome.storage.local.set({wait_time:wait_time.value});
})