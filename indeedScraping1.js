const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
const local_uri = 'mongodb://localhost:27017/atsCompanies';
var _ = require('lodash');
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
const width = 1366,
    height = 768,
    C_HEADELESS = false;
(async () => {
    let client = await getCollection(server_uri);
    const browser = await puppeteer.launch({
        headless: C_HEADELESS,
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list', "--disable-web-security", `--window-size=${width},${height}`
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    );
    await page.setViewport({
        width: width,
        height: height
    });

    let db = client.db('stage_jobs');
    while (true) {
        await searchData(page, db);
    }
    setTimeout(() => page.close(), 10000);
    await closeConnection(client)
    setTimeout(() => browser.close(), 20000);
})();


async function searchData(page, db) {
    let dataSet = await db.collection('Indeed_unique_companies').find({
        status: ""
    }).skip(9500).limit(200).toArray();
    //dataSet = _.uniqBy(dataSet, 'companyName');
    console.log("total DB data:" + dataSet.length);
    for (let index = 0; index < dataSet.length; index++) {
        let jobUrl = dataSet[index].jobUrl;
        //let jobUrl = "https://www.indeed.com/viewjob?jk=9d157618243e31bd&from=serp&vjs=3"
        // let url = "https://www.indeed.com/jobs?as_and=" + title + "&as_phr&as_any&as_not&as_ttl&as_cmp&jt=all&st&as_src&salary&radius=100&l=United%20States&fromage=any&limit=50&sort&psf=advsrch&from=advancedsearch&vjk=79a3bb88971c8262"
        await page.goto(jobUrl, {
            networkIdle2Timeout: 200000,
            waitUntil: ['load',
                'domcontentloaded',
            ],
            timeout: 200000
        });
        await delay(2000);
        let applyStatus = await getData(page);
        console.log(applyStatus);

        await db.collection('Indeed_unique_companies').updateMany({
            'jobUrl': dataSet[index].jobUrl
        }, {
            $set: {
                "applyStatus": applyStatus,
                'status': 200
            }
        })
    }
}
async function getData(page) {
    try {
        let pageData = await page.evaluate(() => {
            try {
                return document.documentElement.querySelectorAll('a[class="icl-Button icl-Button--primary icl-Button--md icl-Button--block"]')[0].innerText;
            } catch (error) {
                return "";
            }

        });
        return pageData;
    } catch (error) {
        console.log("error in the getData:" + error);
        return ""
    }
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
async function getCollection(mongoUrl) {
    let client = await MongoClient.connect(
        mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    console.log("DB Session Started");
    return client;
}

async function closeConnection(client) {
    await client.close();
    console.log("DB Session Ended");
    return "Session Closed";
}