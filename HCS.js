var URL = require("url");
var _ = require("underscore");
var chalk = require("chalk");
// var testingArray1 = [];
var request = require("request");
var rp = require('request-promise');
var http = require('http');
var roundround = require("roundround");
var bodyParser = require('body-parser');
const express = require('express');
var testingArray1 = require('./variables/var132.js');
var arrayCounter = require("array-counter");
var pc_len = 0;
var pc_links = [];
var servers = ['http://localhost:8236']
var pc = ["http://104.251.210.66/callPageCheck",
    "http://104.251.210.98/callPageCheck",
    "http://104.251.210.165/callPageCheck",
    "http://104.251.210.166/callPageCheck",
    "http://104.251.210.167/callPageCheck",
    "http://104.251.210.168/callPageCheck",
    "http://104.251.210.169/callPageCheck",
    "http://104.251.210.170/callPageCheck",
    "http://104.251.210.171/callPageCheck",
    "http://104.251.210.172/callPageCheck",
    "http://104.251.210.173/callPageCheck",
    "http://104.251.210.174/callPageCheck",
    "http://104.251.210.175/callPageCheck",
    "http://104.251.210.176/callPageCheck",
    "http://104.251.210.177/callPageCheck",
    "http://104.251.210.178/callPageCheck",
    "http://104.251.210.179/callPageCheck",
    "http://104.251.210.180/callPageCheck",
    "http://104.251.210.181/callPageCheck",
    "http://104.251.210.182/callPageCheck",
    "http://104.251.210.183/callPageCheck",
    "http://104.251.210.184/callPageCheck",
    "http://104.251.210.185/callPageCheck",
    "http://104.251.210.186/callPageCheck",
    "http://104.251.210.187/callPageCheck",
    "http://104.251.210.188/callPageCheck",
    "http://104.251.210.189/callPageCheck",
    "http://104.251.210.190/callPageCheck",
    "http://104.251.210.191/callPageCheck",
    "http://104.251.210.192/callPageCheck",
    "http://104.251.210.193/callPageCheck",
    "http://104.251.210.194/callPageCheck",
    "http://104.251.210.195/callPageCheck",
    "http://104.251.210.196/callPageCheck",
    "http://104.251.210.197/callPageCheck",
    "http://104.251.210.198/callPageCheck",
    "http://104.251.210.199/callPageCheck",
    "http://104.251.210.200/callPageCheck",
    "http://104.251.210.201/callPageCheck",
    "http://104.251.210.202/callPageCheck",
    "http://104.251.210.203/callPageCheck",
    "http://104.251.210.204/callPageCheck",
    "http://104.251.210.205/callPageCheck",
    "http://104.251.210.206/callPageCheck",
    "http://104.251.210.208/callPageCheck",
    "http://104.251.210.210/callPageCheck",
    "http://104.251.210.207/callPageCheck",
    "http://104.251.210.209/callPageCheck",
    "http://104.251.210.211/callPageCheck"
]
const serverRound = roundround(servers);
const pageCheckRound = roundround(pc);
var pc_resp = []
var domains_val = []
var selecteddomains = []
var hcs = "";

const app = express();

var start = Date.now();
var res = [];


app.use(bodyParser.urlencoded({
    'limit': '50mb',
    'extended': 'true'
}));
app.use(bodyParser.json({
    'limit': '50mb',
    'extended': 'true'
}));
var server = http
    .createServer(app)
    .listen(8120, () =>
        console.info("Run Sample Using ==> http://localhost:8120")
    );
server.timeout = 240000;
app.post('/HCS', async (req, res) => {
    const start = Date.now();
    console.log("********************************************************************************************");
    // console.log(req.body.joburl)
    const finalResponse = await process1(start, req.body.link);
    console.log("********************************************************************************************");
    res.send(finalResponse)

});


var link = "https://jobs.disneycareers.com/search-jobs?k=&alp=6252001-4155751&alt=3"

