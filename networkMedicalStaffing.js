'use strict';
var MongoClient = require('mongodb').MongoClient;
var url= 'mongodb://jobiak:jobiak@18.223.47.109:28015/data_cleansing';
//var url = "mongodb://localhost:27017/";
let db,browser;
var CommonFile = require('./CommonFile');
/* global document:true, window:true, URL:true */
const puppeteer = require("puppeteer");
const rp = require("request-promise");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
var cors = require('cors')
app.use(cors())



//allow express to access our html (index.html) file

const width = 1920,
    height = 1080;
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
        MongoClient.connect(url, {
            'poolSize': 10,
            'useNewUrlParser': true
        }, (err, client) => {
            if (err) return console.log(err)
            db = client.db('data_cleansing') // whatever your database name is
            const HTTP_PORT = 8745;
            var server= http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT+"/networkStaffing")
                );
            server.timeout = 240000;
        })
    });
app.get('/networkStaffing', async (req, res) => {
    const start = Date.now();
    let joburl="https://www.networkmedicalstaffing.com/careerportal/#/jobs"
    console.log("Given joburl " + joburl)

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        console.log("====================================THE START============================================")
        const response = await LoadMore(page, start, joburl);
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("=====================================THE END===========================================");
        let dataset=uniqueDataSet(response);
        setTimeout(() => page.close(), 30000);
        await GetAllALbels(dataset);
        res.status(200).send("Done")
    } catch (error) {
        console.error('Error handling request', error);
        console.log("====================================THE END WITH ERROR============================================")
        res.status(200).send([]);

    }
});







