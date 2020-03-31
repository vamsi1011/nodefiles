"use strict";

/* global document:true, window:true, URL:true */
//npm i puppeteer-extra puppeteer-extra-plugin-stealth
const puppeteer = require("puppeteer-extra").use(require("puppeteer-extra-plugin-stealth")());
const rp = require("request-promise");
var _ = require('lodash');
const MongoClient = require('mongodb').MongoClient
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const fse = require('fs-extra');
const app = express();
const log = console.log;
app.use(bodyParser.urlencoded({
    extended: false
}));
var db;
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

let browser;
var local_uri = 'mongodb://localhost:27017';
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
const width = 1366,
    height = 768;
const C_HEADELESS = true;
const C_OPTIMIZE = true;
const C_SLOWMOTION = 0;
puppeteer
    .launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
            `--window-size=${width},${height}`
        ]
    })
    .then(async b => {
        browser = b;
        MongoClient.connect(server_uri, {
            'poolSize': 10,
            'useNewUrlParser': true,
            'useUnifiedTopology': true,
        }, (err, client) => {
            if (err) return console.log(err)
            db = client.db('atsCompanies') // whatever your database name is
            const HTTP_PORT = 8129;
            http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "?skip=0&limit=1")
                );
        });
    });
app.get("/", async (req, res) => {
    const start = Date.now();
    let skip = req.query.skip;
    let limit = req.query.limit;
    // let companystatus = req.query.companyStatus;
    if (!skip || !limit || skip == "" || limit == "") {
        return res.send("please send perfect parameters")
    }
    skip = parseInt(req.query.skip);
    limit = parseInt(req.query.limit);
    // companystatus = parseInt(req.query.companystatus);
    console.log("Into the GET Method")
    const Data = await db.collection('Tracking26Dec').find({
        'status': {
            $exists: false
        }
    }).skip(skip).limit(limit).toArray();
    console.log(Data.length);
    console.log(Date.now() - start + '(ms) Opening tab');
    if (Data.length) {
        const page = await browser.newPage();

        try {

            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            );
            const preloadFile = await fse.readFileSync('./preload.js', 'utf8');
            await page.evaluateOnNewDocument(preloadFile);
            await page.setViewport({
                width: 1366,
                height: 768
            });
            let finalResponse = []
            for (let index = 0; index < Data.length; index++) {
                const element = Data[index];
                var keyword = element.keyword.trim()
                var title = element.title.trim()
                var location = element.location.replace('-US', ',US');
                var company = element.company.trim()
                var submittedUrl = element.jobUrl.trim();
                console.log(submittedUrl);
                var googleUrl = await formGoogleUrl(title, location, company, keyword, 0);
                await console.log(googleUrl)
                var details = await process(page, start, googleUrl, title, location, company, submittedUrl, limit);
                //https://www.google.com/sorry/index?continue=
                let OriginalURL = page.mainFrame().url();
                if (OriginalURL.indexOf("https://www.google.com/sorry/index?continue=") >= 0) {
                    console.log("-------------------------------------------------------------------");
                    log("Google Captcha Alert");
                    console.log("-------------------------------------------------------------------");
                    await db.collection('Tracking26Dec').updateOne({
                        '_id': element._id
                    }, {
                        $set: {
                            "blockedStatus": 1
                        }
                    });
                } else {
                    console.log("-------------------------------------------------------------------");
                    log(details);
                    console.log("-------------------------------------------------------------------");
                    details.status = 200;
                    details.submittedUrl = submittedUrl
                    details.googleUrl = googleUrl
                    await db.collection('Tracking26Dec').updateOne({
                        '_id': element._id
                    }, {
                        $set: details
                    });

                    finalResponse.push(details)
                    console.log(Date.now() - start + 'Google page response sent');
                }

            }
            res.send(finalResponse);
        } catch (error) {
            console.error('Error handling request', error);
            res.send('Soory for the Error==>' + error);;
        } finally {
            setTimeout(() => page.close(), 10000);
        }
    }

});




