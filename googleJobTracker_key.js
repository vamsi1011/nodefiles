const puppeteer = require("puppeteer-extra").use(require("puppeteer-extra-plugin-stealth")());
const chalk = require("chalk");
const isUrl = require('is-url');
var stringSimilarity = require('string-similarity');
const _ = require('lodash');
const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const http = require("http");

// let title = "Purchasing Cost Assistant";
// let location = "Melrose Park, IL";
// let company = "1-800 FLOWERS.COM";
// let jobUrl = "https://jobs.smartrecruiters.com/1-800-Flowers/85706450-purchasing-cost-assistant"


let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
let browser;
var server_uri = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';


const width = 1366;
const height = 768;
const headless = true;
let args = ['--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
    `--window-size=${width},${height}`
]
let browserParams = {
    width,
    height,
    headless,
    args
}

function formingUrl(params) {
    title = escapeReqThings(params.title)
    location = escapeReqThings(params.location)
    company = escapeReqThings(params.company)
    keyword = escapeReqThings(params.keyword)
    // console.log(temptitle);
    if (params.companyStatus == 0) {
        // return "https://www.google.com/search?q=" + tempTitle + "+in+" + tempLocation + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
        return "https://www.google.com/search?q=" + keyword + "+" + location + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
    }
    return "https://www.google.com/search?q=" + keyword + "+" + location + '+' + company + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
}
var escapeReqThings = function (string) {
    return string.replace(/[%]/, '').replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
}

var log = (start, msg, color = 'orange') => {
    console.log("------------------------------------------------");
    console.log((Date.now() - start + " ms " + msg));
    console.log("------------------------------------------------");
}
puppeteer
    .launch({
        headless: false,
        slowMo: false,
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
            db = client.db('atsCompanies') // whatever your database name is
            const HTTP_PORT = 8129;
            http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "?skip=0&limit=1&companyStatus=0")
                );
        });
    });


app.get("/", async (req, res) => {
    let start = Date.now();
    let skip = parseInt(req.query.skip),
        limit = parseInt(req.query.limit);
    const Data = await db.collection('jan28_keytrack').find({
        'jobUrl': "https://aidatabot.com/jobs/brooklyn-center-mn/dishwasher-480949159/",
        'keyword': ' dishwasher jobs in brooklyn'
    }).skip(skip).limit(limit).toArray();
    console.log(Data)

    var pages_per_browser = 3
    for (let startp = 0; startp <= limit; startp += pages_per_browser) {
        if ((startp + pages_per_browser) >= limit)
            var endp = limit
        else
            var endp = startp + pages_per_browser
        console.log(chalk.red('currently ' + endp))
        let data_new = Data.slice(startp, endp);
        await Promise.all(data_new.map(async element => {
            let title = element.title.trim(),
                location = element.location.trim(),
                company = element.company.trim(),
                keyword = element.keyword.trim(),
                jobUrl = element.jobUrl.replace("?in_iframe=1", "").trim(),
                companyStatus = parseInt(req.query.companyStatus);
            try {
                log(start, "launching browser", 'red')
                log(start, "browser launch successful")
                let params = {
                    title,
                    keyword,
                    location,
                    company,
                    jobUrl,
                    companyStatus
                }
                params.googleUrl = formingUrl(params)
                log(start, "googleUrl:" + params.googleUrl);
                let finalResponse = await IsJobInGfj(start, params);
                log(start, "finalOutput:" + JSON.stringify(finalResponse));
                console.log(chalk.green(params.jobUrl))
                await db.collection('jan28_keytrack').updateOne({
                    '_id': element._id
                }, {
                    '$set': finalResponse
                })


            } catch (error) {
                log(start, "error in main async:" + error, 'red')
            }


        }))
    }




});

var IsParams = (params) => {
    if ('title' in params && title !== null && title !== "") {
        if ('location' in params && location !== null && location !== "") {
            if ('company' in params && company !== null && company !== "") {
                if ('jobUrl' in params && isUrl(params.jobUrl)) {
                    return {
                        'paramsStatus': true,
                        'msg': 'everything is fine'
                    }
                } else {
                    return {
                        'paramsStatus': false,
                        'msg': 'jobUrl parameter missing'
                    }
                }

            } else {
                return {
                    'paramsStatus': false,
                    'msg': 'company parameter missing'
                }
            }
        } else {
            return {
                'paramsStatus': false,
                'msg': 'location parameter missing'
            }
        }
    } else {
        return {
            'paramsStatus': false,
            'msg': 'title parameter missing'
        }
    }
}


var IsJobInGfj = async (start, params) => {
    log(start, "opening the page:" + params.googleUrl);
    const page = await browser.newPage();
    let paramsCheck = IsParams(params)
    if (paramsCheck.paramsStatus) {
        try {
            let googleUrl = params.googleUrl;
            await page.setUserAgent(userAgent);
            await page.setViewport({
                width,
                height
            });
            await page.goto(googleUrl, {
                networkIdle2Timeout: 100000,
                waitUntil: "networkidle2",
                timeout: 90000
            });
            await page.waitFor(1000);
            let originalUrl = page.mainFrame().url();
            if (originalUrl.indexOf("https://www.google.com/sorry/index?continue=") >= 0) {
                log(start, "Google blocked your system please stop your work:", 'red')
                return {
                    paramsStatus: paramsCheck.paramsStatus,
                    blockStatus: 1
                }
            }
            return await isJobExists(start, page, params);

        } catch (error) {
            log(start, "error in IsJobInGfj:" + error, 'red')
        } finally {
            setTimeout(() => {
                log(start, "Page Closed", 'red')
                page.close();
            }, 5000);
        }
    } else {
        setTimeout(() => {
            log(start, "Page Closed", 'red')
            page.close();
        }, 5000);
        return paramsCheck;

    }
}

