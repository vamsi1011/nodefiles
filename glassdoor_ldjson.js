const puppeteer = require('puppeteer'),
    MongoClient = require('mongodb').MongoClient,
    mailer = require("nodemailer"),
    express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    roundround = require('roundround'),
    _ = require('lodash');
const app = express();
const log = console.log;
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

var local_uri = 'mongodb://localhost:27017';
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
const width = 1366,
    height = 768,
    C_HEADLESS = true;
const HTTP_PORT = 8123
http
    .createServer(app)
    .listen(HTTP_PORT, () =>
        console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
    );
app.get("/", async (req, res) => {
    try {
        await process();
    } catch (error) {
        console.log("error:" + error);

    }
});


async function process() {
    let connection = await getConnection(server_uri)
    if (connection.connStatus) {
        var client = connection.client,
            db = client.db('occupationCategory');
        const browser = await puppeteer.launch({
            headless: C_HEADLESS,
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list', "--disable-web-security", `--window-size=${width},${height}`
            ]
        });
        //let categoryUrl = "https://www.glassdoor.com/sitedirectory/title-jobs/IC-Administrative.htm";
        const page = await pageStructure(await browser.newPage());
        const pages = [await pageStructure(await browser.newPage()), await pageStructure(await browser.newPage()),
            await pageStructure(await browser.newPage()), await pageStructure(await browser.newPage()), await pageStructure(await browser.newPage()), await pageStructure(await browser.newPage()), await pageStructure(await browser.newPage()), await pageStructure(await browser.newPage())
        ];
        let selectedPage = roundround(pages);
        while (true) {
            let links = await db.collection('occp').find({
                "occpStatus": {
                    $exists: false
                }
            }).skip(100).limit(8).toArray();
            //console.log(links);
            if (links.length >= 1) {
                await Promise.all(
                    links.map(async data => {
                        let page = selectedPage();
                        try {
                            const title = data.title;
                            console.log("title:" + title);
                            var joburl = "https://www.glassdoor.co.in/Job/us-glassdoor-jobs-SRCH_IL.0,2_IN1_KE3,12.htm"
                            await page.goto(joburl, {
                                networkIdle2Timeout: 90000,
                                waitUntil: "networkidle2",
                                timeout: 0
                            });
                            await delay(1000);
                            await page.click('input[class="keyword"]', {
                                clickCount: 3
                            })
                            await page.type('input[class="keyword"]', title);
                            await page.click('button#HeroSearchButton');

                            await page.waitFor(5000)
                            let Counter = await page.$$('div [class="jobContainer"] a')
                            console.log(Counter.length)
                            let CounterLen = Counter.length;
                            console.log("Blocks Loaded:" + CounterLen);
                            if (CounterLen >= 1) {
                                const dataSet = await page.evaluate(() => {
                                    var els = document.querySelectorAll('div [class="jobContainer"]>a') //ul div[class="titleContainer"] a
                                    var data = [];
                                    for (let i = 0; i < els.length; i++) {
                                        let element = els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim()
                                        let Url = new window.URL(els[i].getAttribute('href'), window.document.URL).toString();
                                        data.push({
                                            'title': element,
                                            'url': Url
                                        })

                                    }
                                    return data;
                                });
                                for (let index = 0; index < dataSet.length; index++) {
                                    let bestMatch = {}
                                    const element = dataSet[index];
                                    if (await db.collection('glassdoorOccp').countDocuments({
                                            'title': element.title
                                        }) <= 0) {
                                        let ldjson = await ldjsonGetter(page, Date.now(), element.url);
                                        console.log(ldjson.occupation_category);
                                        bestMatch.title = element.title
                                        bestMatch.occupation_category = ldjson.occupation_category;
                                        bestMatch.ldjson = ldjson.LdJson;
                                        bestMatch.status = 404;
                                        if (bestMatch.occupation_category.length >= 1) {
                                            bestMatch.status = 100;
                                            await db.collection('glassdoorOccp').insertMany([bestMatch]);
                                        }
                                    }
                                }
                                await db.collection('occp').updateMany({
                                    'title': data.title
                                }, {
                                    $set: {
                                        "occpStatus": 1
                                    }
                                }).then(() => console.log('Updated Status Into the Collection 1'));
                            } else {
                                await db.collection('occp').updateMany({
                                    'title': data.title
                                }, {
                                    $set: {
                                        "occpStatus": 404
                                    }
                                }).then(() => console.log('Updated Status Into the Collection 404'));
                            }
                        } catch (error) {
                            console.log("error:" + error)
                            return [];
                        }

                    }))
            } else {
                setTimeout(() => browser.close(), 20000);
            }

        }
        //var joburl = "https://www.glassdoor.co.in/Job/us-jobs-SRCH_IL.0,2_IN1.htm"

        //scrapingData(links)
    }
};

//Delay time for loading
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}


