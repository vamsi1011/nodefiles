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
            db = client.db('atsCompanies') // whatever your database name is
            const HTTP_PORT = 8745;
            var server = http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
                );
            server.timeout = 240000;
        })
    });
async function process(skip = 50) {
    try {
        const Data = await db.collection('atsJobs').find({
            "company": "DaVita Healthcare",
            'checkStatus': {
                $exists: false
            }
        }).skip(skip).limit(3).toArray()
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
                    const response = await LDJSONGetter(page, start, element.jobUrl);

                    if (!response.hasOwnProperty('error')) {
                        successLabels.push({
                            joburl: response
                        })

                        console.log(Date.now() - start + '(ms)' + element.jobUrl + ' page response sent');
                        let ldjson = response.LDJSON
                        if (response.HTML !== "" && response.PlainText !== "" && ldjson.hasOwnProperty('title')) {
                            response.checkStatus = 200
                            await db.collection('atsJobs').updateOne({
                                '_id': element._id
                            }, {
                                $set: response
                            }).then(() => console.log('Updated 200 checkStatus Into the Collection in url contains'));
                        } else {
                            response.checkStatus = 404
                            await db.collection('atsJobs').updateOne({
                                '_id': element._id
                            }, {
                                $set: response
                            }).then(() => console.log('Updated 200 checkStatus Into the Collection in url contains'));

                        }

                        console.log("================================================================================")
                    } else {
                        errorlabels.push({
                            joburl: response
                        })
                        response.checkStatus = 404
                        console.log(Date.now() - start + '(ms)' + element.jobUrl + ' page response sent into error');
                        await db.collection('atsJobs').updateOne({
                            '_id': element._id
                        }, {
                            $set: response
                        }).then(() => console.log('Updated 400 checkStatus Into the Collection in url contains'));
                        console.log("================================================================================")
                    }
                } catch (error) {
                    let response = {}
                    errorlabels.push({
                        joburl: element.jobUrl
                    })
                    response.checkStatus = 404
                    console.log(Date.now() - start + '(ms)' + element.jobUrl + ' page response sent into error');
                    await db.collection('atsJobs').updateOne({
                        '_id': element._id
                    }, {
                        $set: response
                    }).then(() => console.log('Updated 400 checkStatus Into the Collection in url contains'));
                    console.log("================================================================================")
                } finally {
                    setTimeout(() => page.close(), 5000);
                }

            }));
        await sleep(1000);
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
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        );
        await page.setRequestInterception(true);
        page.on('request', request => {
            const type = request.resourceType();
            if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other' || type === 'stylesheet')
                request.abort();
            else
                request.continue();
        });
        await page.setViewport({
            width: 1366,
            height: 671
        });
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
            timeout: 90000
        });
        await page.waitFor(1000).then(() => console.log("Waiting for 1 Sec"))


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
            var LDJSON = []
            var LDJSON = cleanup(document.documentElement, "script")
            cleanup(document.documentElement, "noscript")
            cleanup(document.documentElement, "meta")
            cleanup(document.documentElement, "style")
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
                    'Jobbody': jobbody,
                    'LDJSON': LDJSON
                };
            } else {
                let json = {};
                if (LDJSON && LDJSON.length) {
                    for (const ldjson of LDJSON) {
                        json = Object.assign(json, JSON.parse(ldjson.replace(/\n/g, '')));
                    }
                }
                if (json.hasOwnProperty("0")) {
                    if (json['0'].hasOwnProperty('@type')) {
                        if (json['0']['@type'] === "JobPosting") {
                            let ldjsondata = json['0']
                            return {
                                'HTML': HTML,
                                'Jobbody': jobbody,
                                'LDJSON': ldjsondata
                            };
                        }

                    }
                }
                if (json.hasOwnProperty("1")) {
                    if (json['1'].hasOwnProperty('@type')) {
                        if (json['1']['@type'] === "JobPosting") {
                            let ldjsondata = json['1']
                            return {
                                'HTML': HTML,
                                'Jobbody': jobbody,
                                'LDJSON': ldjsondata
                            };
                        }

                    }

                }
                return {
                    'HTML': HTML,
                    'Jobbody': jobbody,
                    'LDJSON': json
                };
            }

        });
        console.info(
            Date.now() - start + ":Scraping Successfull: " + joburl
        );
        return result;


    } catch (error) {
        console.log("Having Some Error===>" + error);
        return {};
    }


}