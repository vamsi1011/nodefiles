"use strict";

/* global document:true, window:true, URL:true */
const rp = require("request-promise");
var dateFormat = require('dateformat');
const puppeteer = require("puppeteer");
//const request = require('request');
const request = require('request');
const express = require("express");
const URL = require('url');
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
var roundround = require('roundround');
const MongoClient = require('mongodb').MongoClient;
var CommonFile = require('./commonVariables');
let db, browser;

app.use(bodyParser.urlencoded({
    extended: false
}));
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});


const width = 1366,
    height = 768;
const C_HEADELESS = true;
const C_SLOWMOTION = 0;
puppeteer
    .launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        args: ["--disable-web-security", `--window-size=${width},${height}`]
    })
    .then(async b => {
        browser = b;
        MongoClient.connect(CommonFile.Mongouri, {
            'poolSize': 10,
            'useNewUrlParser': true
        }, (err, client) => {
            if (err) return console.log(err)
            db = client.db('admin') // whatever your database name is
            const HTTP_PORT = 7775;
            var server= http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/process1?status=0")
                );
            server.timeout = 3000000;
        })
    });




app.get('/process1', async (req, res) => {
    
    
    var status=req.query.status;
    try {
        console.log("given Status:"+status);
        if(!status || status==undefined){
            return res.send('{"message": "No status provided.", "status": 1}');
        }
            

        // while(true){
            console.log("---------the Start-----------");
            const dataSet = await db.collection(CommonFile.collection1).find({
                'status':parseInt(status)
            }).skip(0).limit(70).toArray()
            console.log("Dataset Lnth:"+dataSet.length);
            if(dataSet.length){

                const page = await PageStructure(await browser.newPage()); 
                var success=[],fail=[];
                for (let index = 0; index < dataSet.length; index++) {
                    const rowData = dataSet[index];
                    try {
                        const start = Date.now();
        
                        const responseData=await careerType(start,page,rowData.careerLink);
                        if(!responseData.hasOwnProperty('error')){
                            var date = new Date();
                            responseData.P1_Updatetime=dateFormat(date, "dddd, mmmm dS, yyyy, h:MM:ss TT");
                            var pages = await browser.pages()
                            for (let index = 0; index < pages.length; index++) {
                                if(index>1){
                                    const page = pages[index];
                                    console.log(page.url())   // new page now appear!
                                    setTimeout(() => page.close(), 5000);
                                }
                    
                            }
                            await db.collection(CommonFile.collection1).updateOne({'careerLink':rowData.careerLink},{$set:responseData}).then(() => console.log('Updated Status Into the Collection'));
                            success.push(rowData.careerLink)
                        }else{
                            fail.push(rowData.careerLink)
                        }
        
                    } catch (error) {
                        console.log(error);
                        
                        fail.push(rowData.careerLink)
                    }
                }
        
                console.log("---------the end-----------");
            // }
            
            res.send({success,fail});
            }else{
                res.send({'error':"sorry no data found with the given status"});
            }
            
    } catch (error) {
        res.send({error});
    }finally{
        var pages = await browser.pages()
        for (let index = 0; index < pages.length; index++) {
            if(index!=0){
                const page = pages[index];
                console.log(page.url())   // new page now appear!
                setTimeout(() => page.close(), 5000);
            }

        }
    }
});
async function PageStructure(page){
    var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    ];
    await page.setUserAgent(
        Useragents[Math.floor(Math.random() * Useragents.length)]
    );
    // await page.setRequestInterception(true);
    // page.on('request', request => {
    //     const type = request.resourceType();
    //     if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other')
    //         request.abort();
    //     else
    //         request.continue();
    // });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        const filters = [
            'livefyre',
            'moatad',
            'analytics',
            'controltag',
            'chartbeat',
        ];
        const type = request.resourceType();
        const shouldAbort = filters.some((urlPart) => url.includes(urlPart));
        if (shouldAbort || type === 'image' || type === 'font' || type === 'media') request.abort();
        else request.continue();
    });
    await page.setViewport({
        width: 1366,
        height: 671
    });
    return page;
}

