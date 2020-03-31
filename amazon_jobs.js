"use strict";

/* global document:true, window:true, URL:true */
const puppeteer = require("puppeteer");
var MongoClient = require('mongodb').MongoClient;
const rp = require("request-promise");
const chalk = require('chalk');
// var url= 'mongodb://jobiak:jobiak@18.223.47.109:28015/data_cleansing'; 

const url = 'mongodb://localhost:27017/NodeDB'
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

let db, browser;

//allow express to access our html (index.html) file
app.get('/amazon', async (req, res) => {
    const start = Date.now();

    const joburl = "https://www.amazon.jobs/en-gb/search?base_query=&loc_query="
    console.log("Given joburl " + joburl)

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        const response = await tephraJobsGetter(page, start, joburl);
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("=====================================THE END===========================================");
        let dataset = uniqueDataSet(response);
        console.log("total Jobs:" + dataset.length);

        setTimeout(() => page.close(), 30000);
        await tephra_GetAllALbels(dataset);
        res.status(200).send("Done")
    } catch (error) {
        console.error('Error handling request', error);
        res.status(500);

    } finally {
        setTimeout(() => page.close(), 10000);
    }
});

const width = 1920,
    height = 1080;
const C_HEADELESS = false;
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
            db = client.db('NodeDB') // whatever your database name is
            const HTTP_PORT = 8082;
            var server = http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/amazon")
                );
            server.timeout = 300000;
        })
    });


async function tephraJobsGetter(page, start, joburl) {
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
        await page.setRequestInterception(true);
        page.on('request', request => {
            const type = request.resourceType();
            if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other')
                request.abort();
            else
                request.continue();
        });
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 90000
        });

        //const doc = await page._client.send('DOM.getDocument');
        await delay(5000);

        const results = await tephra_extractedEvaluateCall(page);
        console.info(
            Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
        );
        return results;
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

async function tephra_extractedEvaluateCall(page) {
    //page.on('console', consoleObj => console.log(consoleObj.text()));
    // just extracted same exact logic in separate function
    // this function should use async keyword in order to work and take page as argument

    return page.evaluate(() => {
        function removeComments(node) {
            if (node.nodeType === 8) {
                node.parentNode.removeChild(node);
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                removeComments(node.childNodes[i]);
            }
        }

        function cleanup(node, type) {
            let els = node.getElementsByTagName(type);
            for (let i = els.length - 1; i >= 0; i--) {
                /*
                if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                    scripts.push(els[i].innerText);
                }*/
                els[i].parentNode.removeChild(els[i]);
            }
            return node;
        }
        // for (const frame of document.querySelectorAll("iframe")) {
        //     const frameDocument =
        //         frame.contentDocument || frame.contentWindow.document;
        //     //frame.sandbox = 'allow-same-origin allow-scripts';
        //     const div = document.createElement("div");
        //     for (const attr of frame.attributes) {
        //         if (
        //             attr.name !== "src" &&
        //             attr.name !== "srcdoc" &&
        //             attr.name !== "sandbox"
        //         ) {
        //             div.setAttribute(attr.name, attr.value);
        //         }
        //     }
        //     div.innerHTML = frameDocument.documentElement.innerHTML;
        //     frame.parentNode.replaceChild(div, frame);
        // }
        var required_apply_link = []
        //var evenBlock=document.documentElement.querySelectorAll('tr[class="evenTableRow"]');
        var block = document.documentElement.querySelectorAll("#main-content > div.search-page > div > div > div.container > content > div > div > div.col-md-8.search-page-job-list > div:nth-child(2) > div > div");

        // for (let index = 0; index < 2; index++) {
        //     const element = evenBlock[index];
        //     let jobId=element.children[0].innerText;
        //     let title=element.children[1].innerText;
        //     let jobUrl=new window.URL(element.children[1].querySelector('a').getAttribute('href'), window.document.URL).toString();
        //     let location=element.children[2].innerText;
        // // console.dir(chalk.red("my cat job urls+===>"+jobUrl));

        //     required_apply_link.push({'jobId':jobId,'title':title,'jobUrl':jobUrl,'location':location})
        // }



        for (let index = 0; index < 5; index++) {
            const element = block[index];
            let jobId = element.children[0].children[0].attributes['data-job-id'].value;
            let title = element.children[0].children[0].children[0].children[0].children[0].innerText;
            let jobUrl = element.children[0].href;
            let location = element.children[0].children[0].children[0].children[0].children[1].innerText.split('|')[0];
            required_apply_link.push({
                'jobId': jobId,
                'title': title,
                'jobUrl': jobUrl,
                'location': location
            })
        }
        console.log(required_apply_link);

        return required_apply_link;
    });

}

