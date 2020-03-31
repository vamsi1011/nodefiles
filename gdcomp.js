"use strict";
/* global document:true, window:true, URL:true */
//npm i puppeteer-extra puppeteer-extra-plugin-stealth
const puppeteer = require("puppeteer");
const MongoClient = require('mongodb').MongoClient
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const fse = require('fs-extra');
const app = express();
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
// var server_uri = 'mongodb://localhost:27017';
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
const width = 1366,
    height = 768;
const C_HEADELESS = false;
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
            db = client.db('marketingTool') // whatever your database name is
            const HTTP_PORT = 8132;
            http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
                );
        });
    });
app.get("/", async (req, res) => {
    const start = Date.now();
    // companystatus = parseInt(req.query.companystatus);
    console.log("Into the GET Method");
    try {
        const page = await browser.newPage();
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
        var scrapData = process_one(page);
        const Data = await db.collection('Glassdoor_Companies').find({}).toArray();
        res.send(finalResponse);
    } catch (error) {
        console.error('Error handling request', error);
        res.send('Soory for the Error==>' + error);;
    }


});

async function process_one(page) {
    try {
        console.log("into process")
        let dataSet = []
        let lastPage = await db.collection('LastPageGlassDoorB3').find({}).sort({
            "lastPage": 1
        }).toArray();
        // console.log("lastPage ", lastPage[0].lastPage);
        //
        let lastPageIndex = lastPage[0] ? parseInt(lastPage[0].lastPage) : 15000;
        console.log(lastPage)
        for (let index = lastPageIndex; index >= 12000; index--) {
            var Url = `https://www.glassdoor.co.in/Reviews/us-reviews-SRCH_IL.0,2_IN1_IP${index}.htm`;
            await page.goto(Url, {
                networkIdle2Timeout: 80000,
                waitUntil: "networkidle2",
                timeout: 80000
            });
            //await framesLoading(page);
            // console.log("fatajshdjkshdjkhd", dataSet[index],"\nlength:----", dataSet.length)
            var result = await page.evaluate(() => {
                var Urls = []
                let els = document.querySelectorAll(".empInfo")
                for (let index = 0; index < els.length; index++) {
                    const element = els[index];
                    let logo = element.querySelector('img') ? element.querySelector('img').src : "";
                    let link = element.querySelector('.sqLogoLink') ? element.querySelector('.sqLogoLink').href : "";
                    let companyUrl = element.querySelector('.url') ? element.querySelector('.url').innerText : "";
                    let review = element.nextElementSibling.querySelector('.bigRating') ? parseFloat(element.nextElementSibling.querySelector('.bigRating').innerText) : "";
                    let location = element.querySelector('.value') ? element.querySelector('.value').innerText : "";
                    let recommendedPercent = element.nextElementSibling.querySelector('.margTopXs') ? element.nextElementSibling.querySelector('.margTopXs').innerText : "";
                    let name = element.querySelector('.h2') ? element.querySelector('.h2').innerText : "";
                    Urls.push({
                        "logo": logo,
                        "link": link,
                        "companyUrl": companyUrl,
                        "review": review,
                        "location": location,
                        "recommendedPercent": recommendedPercent,
                        "name": name
                    })
                }
                console.log("final Data...........................", Urls)
                return Urls;
            });
            await db.collection('LastPageGlassDoorB3').insertOne({
                "lastPage": index
            });
            for (let list of result) {
                const Data = await db.collection('Glassdoor_Companies').find({
                    "link": list.link
                }).toArray();
                // console.log(Data.length)

                if (Data.length == 0) {
                    await db.collection('Glassdoor_Companies').insert(list);
                    console.log("list inserted to db", list)
                } else {
                    console.log("found in db", list.name)
                }
            }

            dataSet = dataSet.concat(result)
        }
        return dataSet;
    } catch (error) {
        console.log("error in" + error);
        return [];
    }


}