async function careerType(start,page,careerLink){
    try {
        const urlParse = URL.parse(careerLink);
        console.log("Domain=" + urlParse.hostname);
        let domain = urlParse.hostname;  
         
        if(domain.includes('icims')){
            
            var GetLastpage=await Pagination(page,start,careerLink);
            console.log("----------============--------------");
            console.log(GetLastpage);
            console.log("----------============--------------");
            if(GetLastpage.length){
                var Limit=await get_page_number(GetLastpage[0],'/search?pr=')
                console.log("-------------------------------");
                console.log('pageLimit:'+Limit);
                console.log("-------------------------------");
                var paginationUrls=await formingUrls(start,careerLink,'icims',[],parseInt(Limit)+1)
                
                return {'type':'icims','paginationUrls':paginationUrls,'paginationAPI':GetLastpage,'status':1}
            }else{
                var paginationUrls=await formingUrls(start,careerLink,'icims',[],1)
                return {'type':'icims','paginationUrls':paginationUrls,'paginationAPI':GetLastpage,'status':1,'paginationPattern':{}} 
            }

        }else if(domain.includes('workday')){
            
            return {'type':'workday','paginationUrls':[],'paginationAPI':[],'status':1}
        }else{ 
            var paginationSelectors_in_Urls = ['from=','&pageno=','&beg=','?page=','/Page-','page_job=','page_jobs=','||d-ASC|','page_jobs=','/page','&pagenum=','&pageNum=','?pageNum=','pages=','jobOffset=','?folderOffset=','jobSearchPaginationExternal_page:','&startrow=', '&page=','&paged=','#page-','?page=','&pg=','?pg=','/page/','PGNO=', 'Page-', 'Page=', 'page=', 'page/','jobs/', 'page-', 'startRow=','startrow=','#||||','|||||', 'p=', 'offset=','pagenumber=','Pagenumber=','pageNumber=','results/','all-jobs/','szStart=','PageID=','rowFrom=','start/'];

            var SourceUrlPatternCheck=await paginationPattern(start,[careerLink],paginationSelectors_in_Urls)
            if (!(SourceUrlPatternCheck.hasOwnProperty('error')) && SourceUrlPatternCheck.matchUrl!=='') {
                console.log(Date.now()-start+"(ms) Got the Pattern in Given Job URL");

                var formUrls=await formingUrls(start,careerLink,'',SourceUrlPatternCheck,2);
                if(formUrls.length==0){
                    console.log(Date.now()-start+"(ms) Didn't Got the Pattern in Given Job URL");
                let paginationLinks=await Pagination(page,start,careerLink);
                var uniqueLinks = [];
                for (var i = 0; i < paginationLinks.length; i++) {
                    if (uniqueLinks.indexOf(paginationLinks[i]['Link']) == -1 && paginationLinks[i]['Link'] != null) {
                        uniqueLinks.push(paginationLinks[i]['Link']);
                    }
                }
               
                var pagePattern=await paginationPattern(start,uniqueLinks,paginationSelectors_in_Urls);
                if (pagePattern.hasOwnProperty('error') || pagePattern.matchUrl==='') {
                    console.log(Date.now()-start+"(ms) Didn't Got the Page Pattern in Going for Parallel Processing NEXT LOAD MORE....");
                    return {'type':'other','paginationUrls':[],'paginationAPI':uniqueLinks,'status':1,'paginationPattern':{}}
                }else{
                    console.log(Date.now()-start+"(ms) Got the Pagination URL's Going for Parallel Processing");
                    var formUrls=await formingUrls(start,careerLink,'',pagePattern,2);
                    if(formUrls.length==0){
                        return {'type':'other','paginationUrls':[],'paginationAPI':uniqueLinks,'status':1,'paginationPattern':{}} 
                    }
                    return {'type':'Pagination','paginationPattern':pagePattern,'paginationUrls':formUrls,'paginationAPI':paginationLinks,'status':1}
                }
                }
                return {'type':'Pagination','paginationPattern':SourceUrlPatternCheck,'paginationUrls':formUrls,'paginationAPI':[],'status':1}
            }
            else{
                console.log(Date.now()-start+"(ms) Didn't Got the Pattern in Given Job URL");
                let paginationLinks=await Pagination(page,start,careerLink);
                var uniqueLinks = [];
                for (var i = 0; i < paginationLinks.length; i++) {
                    if (uniqueLinks.indexOf(paginationLinks[i]['Link']) == -1 && paginationLinks[i]['Link'] != null) {
                        uniqueLinks.push(paginationLinks[i]['Link']);
                    }
                }
               
                var pagePattern=await paginationPattern(start,uniqueLinks,paginationSelectors_in_Urls);
                if (pagePattern.hasOwnProperty('error') || pagePattern.matchUrl==='') {
                    console.log(Date.now()-start+"(ms) Didn't Got the Page Pattern in Going for Parallel Processing NEXT LOAD MORE....");
                    return {'type':'other','paginationUrls':[],'paginationAPI':uniqueLinks,'status':1,'paginationPattern':{}}
                }else{
                    console.log(Date.now()-start+"(ms) Got the Pagination URL's Going for Parallel Processing");
                    var formUrls=await formingUrls(start,careerLink,'',pagePattern,2);
                    if(formUrls.length==0){
                        return {'type':'other','paginationUrls':[],'paginationAPI':uniqueLinks,'status':1,'paginationPattern':{}} 
                    }
                    return {'type':'Pagination','paginationPattern':pagePattern,'paginationUrls':formUrls,'paginationAPI':paginationLinks,'status':1}
                }
            }    
        }  
    } catch (error) {
        return {'error':error}
    }
}





