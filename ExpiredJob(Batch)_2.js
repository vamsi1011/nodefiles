'use strict';
var MongoClient = require('mongodb').MongoClient;
var fuzz = require('fuzzball');
var url = "mongodb://admin:jobiak@3.18.238.8:28015/admin";
let db, browser;
/* global document:true, window:true, URL:true */
const puppeteer = require("puppeteer");
const rp = require("request-promise");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.get('/', async (req, res) => {
    const details = await process();
    res.send(details)
});
const width = 1366,
    height = 768;
const C_HEADELESS = true;
const C_SLOWMOTION = 0;
puppeteer
    .launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        args: ["--disable-web-security", `--window-size=${width},${height}`]
    })
    .then(async b => {
        browser = b;
        MongoClient.connect(url, {
            'useNewUrlParser': true
        }, (err, client) => {
            if (err) return console.log(err)
            db = client.db('data_cleansing') // whatever your database name is
            const HTTP_PORT = 8749;
            var server = http
                .createServer(app)
                .listen(HTTP_PORT, () =>
                    console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
                );
            server.timeout = 240000;
        })
    });
var expiredJobsPhrases = ["Sorry, we can't provide additional information about this job right now",
    "This job is no longer available",
    "Sorry, We Can't Find That Opportunity!",
    "Sorry, this opportunity is only available for Pioneers Memorial Healthcare District employees",
    "We're really sorry but the page you requested cannot be found",
    "The job listing no longer exists",
    "Oh No!",
    "The job posting you are looking for has expired or the position has already been filled. If you are interested in one of our other opportunities, please visit our career site",
    "This position has been closed and is no longer available",
    "This job does not exist",
    "We are sorry the job you are looking for is no longer available",
    "Sorry… The job you are trying to applied for has been filled",
    "An Error Occurred,Sorry, there was a problem displaying this job",
    "We are not currently accepting applications for this position",
    "The job you have requested cannot be found.",
    "Page Not Found",
    "The job you have requested cannot be found",
    "We're sorry, the job you are looking for is no longer available",
    "It looks like nothing was found at this location.",
    "The job you are trying to locate has either been filled or removed by the employer",
    "Sorry, this position has been closed",
    "Job Expired The job opportunity you were interested in is no longer available',",
    "Sorry! Looks like that position is no longer available",
    "ERROR: INVALID DATA. REVIEW ALL ERROR MESSAGES BELOW TO CORRECT YOUR DATA",
    "THIS JOB IS NO LONGER AVAILABLE. PLEASE SEARCH OUR CURRENT JOB OPENINGS",
    "The job description you are trying to view is no longer available",
    "The job is no longer available",
    "The resource you are looking for has been removed, had its name changed, or is temporarily unavailable",
    "The page you are looking for does not exist",
    "Error: The requested job could not be found",
    "404 - Page not found",
    "That listing is no longer valid",
    "Unfortunately, we are not hiring at this time",
    "This job is not available any more",
    "This position is no longer available",
    "Sorry, this job is no longer active",
    "We apologize for the inconvenience, but this position's status has recently changed",
    "This Job is currently unavailable",
    "There are no available positions",
    "404 Not Found",
    "we are no longer accepting applications for this position",
    "Oops! The position you're looking for does not exist",
    "The position you are looking for could not be found, or is no longer available",
    "An error occurred",
    "Sorry, this job is not currently posted",
    "Thank you for your interest in this position however it has been closed",
    "Error:Login is required to see these job details",
    "Sorry, this position has been filled",
    "We’re sorry, but the page or function you tried to access could not be found",
    "Sorry, but we can't find that page",
    "Unfortunately that job is no longer available",
    "Job not found",
    "This institution is no longer accepting applications for the job you selected",
    "This Job has been closed",
    "This position is no longer open",
    "Article does not exist or Permission Denied",
    "This job posting is no longer active",
    "The job's status might have changed or closed",
    "Jobad was not found",
    "Looks like this job has closed",
    "This job cannot be viewed at the moment",
    "This job cannot be viewed at this time",
    "The job you tried to view is no longer active",
    "The job you are looking for no longer exists",
    "Sorry, this job has been filled",
    "This job no longer exists",
    "Sorry, this position is no longer available",
    "Sorry, but the page you were trying to view does not exist",
    "The page you are looking for no longer exists",
    "Sorry! This position is no longer available",
    "Sorry, this position is no longer accepting further applicants",
    "This position is no longer posted",
    "This vacancy has now expired",
    "The page you are looking for has been removed or deleted",
    "The Elementary Teacher (19-20) job is no longer open",
    "We’re sorry but that page no longer exists",
    "We're sorry, but this job has either expired or been removed",
    "We're sorry… the job you are trying to apply for has been filled",
    "The posting for this position is not currently available",
    "The position has been closed or filled",
    "This listing has expired",
    "The job posting you are looking for has expired or the position has already been filled",
    "Error: The job that you were looking for either does not exist or is no longer open",
    "The requested page is no longer available",
    "A system error has occurred",
    "Sorry... This position is no longer posted online",
    "We're sorry, we were unable to find a matching job",
    "Notice: This vacancy has expired",
    "Hiring for this position has been put on hold at this time",
    "This page could not be found",
    "Unfortunately this position has been closed",
    "That job listing (193017) is no longer active",
    "An error has occurred",
    "This job hosting site is not available",
    "OOPS... SOMETHING WENT WRONG",
    "The job that you were looking for either does not exist or is no longer open",
    "Oops!,We couldn’t find the page you were looking for",
    "Error:  Login is required to see these job details",
    "Not Found",
    "Error 404 - Page not found!",
    "Sorry, this job expired on Jun 13, 2019",
    "The job you were looking for is unavailable",
    "Oh No! Looks like this job has closed",
    "The page you are looking for doesn't exist",
    "This job is not active and is no longer accepting applications",
    "Sorry, the post you are looking for is not available",
    "No open jobs at this moment",
    "Oops! That page can’t be found",
    "No Active job found!",
    "Position not found or no longer available",
    "This posting is not available",
    "This opening is closed and is no longer accepting applications",
    "404",
    "No Results Found",
    "Not found, error 404",
    "WE ARE SORRY, BUT THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST",
    "We can't find the Job you are looking for",
    "Job was removed",
    "The requested job could not be found",
    "The page you requested was removed",
    "The page you requested cannot be found",
    "This page doesn’t exist",
    "This job is not available",
    "The Job Order you are looking for is not enabled for public web viewing",
    "Sorry! An error has occurred",
    "Sorry, the specified job listing does not exist or is no longer active",
    "Sorry, we couldn't find the vacancy you are looking for",
    "Job Not Found!",
    "We are sorry this job post no longer exists",
    "The job you are looking for cannot be found",
    "Sorry The job you are trying to apply for has been filled",
    "This Job Posting is no longer available",
    "The job was not found It may no longer be available",
    "We apologize, but the job you are trying to access is no longer accepting applications",
    "This site can’t be reached",
    "The job posting you have requested cannot be found",
    "At this time, the position you are interested in is no longer posted",
    "The job you are trying to apply for has Been filled",
    "The job you are trying to applied for has Been filled",
    "This position is no longer taking new applicants",
    "Our apologies, but we are no longer accepting applications for this position",
    "Sorry… the job you are trying to apply for has been filled",
    "Oops This position is closed",
    "The job posting you're looking for might have closed, or it has been removed",
    "Position No Longer Available",
    "Sorry, but the page you requested was not found",
    "Sorry  The job you are trying to apply for has been filled",
    "Aw, shucks! We don't have any jobs that match your criteria today",
    "The requisition is no longer accepting applications or is filled",
    "Page Expired",
    "P A G E  N O T  F O U N D",
    "Sorry, the page you were looking for doesn't exist",
    "We apologize for the inconvenience, but we cannot find this position",
    "Sorry, this job has expired",
    "This jobssuckerpunchcom page can’t be found",
    "Sorry, the page you are looking for is unavailable or does not exist",
    "WE ARE SORRY THERE WAS AN ERROR WITH YOUR SEARCH",
    "Sorry, this job opening is no longer available",
    "This position is closed",
    "Job Unavailable",
    "This page doesn't exist",
    "PAGE NOT FOUND!",
    "Login is required to see these job details",
    "Sorry, page not found",
    "THIS PAGE DOES NOT EXIST",
    "The page you were looking for doesn't exist",
    "ERROR 404",
    "Sorry, This Page Does not exist",
    "The Career Opportunity you were looking for is no longer available",
    "We apologize for the inconvenience, but this position's status has recently changed",
    "Sorry, the job you were looking for was not found",
    "404 ERROR",
    "404 - Article Not Found",
    "Sorry, the page you were looking for cannot be found",
    "Unfortunately, we are not hiring at this time",
    "Job not available",
    "Page Not Found",
    "This position has been closed and is no longer available",
    "This job has expired!",
    "Error: The requested job could not be found",
    "The page that you have requested could not be found",
    "Job no longer available",
    "This placementbydesigncatsonecom page can’t be found",
    "The page you requested could not be found",
    "This page isn’t working",
    "This job listing is no longer active",
    "Oops Job Not Found!",
    "This institution is no longer accepting applications for the job you selected",
    "This position is no longer accepting applications",
    "We are no longer accepting applications for this job",
    "We're sorry, that job does not exist or is not currently active",
    "Sorry, this opportunity is only available",
    "Sorry, this opportunity is only available for R1 RCM Inc employees",
    "The job you have requested cannot be found",
    "This position is no longer accepting applications",
    "You may have typed the url for this website incorrectly",
    "Sorry! That page doesn't seem to exist",
    "Oops! Page not found",
    "The job you're looking for has expired!",
    "We can't locate the page you requested",
    "The job link you are attempting to access has expired",
    "Oops, This Page Could Not Be Found",
    "404 - File or directory not found",
    "Job Requisition is no longer active",
    "Position not found",
    "ERROR: The requested job does not exist",
    "Nothing found for the requested page",
    "This position has been closed and is no longer available",
    "No page could be found at this address",
    "This position is no longer available",
    "Oops Job Not Found!",
    "Oops! The position you're looking for does not exist",
    "The page you are looking for doesn't exist",
    "This job is not available any more",
    "We apologize for the inconvenience, but this position's status has recently changed",
    "The job you have requested cannot be found",
    "ERROR",
    "This posting is not available",
    "We are looking for talented people",
    "We're sorry, the job you are looking for is no longer available",
    "This institution is no longer accepting applications for the job you selected",
    "Unfortunately, we are not hiring at this time ",
    "This position is no longer available",
    "If you found this page from a job link, then that job is expired",
    "This position is for an 'on call' person to help within our kitchen",
    "Attention! This job posting is 134 days old and might be already filled",
    "The job is no longer available",
    "Sorry, but we can't find that page",
    "Oops! The position you're looking for does not exist",
    "Login is required to see these job details",
    "Thank you for your interest in this position however it has been closed",
    "Thank you for your interest",
    "We can't find the Job you are looking for",
    "Below is a list of the current openings with our company",
    "The job you are attempting to reach is not available",
    "This probably means the opening is not active anymore",
    "This wisehealthsystemcatsonecom page can’t be found",
    "We somehow lost the page you are looking for",
    "There is no active job with this ID",
    "This position has been filled",
    "ERROR 404 - NOT FOUND",
    "Server Error",
    "Sorry - the page you requested is no longer here",
    "The page cannot be displayed",
    "THE POSITION YOU ARE LOOKING FOR IS NO LONGER AVAILABLE",
    "404: Page Not Found",
    "Job Post is temporarily unavailable",
    "We couldn't find the page you were looking",
    "Page not Found",
    "Looks like this job has been filled",
    "Expired Professional Alternatives of AZ Jobs",
    "ERROR Your request generated an error with the server, and could not be recovered",
    "Sorry, there job you are looking for is no longer active",
    "Couldn't find what you were looking for",
    "Sorry, the job vacancy is no longer available",
    "We can't seem to find the page you're looking for",
    "The page does not exist",
    "404 Page Not Found",
    "Error 404-- Page Not Found",
    "This job doesn’t exist",
    "404 PAGE NOT FOUND",
    "Ooops Error 404",
    "Recruitment closed",
    "OOPS!The page you are looking for could not be found",
    "Access denied",
    "The selected job is currently not active for viewing",
    "This position has expired on the Casino Careers job board",
    "We couldn't find the page",
    "404 – Page not found",
    "You are not authorized to access this page",
    "Page Doesn’t Exist",
    "Uh-oh, looks like we can't find this page",
    "404: The page cannot be found",
    "Uh Oh",
    "File Not Found",
    "This job has expired",
    "This job post has expired",
    "Nothing Found",
    "No Results Found",
    "No job found!",
    "Oops! That page cannot be found",
    "This listing has expired",
    "This job is expired",
    "The selected job ad is no longer available",
    "We were unable to find any openings that matched your current search criteria",
    "That job description was not found",
    "This is not the page you are looking for",
    "Sorry, you do not have access to this page",
    "Fill out the application below and we will reach out to discuss this opportunity",
    "Error 404 - page not found",
    "Sorry, the page you are looking for does not exist",
    "OOPS, Page Unavailable!",
    "Apologies, but the page you requested could not be found",
    "It looks like you are lost",
    "The page you requested was not found",
    "This position is no longer an active posting on HigherEdJobs",
    "We're sorry, but that page doesn't exist",
    "The Position id [8010] is not valid",
    "404. Looks like you found a page you shouldn't have",
    "Sorry, but the page you are looking for cannot be found",
    "The page you are looking for cannot be found or another error occurred",
    "Unfortunately we can't find this page",
    "THIS POSITION IS NOW CLOSED",
    "Oops, This Page Could Not Be Found!",
    "We are looking for your page...but we can't find it at the moment",
    "Oops! This job you were looking for is no longer available",
    "We've Encountered an error displaying the requested job posting",
    "Sorry, the page you're looking for can't be found",
    "The opening you are looking for does not exist",
    "Sorry, we currently have a problem displaying the page",
    "We’re sorry, but we can’t find the page you’re looking for",
    "The page you requested was not found",
    "We Couldn't Find That Job",
    "We couldn't find the page you were looking for",
    "This job code doesn't exist any more",
    "The Midmarket Customer Success Manager Opening is no longer available. Please check below our related opening offers",
    "This job is closed to new applications",
    "Sorry, but the page you are looking for does not exist or is temporarily unavailable",
    "Sorry, but the page you're looking for is no longer available",
    "OOPS, PAGE NOT FOUND!",
    "Oh No!",
    "404 - We're sorry! We couldn't find any information at the page you requested",
    "Unfortunately we couldn't find the page you were looking for. Please use the menu to navigate the site",
    "The file you are looking for could not be found",
    "We're sorry, but job 1194707 is no longer available",
    "The page you're looking for cannot be found",
    "Position can't be found or is no longer available",
    "We couldn’t find any open jobs that match your search",
    "SORRY, BUT THIS PAGE ISN'T BUILT YET",
    "Sorry, the page you’re trying to reach could not be found",
    "We're sorry, but there is not a web page matching your entry",
    "Oops... We've lost you",
    "Expired: over a month ago. Applications are no longer accepted",
    "We're sorry we couldn't find the page you are looking for",
]