async function ldjsonGetter(page, start, joburl) {

    //const start = Date.now();
    try {

        console.info(Date.now() - start + ': Opening the Page: ' + joburl);
        await page.goto(joburl, {
            networkIdle2Timeout: 80000,
            waitUntil: 'networkidle2',
            timeout: 0
        });
        await delay(1000);
        await framesLoading(page);
        //const doc = await page._client.send('DOM.getDocument');
        // Scrape
        //const domain = URL.parse(joburl).hostname;
        const result = await page.evaluate(() => {
            function cleanup(node, type) {
                const scripts = [];
                let els = node.getElementsByTagName(type);
                for (let i = els.length - 1; i >= 0; i--) {
                    if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                        scripts.push(els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' '));
                        break;
                    }
                }
                return scripts;
            }
            var Urls = []



            const ldjsons = cleanup(document.documentElement, 'script');
            let json = {};
            if (ldjsons[0] && ldjsons[0].length) {
                for (const ldjson of ldjsons) {
                    json = Object.assign(json, JSON.parse(ldjson.replace(/\n/g, '')));
                }
            }
            return json;


        });

        console.info(Date.now() - start + ': Successfully Scrapped the Page: ' + joburl);
        //console.log(result.title);
        /*
        if(result.hasOwnProperty('employmentType')){
            return result.employmentType;
        }
        else{

        }*/
        if (result.hasOwnProperty('occupationalCategory')) {
            var data = {
                'occupation_category': result.occupationalCategory,
                'LdJson': result
            }
            return data;
        }
        var data = {
            'occupation_category': [],
            'LdJson': result
        }
        return data;

    } catch (e) {
        console.log("Some error " + e)
        var data = {
            'occupation_category': [],
            'LdJson': []
        }
        return data;
    }
}

async function scrapData(page, url) {
    let result = []
    try {
        var start = Date.now();


        console.log(new Date() + ' [' + (Date.now() - start) + ' ms] ' + "opening " + url);
        await page.goto(url, {
            networkIdle2Timeout: 1200000,
            waitUntil: "networkidle2",
            timeout: 1200000
        });

        await delay(1000);
        console.log(new Date() + ' [' + (Date.now() - start) + ' ms] ' + "loaded Successfully " + url);
        let jobCount = await page.evaluate(() => {
            try {
                return document.documentElement.querySelectorAll('p[class="jobsCount"]')[0].innerText;
            } catch (err) {
                return 0
            }
        });

        console.log("**********************************************");
        console.log("total Jobs:" + jobCount);
        console.log("**********************************************");
        var nextButton = await page.$$('li[class="next"] a');
        jobCount = parseInt(jobCount.replace(/Jobs/gi, '').replace(/,/, '').trim())
        let pages = (jobCount / 30) + 1
        let i = 1
        while (nextButton.length >= 1 && pages >= i) {
            await delay(1000);
            let dataSet = await page.evaluate(() => {
                function dataGetter(node, selector, attr) {
                    let dataSet = node.querySelectorAll(selector);
                    if (dataSet.length >= 1) {
                        if (attr == 'innerText') {
                            return dataSet[0].innerText.replace(/\t/g, ' ').replace(/ /g, ' ')
                        }
                        if (attr == 'href') {
                            return new window.URL(dataSet[0].getAttribute(attr), window.document.URL).toString()
                        }
                        return dataSet[0].getAttribute(attr)
                    }
                    return "";
                }
                let data = []
                let jobBlocks = document.documentElement.querySelectorAll('li.jl');
                for (let index = 0; index < jobBlocks.length; index++) {
                    const element = jobBlocks[index];
                    let obj = {};
                    obj.logo = dataGetter(element, 'div[class="logoWrap"] span.sqLogo img', 'data-original');
                    obj.company = dataGetter(element, 'div[class="jobHeader"]>a', 'innerText');
                    obj.glassDoorJobLink = dataGetter(element, 'div[class="jobContainer"]>a', 'href');
                    obj.title = dataGetter(element, 'div[class="jobContainer"]>a', 'innerText');
                    data.push(obj)
                }
                return data;
            })
            //
            result = result.concat(dataSet)
            nextButton = await page.$$('li[class="next"] a');
            if (nextButton.length >= 1) {
                await nextButton[0].click();
                //await nextButton[0].click();
                await page.waitFor('li[class="next"] a', {
                    timeout: 60000
                })
                await delay(2000);
            }
            i = i + 1;
        }

        // var Counter = await page.$$('div.eiHdrModule')
        // var CounterLength = Counter.length;
        // console.log("total Job Blocks:" + CounterLength);

        //console.log("total Job Blocks:" + dataSet.length);
        console.log(new Date() + ' [' + (Date.now() - start) + ' ms] ' + "returning Data" + url);
        return result;
    } catch (error) {
        console.error("error in scrapData:" + error);
        return result;
    }
}
async function framesLoading(page) {
    return page.evaluate(() => {
        try {
            for (const frame of document.querySelectorAll("iframe")) {
                try {
                    const frameDocument =
                        frame.contentDocument ||
                        frame.contentWindow.document;
                    const div = document.createElement("div");
                    for (const attr of frame.attributes) {
                        if (
                            attr.name !== "src" &&
                            attr.name !== "srcdoc" &&
                            attr.name !== "sandbox"
                        ) {
                            div.setAttribute(
                                attr.name,
                                attr.value
                            );
                        }
                    }
                    div.innerHTML =
                        frameDocument.documentElement.innerHTML;
                    frame.parentNode.replaceChild(div, frame);
                } catch (error) {

                }

            }
        } catch (error) {
            console.error("error in framesLoading:" + error);
        }

    });
}
async function pageStructure(page) {
    await page.setViewport({
        width: width,
        height: height
    });
    // var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    //     'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
    //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    //     'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    // ];
    // await page.setUserAgent(
    //     Useragents[Math.floor(Math.random() * Useragents.length)]
    // );
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"
    );
    await page.setRequestInterception(true);
    page.on('request', request => {
        const type = request.resourceType();
        if (type === 'image' || type === 'script' || type === 'font')
            request.abort();
        else
            request.continue();
    });
    return page;
}
async function getConnection(mongoUrl) {
    try {
        var client = await MongoClient.connect(
            mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        return {
            'connStatus': 1,
            client
        }
    } catch (error) {
        console.error("error while connecting to mongo:" + error);
        return {
            'connStatus': 0
        }
    }

}
async function closeConnection(client) {
    await client.close();
    console.log("DB Session Ended");
    return "Session Closed";
}