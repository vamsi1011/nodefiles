const puppeteer = require("puppeteer-extra").use(require("puppeteer-extra-plugin-stealth")());
const chalk = require("chalk");
const path = require('path');
const isUrl = require('is-url');
const server_uri = "mongodb://admin:jobiak@3.18.238.8:28015/admin";
const MongoClient = require("mongodb").MongoClient;
var stringSimilarity = require('string-similarity');
const _ = require('lodash');
// let title="Kofax Specialist, BPC Operations";
// let location="US-PA-SCRANTON";
// let company="Canon Business Process";
// let jobUrl="https://careers-cbps.icims.com/jobs/8280/kofax-specialist%2C-bpc-operations/job"
let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
let IsWithCompany = false;
let browser;

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
    // console.log(temptitle);
    if (!params.IsWithCompany) {
        // return "https://www.google.com/search?q=" + tempTitle + "+in+" + tempLocation + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
        return "https://www.google.com/search?q=" + title + "+" + location + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
    }
    return "https://www.google.com/search?q=" + title + "+" + location + '+' + company + "+&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs"
}
var escapeReqThings = function (string) {
    return string.replace(/[%]/, '').replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
}

var log = (start, msg, color = 'orange') => {
    console.log("------------------------------------------------");
    console.log(chalk.bold.keyword(color)(Date.now() - start + " ms " + msg));
    console.log("------------------------------------------------");
}
const launchBrowser = async () => {
    browser = await puppeteer.launch(browserParams);
    browser.on('disconnected', launchBrowser);
};