async function allLinksApi(careerLink) {
    console.log("-------------------------------------------------")
    try {

        var options = {
            method: 'POST',
            url: 'http://34.220.92.196:8130/marketingTool',
            headers: {
                'Postman-Token': 'fa1d2ed6-9bdc-44db-b738-0401b372ea48',
                'cache-control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                "joburl": careerLink,
                "navigationLimit": 20,
                "needed": "alllinks",
                "jobsRequired": 1000
            }
        };
        return rp(options);


    } catch (error) {
        console.log("Had an Error in Request Function==>" + error);
        return {};
    }
}

function selectDomains(url) {
    for (let index = 0; index < selecteddomains.length; index++) {
        const element = selecteddomains[index];
        if (url.includes(element)) {
            // console.log(chalk.red("domain : ") + element + " found");
            return false;
        }

    }
}


function endsWithUrl(url) {



    var endwithData = ['email-alerts/', 'activate-privacy-policy.html', 'privacy-policy/', 'homepage.htm', 'services.html', '/terms-and-conditions.html', '/careers.html', 'login.xhtml', 'faq', 'careers', 'terms-of-use', 'privacy-notice', 'news', 'about-us', '/contact/', '?searchphrase=', '/staff', '/services', "/feedback", "search.html",
        "savedJobs.html", "MyChart/", "save_job/",
        "terms-and-conditions", "/faqs", "/career-areas", 'jobs-by-category', 'jobs-by-location',
        "company.html", "/our-services", "/events",
        ".com/apply/",
        "prem-offline-form",
        '/search-and-apply/', 'feed.atom', '/create', '/jobs/#', '/jobs/#go', '/jobs/', '=Filter+by+Keywords&', 'job_function=-1', 'employment-opportunities/', 'order=ASC', 'irving',
        "careers/#", "/patients", "/forgot", "Research & Innovation", "Patients & Visitors", "terms/", "/refer", '/responsibility', '/terms-conditions', "/services", ".org/", "our-story/", "forms/", 'save_job/', 'open-positions/', 'topjobs/', '/google-translate', '.edu/', '.org/', '/volunteer', '/join', '/privacy/', '/pay-your-bill', '/terms/', '/pay-a-bill', '/submissions', '/about', '/privacy', '/search', '/your-application', '/blog', '/job_search#', '.ca//', '/contact-emerald/', '/talk-to-us/', '/connect.html', '.com/', '/contact-us.html', '/contact-us', '/contact', '/contact.html', 'contactus', 'aboutus'
    ]
    var Patterns = ['maps?q=', 'login', '.pdf', '/job-categories/', '#page', '/content/', "/local-resources/", "listing-category", "listing_type", '/resources/', '&pageno=', '/about-Us/', 'aboutus', 'contactus', 'sign-in', '/about/careers/', '/social-responsibility/',
        '/jobs/job-search/', '/careersection/', '/postings/all', '&page=', 'page_job=', '/job-areas/', '/job-search/', '/about-us/', '/community/', '/research/',
        '/jobs/resume', '&pagenum=', '?pageNum=', 'page_jobs=', '/jobsearch.ftl', '/joblist.rss', 'plus.google.com', 'googleads.g.doubleclick.net', '/location/', '/category/', 'youtube.com', 'gmail.com', 'twitter.com', 'linkedin.com', 'page_jobs=', '?facetcategory=', '?facetcategory=', '?facetcountry=', '/listings.html', 'twitter.com', '&pageNum=', 'pages=', '/jobs/in/', 'jobOffset=', '?folderOffset=', '&paged=', '#page-', '?pg=', 'PGNO=', 'Page-', 'startrow=', 'page-', 'startRow=', '#||||', '|||||', 'p=', 'offset=', 'pagenumber=', 'Pagenumber=', 'pageNumber=', '/contact-us/', '/introduction/'
    ]



    for (let index = 0; index < endwithData.length; index++) {
        const element = endwithData[index];
        if (url.endsWith(element)) {
            //console.log(chalk.red("ends with : ") + element + " found");
            return true;
        }


    }
    for (let index = 0; index < Patterns.length; index++) {
        const element = Patterns[index];
        if (url.indexOf(element) >= 0) {
            if (element == '/search') {
                if (url.toLowerCase().indexOf('/search/job/') >= 0 ||
                    url.toLowerCase().indexOf('/search-and-apply/') >= 0 ||
                    url.toLowerCase().indexOf('/search/apply/all/') >= 0 ||
                    url.toLowerCase().indexOf('/search-jobs/jobdetails') >= 0) {
                    return false;
                }
            }
            //console.log(element + " found");
            return true;
        }
    }
    if (url.split('/').length < 5) {
        if (!(url.includes('=') || url.includes('-'))) {
            //console.log(chalk.red("double slash-nojob : ") + url);
            return true;
        }
    }
    if (url.split('/').length == 5) {
        if (url.slice(url.lastIndexOf('/'), -1).length == 0) {
            //console.log(chalk.red("double slash : ") + url)
            return true;
        }
    }

    return false;
}



