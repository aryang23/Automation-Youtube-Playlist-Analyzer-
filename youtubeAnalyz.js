const puppeteer=require("puppeteer");
let cTab;

(async function fn(){
    try
    {
        let browserOpenPromise=puppeteer.launch({
            headless:false,
            defaultViewport:null,
            args:["--start-maximized"],
            ignoreDefaultArgs: ['--disable-extensions']
        });
        let browser=await browserOpenPromise;
        let allTabsArr=await browser.pages();
        cTab=allTabsArr[0];
        await cTab.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
        let obj=await cTab.evaluate(consoleFn,"#items .yt-simple-endpoint.style-scope.yt-formatted-string","#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer");
        console.log(obj);

        let noOfSupposedVideos=obj.videos.split(" ")[0];
        // console.log(noOfSupposedVideos);
        let cVideosLength=await getCVideosLength();
        // console.log(cVideosLength);
        while(noOfSupposedVideos-cVideosLength>=20)
        {
            await scrollToBottom();
            cVideosLength=await getCVideosLength();
        }
        
        let list=await getStats();
        console.table(list);

        // await cTab.evaluate(consoleFn2,"#video-title",".style-scope.ytd-thumbnail-overlay-time-status-renderer");
    }
    catch(err)
    {
        console.log(err);
    }
})();

function consoleFn(nameSelector,viewsSelector)
{
    let name=document.querySelector(nameSelector).innerText;
    let videos=document.querySelectorAll(viewsSelector)[0].innerText;
    let views=document.querySelectorAll(viewsSelector)[1].innerText;
    let obj={name,videos,views};
    return obj;
}

async function getCVideosLength()
{
    let length=await cTab.evaluate(consoleGetLength,"#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return length;
}

function consoleGetLength(selector)
{
    let durationElem=document.querySelectorAll(selector);
    return durationElem.length;
}

async function scrollToBottom()
{
    await cTab.evaluate(goToBottom);

    function goToBottom(){
        window.scrollBy(0,window.innerHeight);
    }
}

async function getStats(){
    let list=await cTab.evaluate(consoleGetNameAndTime,"#video-title","#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return list;
}

function consoleGetNameAndTime(nameSelector,timeSelector)
{
    let allNamesElem=document.querySelectorAll(nameSelector);
    let timeNameElem=document.querySelectorAll(timeSelector);
    let currVidList=[];
    for(let i=0;i<timeNameElem.length;i++)
    {
        let name=allNamesElem[i].innerText;
        let time=timeNameElem[i].innerText;
        let obj={name,time};
        currVidList.push(obj);
    }
    return currVidList;
}