(async () => {
    let start = Date.now();
    try {
        log(start, "launching browser", 'red')
        await launchBrowser();
        log(start, "browser launch successful");
        log(start, "getting the connection with " + server_uri);
        let connection = await getConnection(server_uri);
        let client = connection.client;
        if (connection.connStatus) {
            log(start, "connection successful");
            db = connection.client.db('atsCompanies');
            let dataset = await db.collection('GoodwinRecruitingJan13th').find({
                'isUrlExists': {
                    $exists: false
                }
            }).limit(100).toArray();

            const page = await browser.newPage();
            for (const item of dataset) {
                let title = item.title;
                let company = item.company;
                let location = item.location;
                let jobUrl = item.jobUrl;
                let id = item._id;
                let params = {
                    id,
                    title,
                    location,
                    company,
                    jobUrl,
                    IsWithCompany
                }

                params.googleUrl = formingUrl(params);
                log(start, "googleUrl:" + params.googleUrl);
                let finalResponse = await IsJobInGfj(start, page, params);
                log(start, "finalOutput:" + JSON.stringify(finalResponse));
                await db.collection('GoodwinRecruitingJan13th').updateOne({
                    _id: item._id
                }, {
                    $set: finalResponse
                })
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            setTimeout(() => {
                log(start, "Page Closed", 'red')
                page.close();
            }, 5000);

            await closeConnection(client);
        }


    } catch (error) {
        log(start, "error in main async:" + error, 'red')
    }

})();

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


var IsJobInGfj = async (start, page, params) => {

    let paramsCheck = IsParams(params)
    if (paramsCheck.paramsStatus) {
        try {
            let googleUrl = params.googleUrl;
            await page.setUserAgent(userAgent);
            await page.setViewport({
                width,
                height
            });
            log(start, "opening the page:" + params.googleUrl);
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
        }
    } else {
        setTimeout(() => {
            log(start, "Page Closed", 'red')
            page.close();
        }, 5000);
        return paramsCheck;

    }
}
let compare = function (txt1, txt2, similarityPercent) {
    txt1 = txt1.toLowerCase().replace(/\s+/g, '');
    txt2 = txt2.toLowerCase().replace(/\s+/g, '');
    var similarity = stringSimilarity.compareTwoStrings(txt1, txt2) * 100;
    console.log("----------------------------------------------------");
    console.log("txt1:" + txt1 + " txt2:" + txt2 + " similarity:" + similarity);
    console.log("----------------------------------------------------");
    if (similarity >= similarityPercent) {
        return true;
    }
    return false;
}

var isJobExists = async (start, page, params) => {
    try {
        var jobBlocks = await page.$$('li.PaEvOc div.BjJfJf');
        let checkedBlocks = [];
        let checkedData = [];
        let previousScrollPos = 0;
        let title = params.title;
        let company = params.company;
        let location = params.location;
        let jobUrl = params.jobUrl;
        let id = params.id;
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

                let newBlocks = _.differenceBy(blocksData, checkedData, 'rank');
                newBlocks = newBlocks.filter(item => {
                    return compare(title, item.jobtitle, 80) && compare(company, item.companyName, 80)
                })
                let diff1 = _.differenceBy(newBlocks, checkedData, 'rank')
                if (diff1.length) checkedData = checkedData.concat(diff1);
                let diff2 = _.difference(_.uniq(_.map(newBlocks, 'rank')), checkedBlocks);

                console.log("*******************************************");
                console.log(diff2);
                console.log("*******************************************");
                if (diff2.length) {
                    let isExists = await clickAndCheck(page, diff2, params);
                    checkedBlocks = checkedBlocks.concat(diff2);
                    jobBlocks = await page.$$('li.PaEvOc div.BjJfJf')
                    if (isExists.isUrlExists) {
                        //await page.screenshot({ path: path.join(__dirname,id+'.png'), fullPage: true });
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
            //await page.screenshot({ path: path.join(__dirname,id+'.png'), fullPage: true });
            return {
                paramsStatus: true,
                checkedBlocks: checkedBlocks.length,
                jobBlocks: jobBlocks.length,
                'isUrlExists': false
            }
        } else {
            //await page.screenshot({ path: path.join(__dirname,id+'.png'), fullPage: true });
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

async function clickAndCheck(page, indexes, params) {
    let submittedurl = params.jobUrl;
    var jobBlocks = await page.$$('li.PaEvOc div.BjJfJf');
    for (const index of indexes) {
        const ele = jobBlocks[index]
        console.log('Clicking:' + index)
        await ele.click();
        await page.waitFor(800);

        let jobTitle = await page.evaluate(() => {
            return document.documentElement.querySelector('div[id="tl_ditc"] h2').innerText;
        })
        let jobLocation = await page.evaluate(() => {
            return document.documentElement.querySelector('div[id="tl_ditc"] div[class="tcoBdd"]').innerText;
        })
        let jobCompany = await page.evaluate(() => {
            return document.documentElement.querySelector('div[id="tl_ditc"] div[class="pbHUre tcoBdd"]').innerText;
        })
        let applyOns = await page.evaluate(() => {
            let dataSet = []
            var ApplyLinks = document.documentElement.querySelectorAll('div[id="tl_ditc"] div[jsname="haAclf"] span>a');
            for (const element of ApplyLinks) {
                dataSet.push({
                    'url': element.getAttribute('href').replace('?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic', '').trim(),
                    'label': element.innerText.replace(/Apply on /gi, '').trim()
                })
            }
            return dataSet
        });
        let applyLabels = _.uniq(_.map(applyOns, 'label'));
        let applylinks = _.uniq(_.map(applyOns, 'url'));
        let isUrlExists = applylinks.some(item => compare(submittedurl.replace(/https:\/\//gi, '').replace(/http:\/\//gi, '').trim(), item.replace(/https:\/\//gi, '').replace(/http:\/\//gi, '').trim(), 100))
        let isLabelExists = applyLabels.some(item => compare(item, params.company, 90));
        let isCompany = compare(jobCompany, params.company, 85);
        let isLocation = compare(jobLocation.split(",")[0], params.location, 100);
        let isTitle = compare(jobTitle, params.title, 100);
        let isAtsExists = applyLabels.some(item => {
            if (compare(item, params.company, 80)) {
                return atsCheck(item);
            }
        });
        console.log("-----------------------------------------------");

        console.log(params);
        console.log('isUrlExists:' + isUrlExists + " " + "isLabelExists:" + isLabelExists + " " + 'isCompany:' + isCompany);
        console.log('isLocation:' + isLocation + " " + "isTitle:" + isTitle + " " + 'isAtsExists:' + isAtsExists);
        console.log("-----------------------------------------------");
        if (isUrlExists) {
            await randomClicking(page)
            return {
                'paramsStatus': true,
                'jobBlocks': jobBlocks.length,
                'isUrlExists': isUrlExists,
                'applylinks': applylinks,
                'rank': index + 1
            }
        }
        if (isLabelExists && !isAtsExists) {
            await randomClicking(page)
            return {
                'paramsStatus': true,
                'jobBlocks': jobBlocks.length,
                'isUrlExists': isLabelExists,
                'applylinks': applylinks,
                'rank': index + 1
            }
        }
        if (isLabelExists && isAtsExists) {
            await randomClicking(page)
            return {
                'paramsStatus': true,
                'jobBlocks': jobBlocks.length,
                'isUrlExists': true,
                'applylinks': applylinks,
                'isAtsOrThirdParty': 1,
                'rank': index + 1
            }
        }

        if (isCompany && isLocation && isTitle) {
            return {
                'paramsStatus': true,
                'jobBlocks': jobBlocks.length,
                'isUrlExists': isUrlExists,
                'isAtsOrThirdParty': 2,
                'applylinks': applylinks,
                'rank': index + 1
            }
        }
    }
    await randomClicking(page)
    return {
        'paramsStatus': true,
        'jobBlocks': jobBlocks.length,
        'isUrlExists': false,
    }
}

function atsCheck(label) {
    let atsCompanies = ['Taleo',
        'Jobvite',
        'iCims',
        'Greenhouse',
        'SAP',
        'ADP',
        'WorKDay',
        'SmartRecruiters',
        'Lever',
        'CareerBuilder',
        'PeopleSoft',
        'castone',
        'Monster',
        'ConerStone on Demand',
        'Comeet',
        'Kronos',
        'Workable',
        'Jobscore',
        'reezyHR',
        'Avature',
        'Compass',
        'Prevue',
        'PrismHR Hiring',
        'Healthcaresource.com',
        'ApplicantPro',
        'ApplicantStack',
        'RecruiterBox',
        'CareerPlug',
        'Gallo Winery',
        'Paycom',
        'JobDiva',
        'Njoyn',
        'SnagAJob',
        'TeamWorkOnline',
        'Symphony Talent',
        'gr8 People',
        'Hirebridge',
        'iApplicants',
        'PageUp People',
        'SmartSearch',
        'ApplicantPool.com',
        'ApplicantPool',
        'Hireology',
        'HospitalityOnline',
        'Applicant Manager',
        'Jazz HR',
        'Simplicant',
        'Paychex',
        'appone',
        'PeopleFluent',
        'Lumesse',
        'PCRecruiter',
        'Technomedia',
        'Recruitee',
        'Rullion Solutions',
        'SilkRoad',
        'Ceridian',
        'Geebo',
        'Job Info',
        'State Farm Agent'
    ];
    return atsCompanies.some(item => compare(item, label, 100))
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

//Db Connection method
async function getConnection(mongoUrl) {
    try {
        var client = await MongoClient.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        return {
            connStatus: 1,
            client: client
        };
    } catch (error) {
        console.log("----------------");
        console.error("error while connecting to mongo:" + error);
        console.log("----------------");
        return {
            connStatus: 0
        };
    }
}

//close the Db Connection
async function closeConnection(client) {
    try {
        await client.close();
        console.log("----------------");
        console.log("DB Session Ended");
        console.log("----------------");
        return "Session Closed";
    } catch (error) {
        console.log("----------------");
        console.error("error while closing the mongo connection:" + error);
        console.log("----------------");
    }
}