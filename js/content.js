let next_page_btn;
let start_btn;


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
function delete_all_btn(){
    let start_btn = document.createElement('button');
    start_btn.textContent = 'Xóa tất cả';
    start_btn.onclick = function(){
        let click_next = setInterval(function(){
            next_page_btn.click();
            if (next_page_btn.parentElement.disabled) chain++;
            else chain = 0;
            if(chain > 100) {
                clearInterval(click_next);
                alert("end");
            }
        },100);
    }

    return start_btn;
}
window.onload = function(){
    next_page_btn  = document.querySelectorAll("[type='submit'][value='1'] i")[3];
    sleep(5000);
    next_page_btn.click();
    let panel = next_page_btn.parentElement.parentElement.parentElement
    console.log(panel);
    panel.appendChild(delete_all_btn());
}