const puppeteer = require('puppeteer'),
    MongoClient = require('mongodb').MongoClient,
    // mailer = require("nodemailer"),
    express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http')
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
const HTTP_PORT = 8129;
http
    .createServer(app)
    .listen(HTTP_PORT, () =>
        console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "?skip=0&limit=10")
    );
app.get("/", async (req, res) => {
    var skip = parseInt(req.query.skip) || 0;
    var limit = parseInt(req.query.limit) || 20;
    while (true) {
        await calling(skip, limit);
    }
})

async function calling(skip, limit) {

    console.log("Input Given Skip:" + skip + " limit:" + limit);
    const [a, b, c, d, e] = await Promise.all([
        mainFun((5 * skip), limit),
        mainFun(6 * (skip + (1 * limit)), limit),
        mainFun(7 * (skip + (2 * limit)), limit),
        mainFun(8 * (skip + (3 * limit)), limit),
        mainFun(9 * (skip + (4 * limit)), limit)
    ]);

    //, mainFun(skip + (2 * limit), limit), mainFun(skip + (3 * limit), limit), mainFun(skip + (4 * limit), limit)

    console.log(a, b, c, d, e);
    return {
        a,
        b,
        c,
        d,
        e
    }
}

async function mainFun(skip, limit) {
    console.log("main Skip:" + skip + " limit:" + limit);

    let connection = await getConnection(server_uri)
    if (connection.connStatus) {
        var client = connection.client,
            db = client.db('stage_jobs');
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
        const [a, b, c, d, e] = await Promise.all([processData(browser, db, skip, limit), processData(browser, db, skip + (1 * limit), limit), processData(browser, db, skip + (2 * limit), limit), processData(browser, db, skip + (3 * limit), limit),
            processData(browser, db, skip + (4 * limit), limit)
        ]);
        console.log(a, b, c, d, e);

        //closing db Connection
        await closeConnection(client);
        return {
            a,
            b,
            c,
            d,
            e
        }
    } else {
        console.log("failed to connect to the DB");
        return {}
    }
}

//scrap Required Data
async function processData(context, db, skip, limit) {
    const page = await pageStructure(await context.newPage());
    try {
        console.log("processData=> Skip:" + skip + " limit:" + limit);
        let completeData = [{
            URL: 'https://careers-here.icims.com/jobs/55136/sr-technical-pm-specialist/job'
        }]
        for (let index = 0; index < completeData.length; index++) {
            const element = completeData[index];
            let joburl = element.URL;
            try {
                console.log("------------------------");
                await page.goto(joburl, {
                    networkIdle2Timeout: 90000,
                    waitUntil: "networkidle2",
                    timeout: 0
                });
                await page.waitFor(2000);
                await framesLoading(page);
                let {
                    html,
                    jobbody
                } = await page.evaluate(() => {
                    function removeComments(node) {
                        if (node.nodeType === 8) {
                            node.parentNode.removeChild(node);
                        }

                        for (let i = 0; i < node.childNodes.length; i++) {
                            removeComments(node.childNodes[i]);
                        }
                    }

                    function cleanup(node, type) {
                        const scripts = [];
                        let els = node.getElementsByTagName(type);
                        for (let i = els.length - 1; i >= 0; i--) {
                            if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                                scripts.push(els[i].innerText);
                            }
                            els[i].parentNode.removeChild(els[i]);
                        }
                        return scripts;
                    }
                    removeComments(document);
                    const ldjsons = cleanup(document.documentElement, 'script');
                    cleanup(document.documentElement, 'noscript');
                    cleanup(document.documentElement, 'base');
                    cleanup(document.documentElement, 'style');
                    cleanup(document.documentElement, 'select');
                    const html = document.documentElement.outerHTML;
                    const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
                    return {
                        html,
                        jobbody
                    }
                });
                console.log(joburl + "Updated the url to 200");
                console.log("-------------------------------------------------------------------------")
                res.send(html);
                console.log("-------------------------------------------------------------------------")


                // await db.collection('unique_urls_1000').updateMany({
                //     '_id': element._id
                // }, {
                //     $set: {
                //         html: html,
                //         jobbody: jobbody,
                //         htmlstatus: 200,
                //         'updateDate': new Date().toString()
                //     }
                // })
                console.log("------------------------");
            } catch (error) {
                console.log(joburl + "Updated the url to 404");
                // await db.collection('unique_urls_1000').updateMany({
                //     '_id': element._id
                // }, {
                //     $set: {
                //         html: "",
                //         jobbody: "",
                //         htmlstatus: 404,
                //         'updateDate': new Date().toString()
                //     }
                // })
            }

        }
        return "done"
    } catch (error) {
        console.error("error in scrapData:" + error);
        return "error"
        // await db.collection('usCompanies').updateMany({
        //     'company':element.company
        // }, {
        //     $set: {
        //         'gUnitedStateJobs': 0,
        //         gStatus: 500
        //     }
        // })
    } finally {
        setTimeout(() => page.close(), 5000);
    }
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

//frame loading
async function framesLoading(page) {
    return page.evaluate(() => {
        try {
            for (const frame of document.querySelectorAll("iframe")) {
                try {
                    frame.sandbox = 'allow-same-origin allow-scripts';
                    const frameDocument =
                        frame.contentDocument ||
                        frame.contentWindow.document ||
                        frame.contentWindow.document.body.innerHTML;
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

//Delay time for loading
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
//DB Connections
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