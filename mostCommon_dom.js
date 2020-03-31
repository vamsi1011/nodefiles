var URL = require("url");
var _ = require("underscore");
var chalk = require("chalk");
var testingArray1 = require('./alllinksVar/var205.js');
var request = require("request");
var rp = require('request-promise');
var roundround = require("roundround")
var arrayCounter = require("array-counter");
var pc_len = 0;
var servers = ['http://34.220.92.196:8121/htmlPlainText',
    'http://54.201.250.85:8121/htmlPlainText',
    'http://34.219.200.19:8121/htmlPlainText',
    'http://54.185.163.132:8121/htmlPlainText',
    'http://54.187.1.8:8121/htmlPlainText',
    'http://54.190.133.207:8121/htmlPlainText',
    'http://34.209.119.176:8121/htmlPlainText',
    'http://54.214.143.211:8121/htmlPlainText',
    'http://34.218.210.46:8121/htmlPlainText',
    'http://34.219.248.226:8121/htmlPlainText',
    'http://34.208.177.185:8121/htmlPlainText',
    'http://34.221.26.170:8121/htmlPlainText',
    'http://34.217.51.100:8121/htmlPlainText',
    'http://34.220.16.139:8121/htmlPlainText',
    'http://54.213.92.88:8121/htmlPlainText',
    'http://54.202.251.82:8121/htmlPlainText',
    'http://34.216.237.121:8121/htmlPlainText',
    'http://54.203.6.108:8121/htmlPlainText',
    'http://34.211.193.74:8121/htmlPlainText',
    'http://35.162.187.168:8121/htmlPlainText'
]
var pc = ["http://18.220.167.35:8852/callPageCheck",
    "http://54.201.250.85:8854/callPageCheck",
    "http://34.219.200.19:8854/callPageCheck",
    "http://34.216.237.121:8854/callPageCheck",
    'http://54.203.6.108:8854/callPageCheck',
    'http://34.211.193.74:8854/callPageCheck',
    'http://35.162.187.168:8854/callPageCheck'
]
var pc_resp = []
var domains = []
var domains_val = []
var selecteddomains = []


let pathArray = [];



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
            console.log(chalk.red("ends with : ") + element + " found");
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
            console.log(chalk.red("double slash-nojob : ") + url);
            return true;
        }
    }
    if (url.split('/').length == 5) {
        if (url.slice(url.lastIndexOf('/'), -1).length == 0) {
            console.log(chalk.red("double slash : ") + url)
            return true;
        }
    }

    return false;
}



