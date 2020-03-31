"use strict";
const puppeteer = require("puppeteer");
const fse = require('fs-extra')
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
const blockedResourceTypes = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
];

const skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'fontawesome',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
];

puppeteer
    .launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        devtools: true,
        ignoreHTTPSErrors: true,
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
                console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/?url=https://careers.eaest.com/Jobs")
            );
        server.timeout = 240000;
    });

app.get('/', async (req, res) => {
    const start = Date.now();
    console.log("---------------------------------------------------------------------------------------");
    //const context = await browser.createIncognitoBrowserContext();
    // const context = browser.defaultBrowserContext();
    const index = req.url.indexOf('url=');
    console.log("Into the GET Method")
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = decodeURIComponent(req.url.substring(index + 4).trim());
    try {
        var finaldata = await response(joburl);
        res.status(200).send(finaldata)
        console.log("---------------------------------------------------------------------------------------");
    } catch (error) {

    }
});


async function response(joburl) {
    const page = await browser.newPage();
    const mainUrl = joburl
    let mainUrlStatus;

    try {
        //page.on('console', consoleObj => console.log(consoleObj.text()));
        await page.setViewport({
            width: width,
            height: height
        });
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36");
        let data = []
        page.on("request", r => {
            if (["xhr"].indexOf(r.resourceType()) !== -1) {
                const url = r.url();
                console.log("----------------------------------------------------")
                console.log(url);
                data.push(url);
                console.log("----------------------------------------------------")
            }
        });
        await page.goto(mainUrl, {
            waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
            timeout: 100000
        });
        //await page.setRequestInterception(true)
        // const finalResponse = await page.waitForResponse(response => 
        //     response.url() === data[0] 
        //     && (response.request().method() === 'PATCH' 
        //     || response.request().method() === 'POST'), 11);
        //   let responseJson = await finalResponse.json();
        //   console.log(responseJson);
        let content = []
        //const prefixPath = '/proxy/' + randomstring.generate({ length: '32', charset: 'alphanumeric', capitalization: 'lowercase' });
        await page.on('response', async response => {
            const responseUrl = response.url().toLowerCase();
            if (data.indexOf(responseUrl)) {
                if (
                    !response.ok() ||
                    responseUrl.indexOf(';base64,') > -1 ||
                    responseUrl.indexOf('data:') > -1
                ) {
                    console.log("SORRY PAGE LOAD FAILED");
                } else {
                    let headers = await response.headers();

                    console.log(" PAGE LOAD SUCCESS");
                    // console.log(response.request().postData());
                    console.log(await response.request().resourceType());
                    console.log(await response.request().url());
                    console.log("=======security=======")
                    console.log(await response.securityDetails())

                }
            }
        });


        return content;

    } catch (error) {
        console.log("----------------error-------------------");
        log(erro)
        console.log("-----------------------------------------");


        return error;
    } finally {
        setTimeout(() => page.close(), 50000);
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