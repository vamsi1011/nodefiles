'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
//var url = "mongodb://localhost:27017/";
let db, browser;
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
app.get('/', async (req, res) => {
    const details = await process();
    res.send(details)
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
        MongoClient.connect(url, {
            'useNewUrlParser': true
        }, (err, client) => {
            if (err) return console.log(err)
            db = client.db('stage_jobs') // whatever your database name is
            const HTTP_PORT = 8745;
            var server = http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
                );
            server.timeout = 240000;
        })
    });
async function process(skip = 0) {
    try {
        const Data = await db.collection('JobsSet_Aug13_PageCheck').find({
            'status': {
                $exists: false
            }
        }).skip(skip).limit(20).toArray()
        console.log("Length of Data:" + Data.length);
        var successLabels = [],
            errorlabels = [];
        const start = Date.now();
        await Promise.all(
            Data.map(async element => {
                const page = await browser.newPage();
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
                );
                await page.setViewport({
                    width: 1366,
                    height: 768
                });
                try {
                    await sleep(2000);
                    //log(start,URL,URLs.indexOf(URL));
                    const response = await LDJSONGetter(page, start, element.Link);
                    if (!response.hasOwnProperty('error')) {
                        successLabels.push({
                            joburl: response
                        })
                        response.status = 1
                        console.log(Date.now() - start + '(ms)' + element.Link + ' page response sent');
                        if (response.HTML !== "" && response.PlainText !== "") {
                            await db.collection('JobsSet_Aug13_PageCheck').updateOne({
                                '_id': element._id
                            }, {
                                $set: response
                            }).then(() => console.log('Updated 200 Status Into the Collection in url contains'));
                        }
                        console.log("================================================================================")
                    } else {
                        errorlabels.push({
                            joburl: response
                        })
                        response.status = 404
                        console.log(Date.now() - start + '(ms)' + element.Link + ' page response sent into error');
                        await db.collection('JobsSet_Aug13_PageCheck').updateOne({
                            '_id': element._id
                        }, {
                            $set: response
                        }).then(() => console.log('Updated 400 Status Into the Collection in url contains'));
                        console.log("================================================================================")
                    }
                } catch (error) {
                    errorlabels.push({
                        joburl: response
                    })
                    response.status = 404
                    console.log(Date.now() - start + '(ms)' + element.Link + ' page response sent into error');
                    await db.collection('JobsSet_Aug13_PageCheck').updateOne({
                        '_id': element._id
                    }, {
                        $set: response
                    }).then(() => console.log('Updated 400 Status Into the Collection in url contains'));
                    console.log("================================================================================")
                } finally {
                    setTimeout(() => page.close(), 5000);
                }
            }));
        await sleep(4000);
        await process(0);
    } catch (error) {
        console.log("Having Some Error===>" + error);
        await process(1);

    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function LDJSONGetter(page, start, joburl) {
    try {
        console.info(Date.now() - start + ": Opening page: " + joburl);
        await page.goto(joburl, {
            networkIdle2Timeout: 900000,
            waitUntil: "networkidle2",
            timeout: 800000
        });
        await page.waitFor(2000).then(() => console.log("Waiting for 2 Sec"))
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

            function getDateTime() {
                var date = new Date();

                var hour = date.getHours();
                hour = (hour < 10 ? "0" : "") + hour;

                var min = date.getMinutes();
                min = (min < 10 ? "0" : "") + min;

                var sec = date.getSeconds();
                sec = (sec < 10 ? "0" : "") + sec;

                var year = date.getFullYear();

                var month = date.getMonth() + 1;
                month = (month < 10 ? "0" : "") + month;

                var day = date.getDate();
                day = (day < 10 ? "0" : "") + day;

                return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

            }
            const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
            var LDJSON = []
            var LDJSON = cleanup(document.documentElement, "script")
            cleanup(document.documentElement, "noscript")
            cleanup(document.documentElement, "meta")
            //cleanup(document.documentElement, "style")
            cleanup(document.documentElement, "select")
            var HTML = document.documentElement.outerHTML;
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
                    'HtmlUpdateTime': getDateTime()
                };
            } else {
                return {
                    'HTML': HTML,
                    'PlainText': jobbody,
                    'LDJSON': LDJSON,
                    'HtmlUpdateTime': getDateTime()
                };
            }
        });
        console.info(
            Date.now() - start + ":Scraping Successfull: " + joburl
        );
        return result;
    } catch (error) {
        console.log("Having Some Error===>" + error);
        return {
            'error': error,
            'HtmlUpdateTime': getDateTime()
        };
    }
}