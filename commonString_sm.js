const puppeteer = require('puppeteer');
var allLinks = require("./mostCommonSubstringVariables.js");
var rp = require('request-promise');
var request = require('request')


const width = 1920,
    height = 1080;
const C_HEADELESS = false;
const C_SLOWMOTION = 0;

(async () => {
    nthLink = Math.round(allLinks.length / 14);
    console.log(nthLink)
    let newArrayLinks = [];
    for (let i = 1; i < 14; i++) {
        await newArrayLinks.push(allLinks[nthLink * i])
    }
    await Promise.all(
        newArrayLinks.map(async (url) => {
            let jobbody = await htmlPlanText(url);
            await console.log(jobbody.html);
            //   let isJob= await IS_Job(url,jobbody.html,jobbody.jobBody, 'http://18.220.167.35:8852/callPageCheck')
            // console.log(isJob);
        })
    )

    //  htmlPlanText(newArrayLinks[2]);
})()





async function htmlPlanText(url) {
    var OccCat_array = {};
    return await new Promise((resolve, reject) => {
        var formData = {
            "joburl": url,

        }
        var options = {
            url: 'http://localhost:8121/htmlPlainText',
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
                await resolve(body);

            } else {
                resolve({
                    'error': error
                })
            }
        }
        var response = request(options, callback);
    });
}



async function IS_Job(joburl, jobhtml, jobbody, API_URL) {
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
                html: "",
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