(async () => {
    let start = Date.now();
    // console.log(chalk.blue("--------------------------------------------"));
    // console.log(chalk.blue(Date.now() - start + " (ms)Start "));
    //const urlParse = URL.parse(testingArray[0]);
    //console.log(urlParse);

    await Promise.all(
        testingArray1.map(async element => {
            var urlParse = URL.parse(element);
            domains.push(urlParse.host);
        })
    );

    domains = await arrayCounter(domains);

    for (let [key, value] of Object.entries(domains)) {
        domains_val.push({
            "domain": `${key}`,
            "repeat": value
        })
        // console.log(`${value}`)

    }
    domains_val.sort(function (a, b) {
        return b.repeat - a.repeat
    })

    for (let i = 0; i < 5; i++) {
        if (typeof domains_val[i] != 'undefined') {
            selecteddomains.push(domains_val[i])
        }
    }

    testingArray1 = await testingArray1.filter(element => {
        return !selectDomains(element)
    })


    const testingArray = await testingArray1.filter(element => {
        // console.log(!endsWithUrl(element))
        return !endsWithUrl(element)
    })

    // console.log(testingArray)
    async function CommonString(cs_arr) {
        console.log("============== array for common string ===================================")
        // console.log(cs_arr)

        await Promise.all(
            cs_arr.map(async element => {
                console.log(element)

                if (typeof element.perfectJobs == 'string') {
                    var urlParse = URL.parse(element.perfectJobs)

                    if (urlParse.hash != null) {
                        pathArray.push(urlParse.hash);
                    } else {
                        pathArray.push(urlParse.path);
                    }
                    // console.log(chalk.green(element.perfectJobs))
                }
            })
        );
        console.log("============== array for common string ===================================")
        // console.log(pathArray)
        pathArray = await spliting(pathArray);
        pathArray = Array.prototype.concat.apply([], pathArray);
        pathArray = await pathArray.filter(function (el) {
            return el != null && el != "" && el != "/";
        });

        // console.log(pathArray)
        pathArray = await arrayCounter(pathArray);
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
            await Promise.all(pathString.map(async element => {
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
        var longest_new = ""
        // let longest_final = longest.slice(0, -1);

        longest_new = longest
        console.log(longest_new.replace(/\d+$/, ""))
        console.log(chalk.blue(Date.now() - start + " (ms) got Highest Common String"));
        console.log(chalk.red("--------------------------------------------"));
    }
    var arr = []

    if (testingArray.length <= 60) {
        div = testingArray.length
    } else {
        div = 60
    }
    var len = testingArray.length / div

    let i = 0
    while (i < div) {
        arr.push(Math.round(len * i))
        i = i + 1
    }
    // console.log(arr)
    var pc_links = []
    await Promise.all(
        arr.map(async element => {
            pc_links.push({
                sno: element,
                url: testingArray[element]
            })
        }));
    var hp_arr = []
    console.log(pc_links)
    let ht_url = roundround(servers)
    let pc_api = roundround(pc)
    await Promise.all(pc_links.map(async element => {
        htmlPlainText(element.url)
        // console.log(chalk.green("requesting to : ") + ht_url())
        async function htmlPlainText(url) {
            return await new Promise((resolve, reject) => {
                var formData = {
                    "joburl": url,
                }
                var options = {
                    url: ht_url(),
                    method: 'POST',
                    json: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: formData
                };
                async function callback(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // console.log("================DATA HTML API=====================");
                        // console.log(body)
                        var data = body.jobBody
                        // await console.log(data)
                        await hp_arr.push({
                            text: data,
                            url: element.url
                        })

                        API_URI = pc_api()
                        console.log(API_URI)
                        let pageCheck = await IS_Job(element.url, data, API_URI)
                        pageCheck = JSON.parse(pageCheck)
                        console.log(pageCheck.Status)

                        if (typeof element.url == "string") {

                            if (pageCheck.Status == true) {
                                pc_resp.push({
                                    perfectJobs: element.url
                                })
                            } else {
                                pc_resp.push({
                                    noJobs: element.url
                                })
                            }
                        }
                        // console.log(pageCheck)

                        resolve(data);

                    } else {
                        resolve({
                            'error': error
                        })
                    }
                    print_hp()
                }
                var response = request(options, callback);

            });
        }
    }))


    async function print_hp() {
        pc_len = pc_len + 1
        console.log("waiting for link : " + pc_resp.length)
        if (pc_len == (60)) {
            CommonString(pc_resp)
            console.log(chalk.blue(Date.now() - start + " (ms) for page check positive url's"));
        }
    }


})();


async function spliting(arrayVal) {
    try {
        let data = [];
        //console.log("--------------------------------------------");

        for (let index = 0; index < arrayVal.length; index++) {
            const val = arrayVal[index];
            let valArray = val.split("");
            finalStringLen = valArray.length;
            let i = 0;
            while (i !== finalStringLen + 1) {
                let stringData = await valArray.slice(0, i).join("");
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
async function IS_Job(joburl, jobbody, API_URL) {
    try {
        //var dataString = 'url=' + encodeURIComponent(joburl) + '&html=' + encodeURIComponent(jobhtml) + '&text=' + (jobbody);
        var options = {
            method: 'POST',
            url: API_URL,
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