'use strict';

const url = require('url');

var colors = require('colors');
const puppeteer = require('puppeteer');
const MongoDB = require('mongodb');

// MongoDB Settings
const mongoEndpoint = 'mongodb://admin:jobiak@3.18.238.8:28015/admin'
const dbName = 'marketingTool';
const collectionName = 'Glassdoor_Companies';


MongoDB.connect(mongoEndpoint, {
    useUnifiedTopology: true
}, async function (err, mongoClient) {
    if (err) throw err;
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    try {
        // Browser Config
        const browser = await puppeteer.launch({
            "headless": false,
            "executablePath": "C://Program Files (x86)/Google/Chrome/Application/chrome.exe",
            "timeout": 100000,
            "waitUntil": "domcontentloaded",
            "userDataDir": "C:/Users/behar/AppData/Roaming/Google/Chrome/User Data",
            "args": [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu"
            ],
            "ignoreDefaultArgs": [
                "--disable-extensions"
            ],
            "devtools": false,
            "defaultViewport": {
                "width": 1600,
                "height": 900
            }
        });

        let page = await browser.newPage();


        (function main() {

            // DB Query to findOne company with no jobs count & with rating btw 4 & 4.9
            collection.aggregate([{
                    $match: {
                        $and: [{
                                us_jobs: {
                                    $exists: false
                                }
                            },
                            // { review: { $gte: 4 } },
                            //{ review: { $lte: 4.9 } }
                        ]
                    }
                },
                {
                    $sample: {
                        size: 1
                    }
                }
            ]).toArray(async (err, docs) => {
                if (err) throw err;
                if (!docs.length) {
                    console.log('Found no doc!');
                    return;
                };

                const doc = docs[0];

                console.log(`Finding: ${doc.name}'s Jobs Count`.green);
                const USJobsURI = convertToUSJobsURI(doc.link);
                console.log(`From: ${USJobsURI}`.green);

                try {
                    await page.goto(USJobsURI, {
                        networkIdle2Timeout: 100000,
                        waitUntil: "networkidle2",
                        timeout: 100000
                    });
                } catch (err) {
                    console.log(err);
                    process.exit(1);
                }
                const jobsCount = await fetchJobsCount(page);
                const updateDoc = jobsCount ? jobsCount : {
                    us_jobs: -1,
                    total_jobs: -1
                };

                console.log(`Jobs Count: ${JSON.stringify(updateDoc, null, 4)}`);

                collection.findOneAndUpdate({
                    '_id': doc['_id']
                }, {
                    $set: updateDoc
                }, (err, res) => {
                    if (err) throw err;
                    console.log(res);
                    main();
                });
            });

        })();

    } catch (error) {
        if (error) throw error;
        browser.close();
        mongoClient.close();
    }
});



// Converts overview URI to US Jobs uri
function convertToUSJobsURI(uri) {
    const jobsURISuffix = '.0,9_IL.10,12_IN1.htm';
    const URIParts = url.parse(uri);

    // Modify hostname
    const hostnameParts = URIParts.hostname.split(".");
    if (hostnameParts.length >= 3) {
        hostnameParts[2] = 'com';
    }

    URIParts.host = null;
    URIParts.hostname = hostnameParts.splice(0, 3).join('.');

    // Modify Path
    URIParts.pathname = URIParts.pathname.replace(/\/overview\//i, "/Jobs/");
    URIParts.pathname = URIParts.pathname
        .replace(/-(?=EI_IE)/, '-Us-Jobs-')
        .replace(/\.\d+,\d+.+/, '.0,9_IL.10,12_IN1.htm');

    // const pathnameParts = URIParts.pathname.split(/-(?=EI_IE)/);
    // console.log(pathnameParts);
    // if(pathnameParts.length == 2){
    //     pathnameParts[0] = pathnameParts[0] + '-Us-Jobs'
    //     pathnameParts[1] = pathnameParts[1].replace(/\.\d+,\d+\./, '.0,9_IL.10,12_IN1.htm');
    // }
    // URIParts.pathname = pathnameParts.join('-');

    return url.format(URIParts);
}

// Fetch Jobs Count
async function fetchJobsCount(page) {
    const selector = 'JobsLandingPage';
    const jobsCount = await page.evaluate((sel) => {
        const $elm = document.getElementById(sel);
        if (!$elm) return;

        const matches = $elm.innerText.match(/found (\d+) of (\d+) job openings/i);
        if (matches) {
            return {
                us_jobs: parseInt(matches[1]),
                total_jobs: parseInt(matches[2])
            };
        }
    }, selector);

    return jobsCount;

}