async function process1(start, link) {
    var domains = [],
        selecteddomains = [],
        domains_val = [],
        filteredUrls = [],
        counter = {};
    //console.log(link)
    console.log(Date.now() - start + "(ms) into the Process1");
    console.log(Date.now() - start + "(ms) Started the process for all links");
    // let dataSet = await allLinksApi(link);
    // dataSet = JSON.parse(dataSet)
    let links = [];
    // if (dataSet.hasOwnProperty('success')) {
    //     links = dataSet.success
    // } else {
    //     links = dataSet;
    // }
    links = testingArray1;
    console.log(Date.now() - start + "(ms) done with all links");

    if (links.length >= 1) {
        console.log(Date.now() - start + "(ms) starting with domains pushing");
        await Promise.all(
            links.map(async element => {
                var urlParse = URL.parse(element);
                domains.push(urlParse.host);
            })
        );
        console.log(Date.now() - start + "(ms) done with domains pushing");
        counter = _.countBy(domains);
        domains_val = _.chain(counter).
        map(function (cnt, brand) {
                return {
                    domain: brand,
                    repeat: cnt
                }
            }).sortBy('repeat').reverse()
            .value();
        console.log(Date.now() - start + "(ms) done with domains arrayCounter");
        if (domains_val.length >= 5) {
            selecteddomains = domains_val.slice(0, 4)
        } else {
            selecteddomains = domains_val
        }
        selecteddomains = _.pluck(selecteddomains, 'domain');
        if (selecteddomains.length >= 1) {
            console.log(Date.now() - start + "(ms) starting filteredUrls");
            await Promise.all(
                links.map(async element => {
                    if (!selectDomains(element)) {
                        if (!endsWithUrl(element)) {
                            //console.log("returning " + element.Link);
                            filteredUrls.push(element)
                        }

                    }
                }));
            console.log(Date.now() - start + "(ms) done with filteredUrls");
            if (filteredUrls.length >= 1) {
                let divisionLength = filteredUrls.length
                if (filteredUrls.length >= 60) {
                    divisionLength = 60
                }
                var indexSelector = filteredUrls.length / divisionLength;
                let htmlProcessingUrls = [];
                console.log(Date.now() - start + "(ms) sending for html");
                await Promise.all(filteredUrls.map(async element => {
                    if (parseInt(filteredUrls.indexOf(element) % indexSelector) == 0) {
                        try {
                            let response = await apiRequestFuntionForHTML(start, element);
                            //response.joburl = element;
                            let ISJOB = await IS_Job(element, response.jobBody);
                            ISJOB = JSON.parse(ISJOB)
                            if (ISJOB.hasOwnProperty('Status') && ISJOB.Status == true)
                                // htmlProcessingUrls.push({
                                //     "url": element,
                                //     ISJOB
                                // });
                                htmlProcessingUrls.push(element)
                            //response.isJob = ISJOB.Status;
                            //htmlProcessingUrls = htmlProcessingUrls.concat();

                        } catch (error) {
                            console.log("error in htmlProcessingUrls" + error);
                        }
                    }
                    // console.log(chalk.green("requesting to : ") + ht_url())
                }))
                console.log(Date.now() - start + "(ms) done with html");
                //return htmlProcessingUrls;
                let commonString = "";
                if (htmlProcessingUrls.length) {
                    commonString = await CommonString(htmlProcessingUrls);
                    return {
                        commonString
                    }
                }
                return {
                    commonString
                }


            } else {
                console.log(Date.now() - start + "(ms) couldn't get the filteredUrls");
                return selecteddomains;
            }
        } else {
            console.log(Date.now() - start + "(ms) couldn't get the domains into selected domains");
            return selecteddomains;
        }

    } else {
        console.error(Date.now() - start + "(ms) couldn't get the links");
        return [];
    }





}
//html Request
function apiRequestFuntionForHTML(start, joburl) {
    try {

        //console.log(Date.now() - start + "(ms) Making Request to " + API_url);
        var Options = {
            url: serverRound(),
            strictSSL: true,
            headers: {
                'content-type': 'application/json'
            },
            method: "POST",
            //timeout: 120000,
            json: true,
            body: {
                "joburl": joburl,
                "bigmlStatus": false
            }
        }
        return rp(Options);
    } catch (error) {
        console.log("error in apiRequestFuntionForHTML:" + error);
        return []
    }
}

