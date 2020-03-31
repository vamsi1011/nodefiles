// var allLinksVar = require("./alllinksvar100");
var rp = require('request-promise');
var roundround = require("roundround")
var request = require('request');
var URL = require('url');

var chalk = require('chalk');
var fs = require('fs');
var arrayCounter = require('array-counter');
var config = require('./config.js');
const servers = config.servers;
const http = config.http;
const HTTP_PORT = config.HTTP_PORTS;
var jobSelectors = config.jobSelectors;
const log = config.log;
const bodyParser = config.bodyParser;
const serverRound = roundround(servers);
const randomIntFromInterval = config.randomIntFromInterval;
var _ = config._;
const express = require('express');
var pc = [
    // "http://18.220.167.35:8852/callPageCheck",
    "http://54.201.250.85:8854/callPageCheck",
    "http://34.219.200.19:8854/callPageCheck",
    "http://34.216.237.121:8854/callPageCheck",
    //     'http://54.203.6.108:8854/callPageCheck',
    'http://34.211.193.74:8854/callPageCheck',
    //     'http://35.162.187.168:8854/callPageCheck'
]
const app = express();
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
    .listen(HTTP_PORT[0], () =>
        console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT[0])
    );
server.timeout = 240000;
app.post('/HCS', async (req, res) => {
    const start = Date.now();
    console.log("********************************************************************************************");
    const finalResponse = await process1(start, req.body);
    console.log("********************************************************************************************");
    res.send(finalResponse)

});