async function paginationPattern(start,UrlsArray,selectors){
    try {
        console.log(Date.now()-start+"(ms){Into the paginationPattern Function}");
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        if(UrlsArray.length==0){
            return {'matchUrl':'','pattern':''}
        }
        for (let index1 = 0; index1 < UrlsArray.length; index1++) {
            const matchUrl = UrlsArray[index1];
            console.log(matchUrl);
            for (let index2 = 0; index2 < selectors.length; index2++) {
                const pattern = selectors[index2];
                console.log(Date.now()-start+"(ms) Checking "+matchUrl + " includes " + pattern)
                if(matchUrl.includes(pattern)){
                    if(pattern=="page="){
                        if(matchUrl.includes("&per_page=")){
                            return {'matchUrl':'','pattern':''}
                        }else{
                            return {'matchUrl':matchUrl,'pattern':pattern}
                        }
                    }
                    return {'matchUrl':matchUrl,'pattern':pattern}
                }
            }
            
        }
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        return {'matchUrl':'','pattern':''}
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in paginationPattern Function:"+error);
        console.log("-------------------------------------------------------------");
        return {'matchUrl':'','pattern':'','error':error}
    }
}
function get_page_number(url, selector) {

    var page_number = -1;
    page_number = url.lastIndexOf(selector);
    if (page_number != -1) {
        page_number = page_number + selector.length;
    }
    var number_string_value = url.substring(page_number, page_number + 5);
    if (number_string_value.match(/\d/g)) {
        return number_string_value.match(/\d/g).join('').toString();
    } else {
        return '';
    }

}
async function formingUrls(start,careerLink,type,pagePattern,pageLimit=200){
    console.log("==================================================");
    console.log("into formingUrls");
    console.log("Input Values "+pagePattern.matchUrl+" "+pageLimit);
    console.log("==================================================");

    if(type==='icims'){
        const Parsedurl = URL.parse(careerLink);
        var ICIMS_urls = [],incr=0;
        while (incr < pageLimit) {
            const FormedURL = Parsedurl.protocol + "//" + Parsedurl.host + "/jobs/search?pr=" + incr
            ICIMS_urls[incr] = FormedURL
            incr = incr + 1;
        }
        return ICIMS_urls;
    }else{
        let UrlFormation=[];
        let matchUrl=pagePattern.matchUrl;
        let pattern=pagePattern.pattern;
    
        let numberAfterPattern=await get_page_number(matchUrl,pattern)
        if(numberAfterPattern==''){
            return [];
        }
        console.log("PageNumber Found=" + parseInt(numberAfterPattern))
        var StringToChange = pattern + parseInt(numberAfterPattern);
        console.log(StringToChange);
        var incr=0,numb=0;
        while(incr<pageLimit){
            if(pattern=='jobOffset='){
                var NewValue = pattern + numb
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                incr=incr+1
                let page_number_value=5
                numb = numb + page_number_value
    
            }
            else if(pattern=='?folderOffset='){
                var NewValue = pattern + numb
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                incr = incr + 1
                let page_number_value=20
                numb = numb + page_number_value
    
            }
            else if(pattern.toLowerCase().includes('startrow=')){
                console.log("Into startrow=");
                var NewValue = pattern + numb
                console.log(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                incr = incr + 1
                let page_number_value=25
                numb = numb + page_number_value
    
            }
            else if(pattern.toLowerCase()=='from='){
                if(parseInt(numberAfterPattern)==10){
                    var NewValue = pattern + numb
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                    let page_number_value=10
                    numb = numb + page_number_value
                    incr = incr + 1
                }else if(parseInt(numberAfterPattern)==50){
                    var NewValue = pattern + numb
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                    let page_number_value=50
                    numb = numb + page_number_value
    
                    incr = incr + 1
                }
                else{
    
                    UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                    var NewValue = pattern + numb;
                    numb=numb+1
                    incr=incr+1
                }
            }else if((parseInt(numberAfterPattern)>0 && parseInt(numberAfterPattern)%2==0||parseInt(numberAfterPattern)===1)){
                var NewValue = pattern + (numb+1);
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                incr=incr+1
                numb=numb+1
    
            }
            else{
                var NewValue = pattern + numb;
                numb=numb+1
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                incr=incr+1
            }
    
        }
        return UrlFormation;
    }
    
}

async function Pagination(page, start, joburl) {
    try {
        const urlParse = CommonFile.URL.parse(joburl);
        console.log("Domain=" + urlParse.hostname);
        let domain = urlParse.hostname
        if(domain.includes('icims')){
            console.info(Date.now() - start + ": Opening page: " + joburl);
            console.log("Given URL==>" + joburl); 
            await page.goto(joburl, {
                networkIdle2Timeout: 5000,
                waitUntil: "networkidle2",
                timeout: 0
            });
            await page.waitFor(2000).then(() => console.log('Waiting for 2 Sec'));
            const getLastPage = await page.evaluate(()=>{
                for (const frame of document.querySelectorAll("iframe")) {
                    const frameDocument =
                        frame.contentDocument || frame.contentWindow.document;
    
                    const div = document.createElement("div");
                    for (const attr of frame.attributes) {
                        if (
                            attr.name !== "src" &&
                            attr.name !== "srcdoc" &&
                            attr.name !== "sandbox"
                        ) {
                            div.setAttribute(attr.name, attr.value);
                        }
                    }
                    div.innerHTML = frameDocument.documentElement.innerHTML;
                    frame.parentNode.replaceChild(div, frame);
                }
                return "done"
            });
            const [elementHandle] = await page.$x('//div[@class="iCIMS_Paginator_Bottom"]//a[contains(., "Last")]');
            const propertyHandle = await elementHandle.getProperty('href');
            const propertyValue = await propertyHandle.jsonValue();
            return [propertyValue];
        }
        console.info(Date.now() - start + ": Opening page: " + joburl);

        console.log("Given URL==>" + joburl);

        await page.goto(joburl, {
            networkIdle2Timeout: 5000,
            waitUntil: "networkidle2",
            timeout: 0
        });

        if (CommonFile.exceptionDomain.includes(domain)) {
            await page.waitFor(10000).then(() => console.log('Waiting for 10 Sec'));
        } else {
            await page.waitFor(1000).then(() => console.log('Waiting for 1 Sec'));
        }
        let div_selector_to_remove= ".pager-container-reduced";
        await page.evaluate((sel) => {
            var elements = document.querySelectorAll(sel);
            for(var i=0; i< elements.length; i++){
                elements[i].parentNode.removeChild(elements[i]);
            }
        }, div_selector_to_remove)
        //const doc = await page._client.send('DOM.getDocument');
        //const doc = await page._client.send('DOM.getDocument');
        await delay(500);
        await page.$eval('body a', e => e.setAttribute("target", "_self"))
        var results = await getPaginationLinks(page);
        var paginationSelector = '';
        for (var m = 0; m < CommonFile.nextButtonSelectors.length; m++) {
            const data =  CommonFile.nextButtonSelectors[m]
            const linkHandlers = await page.$x(data);
            if (linkHandlers.length > 0) {
                //await linkHandlers[0].click();
                console.log(data + " Found in " + joburl)
                paginationSelector = data;
                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                break;
            }
        };
        if (paginationSelector != "") {

            var paginationSelectorCount = await page.$x(paginationSelector);
            console.log('Selector Check in L1=>' + paginationSelectorCount.length);
            //await page.$x(paginationSelector).click() .then(() => console.log('next button Clicked going to Paage'));
            try {
                //await page.waitFor(1000).then(() => console.log('Waiting for 1 Secs to Navigate'));
                //results=results.concat(await Anchor_Tags_Getter(page));

                paginationSelectorCount = await page.$x(paginationSelector);
                console.log('Selector Check=>' + paginationSelectorCount.length);
                await paginationSelectorCount[0].click().then(() => console.log('next button Clicked going to Paage'));
                //await page._frameManager._mainFrame.waitForNavigation();
                await page.waitFor(4000).then(() => console.log('Waiting for 4 Secs to Navigate'));
                let OriginalURL = page.mainFrame().url();
                results.unshift(await getPaginationLinks(page));
                results.unshift([{
                    'Label': 'MainURL',
                    'Link': OriginalURL
                }])
                console.log(results)
                console.info(
                    Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
                );
                results = Array.prototype.concat.apply([], results);
                return results
            } catch (error) {
                console.log(error);

                console.info(
                    Date.now() - start + "(ms) : No Next Buuton found Successfully Scrapped the Page: " + joburl
                );
                let OriginalURL = page.mainFrame().url();
                //results.unshift(await getPaginationLinks(page));
                results.unshift([{
                    'Label': 'MainURL',
                    'Link': OriginalURL
                }])
                console.log(results)
                console.info(
                    Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
                );
                results = Array.prototype.concat.apply([], results);
                return results;
            }

        } else {
            console.info(
                Date.now() - start + "(ms) : No Next Buuton found Successfully Scrapped the Page: " + joburl
            );
            let OriginalURL = page.mainFrame().url();
            //results.unshift(await getPaginationLinks(page));
            results.unshift({
                'Label': 'MainURL',
                'Link': OriginalURL
            })
            console.log(results)
            console.info(
                Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
            );
            results = Array.prototype.concat.apply([], results);
            return results
        }

    } catch (e) {
        console.log("Sorry Some Error has " + e + " Occured")
        return []
    }

    function delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }
}