async function process(page, start, googleUrl, title, location, company, submittedUrl, limit) {
    try {
        await page.waitFor(1000);
        console.info(Date.now() - start + ": Opening page: " + googleUrl);
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
        );
        await page.setViewport({
            width: 1366,
            height: 768
        });
        await page.goto(googleUrl, {
            networkIdle2Timeout: 100000,
            waitUntil: "networkidle2",
            timeout: 90000
        });
        //const doc = await page._client.send('DOM.getDocument');

        await page.waitFor(1000);

        var Counter = await page.$$('li.PaEvOc div.BjJfJf')
        var CounterLength = Counter.length;
        await page.screenshot({
            path: 'googleTracker.png'
        });
        if (CounterLength > 0) {
            log("into IF")
            let matchBlocks = await getMatchBlocks(page, title, location, company);
            if (matchBlocks.length >= 1) {
                let jobChecking = await work(page, submittedUrl, matchBlocks)
                if (jobChecking.matchFound == 1) {
                    return jobChecking;
                } else if (CounterLength == 1) {
                    return jobChecking;
                } else {
                    await autoScroll(page);
                    let newMatchBlocks = await getMatchBlocks(page, title, location, company);
                    if (newMatchBlocks.length >= 1) {
                        newMatchBlocks = _.differenceBy(newMatchBlocks, matchBlocks);
                        return await work(page, submittedUrl, newMatchBlocks)
                    }
                }


            } else {
                await autoScroll(page);
                matchBlocks = await getMatchBlocks(page, title, location, company);
                return await work(page, submittedUrl, matchBlocks);
            }
            //checkedIndexes=checkedIndexes.concat(checkIndex)
            //await startingCheck(page, title, location, company, submittedUrl)
            //await autoScroll(page);
            //return {"done":}
            //return await work(page, title, location, company, submittedUrl)
        } else {
            log("into ELSE")
            return {
                'urls': [],
                'matchFound': 0,
                'linkPosition': null,
                'blocksLoaded': 0
            };
        }
    } catch (error) {
        log(error)
    }

}
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 50

            let timer = setInterval(() => {
                let scrollHeight = document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollHeight
                window.document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollBy(0, distance)
                totalHeight += distance
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, 150)
        })
    })
}
async function work(page, submittedUrl, checkIndex) {
    let clickAndChecker = await clickAndCheck(page, checkIndex, submittedUrl);
    if (clickAndChecker.hasOwnProperty('rank') == true) {
        await randomClicking(page);
        return clickAndChecker;
    } else {
        await randomClicking(page);
        return {
            'urls': [],
            'matchFound': 0,
            'linkPosition': null,
            'checkIndex': checkIndex
        };
    }
}
async function formGoogleUrl(title, location, company, keyword, statusBit) {
    var tempTitle = title.replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
    var tempLocation = location.replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
    var tempCompany = company.replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
    // console.log(temptitle);

    if (statusBit != 1) {
        // return "https://www.google.com/search?q=" + tempTitle + "+in+" + tempLocation + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
        return "https://www.google.com/search?q=" + keyword + "+" + tempLocation + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
    }
    return "https://www.google.com/search?q=" + keyword + "+in+" + tempLocation + '+' + tempCompany + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
}
async function randomClicking(page) {
    try {
        var Counter = await page.$$('li.PaEvOc div.BjJfJf');
        for (let index = 1; index < 4; index++) {
            let blockNo = Math.floor(Math.random() * Counter.length);
            const ele1 = Counter[blockNo]
            await ele1.click();
            await page.waitFor(200);
            console.log(index + "fake clicking Done");
        }
    } catch (error) {
        console.log("facing error :" + error + " while fake clicking");
    }
}

async function clickAndCheck(page, indexes, SubmittedUrl) {
    var Counter = await page.$$('li.PaEvOc div.BjJfJf');
    let i = 0;
    while (i < indexes.length) {
        var index = indexes[i]
        const ele1 = Counter[index]
        console.log('Clicking:' + i)
        await ele1.click();
        await page.waitFor(1800);
        let applylinks = await page.evaluate(() => {
            let dataSet = []
            var ApplyLinks = document.documentElement.querySelectorAll('div[id="tl_ditc"] div[jsname="haAclf"] span>a');
            for (let index = 0; index < ApplyLinks.length; index++) {
                const element = ApplyLinks[index];
                dataSet.push(element.getAttribute('href').replace('?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic', '').trim())
            }
            return dataSet
        })
        console.log(applylinks);
        console.log(SubmittedUrl);

        for (let index2 = 0; index2 < applylinks.length; index2++) {
            const element = applylinks[index2];
            if (element.indexOf(SubmittedUrl) >= 0) {
                console.log("-------------------------------------------");
                console.log("Succesfully found the job at rank=>" + (index + 1));
                console.log("-------------------------------------------");
                return {
                    'rank': index + 1,
                    'linkPosition': applylinks.indexOf(SubmittedUrl) + 1,
                    'matchFound': 1,
                    'googleJobUrl': page.mainFrame().url()
                }
            }
        }

        i = i + 1;
    }
    return {
        'matchFound': 0,
        'linkPosition': null
    };
}

async function getMatchBlocks(page, title, location, company) {
    try {
        var result = await page.evaluate((title, location, company) => {
            var block = document.documentElement.querySelectorAll('div[role="treeitem"]');
            var database = [];
            let compare = function (txt1, txt2) {
                if (txt1.toLowerCase().replace(/\s+/g, '').includes(txt2.toLowerCase().replace(/\s+/g, '')) || txt2.toLowerCase().replace(/\s+/g, '').includes(txt1.toLowerCase().replace(/\s+/g, ''))) {
                    return true;
                }
                return false;
            }
            for (let index = 0; index < block.length; index++) {
                const element = block[index];
                var jobtitle = element.querySelector('div[role="heading"]').innerText;
                var companyName = element.querySelector('div[class="SHrHx"]').children[0].innerText;
                var locationName = element.querySelector('div[class="SHrHx"]').children[1].innerText;
                if (compare(title, jobtitle) && (compare(company, companyName))) {
                    database.push(index);
                }
            }
            return database;
        }, title, location, company);
        return result;
    } catch (error) {
        console.log("error in getMatch Blocks:" + error);
        return []
    }

}