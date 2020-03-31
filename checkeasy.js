var MongoClient = require('mongodb').MongoClient;
const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
var db;
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

    await pager();
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
        MongoClient.connect("mongodb://admin:jobiak@3.18.238.8:28015/admin", {
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

var startnum = 1;


async function pager() {
    try {
        const urls = await db.collection('lol').find({
            'status': 0
        }).skip(0).limit(8).toArray()


        // for (let url1 = startnum; url1 < startnum + 4; url1++) {
        //     urls.push({
        //         'id': url1,
        //         'url': Data
        //     })
        //     console.log({
        //         'id': url1,
        //         'url': Data
        //     })
        // }
        // startnum = startnum + 4

        console.log("Length of Data:" + urls.length);


        await Promise.all(
            urls.map(async element => {
                const page = await browser.newPage(element.jobUrl);
                console.log(element.jobLink);
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
                );
                await page.setViewport({
                    width: 1366,
                    height: 768
                });
                try {
                    console.info(": Opening page: " + element.jobLink);
                    await page.goto(element.jobLink, {
                        networkIdle2Timeout: 900000,
                        waitUntil: "networkidle2",
                        timeout: 800000
                    });
                    await page.waitFor(5000).then(() => console.log("Waiting for 5 Sec"))
                    console.log('opened tabs')
                    var ev_result = await page.evaluate(() => {
                        var title = document.querySelector("#inline-topcard-modal-outlet > div").innerText
                        return title
                    });
                    // let cleaned_title = ev_result.split("-")[0]
                    console.log(ev_result)
                    await db.collection('lol').update({
                        _id: element._id
                    }, {
                        $set: {
                            "title": ev_result,
                            "status": status

                        }
                    });
                } catch (error) {
                    console.log("================================================================================")
                } finally {
                    setTimeout(() => page.close(), 5000);
                }

            }));
        // sleep(10 * 1000);
    } catch (error) {
        console.log("Having Some Error===>" + error);
    }
    if (startnum <= 71) {
        pager()
    } else {
        return;
    }

}