async function process() {
    try {
        const Data = await db.collection('JobsScrapingcheck2').find({
            'status': 0
        }).skip(20).limit(5).sort({
            'URL': 1
        }).toArray()
        console.log("Length of Data:" + Data.length);
        var successLabels = [],
            errorlabels = [];
        const start = Date.now();

        await Promise.all(
            Data.map(async element => {
                const page = await browser.newPage();
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
                );
                await page.setViewport({
                    width: 1366,
                    height: 768
                });
                try {
                    await sleep(2000);
                    //log(start,URL,URLs.indexOf(URL));
                    const response = await LDJSONGetter(page, start, element.URL);

                    if (!response.hasOwnProperty('error')) {
                        successLabels.push(
                            response
                        )

                        console.log(Date.now() - start + '(ms)' + element.URL + ' page response sent');
                        let ldjson = response.LDJSON
                        if (response.HTML !== "" && response.PlainText !== "") {
                            response.status = 1
                            await db.collection('JobsScrapingcheck2').updateOne({
                                '_id': element._id
                            }, {
                                $set: response
                            }).then(() => console.log('Updated 200 Status Into the Collection in url contains'));
                        } else {
                            response.status = 404
                            await db.collection('JobsScrapingcheck2').updateOne({
                                '_id': element._id
                            }, {
                                $set: response
                            }).then(() => console.log('Updated 404 Status Into the Collection in url contains'));

                        }

                        console.log("================================================================================")
                    } else {
                        errorlabels.push({
                            joburl: response
                        })
                        response.status = 404
                        console.log(Date.now() - start + '(ms)' + element.URL + ' page response sent into error');
                        await db.collection('JobsScrapingcheck2').updateOne({
                            '_id': element._id
                        }, {
                            $set: response
                        }).then(() => console.log('Updated 404 Status Into the Collection in url contains'));
                        console.log("================================================================================")
                    }
                } catch (error) {
                    let response = {}
                    errorlabels.push({
                        joburl: element.URL
                    })
                    response.status = 404
                    console.log(Date.now() - start + '(ms)' + element.URL + ' page response sent into error');
                    await db.collection('JobsScrapingcheck2').updateOne({
                        '_id': element._id
                    }, {
                        $set: response
                    }).then(() => console.log('Updated 400 Status Into the Collection in url contains'));
                    console.log("================================================================================")
                } finally {
                    setTimeout(() => page.close(), 5000);
                }

            }));
        //return {successLabels,errorlabels}
        await sleep(2000);
        await process(0);
    } catch (error) {
        console.log("Having Some Error===>" + error);
        await process(1);

    }


}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function LDJSONGetter(page, start, joburl) {
    try {
        console.info(Date.now() - start + ": Opening page: " + joburl);
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        );

        await page.setViewport({
            width: 1366,
            height: 671
        });
        await page.goto(joburl, {
            networkIdle2Timeout: 90000,
            waitUntil: "networkidle2",
            timeout: 50000
        });
        await page.waitFor(1000).then(() => console.log("Waiting for 1 Sec"))

        await page.setRequestInterception(true);
        page.on('request', request => {
            const type = request.resourceType();
            if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other' || type === 'script')
                request.abort();
            else
                request.continue();
        });
        var result = await page.evaluate(() => {
            for (const frame of document.querySelectorAll("iframe")) {
                const frameDocument =
                    frame.contentDocument || frame.contentWindow.document;

                const div = document.createElement("div");
                for (const attr of frame.attributes) {
                    if (
                        attr.name !== "src" &&
                        attr.name !== "srcdoc" &&
                        attr.name !== "sandbox"
                    ) {
                        div.setAttribute(attr.name, attr.value);
                    }
                }
                div.innerHTML = frameDocument.documentElement.innerHTML;
                frame.parentNode.replaceChild(div, frame);
            }
            // eslint-disable-line no-irregular-whitespace
            function cleanup(node, type) {
                const scripts = [];
                let els = node.getElementsByTagName(type);
                for (let i = els.length - 1; i >= 0; i--) {
                    if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                        scripts.push(els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' '));
                    }

                    els[i].parentNode.removeChild(els[i]);


                }
                return scripts;
            }
            const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
            var LDJSON = []
            var LDJSON = cleanup(document.documentElement, "script")
            cleanup(document.documentElement, "noscript")
            cleanup(document.documentElement, "meta")
            cleanup(document.documentElement, "style")
            cleanup(document.documentElement, "select")
            var HTML = document.documentElement.outerHTML;


            return {
                'HTML': HTML,
                'Jobbody': jobbody,
            };


        });
        console.info(
            Date.now() - start + ":Scraping Successfull: " + joburl
        );
        var expiredJobCheckStatus = await expiredJobCheck(result.Jobbody);
        console.log("---------------------------------------");
        var pageUrl = page.url();
        console.log("---------------------------------------");
        var endResult = result
        endResult.urlRedirectStatus = 0;

        console.log(pageUrl.includes(joburl));
        let mm = await cmpPlainText(pageUrl, joburl)
        endResult.urlMatchPercent = mm
        endResult.redirectedUrl = pageUrl
        if (mm < 90) {
            endResult.urlRedirectStatus = 1;
        }
        console.log(pageUrl);
        console.info(
            Date.now() - start + ":Expired Jobs Check done " + joburl
        );
        console.log(expiredJobCheckStatus);
        endResult.expiredJobCheckStatus = expiredJobCheckStatus.exStatus
        endResult.expiredJobCheck_match = expiredJobCheckStatus.match
        return endResult;


    } catch (error) {
        console.log("Having Some Error===>" + error);
        return {
            'error': error
        };
    }


}

