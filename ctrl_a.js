"use strict";
const puppeteer = require("puppeteer");
const fse = require('fs-extra')
const request = require('request');
const rp = require('request-promise');
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");

const app = express();
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


let browser;
//allow express to access our html (index.html) file

const width = 1366,
    height = 760;
const HTTP_PORT = 8236;
const C_HEADELESS = false;
const C_OPTIMIZE = true;
const C_SLOWMOTION = 0;


puppeteer
    .launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            "--disable-web-security",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            '--ignore-certificate-errors',
            `--window-size=${width},${height}`
        ]
    })
    .then(async b => {
        browser = b;
        var server = http
            .createServer(app)
            .listen(HTTP_PORT, () =>
                console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
            );
        server.timeout = 240000;
    });

app.post('/', async (req, res) => {
    const start = Date.now();
    console.log("\n");
    console.log("---------------------------------------------------------------------------------------");
    //const context = await browser.createIncognitoBrowserContext();
    // const context = browser.defaultBrowserContext();
    const index = req.body.joburl;
    console.log("Into the post Method")
    console.log(req.body)

    if (index.length <= 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = req.body.joburl

    const plainTextStatus = 0
    try {
        var pt_res = await response(start, joburl,
            plainTextStatus);
        var jobBody = pt_res.plainText
        res.status(200).send(jobBody)
        console.log("---------------------------------------------------------------------------------------");
    } catch (error) {
        console.log("error is " + error);

    }
});


async function response(start, joburl, plainTextStatus = 0) {
    console.log("into crawling " + joburl)
    const page = await browser.newPage();
    try {
        console.log("-----------------------------------------------");
        log(start, "Opening tab")
        console.log("-----------------------------------------------");
        //page.on('console', consoleObj => console.log(consoleObj.text()));
        await page.setViewport({
            width: width,
            height: height
        });
        //await page.setRequestInterception(true);
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36");
        // page.on('request', request => {
        //     const requestUrl = request._url.split('?')[0].split('#')[0];
        //     if (
        //         blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
        //         skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
        //     ) {
        //         request.abort();
        //     } else {
        //         request.continue();
        //     }
        // });
        // await page.setRequestInterception(true);
        // page.on('request', (request) => {
        //     const url = request.url();
        //     const filters = [
        //         'livefyre',
        //         'moatad',
        //         'analytics',
        //         'controltag',
        //         'chartbeat',
        //     ];
        //     const shouldAbort = filters.some((urlPart) => url.includes(urlPart));
        //     if (shouldAbort) request.abort();
        //     else request.continue();
        // });
        console.log("-----------------------------------------------");
        log(start, "going to url")
        console.log("-----------------------------------------------");
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
            timeout: 90000
        });
        await page.waitFor(500).then(() => console.log('Waiting for 0.5 Sec'));
        try {
            await page.evaluate(() => {
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


            });
        } catch (error) {
            console.log(error);
        }
        console.log("-----------------------------------------------");
        log(start, "Iframe data captured")
        console.log("-----------------------------------------------");
        // await remove(page,"select");
        // await remove(page,"aside");
        remove(page, 'aside[class="side-bar"]');
        remove(page, 'button[class="apply"]');
        await page.evaluate(() => {
            var body = document.documentElement.querySelectorAll('body')[0];
            var newEl = document.createElement('TEXTAREA');
            newEl.setAttribute('class', 'madhuPrakash')
            newEl.rows = "40";
            newEl.cols = "80";
            newEl.innerText = ''
            body.appendChild(newEl);
        });
        await page.waitFor(200).then(() => console.log('Waiting for 0.2 Sec'));
        await page.keyboard.down('Control').then(() => console.log('ctrl done'));
        await page.keyboard.press('KeyA').then(() => console.log('A done'));
        await page.waitFor(200).then(() => console.log('Waiting for 0.2 Sec'));
        await page.keyboard.press('KeyC').then(() => console.log('C done'));
        await page.keyboard.up('Control').then(() => console.log('ctrl done'));

        //await page.waitFor(2000).then(() => console.log('Waiting for 2 Sec'));
        await page.focus("textarea[class=madhuPrakash]")
        //await page.click('textarea[class=madhuPrakash]', {clickCount: 3})

        await page.keyboard.down('Control');
        await page.keyboard.down('V');
        await page.waitFor(300).then(() => console.log('Waiting for 0.3 Sec'));
        await page.keyboard.up('Control')
        await page.keyboard.up('V')
        await page.keyboard.down('Control')
        await page.keyboard.down('C');
        // await page.screenshot({path: 'p2.png'});
        // await page.keyboard.up('A')
        // await page.keyboard.down('C');
        // await page.screenshot({path: 'p3.png'});
        // await page.keyboard.up('C')
        // await page.keyboard.up('Control')
        console.log("-----------------------------------------------");
        log(start, "ctrl + c done")
        console.log("-----------------------------------------------");
        var data = await page.evaluate(() => {
            function remove(node, sel) {
                var elements = node.querySelectorAll(sel);
                for (var i = 0; i < elements.length; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }
            remove(document.documentElement, 'script');
            remove(document.documentElement, 'noscript');
            remove(document.documentElement, 'base');
            let dat = document.documentElement.querySelectorAll('textarea[class="madhuPrakash"]')

            console.log(dat.length);
            if (dat.length) {
                let plainText = dat[0].value.replace(/\t/g, ' ').replace(/ /g, ' ');
                let div_selector_to_remove = "textarea[class=madhuPrakash]";
                remove(document.documentElement, div_selector_to_remove);
                var relhtml = document.documentElement.outerHTML;
                return {
                    'plainText': plainText,
                    'html': relhtml
                }
            }
            var relhtml = document.documentElement.outerHTML;
            let div_selector_to_remove = "textarea[class=madhuPrakash]";
            remove(document.documentElement, div_selector_to_remove);
            return {
                'plainText': document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' '),
                'html': relhtml
            }

        });
        console.log("-----------------------------------------------");
        log(start, "Scraping done and going to allLabels")
        console.log("-----------------------------------------------");
        if (plainTextStatus == 1) {
            return data.plainText;
        }
        data.labels = await getAllLabels(start, joburl, data.html, data.plainText, 'http://prod-bigml-java-service-1746202486.us-east-1.elb.amazonaws.com/predict/labels')
        data.html = "";
        return data;
    } catch (error) {
        console.log("----------------error-------------------");
        console.log(error)
        console.log("-----------------------------------------");


        return error;
    } finally {
        setTimeout(() => page.close(), 5000);
    }

}


