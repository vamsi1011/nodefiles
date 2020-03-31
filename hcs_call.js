var MongoClient = require('mongodb').MongoClient;
const puppeteer = require("puppeteer");
var rp = require('request-promise');
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
var db;
var result = []
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
const width = 1920,
    height = 1080;
const C_HEADELESS = false;
const C_SLOWMOTION = 0;
app.get('/', async (req, res) => {

    pager();
});
puppeteer.launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        args: ["--disable-web-security",
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
        MongoClient.connect("mongodb://localhost:27017/", {
            'poolSize': 10,
            'useNewUrlParser': true
        }, (err, client) => {
            if (err) return console.log(err)
            db = client.db('domains') // whatever your database name is
            const HTTP_PORT = 8201;
            http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
                );
        })
    });



async function pager() {
    try {

        const url = await db.collection('hcs').find({
            'status_bit': 0
        }).skip(0).limit(1).toArray()

        console.log(url[0].Link)
        result = await hcscall(url[0].Link)
        console.log(result.HCS)
        pager()

    } catch (error) {
        console.log("Having Some Error===>" + error);
    }

}

function hcscall(careerLink) {
    console.log("-------------------------------------------------")
    try {

        var options = {
            method: 'POST',
            url: 'http://localhost:8140/HCS',
            headers: {
                'Postman-Token': 'fa1d2ed6-9bdc-44db-b738-0401b372ea48',
                'cache-control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                "joburl": careerLink
            }
        };
        return rp(options);
    } catch (error) {
        console.log("Had an Error in Request Function==>" + error);
    }

}