var isJobExists = async (start, page, params) => {
    try {
        var jobBlocks = await page.$$('li.PaEvOc div.BjJfJf');
        let checkedBlocks = [];
        let checkedData = [];
        let previousScrollPos = 0;
        let title = params.title;
        let jobUrl = params.jobUrl;
        let company = params.company;
        let location = params.location;
        let newScrollpos = 0;
        if (jobBlocks.length) {
            while (true) {
                var blocksData = await page.evaluate(() => {
                    var blocks = document.documentElement.querySelectorAll('div[role="treeitem"]');
                    var db = [];
                    let rank = 0;
                    for (const block of blocks) {
                        var jobtitle = block.querySelector('div[role="heading"]').innerText;
                        var companyName = block.querySelector('div[class="SHrHx"]').children[0].innerText;
                        var locationName = block.querySelector('div[class="SHrHx"]').children[1].innerText;
                        db.push({
                            jobtitle,
                            companyName,
                            locationName,
                            rank: rank++
                        })
                    }
                    return db;
                });
                let compare = function (txt1, txt2) {
                    var similarity = stringSimilarity.compareTwoStrings(txt1, txt2);
                    if (similarity >= 95 || txt1.toLowerCase().replace(/\s+/g, '').includes(txt2.toLowerCase().replace(/\s+/g, '')) || txt2.toLowerCase().replace(/\s+/g, '').includes(txt1.toLowerCase().replace(/\s+/g, ''))) {
                        return true;
                    }
                    return false;
                }
                let newBlocks = _.differenceBy(blocksData, checkedData, 'rank');
                newBlocks = newBlocks.filter(item => {
                    return compare(title, item.jobtitle) && compare(company, item.companyName)
                })
                let diff1 = _.differenceBy(newBlocks, checkedData, 'rank')
                if (diff1.length) checkedData = checkedData.concat(diff1);
                let diff2 = _.difference(_.uniq(_.map(newBlocks, 'rank')), checkedBlocks);

                console.log("*******************************************");
                console.log(diff2);
                console.log("*******************************************");
                if (diff2.length) {
                    let isExists = await clickAndCheck(page, diff2, jobUrl);
                    checkedBlocks = checkedBlocks.concat(diff2);
                    jobBlocks = await page.$$('li.PaEvOc div.BjJfJf')
                    if (isExists.matchFound) {
                        return {
                            ...{
                                paramsStatus: true,
                                jobBlocks: jobBlocks.length
                            },
                            ...isExists
                        }
                    }
                }
                //---------------------------------
                previousScrollPos = await page.evaluate(() => {
                    return document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollTop
                })
                await autoScroll(page);
                newScrollpos = await page.evaluate(() => {
                    return document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollTop
                })
                if (previousScrollPos == newScrollpos) break;
            }
            jobBlocks = await page.$$('li.PaEvOc div.BjJfJf')
            return {
                paramsStatus: true,
                jobBlocks: jobBlocks.length,
                'matchFound': false
            }
        } else {
            return {
                paramsStatus: true,
                jobBlocks: 0
            }
        }
    } catch (error) {
        log(start, "error in isJobExists:" + error, 'red')
        return {
            paramsStatus: true,
            error: "error in isJobExists",
        }
    }
}

const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 100
            let timer = setInterval(() => {
                let scrollHeight = document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollHeight;
                let scrollbarPosition = document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollTop;
                window.document.documentElement.querySelectorAll('div.gws-horizon-textlists__tl-lvc')[0].scrollBy(scrollbarPosition, distance)
                totalHeight += distance
                if (totalHeight >= scrollHeight || totalHeight >= 1000) {
                    clearInterval(timer)
                    resolve()
                }
            }, 200)
        })
    })
}

async function clickAndCheck(page, indexes, submittedurl) {

    submittedurl = submittedurl.replace("?in_iframe=1", "")
    var jobBlocks = await page.$$('li.PaEvOc div.BjJfJf');
    for (const index of indexes) {
        const ele = jobBlocks[index]
        console.log('Clicking:' + index)
        await ele.click();
        await page.waitFor(800);
        let applylinks = await page.evaluate(() => {
            let dataSet = []
            var ApplyLinks = document.documentElement.querySelectorAll('div[id="tl_ditc"] div[jsname="haAclf"] span>a');
            for (const element of ApplyLinks) {
                dataSet.push(element.getAttribute('href').replace('?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic', '').replace('&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic', '').replace("?in_iframe=1", "").trim())
                dataSet.push(element.getAttribute('href').replace('?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic', '').replace('&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic', '').replace("?in_iframe=1", "").replace('http:', 'https:').trim())
            }
            return dataSet
        })

        let matchFound = applylinks.some(item => item.includes(submittedurl.toLowerCase()) || submittedurl.includes(item.toLowerCase()))
        if (matchFound) {
            await randomClicking(page)
            return {
                'paramsStatus': true,
                'jobBlocks': jobBlocks.length,
                'matchFound': matchFound,
                'applylinks': applylinks,
                'rank': index + 1
            }
        }
    }
    await randomClicking(page)
    return {
        'paramsStatus': true,
        'jobBlocks': jobBlocks.length,
        'matchFound': false,
    }
}


async function randomClicking(page) {
    try {
        var jobBlocks = await page.$$('li.PaEvOc div.BjJfJf');
        for (let index = 0; index < 3; index++) {
            let blockNo = Math.floor(Math.random() * jobBlocks.length);
            const ele1 = jobBlocks[blockNo]
            await ele1.click();
            await page.waitFor(300);
            console.log(index + "fake clicking Done");
        }
    } catch (error) {
        console.log("facing error :" + error + " while fake clicking");
    }
}