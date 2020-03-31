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
    let skip = req.query.skip;
    let limit = req.query.limit;
    skip = parseInt(req.query.skip);
    limit = parseInt(req.query.limit);
    const details = await process(skip, limit);
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
            const HTTP_PORT = 8740;
            var server = http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "?skip=0&limit=20")
                );
            server.timeout = 240000;
        })
    });
async function process(skip, limit) {
    try {
        const Data = await db.collection('unique_urls_1000').find({
            'status': 0
        }).skip(skip).limit(limit).toArray()
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
                    console.log(element.URL)
                    const response = await LDJSONGetter(page, start, element.URL);
                    if (!response.hasOwnProperty('error')) {
                        successLabels.push({
                            joburl: response
                        })
                        // response.status = 1
                        console.log(Date.now() - start + '(ms)' + ' page response sent');
                        if (response.HTML !== "" && response.PlainText !== "") {
                            // console.log(response)
                            await db.collection('unique_urls_1000').updateOne({
                                '_id': element._id
                            }, {
                                $set: {
                                    'HTML': response.HTML,
                                    'PlainText': response.PlainText,
                                    'status': 1
                                }
                            }).then(() => console.log('Updated 200 Status Into the Collection in url contains'));
                        }
                        console.log("================================================================================")
                    } else {
                        errorlabels.push({
                            joburl: response
                        })
                        response.status = 404
                        console.log(Date.now() - start + '(ms)' + ' page response sent into error');
                        await db.collection('unique_urls_1000').updateOne({
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
                    console.log(Date.now() - start + '(ms)' + ' page response sent into error');
                    await db.collection('unique_urls_1000').updateOne({
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
        await process(skip, limit);
    } catch (error) {
        console.log("Having Some Error===>" + error);
        await process(201);

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
            cleanup(document.documentElement, "select")
            const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
            var LDJSON = []
            var LDJSON = cleanup(document.documentElement, "script")
            cleanup(document.documentElement, "noscript")
            cleanup(document.documentElement, "meta")
            //cleanup(document.documentElement, "style")

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
                    'HtmlUpdateTime': new Date()
                };
            } else {
                return {
                    'HTML': HTML,
                    'PlainText': jobbody,
                    'LDJSON': LDJSON,
                    'HtmlUpdateTime': new Date()
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
            'HtmlUpdateTime': new Date()
        };
    }
}