async function extractPaginationLinks(page) {
    try {
        return page.evaluate(() => {
            function isValidURL(string) {
                // string=string.replace(/\;jsessionid=.*/,'');
                // var pattern = new RegExp(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi);
                // var res = string.match(pattern);
                // return (res !== null)
                return string.startsWith('http')
            };
    
            function dataGetter(node,selector,attribute){
                let finalData=[];
                let dataSet = node.querySelectorAll(selector);
                for (let j=0;j<dataSet.length;j++){
                    var element1=dataSet[j];
                    var Label=element1.innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim()
                    if (Label == "") {
                        Label = element1.innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim();
                    }
                    if (element1.hasAttribute(attribute)) {
                        try {
                            let Link=new window.URL(element1.getAttribute(attribute), window.document.URL).toString();
                            if(isValidURL(Link) && !isNaN(Label) && !(Label.trim()==="") || (Label.toUpperCase().includes("NEXT")) || (Label.toUpperCase().includes("LAST")) || (Label.includes("»")) ||  (Label.toLowerCase().match("^page") && Label.match(/\d+$/))){
                                finalData.push({'Label':Label,
                                'Link':Link})
        
                            }
                        } catch (error) {
                            console.log(error);
                        }
    
                    }
                }
                return finalData;
            }
            var paginationLinks=[]
    
            paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"a[href]",'href'))
    
            paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body a",'data-href'))
    
            paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body a",'data-url'))
    
            paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body a",'data-surl'))
    
            paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body tr",'data-href'))
    
            paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body tr",'href'))
    
            return paginationLinks;
        }); 
    } catch (error) {
        console.log("--------------------------------------------------");
        console.log("Error in extracting Links:"+error);
        console.log("--------------------------------------------------");
        return [];
    }
}

async function getPaginationLinks(page) {
    try {
        var results = await extractPaginationLinks(page);
        const frames = await page.frames();
        for (let index = 0; index < frames.length; index++) {
            const framePage = frames[index];
            results=results.concat(await extractPaginationLinks(framePage))
        }
        return results;
    } catch (error) {
        console.log("--------------------------------------------------");
        console.log("Error in getPaginationLinks:"+error);
        console.log("--------------------------------------------------");
        return [];
    }

}

async function getSelector(page, selectors) {
    try {
        for (var m = 0; m < selectors.length; m++) {
            const data = selectors[m]
            const linkHandlers = await page.$x(data);
            if (linkHandlers.length > 0) {
                console.log(data + " Found")
                return data;
            }
        };
        return "";
    } catch (error) {
        console.log("error:" + error);
        return "";
    }
}