async function LoadMore(page, start, joburl) {
    try {
        console.info(Date.now() - start + ": Opening page: " + joburl);
        var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
            'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        ];
        await page.setUserAgent(
            Useragents[Math.floor(Math.random() * Useragents.length)]
        );
        await page.setViewport({
            width: 1366,
            height: 671
        });
        await page.goto(joburl, {
            networkIdle2Timeout: 5000,
            waitUntil: "networkidle2",
            timeout: 0
        });

        //const doc = await page._client.send('DOM.getDocument');
        const urlParse = CommonFile.URL.parse(joburl);
        console.log("Domain=" + urlParse.hostname);
        let domain = urlParse.hostname
        if (CommonFile.exceptionDomain.includes(domain)) {
            await page.waitFor(10000).then(() => console.log('Waiting for 10 Sec'));
        } else {
            await page.waitFor(1000).then(() => console.log('Waiting for 1 Sec'));
        }
        var LoadMoreSelectors = '//p[@class="load-more-data ng-binding"]';
        if (LoadMoreSelectors != "") {
            var LoadMoreSelectorsCount = await page.$x(LoadMoreSelectors);

            var limit = 0
            while ((LoadMoreSelectorsCount.length !== 0) && limit <= 20) {
                limit = limit + 1
                await page.waitFor(1000).then(() => console.log('1 Sec Waiting Page to Load'));

                LoadMoreSelectorsCount = await page.$x(LoadMoreSelectors);
                try {
                    if (LoadMoreSelectorsCount.length > 0) {
                        await LoadMoreSelectorsCount[0].click();
                        console.log('next button Clicked going to Page')
                        await page.waitFor(2000).then(() => console.log('2 Sec Waiting Page to Load'));
                    }
                } catch (e) {
                    console.log("Have an Error--->" + e)
                    break;
                }

                //await page.$x(LoadMoreSelectors).click() .then(() => console.log('next button Clicked going to Paage'));

            }
        }
        const results = await GetJobLinks(page);
        console.log(results.length)
        console.info(
            Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
        );
        return results

    } catch (e) {
        console.log("Sorry Some Error has " + e + " Occured")
        return [];
    }

}
function uniqueDataSet(originalArray, prop = "jobUrl") {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}
async function extractedEvaluateCall(page,from) {
    try {

        return page.evaluate((from) => {

            let finalDataSet=[]
            function isValidURL(string) {
                // string=string.replace(/\;jsessionid=.*/,'');
                // var pattern = new RegExp(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi);
                // var res = string.match(pattern);
                // return (res !== null)
                return string.startsWith('http')
            };
            let jobCard=document.documentElement.querySelectorAll('a[class="card slide-up-item"]')

            for (let index = 0; index < jobCard.length; index++) {
                const element = jobCard[index];
                let title=element.querySelectorAll('span[class="card-title ng-binding"]')[0].innerText
                let location=element.querySelectorAll('span[class="card-location ng-binding"]')[0].innerText
                let datePosted=element.querySelectorAll('span[class="card-date ng-binding ng-scope"]')[0].innerText.replace('Added - ','').trim();
                let jobUrl=new window.URL(element.getAttribute('href'), window.document.URL).toString();
                finalDataSet.push({'title':title,'location':location,'datePosted':datePosted,'jobUrl':jobUrl})
            }
            return finalDataSet;
        },from); 
    } catch (error) {
        console.log("--------------------------------------------------");
        console.log("Error in extracting Links:"+error);
        console.log("--------------------------------------------------");
        return [];
    }



}
async function GetJobLinks(page) {
    try {
        var from='Page';
        var results = await extractedEvaluateCall(page,from);
        const frames = await page.frames();
        for (let index = 0; index < frames.length; index++) {
            const framePage = frames[index];
            from='frames-'+index
            results=results.concat(await extractedEvaluateCall(framePage,from))
        }
        return results;
    } catch (error) {
        console.log("--------------------------------------------------");
        console.log("Error in GetJobLinks:"+error);
        console.log("--------------------------------------------------");
        return [];
    }

}
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
async function GetAllALbels(Data){
    const start=Date.now();
    const page = await browser.newPage();
    await db.collection('ETL_NMS_Data').deleteMany();
    for (let index = 0; index < Data.length; index++) {
        try {
            const element = Data[index];
        await sleep(2000);
        //log(start,URL,URLs.indexOf(URL));
        
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        );
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        const response=await LDJSONGetter(page,start,element.jobUrl);
        element.HTML=response.HTML;
        element.PlainText=response.PlainText;
        element.Description=response.jobDesc;
        element.Company="Network Medical Staffing"
        //element.status=200
        element.createdAt=new Date().toISOString().slice(0, 19).replace('T', ' ')
        //element.UpdateTime=new Date().toISOString().slice(0, 19).replace('T', ' ')
        console.log("------------------------------------------");
        console.log(element.jobUrl+" Done");
        console.log("------------------------------------------");
        await db.collection('ETL_NMS_Data').insertMany([element])
    } catch (error) {
        console.error('Error handling request', error);
    } 
        
    }
    setTimeout(() => page.close(), 20000);
}
async function LDJSONGetter(page, start, joburl) {
    try {
        console.info(Date.now() - start + ": Opening page: " + joburl);

        await page.goto(joburl, {
            networkIdle2Timeout: 900000,
            waitUntil: "networkidle2",
            timeout: 800000
        });
        await page.waitFor(2000).then(()=>console.log("Waiting for 2 Sec"))


        var result = await page.evaluate(() => {
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
            // eslint-disable-line no-irregular-whitespace
            function cleanup(node, type) {
                const scripts = [];
                let els = node.getElementsByTagName(type);
                for (let i = els.length - 1; i >= 0; i--) {
                    if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                        scripts.push(els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' '));
                    }

                        els[i].parentNode.removeChild(els[i]);

                    
                }
                return scripts;
            }
            const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
            var LDJSON =[]
            var LDJSON = cleanup(document.documentElement, "script")
            cleanup(document.documentElement, "noscript")
            cleanup(document.documentElement, "meta")
            //cleanup(document.documentElement, "style")
            cleanup(document.documentElement, "select")
            var HTML = document.documentElement.outerHTML;
            var jobDesc=document.documentElement.querySelectorAll('div[class="job-details ng-binding"]')[0].outerHTML;
            if (LDJSON.length == 0) {
                var LDJSON = {}
                let itemProps = document.documentElement.querySelectorAll('*[itemprop]')
                for (let index = 0; index < itemProps.length; index++) {
                    const element = itemProps[index];
                    let key = element.getAttribute('itemprop')
                    let value = element.innerText
                    LDJSON[key] = value;
                }
                return {
                    'HTML': HTML,
                    'PlainText': jobbody,
                    'LDJSON': LDJSON,
                    'jobDesc':jobDesc,
                    'HtmlUpdateTime':new Date()
                };
            } else {
                return {
                    'HTML': HTML,
                    'PlainText': jobbody,
                    'LDJSON': LDJSON,
                    'jobDesc':jobDesc,
                    'HtmlUpdateTime':new Date()
                };
            }

        });
        console.info(
            Date.now() - start + ":Scraping Successfull: " + joburl
        );
        return result;


    } catch (error) {
        console.log("Having Some Error===>" + error);
        return {'error':error};
    }


}






    //==============Individual Function Section===============================