function uniqueDataSet(originalArray, prop = "jobUrl") {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
        //console.dir(chalk.blue('helo world.....'+originalArray[i]));

    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function tephra_GetAllALbels(Data) {
    const start = Date.now();
    const page = await browser.newPage();
    await db.collection('amazon_jobs').deleteMany();
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
            const response = await tephra_LDJSONGetter(page, start, element.jobUrl);
            element.HTML = response.HTML;
            element.PlainText = response.PlainText;
            element.Description = response.description;
            element.Company = "Amazon"
            //element.status=200
            element.createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
            //element.UpdateTime=new Date().toISOString().slice(0, 19).replace('T', ' ')
            console.log("------------------------------------------");
            console.log(element.jobUrl + " Done");
            console.log("------------------------------------------");
            await db.collection('amazon_jobs').insertMany([element])
        } catch (error) {
            console.error('Error handling request', error);
        }

    }
    setTimeout(() => page.close(), 20000);
}
async function tephra_LDJSONGetter(page, start, joburl) {
    try {
        console.info(Date.now() - start + ": Opening page: " + joburl);

        await page.goto(joburl, {
            networkIdle2Timeout: 900000,
            waitUntil: "networkidle2",
            timeout: 800000
        });
        await page.waitFor(2000).then(() => console.log("Waiting for 2 Sec"))


        var result = await page.evaluate(() => {
            // eslint-disable-line no-irregular-whitespace
            // function cleanup(node, type) {
            //     const scripts = [];
            //     let els = node.getElementsByTagName(type);
            //     for (let i = els.length - 1; i >= 0; i--) {
            //         if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
            //             scripts.push(els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' '));
            //         }

            //             els[i].parentNode.removeChild(els[i]);


            //     }
            //     return scripts;
            // }
            const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
            const description = document.querySelector("#job-detail-body > div > div.col-12.col-md-7.col-lg-8.col-xl-9 > div").innerText;

            // var LDJSON =[]
            // var LDJSON = cleanup(document.documentElement, "script")
            // cleanup(document.documentElement, "noscript")
            // cleanup(document.documentElement, "meta")
            //cleanup(document.documentElement, "style")
            // cleanup(document.documentElement, "select")
            var HTML = document.documentElement.outerHTML;

            // if (LDJSON.length == 0) {
            //     var LDJSON = {}
            //     let itemProps = document.documentElement.querySelectorAll('*[itemprop]')
            //     for (let index = 0; index < itemProps.length; index++) {
            //         const element = itemProps[index];
            //         let key = element.getAttribute('itemprop')
            //         let value = element.innerText
            //         LDJSON[key] = value;
            //     }
            //     return {
            //         'HTML': HTML,
            //         'PlainText': jobbody,
            //         'LDJSON': LDJSON,
            //         'description':description,

            //     };
            // } else {
            return {
                'HTML': HTML,
                'PlainText': jobbody,
                // 'LDJSON': LDJSON,
                'description': description,

            };
            // }

        });
        console.info(
            Date.now() - start + ":Scraping Successfull: " + joburl
        );
        return result;


    } catch (error) {
        console.log("Having Some Error===>" + error);
        return {
            'error': error
        };
    }


}