async function getAllLabels(start, joburl, jobhtml, jobbody, apiUrl) {
    try {
        console.log("-----------------------------------------------");
        log(start, "requesting Bigml")
        console.log("-----------------------------------------------");
        let responses = await getBigMLLabel(start, joburl, jobhtml, jobbody, apiUrl);
        var pageLabels = {};
        if (!responses.hasOwnProperty('error')) {
            //console.log("-----------------------------------------------");

            //console.log(count);
            //log(startTime,data.URL,'Got the Response');
            for (const resp of responses) {
                pageLabels[resp.label] = resp.value;
            }
            console.log("-----------------------------------------------");
            log(start, "Got response from Bigml")
            console.log("-----------------------------------------------");
            return pageLabels;
            //pageLabels.status=200
            //pageLabels.UpdateTime=new Date();
            //await db.collection('goldenSetBigml').updateOne({'_id':data._id},{$set:pageLabels}).then(() => console.log('Updated Status Into the Collection')); 
            //successLabels.push(data.URL)
            //console.log("-----------------------------------------------");

        } else {
            console.log("-----------------------------------------------");
            log(start, "Got error Bigml")
            console.log("-----------------------------------------------");
            return {}
            //errorlabels.push(data.URL)
            // console.log("-----------------------------------------------");
            // log(startTime,data.URL,'Got the Error');
            // //await db.collection('goldenSetBigml').updateOne({'_id':data._id},{$set:{'status':500,UpdateTime:new Date()}}).then(() => console.log('Updated Status Into the Collection'));    
            // console.log("-----------------------------------------------");
        }

    } catch (error) {
        console.log("-----------------------------------------------");
        log(start, "Got error Bigml:" + error);
        console.log("-----------------------------------------------");
        return {}
    }

}

async function getBigMLLabel(start, joburl, jobhtml, jobbody, apiUrl) {
    if (joburl != "" && joburl != null && jobhtml != '' && jobhtml != null && jobbody != '' && jobbody != null) {
        return await new Promise((resolve, reject) => {
            // var dataString = '{ "joburl": "' + (joburl) + '","jobbody":"' + (jobbody) + '","jobhtml":"' + (jobhtml) + '","method":"' + method + '"}';
            var formData = {
                joburl,
                jobbody,
                jobhtml
            };
            var options = {
                url: apiUrl,
                method: 'POST',
                json: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                formData
            };

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //body=JSON.parse(body)
                    //console.log(body);
                    //console.log(response.statusCode);
                    resolve(body);
                } else {
                    //console.log(error);
                    //console.log(response.statusCode);
                    resolve({
                        'error': error
                    })
                }
            }

            var response = request(options, callback);
        });
    } else {
        return {}
    }
}
// async function getClipboardContents() {
//     try {
//       const text = await navigator.clipboard.readText();
//       console.log('Pasted content: ', text);
//     } catch (err) {
//       console.error('Failed to read clipboard contents: ', err);
//     }
//   }

async function remove(page, sel) {
    await page.evaluate((sel) => {
        var elements = document.querySelectorAll(sel);
        for (var i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, sel)

}


function log(start, msg) {
    console.info(new Date() + ' [' + (Date.now() - start) + ' ms] ' + msg);
}