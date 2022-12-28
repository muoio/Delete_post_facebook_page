let next_page_btn;
let prev_page_btn;
let start_btn;
let actions;
let panel;
let status = 2;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait_for_element(selector){
    let max_wait = 10;
    while(!document.querySelector(selector) && max_wait--)
        await sleep(500);
    if (max_wait<=0) return false;
    else return true;
}
async function click_to_end(){
    new Promise(resolve=>{
        let click_next = setInterval(function(){
            next_page_btn.click();
            if (next_page_btn.parentElement.disabled) chain++;
            else chain = 0;
            if(chain > 40) {
                clearInterval(click_next);
                alert("end");
                resolve(true);
                return true;
            }
        },100);
    });
}

async function delete_post(){
    //return new Promise(async resolve=>{
        prev_page_btn = document.querySelectorAll("[type='submit'][value='1'] i")[2];
        next_page_btn  = document.querySelectorAll("[type='submit'][value='1'] i")[3];

        prev_page_btn.click();
        await sleep(100);

        let checkboxes = document.querySelectorAll('[role="checkbox"]');
        for (let i=1;i<checkboxes.length;++i)
        {
            checkboxes[i].click();
        } 
        await sleep(200);

        panel = next_page_btn.parentElement.parentElement.parentElement;
        actions = panel.parentElement.parentElement.firstChild.querySelector('i');
        
        actions.click();
        await sleep(200);
        let item1 = document.querySelector('.__MenuItem');
        item1.click();
        await sleep(200);
        let confirms = document.querySelectorAll('a.layerCancel.selected');
        let confirm = confirms[confirms.length-1];
        confirm.click();
        if (prev_page_btn.disabled) status--;
    //     resolve(true);
    //     return true;
    // });
}

async function process(){
    await click_to_end();
    //while(!prev_page_btn.disabled)
    let loop_del = setInterval(function(){
        if (status) delete_post();
        else clearInterval(loop_del);
    },5000);
        //if (prev_page_btn.disabled) clearInterval(delete_all);
    //},5000);
}

function delete_all_btn(){
    let start_btn = document.createElement('button');
    start_btn.textContent = 'Xóa tất cả';
    start_btn.onclick = process;

    return start_btn;
}
window.onload = function(){
    prev_page_btn = document.querySelectorAll("[type='submit'][value='1'] i")[2];
    next_page_btn  = document.querySelectorAll("[type='submit'][value='1'] i")[3];
    next_page_btn.click();
    panel = next_page_btn.parentElement.parentElement.parentElement;
    actions = panel.parentElement.parentElement.firstChild.querySelector('i');
    //console.log(panel);
    console.log(actions);
    panel.appendChild(delete_all_btn());
}