var URL = require("url");
var _ = require("underscore");
var chalk = require("chalk");
var testingArray1 = require('./mostCommonSubstringVariables.js');
var request = require("request");
var rp = require('request-promise');
var roundround = require("roundround")
var arrayCounter = require("array-counter");
var servers = ['http://localhost:8121/htmlPlainText']
var pc_res = []



let pathArray = [],
    paginationSelector = "&beg=";

function endsWithUrl(url) {
    var endwithData = ['email-alerts/', 'activate-privacy-policy.html', 'privacy-policy/', 'homepage.htm', 'services.html', '/terms-and-conditions.html', '/careers.html', 'login.xhtml', 'faq', 'careers', 'terms-of-use', 'privacy-notice', 'news', 'about-us', '/contact/', '?searchphrase=', '/staff', '/services', "/feedback", "search.html",
        "savedJobs.html", "MyChart/", "save_job/",
        "terms-and-conditions", "/faqs", "/career-areas",
        "company.html",
        ".com/apply/",
        "prem-offline-form",
        '/search-and-apply/', 'feed.atom', '/create', '/jobs/#', '/jobs/#go', '/jobs/', '=Filter+by+Keywords&', 'job_function=-1', 'employment-opportunities/', 'order=ASC', 'irving',
        "careers/#", "/patients", "/forgot", "Research & Innovation", "Patients & Visitors", "terms/", "/refer", '/responsibility', '/terms-conditions', "/services", ".org/", "our-story/", "forms/", 'save_job/', 'open-positions/', 'topjobs/', '/google-translate', '.edu/', '.org/', '/volunteer', '/join', '/privacy/', '/pay-your-bill', '/terms/', '/pay-a-bill', '/submissions', '/about', '/privacy', '/search', '/your-application', '/blog', '/job_search#', '.ca//', '/contact-emerald/', '/talk-to-us/', '/connect.html', '.com/', '/contact-us.html', '/contact-us', '/contact', '/contact.html', 'contactus', 'aboutus'
    ]
    var Patterns = ['maps?q=', 'login', '.pdf', '/content/', '&pageno=', '/about-Us/', 'aboutus', 'contactus', 'sign-in', '/about/careers/', '/social-responsibility/',
        '/jobs/job-search/', '/postings/all', 'page_job=', '/jobs/resume', '&pagenum=', '?pageNum=', 'page_jobs=', '/jobsearch.ftl', '/joblist.rss', 'plus.google.com', 'googleads.g.doubleclick.net', '/location/', '/category/', 'youtube.com', 'gmail.com', 'twitter.com', 'linkedin.com', 'page_jobs=', '?facetcategory=', '?facetcategory=', '?facetcountry=', '/listings.html', 'twitter.com', '&pageNum=', 'pages=', '/jobs/in/', 'jobOffset=', '?folderOffset=', '&paged=', '#page-', '?pg=', 'PGNO=', 'Page-', 'startrow=', 'page-', 'startRow=', '#||||', '|||||', 'p=', 'offset=', 'pagenumber=', 'Pagenumber=', 'pageNumber='
    ]
    for (let index = 0; index < endwithData.length; index++) {
        const element = endwithData[index];
        if (url.endsWith(element)) {
            console.log(element + " found");
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

    return false;
}



(async () => {
    let start = Date.now();
    // console.log(chalk.blue("--------------------------------------------"));
    // console.log(chalk.blue(Date.now() - start + " (ms)Start "));
    //const urlParse = URL.parse(testingArray[0]);
    //console.log(urlParse);

    const testingArray = await testingArray1.filter(element => {
        // console.log(!endsWithUrl(element))
        return !endsWithUrl(element)

    });
    // console.log(testingArray)
    async function CommonString(cs_arr) {
        console.log("============== array for common string ===================================")
        // console.log(cs_arr)

        await Promise.all(
            cs_arr.map(async element => {
                if (typeof element.perfectJobs == 'string') {
                    var urlParse = URL.parse(element.perfectJobs);

                    if (element.perfectJobs.indexOf(paginationSelector) <= -1) {
                        pathArray.push(urlParse.path);
                        console.log(element.perfectJobs)
                    }
                }

                //console.log("path=" + urlParse.pathname);
            })
        );
        console.log("============== array for common string ===================================")

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
        topValue = pathString[0].value
        await Promise.all(pathString.map(async element => {
            if (((element.value / topValue) * 100) > 95) {
                myStrings.push(element.str)
                myvalues.push({
                    "string": element.str,
                    "value": element.value
                })
            }
        }))
        // console.log((ele.value / topValue) * 100)

        console.log(myvalues)
        // console.log(myStrings)
        var longest = myStrings.sort(function (a, b) {
            return b.length - a.length;
        })[0]
        var longest_new = ""
        let longest_final = longest.slice(0, -1);
        // console.log(chalk.yellow(longest_final))
        // console.log(chalk.yellow(longest))
        for (el of pathString) {

            if (el.str.includes(longest_final)) {
                // console.log(chalk.blue(el.str) + "-----------------")
                if (el.str.length == longest.length) {
                    longest_new = longest
                } else {
                    longest_new = longest_final
                }
            }
        }
        console.log(longest_new.replace(/\d+$/, ""))
        console.log(chalk.blue(Date.now() - start + " (ms) got Highest Common String"));

        // console.log(await pathArray.toString())
        // let valueToSearch = pathArray[mostRepeated];
        console.log(chalk.red("--------------------------------------------"));
    }
    var arr = []

    var len = testingArray.length / 40



    let i = 0
    while (i < 40) {
        arr.push(Math.round(len * i))
        i = i + 1
    }
    // console.log(arr)
    var pc_links = []
    await Promise.all(
        arr.map(async element => {
            // console.log(testingArray[element])
            pc_links.push({
                sno: element,
                url: testingArray[element]
            })
            // pc_links has the picked links from array
        }));
    var hp_arr = []
    // console.log(pc_links)

    let ht_url = roundround(servers)
    await Promise.all(pc_links.map(async element => {
        htmlPlainText(element.url)
        console.log(ht_url())
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
                        API_URI = "http://localhost:8854/callPageCheck";
                        let pageCheck = await IS_Job(element.url, data, API_URI)
                        pageCheck = JSON.parse(pageCheck)
                        // console.log(pageCheck.Status)
                        if (pageCheck.Status == true) {
                            pc_res.push({
                                perfectJobs: element.url
                            })
                        } else {
                            pc_res.push({
                                noJobs: element.url
                            })
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
        if (pc_res.length == 39) {
            CommonString(pc_res)
            console.log(chalk.blue(Date.now() - start + " (ms) got page check output "));
        }
    }





    // console.log(mostRepeated);
    // console.log(chalk.blue(Date.now() - start + " (ms)Finished "));

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

        //console.log("--------------------------------------------");
        //console.log("returing");
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