// page Check Request
async function IS_Job(joburl, jobbody) {
    try {
        //let pageCheckAPI = pageCheckRound()
        //var dataString = 'url=' + encodeURIComponent(joburl) + '&html=' + encodeURIComponent(jobhtml) + '&text=' + (jobbody);
        var options = {
            method: 'POST',
            url: pageCheckRound(),
            headers: {
                'Postman-Token': 'fa1d2ed6-9bdc-44db-b738-0401b372ea48',
                'cache-control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                url: joburl,
                text: jobbody,
                undefined: undefined
            }
        };
        return rp(options);
    } catch (error) {
        console.log("Had an Error in Bigml Request Function==>" + error);
        return {};
    }
}


function spliting(arrayVal) {
    try {
        let data = [];
        //console.log("--------------------------------------------");

        for (let index = 0; index < arrayVal.length; index++) {
            const val = arrayVal[index];
            let valArray = val.split("");
            finalStringLen = valArray.length;
            let i = 0;
            while (i !== finalStringLen + 1) {
                let stringData = valArray.slice(0, i).join("");
                if (stringData.length > 1)
                    data.push(stringData);
                i = i + 1;
            }
        };
        return data;
    } catch (error) {
        return []
    }

}



async function CommonString(cs_arr) {
    var pathArray = [];

    console.log("============== array for common string ===================================")
    // console.log(cs_arr)

    cs_arr.map(element => {
        console.log(element)

        if (typeof element == 'string') {
            var urlParse = URL.parse(element)

            if (urlParse.hash != null) {
                pathArray.push(urlParse.hash);
            } else {
                pathArray.push(urlParse.path);
            }
            // console.log(chalk.green(element.perfectJobs))
        }
    });

    console.log("============== array for common string ===================================")
    console.log(pathArray)

    pathArray = spliting(pathArray);
    pathArray = Array.prototype.concat.apply([], pathArray);
    pathArray = pathArray.filter(function (el) {
        return el != null && el != "" && el != "/";
    });

    // console.log(pathArray)
    pathArray = arrayCounter(pathArray);
    let pathString = []
    let myStrings = []
    // console.log(pathArray);

    for (let [key, value] of Object.entries(pathArray)) {
        if (key.length > 3) {
            pathString.push({
                "str": `${key}`,
                "value": value
            })
        }

        // console.log(`${value}`)

    }
    pathString.sort(function (a, b) {
        return b.value - a.value
    })


    // console.log(pathString)
    // return
    var myvalues = []
    try {
        topValue = pathString[0].value
        Promise.all(pathString.map(async element => {
            if (((element.value / topValue) * 100) > 94) {
                myStrings.push(element.str)
                myvalues.push({
                    "string": element.str,
                    "value": element.value
                })
            }
        }))
    } catch {
        console.log(chalk.red("No perfect Jobs from PageCheck"))
    }
    // console.log((ele.value / topValue) * 100)

    console.log(myvalues)
    // console.log(myStrings)
    var longest = myStrings.sort(function (a, b) {
        return b.length - a.length;
    })[0]

    hcs = longest.replace(/\d+$/, "")
    console.log(chalk.yellow(hcs))
    console.log(chalk.blue(Date.now() - start + " (ms) got Highest Common String"));
    console.log(chalk.red("--------------------------------------------"));
    return hcs;
}