const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
const local_uri = 'mongodb://localhost:27017/atsCompanies';

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
    // var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    //     'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    // ];
    // let userAgt = Useragents[Math.floor(Math.random() * Useragents.length)]
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    );
    await page.setViewport({
        width: width,
        height: height
    });
    await page.setRequestInterception(true);

    page.on('request', (req) => {
        const url = req.url();
        if (url.match(".*/li/track.*")) {
            req.abort();
        } else {
            req.continue();
        }
    });
    await login(page);
    let db = client.db('stage_jobs');
    //let alphaLinks = await getTheAlphabeticsLinks(page);
    // let topCompanies = await topCompaniesDataSet(page, alphaLinks);
    // let db = client.db('linkedInDataSet');
    // await db.collection('topCompanies').insertMany(topCompanies);
    await searchData(page, db);
    await logOut(page);
    //console.log(await logOut(page));
    //console.log(alphaLinks);

    setTimeout(() => page.close(), 10000);
    await closeConnection(client)
    setTimeout(() => browser.close(), 50000);
})();

async function searchData(page, db) {
    let dataSet = await db.collection('occupation_category_final_data').find({
        "manual_collection": "from batch result",
        "status": 0
    }).skip(5000).limit(5000).toArray();
    console.log("total DB data:" + dataSet.length);
    for (let index = 0; index < dataSet.length; index++) {
        const title = dataSet[index].job_titles,
            location = "United States";
        let url = "https://www.linkedin.com/jobs/search/?geoId=103644278&keywords=" + title + "&location=" + location;
        await page.goto(url, {
            networkIdle2Timeout: 200000,
            waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
            timeout: 200000
        });
        await page.waitFor(4000);
        let getData = await getJobsData(page, title);
        console.log("totalJobs Loaded:" + getData.length);
        if (getData.length >= 1) {
            await db.collection('occupation_category_final_data').updateMany({
                '_id': dataSet[index]._id
            }, {
                $set: {
                    status: 1
                }
            });
            await db.collection('linkedInJobs').insertMany(getData);
        } else {
            await db.collection('occupation_category_final_data').updateMany({
                '_id': dataSet[index]._id
            }, {
                $set: {
                    status: 404
                }
            })
        }

    }
}


async function getJobsData(page, title) {
    try {
        await autoScroll(page);
        return page.evaluate((title) => {
            let jobs = []
            let jobBlocks = document.documentElement.querySelectorAll('div.job-card-search');
            jobBlocks.forEach(element => {
                try {
                    let title = element.querySelectorAll('h3[class="job-card-search__title artdeco-entity-lockup__title ember-view"] a')[0].innerText;
                    let jobLink = new window.URL(element.querySelectorAll('h3[class="job-card-search__title artdeco-entity-lockup__title ember-view"] a')[0].getAttribute('href'), window.document.URL).toString();
                    let companyName = element.querySelectorAll('h4.job-card-search__company-name a')[0].innerText;
                    let companyNameLink = new window.URL(element.querySelectorAll('h4.job-card-search__company-name a')[0].getAttribute('href'), window.document.URL).toString();
                    let location = element.querySelectorAll('span.job-card-search__location')[0].innerText;
                    //var easyApply = "";
                    let time = element.querySelectorAll('ul.job-card-search__footer time')[0].innerText;
                    let easyApplyBlock = element.querySelectorAll('ul.job-card-search__footer span[class="job-card-search__easy-apply"]');
                    if (easyApplyBlock.length) {
                        let easyApply = easyApplyBlock[0].innerText;
                        jobs.push({
                            title: title,
                            jobLink: jobLink,
                            companyName: companyName,
                            companyNameLink: companyNameLink,
                            location: location,
                            easyApply: easyApply,
                            time: time,
                            srcTitle: title
                        })
                    } else {
                        jobs.push({
                            title: title,
                            jobLink: jobLink,
                            companyName: companyName,
                            companyNameLink: companyNameLink,
                            location: location,
                            easyApply: "",
                            time: time,
                            srcTitle: title
                        })
                    }
                } catch (error) {
                    console.log("error in the label Value getting in getJobsData:" + error);
                }

            });
            return jobs;
        }, title);
    } catch (error) {
        console.log("error in the getJobsData:" + error);
        return []
    }

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

const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 50

            let timer = setInterval(() => {
                let scrollHeight = document.documentElement.querySelectorAll('div[class="jobs-search-results jobs-search-results--is-two-pane"]')[0].scrollHeight
                window.document.documentElement.querySelectorAll('div[class="jobs-search-results jobs-search-results--is-two-pane"]')[0].scrollBy(0, distance)
                totalHeight += distance
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, 150)
        })
    })
}
async function login(page) {
    try {
        let url = "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin"
        await page.goto(url, {
            networkIdle2Timeout: 200000,
            waitUntil: ['networkidle2', 'load', 'domcontentloaded'],
            timeout: 200000
        });
        await page.waitFor(1000);
        await page.waitFor('div[class="form__input--floating"] input[id="username"]');
        await page.waitFor('div[class="form__input--floating"] input[id="password"]');
        // await page.type('input[name=search]', 'Adenosine triphosphate');
        await page.$eval('div[class="form__input--floating"] input[id="username"]', el => el.value = 'vamsiduppala@gmail.com');
        await page.waitFor(200);
        await page.$eval('div[class="form__input--floating"] input[id="password"]', el => el.value = 'Vamsi12@');
        await page.waitFor(200);
        await page.click('*[aria-label="Sign in"]');
        console.log("Login Successfull");
        await page.waitFor(4000);
        try {
            await page.click('span[class = "password-prompt-wrapper"] button');
            await page.waitFor(2000);
        } catch (error) {
            console.log("could not found the wrapper Done" + error);
        }

        return 1;
    } catch (error) {
        console.log("error while logIn:" + error);
        return 0;
    }

}
async function logOut(page) {
    try {
        await page.waitFor(2000);
        await page.click('li[id="profile-nav-item"] button[aria-controls="nav-settings__dropdown-options"]');
        await page.waitFor(2000);
        await page.click('a[data-control-name="nav.settings_signout"]');
        await page.waitFor(3000);
        console.log("Logout Successful from the account")
        return 1;
    } catch (error) {
        console.log("error while logOut:" + error);
        return 0;
    }

}