const puppeteer = require('puppeteer');
const chalk = require('chalk')

let URL = 'https://www.scientificrobo.com/';
let links = (async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 926
    });
    await page.goto(URL);

    // get job details
    let jobData = await page.evaluate(() => {
        let jobs = [];
        // get the job elements
        let jobsElms = document.querySelectorAll("#main > div.wrapper-joblist > table > tbody > tr");
        // get the job data
        jobsElms.forEach((jobelement) => {
            let jobJson = {};
            try {
                jobJson.title = jobelement.querySelector("td:nth-child(1) > a").innerText;
                jobJson.URL = document.querySelector("td:nth-child(1) > a").href
                jobJson.location = jobelement.querySelector("td:nth-child(3)").innerText

            } catch (exception) {

            }
            jobs.push(jobJson.URL);

        });

        return jobs
    });
    // console.log(jobData)

    let jobUrls = await jobData;
    console.log(jobUrls)
    var finalData = await Promise.all(


        jobUrls.slice(1, 20).map(async element => {
            // console.log(chalk.red(element))
            const page = await browser.newPage(element);
            let resultData = [];
            // console.log(element);
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            );
            await page.setViewport({
                width: 1366,
                height: 768
            });
            try {
                await page.goto(element, {
                    networkIdle2Timeout: 900000,
                    waitUntil: "networkidle2",
                    timeout: 800000
                });
                await page.waitFor(3000)

                let pageInfo = await page.evaluate(() => {

                    let jobDescription = document.querySelector("div.entry-content").innerText
                    // console.log(document.querySelector("div.entry-content").innerText)

                    return {

                        'jobDescription': jobDescription
                    };
                });
                resultData.push(pageInfo);
                return resultData;
            } catch (error) {
                console.log(error)
                console.log("================================error================================================")
            } finally {
                setTimeout(() => page.close(), 20000);
            }
        }));

    console.log(finalData);
})();

// await console.log(links)


// console.log(jobs)
// for (i of jobs) {
//     await page.newPage(i.URL);
//     let details = [];
//     let jobJson = {};
//     try {
//         jobJson.jobDescription = jobelement.querySelector("div.entry-content").innerText

//     } catch (exception) {

//     }
//     details.push(jobJson);
//     console.log(details)
// }