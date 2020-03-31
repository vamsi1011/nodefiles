var URL = require("url");
var _ = require("underscore");
var chalk = require("chalk");
var request = require("request");
var rp = require('request-promise');
const puppeteer = require('puppeteer');

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://admin:jobiak@3.18.238.8:28015/admin";


async function getConnection(mongoUrl) {
    var client = await MongoClient.connect(
        mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    return client;
}

async function closeConnection(client) {
    await client.close();
    console.log("DB Session Ended");
    return "Session Closed";
}


(async () => {
    var client = await getConnection(mongoUrl);
    var db = await client.db('marketingTool')
    let start = Date.now();
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 926
    });
    console.log("opening categories page")
    await page.goto("https://www.glassdoor.com/sitedirectory/title-jobs.htm", {
        timeout: 600000
    });
    page.waitFor(10000)
    let alllinks = await page.evaluate(() => {
        var links_final = [],
            links = [];
        links = document.documentElement.querySelectorAll("#SiteDirectory div div div:nth-child(2) ul li")
        links.forEach((Element) => {
            let temp = "https://www.glassdoor.com" + Element.querySelector('a').getAttribute('href')
            let name = Element.querySelector('a').innerText
            links_final.push({
                "url": temp,
                "category": name
            })
        })
        console.log("got all category links")

        return links_final

    })
    page.close()
    let data = [],
        alllinks1 = [],
        y = 0;
    for (let i = 0; i < alllinks.length; i += 9) {
        y = i + 8
        alllinks1 = alllinks.slice(i, y)
        console.log("sending " + i + " to " + y)

        await category_sal(alllinks1)
    }
    async function category_sal(alllinks) {
        await Promise.all(alllinks.map(async Element => {
            // console.log("into each individual category and getting salary link")
            try {
                const page2 = await browser.newPage();
                await page2.setViewport({
                    width: 1920,
                    height: 926
                });
                await page2.goto(Element.url, {
                    timeout: 600000
                })
                var salary = await page2.evaluate((Element) => {
                    let slinks = [];
                    let salarylinks = document.documentElement.querySelectorAll("ul.undecorated > li > div");
                    salarylinks.forEach((slink) => {
                        let salarylink = "https://www.glassdoor.com" + slink.querySelector('a').getAttribute('href')
                        slinks.push({
                            "url": salarylink,
                            "category": Element.category
                        })
                    })
                    return slinks
                }, Element)
                await db.collection("glassdoor_salaries").insertMany(salary)
                console.log("inserted")
                data.push(salary)
                await page2.close()

            } catch (error) {
                console.log(error)
            }
            return salary
        }));
    }

    var merged = [].concat.apply([], data);
    // console.log("---------------------------------------------------------------------------------")
    // console.log(merged);
    // console.log("---------------------------------------------------------------------------------")
    // await db.collection("glassdoor_salaries").insertMany(merged)
    // console.log(sal_getter[0])

    let val = 0;
    let merged1 = [];
    while (val < merged.length) {
        console.log(val)
        console.log(merged.length)
        merged1 = merged.slice(val, val + 4)
        val = val + 5
        await salary_getter(merged1, browser, db)
    }

    await closeConnection(client);
})();

async function salary_getter(s_links, browser, db) {


    await Promise.all(s_links.map(async Element => {
        const page2 = await browser.newPage();
        await page2.setViewport({
            width: 1920,
            height: 926
        });
        await page2.goto(Element.url, {
            timeout: 60000
        })

        let get_sal = await page2.evaluate((Element) => {
            console.log("getting salary values")

            try {
                var sal_val = document.querySelector("span.occMedianModule__OccMedianBasePayStyle__payNumber").innerText;
                try {
                    var sal_low = document.querySelector("div.common__flex__justifySpaceBetween.common__flex__container.common__HistogramStyle__labels > div:nth-child(1)").innerText.split('\n')[0]
                } catch (error) {
                    sal_low = ""
                    console.log("no sal low")
                }
                try {
                    var sal_high = document.querySelector("#OccMedianChart > div:nth-child(2) > div.common__flex__justifySpaceBetween.common__flex__container.common__HistogramStyle__labels > div:nth-child(8)").innerText.split('\n')[0]
                } catch (error) {
                    sal_high = ""
                    console.log("no sal high")
                }
                try {
                    var sal_avg = document.querySelector("div.common__HistogramStyle__labelWrapper.common__HistogramStyle__avgLabelWrapper.center").innerText.split('\n')[0]
                } catch (error) {
                    sal_avg = ""
                    console.log("no sal high")
                }
                try {
                    var title = document.querySelector("#SearchResults > div.flex-aside.mb-0 > div > div.row.justify-content-between > h1").innerText
                } catch (error) {
                    title = ""
                    console.log("title not found")
                }
            } catch (error) {
                return {}

            }
            return {
                "url": Element.url,
                "title": title,
                "salary": sal_val,
                "sal_low": sal_low,
                "sal_high": sal_high,
                "sal_avg": sal_avg,
                "category": Element.category
            }
        }, Element)
        await db.collection("glassdoor_salaries").updateOne({
            "url": get_sal.url
        }, {
            '$set': {
                "title": get_sal.title,
                "salary": get_sal.salary,
                "sal_low": get_sal.sal_low,
                "sal_high": get_sal.sal_high,
                "sal_avg": get_sal.sal_avg,
                // "category": get_sal.category
            }
        })
        console.log("updated " + get_sal.url)

        // console.log(get_sal)
        console.log("---------------------------------------------------------------------------------")
        await page2.close()

    }));

}