//endswith function for removing some career links so that we can send mostly job links 
function endsWithUrl(url) {
    var endwithData = ['index.html', 'services.php', 'index.php', 'search-jobs-v8/', 'search-apply1/', 'search-apply1', '/overview', 'overview/', 'hudl-applicant-and-candidate-privacy-policy', 'support', 'signup', '.pdf', 'index.shtml', 'hiring-process', 'benefits', 'subscribe/', '.gov/', 'about/', 'careers/', 'jobs-engineer', 'contact.html', 'search/', 'email-alerts/', 'activate-privacy-policy.html', 'privacy-policy/', 'homepage.htm', 'services.html', '/terms-and-conditions.html', '/careers.html', 'login.xhtml', 'faq', 'careers', 'terms-of-use', 'privacy-notice', 'news', 'about-us', '/contact/', '?searchphrase=', '/staff', '/services', "/feedback", "search.html", 'ViewFAQ.aspx',
        "savedJobs.html", "MyChart/", "save_job/",
        "terms-and-conditions", "/faqs", 'faqs.html', "/career-areas", '/benefits.html',
        "company.html",
        ".com/apply/",
        "prem-offline-form", "/research",
        '/search-and-apply/', 'feed.atom', '/create', '/jobs/#', '/jobs/#go', '/jobs/', '=Filter+by+Keywords&', 'job_function=-1', 'employment-opportunities/', 'order=ASC', 'irving',
        "careers/#", "/patients", "/forgot", "Research & Innovation", "Patients & Visitors", "terms/", "/refer", '/responsibility', '/terms-conditions', "/services", ".org/", "our-story/", "forms/", 'save_job/', 'open-positions/', 'topjobs/', '/google-translate', '.edu/', '.org/', '/volunteer', '/join', '/privacy/', '/pay-your-bill', '/terms/', '/pay-a-bill', '/submissions', '/about', '/privacy', '/search', '/your-application', '/job_search#', '.ca//', '/contact-emerald/', '/talk-to-us/', '/connect.html',
        '/contact-us.html', '/contact-us', '/contact', '/contact.html', 'contactus', 'aboutus'
    ]
    var Patterns = ['whatsapp.com', 'tumblr.com', 'linkedin.com', 'facebook.com', 'twitter.com', 'google.com', 'instagram.com', 'youtube.com', 'jobs?', 'jb_search_results', 'results_page=', 'jobs?page=', 'com/job-categories', '?pagesize=', '/page', 'download', '/downloads/', '/introduction/', '/resources/', '/products', "/our-team", 'terms-of-use', 'contact-us', 'product-category', '/sustainability/', 'meet-our-people', 'site-support', 'why-work-us', 'investors-media', '/media-contacts/', '/media-library', 'our-business', '/professional-areas/', '/terms-use/', '/our-stories', 'webSyncID=', '/products/', 'sort_by=', '/creative/', '/page/', 'view-all-our-open-jobs', '/about-us/', 'maps?q=', 'login', '.pdf', '/content/', '&pageno=', '/about-Us/', 'aboutus', 'contactus', 'sign-in', '/about/careers/', '/social-responsibility/',
        '/jobs/job-search/', '/postings/all', '?page=', 'page_job=', '/jobs/resume', '&pagenum=', '?pageNum=', 'page_jobs=', '/jobsearch.ftl', '/joblist.rss', 'plus.google.com', 'googleads.g.doubleclick.net', '/location/', '/category/', 'youtube.com', 'gmail.com', 'twitter.com', 'linkedin.com', 'page_jobs=', '?facetcategory=', '?facetcategory=', '?facetcountry=', '/listings.html', 'twitter.com', '&pageNum=', 'pages=', '/jobs/in/', 'jobOffset=', '?folderOffset=', '&paged=', '#page-', '?pg=', 'PGNO=', 'startrow=', 'startRow=', '#||||', '|||||', 'offset=', 'pagenumber=', 'Pagenumber=', 'pageNumber=', '/about-us', "/contact-us/", "/community/", "/research/"
    ]
    if (url.split('/').length < 5) {
        if (!(url.slice(url.lastIndexOf('/'), -1).includes('=') ||
                url.slice(url.lastIndexOf('/'), -1).includes('?')
            )) {
            return true;
        }
    } else if (url.split('/').length <= 5) {
        if (url.slice(url.lastIndexOf('/'), -1).length == 0) {
            let urlParse = URL.parse(url);
            if (!(urlParse.path.includes('=') || urlParse.path.includes('-'))) {
                return true;
            }
        }
    }
    for (let index = 0; index < endwithData.length; index++) {
        const element = endwithData[index];
        if (url.endsWith(element)) {
            return true;
        }
    }
    for (let index = 0; index < Patterns.length; index++) {
        const element = Patterns[index];
        if (url.toLowerCase().indexOf(element) >= 0) {
            if (element == '/search') {
                if (url.toLowerCase().indexOf('/search/job/') >= 0 ||
                    url.toLowerCase().indexOf('/search-and-apply/') >= 0 ||
                    url.toLowerCase().indexOf('/search/apply/all/') >= 0 ||
                    url.toLowerCase().indexOf('/search-jobs/jobdetails') >= 0) {
                    return false;
                }
            }
            console.log(element + " found");
            return true;
        }
    }

    return false;
}
//main function to get HCS
async function process1(start, params) {
    // console.log(params)
    let careerLink = params.joburl;
    let dataSet = await allLinksApi(careerLink);
    dataSet = JSON.parse(dataSet)
    let joburl = careerLink;
    let links = dataSet;
    if (dataSet.hasOwnProperty('success')) {
        links = dataSet.success
    }
    let domain = await domainGetter(joburl)
    if (domain.indexOf('workday') >= 0 || domain.indexOf('icims') >= 0)
        return links;
    let jobs = [],
        noJobs = [];
    await Promise.all(
        links.map(async data => {
            if (!endsWithUrl(data.Link)) {
                jobs.push(data)
            } else {
                noJobs.push(data)
            }
        })
    )
    // return {jobs,noJobs}
    let totalJobsCount = jobs.length,
        noJobsCount = noJobs.length,
        totalLinks = links.length
    let indexSelector = 1;
    if (totalJobsCount > 50) {
        indexSelector = Math.round(totalJobsCount / 50);
        if (indexSelector <= 1) {
            indexSelector = 2
        }
    };
    console.log("jobs..............................")
    console.log(jobs)
    var jobUrls = _.uniq(_.map(jobs, 'Link'));
    console.log("joburls.................................");
    console.log(jobUrls);
    console.log(indexSelector)
    let HCSCheck = [];
    for (let i = 0; i < jobUrls.length; i++) {
        if (i % indexSelector == 0 && jobUrls[indexSelector * i] != null) {
            HCSCheck.push(jobUrls[indexSelector * i]);
        }
    }
    console.log("hcs check")
    console.log(HCSCheck)
    var mostCommonString = await mostCommonSubstring(HCSCheck);
    console.log("1st common string", mostCommonString)
    //    let is_commonString=await Promise.all(
    var is_commonString = "";
    jobSelectors.forEach(selector => {
        if ((mostCommonString.toLowerCase().indexOf(selector.toLowerCase()) != -1 || selector.toLowerCase().indexOf(mostCommonString.toLowerCase()) != -1) && mostCommonString != "") {
            is_commonString = selector;
        }

    })
    //    )
    console.log("iscommon string", is_commonString)
    //    console.log(is_commonString)
    if (is_commonString != "") {
        let jobUrls2 = await jobs.filter(element => {
            return element.Link.includes(mostCommonString)
        });
        return {
            "HCS": mostCommonString,
            "allLinks": links,
            "perfectJobs": jobUrls2,
            "perfectJobCount": jobUrls2.length
        }
    } else {

        let htmlJobs = []
        await Promise.all(
            jobUrls.map(async url => {
                if (jobUrls.indexOf(url) % indexSelector == 0) {
                    let data = await apiRequestFuntionForHTML(start, url, '/htmlPlainText', false);
                    data.url = url;
                    htmlJobs.push(data);
                }
            })
        )
        log(start, joburl, "HTML JOBS DONE");
        let pc_api = roundround(pc);
        let pageCheckJob = [],
            pageCheckNoJob = []
        await Promise.all(
            htmlJobs.map(async data => {
                // console.log(data.url+" is came for processing");
                API_URI = pc_api()
                // console.log(API_URI)
                let pageCheck = await IS_Job(data.url, data.jobBody, API_URI);
                pageCheck = JSON.parse(pageCheck);
                // console.log(pageCheck.Status+" is came for processing");
                if (pageCheck.Status == true) {

                    pageCheckJob.push(data.url)
                } else {
                    pageCheckNoJob.push(data.url)
                }
            })
        )
        log(start, joburl, "PAGE CHECK DONE");


        mostCommonString = await mostCommonSubstring(pageCheckJob);
        jobUrls2 = await jobs.filter(element => {
            return element.Link.includes(mostCommonString)
        });
        // console.log(jobUrls2);
        console.log(mostCommonString)

        return {
            "HCS": mostCommonString,
            "allLinks": links,
            "pageCeckUrls": pageCheckJob,
            "perfectJobs": jobUrls2,
            "perfectJobCount": jobUrls2.length
        }
    }

}
let ht_url = roundround(servers)
// to get html plan text API calling from routes1.js
function apiRequestFuntionForHTML(start, joburl, API, method) {
    try {
        var API_Endpoint = "",
            API_url = ""
        joburl = decodeURIComponent(joburl);
        API_Endpoint = serverRound() + ':' + randomIntFromInterval(8121, 8125)
        if (API == '/htmlPlainText' || API == '/singlePage' || API == '/scrolling') {
            API_url = API_Endpoint + API;

        } else {
            API_url = API_Endpoint + API
        }
        //console.log(Date.now() - start + "(ms) Making Request to " + API_url);
        var Options = {
            url: API_url,
            strictSSL: true,
            headers: {
                'content-type': 'application/json'
            },
            method: "POST",
            //timeout: 120000,
            json: true,
            body: {
                "joburl": joburl,
                "bigmlStatus": method
            }
        }
        return rp(Options);
    } catch (error) {
        console.log("error in apiRequestFuntionForHTML:" + error);
        return []
    }
}
//python API calling Function 
async function IS_Job(joburl, jobbody, API_URI) {
    try {


        var options = {
            method: 'POST',
            url: API_URI,
            headers: {
                'Postman-Token': 'fa1d2ed6-9bdc-44db-b738-0401b372ea48',
                'cache-control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                url: joburl,
                html: "",
                text: jobbody,
            }
        };
        return rp(options);
    } catch (error) {
        console.log("Had an Error in Bigml Request Function==>" + error);
        return {};
    }
}
//most common string from selectedurls of array
async function mostCommonSubstring(testingArray1) {
    try {
        console.log("into mostcommon string")
        let pathArray = [];
        await Promise.all(
            testingArray1.map(async element => {
                const urlParse = URL.parse(element);
                if (urlParse.hash != null && urlParse.path == null) {
                    pathArray.push(urlParse.hash);
                } else if (urlParse.hash != null) {
                    pathArray.push(urlParse.hash);
                    pathArray.push(urlParse.path);
                } else {
                    pathArray.push(urlParse.path);
                }
            })
        );
        pathArray = await spliting(pathArray);
        // console.log(pathArray)
        pathArray = Array.prototype.concat.apply([], pathArray);
        // 
        pathArray = await pathArray.filter(function (el) {
            return el != null && el != "";
        });
        pathArray = await arrayCounter(pathArray);
        let pathString = []
        let myStrings = []
        for (let [key, value] of Object.entries(pathArray)) {
            if (key.length > 3) {
                pathString.push({
                    "str": `${key}`,
                    "value": value
                })
            }
            pathString.sort(function (a, b) {
                return b.value - a.value
            })

        }
        // console.log(chalk.blue(pathString))

        topValue = pathString[0].value
        await Promise.all(pathString.map(async element => {
            if (((element.value / topValue) * 100) > 85) {
                myStrings.push(element.str)

            }
        }))

        var longest = myStrings.sort(function (a, b) {
            return b.length - a.length;
        })[0]
        console.log(chalk.yellow(longest))
        if (longest.lastIndexOf('=') > longest.lastIndexOf('/')) {
            longest = longest.slice(0, longest.lastIndexOf('=') + 1);
        } else if (longest.lastIndexOf('.') > longest.lastIndexOf('/')) {
            longest = longest.slice(0, longest.lastIndexOf('.') + 1);
        } else if (longest.lastIndexOf('-') > longest.lastIndexOf('/')) {
            longest = longest.slice(0, longest.lastIndexOf('-') + 1);
        } else if (longest.includes('/')) {
            if (longest.slice(0, longest.lastIndexOf('/')).includes('/')) {
                longest = longest.slice(0, longest.lastIndexOf('/') + 1);
            };
        }
        return longest.replace(/\d+$/, "");
    } catch (error) {
        return ""
    }
}
//this function for mostCommonSubstring
async function spliting(arrayVal) {
    let data = [];
    console.log("--------------------------------------------");
    for (let index = 0; index < arrayVal.length; index++) {
        const val = arrayVal[index];
        let valArray = val.split("");
        finalStringLen = valArray.length;
        let i = 0;
        while (i !== finalStringLen + 1) {
            let stringData = await valArray.slice(0, i).join("");
            if (stringData.length > 4)
                data.push(stringData);
            i = i + 1;
        }
    };
    // console.log("--------------------------------------------");
    console.log("returing");
    return data;

}
async function domainGetter(joburl) {
    const urlParse = URL.parse(joburl);
    console.log("Domain=" + urlParse.hostname);
    return urlParse.hostname;
}
async function allLinksApi(careerLink) {
    try {
        var API_Endpoint = "",
            API_url = ""
        API_Endpoint = serverRound() + ':' + 8130;
        let API = '/marketingTool';

        API_url = API_Endpoint + API;
        //console.log(API_url)

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
                "navigationLimit": 60,
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