function cmpPlainText(txt1, txt2) {
    // console.log("---------************************-----------------------");

    // console.log(txt1);
    // console.log("---------************************-----------------------");
    // console.log("---------************************-----------------------");

    // console.log(txt2);
    // console.log("---------************************-----------------------");

    let fuzz_ratio = fuzz.token_set_ratio(txt1.replace(/\t/g, '').replace(/\n/g, '').replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, ''), txt2.replace(/\t/g, '').replace(/\n/g, '').replace(/ /g, ' ').replace(/[^a-zA-Z0-9]/g, ''));
    console.log(fuzz_ratio);
    return fuzz_ratio;
}

async function expiredJobCheck(text) {
    console.log("---------------------------------------------------------------------");
    console.log(text);
    console.log("---------------------------------------------------------------------");

    if (text && expiredJobsPhrases) {
        var lowerCaseText = text.toLowerCase();
        for (var i = 0; i < expiredJobsPhrases.length; i++) {
            let element = expiredJobsPhrases[i];
            console.log("************************************************");
            console.log("Checking " + element);
            console.log("************************************************");
            let matchPercent = await cmpPlainText(text.toLowerCase(), element.toLowerCase())
            if (matchPercent > 80 || lowerCaseText.match(new RegExp(element.toLowerCase()))) {
                console.log(element + " is found at position " + lowerCaseText.indexOf(element.toLowerCase()));
                return {
                    'match': element,
                    'exStatus': 200,
                    'matchPercent': matchPercent
                };
            }
        }

        return {
            'match': '',
            'exStatus': 400
        }
    }

    return "Error: the text provided doesn't contain any words!"
}