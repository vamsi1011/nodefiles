var URL = require("url");
var _ = require("underscore");
var chalk = require("chalk");
var request = require("request");
var rp = require('request-promise');
const puppeteer = require('puppeteer');
// var JSON = require('parse-json')

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
    // var client = await getConnection(mongoUrl);
    // var db = await client.db('marketingTool')
    let start = Date.now();
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 926
    });
    console.log("opening career page")
    await page.goto("https://www.glassdoor.co.in/Job/visakhapatnam-jobs-SRCH_IL.0,13_IC2879606.htm", {
        timeout: 600000
    });
    page.waitFor(10000)
    let ldjson_links = await page.evaluate(() => {
        var ldjson_urls = [],
            links = [];
        links = document.querySelectorAll("#MainCol > div > ul > li")
        links.forEach(element => {
            let url = element.querySelector('div.jobContainer > a').getAttribute('href')
            ldjson_urls.push("https://www.glassdoor.com" + url)
        });
        return ldjson_urls
    })
    await page.close()
    // console.log(ldjson_links)
    for (let p = 0; p < ldjson_links.length; p++) {
        let tem = ldjson_links.slice(p, p + 2)
        await get_ldjson(tem)

    }




    async function get_ldjson(urls) {
        await Promise.all(urls.map(async url => {
            const page1 = await browser.newPage();
            await page1.setViewport({
                width: 1920,
                height: 926
            });
            console.log("opening each page")
            await page1.goto(url, {
                timeout: 600000
            });
            let ldjson_data = await page1.evaluate(() => {
                let ldjson = [];
                ldjson.push(document.querySelector("html").innerHTML.split('<script type="application/ld+json">')[1].split('</script>')[0].toString().replace(/\t/g, ' ').replace(/ /g, ' '));
                return ldjson

            })
            page1.close()

            let json = {}
            for (const ldjson of ldjson_data) {
                json = Object.assign(json, JSON.parse(ldjson.replace(/\n/g, '')));
            }
            console.log(json)

            // if (ldjson_data[0].indexOf("OccupationalCategory") >= 0) {
            //     let json = {}
            //     for (const ldjson of ldjson_data) {
            //         json = Object.assign(json, JSON.parse(ldjson.replace(/\n/g, '')));
            //     }
            //     console.log(json)
            // } else {
            //     console.log("No Occupation Category")
            // }

        }))

    }
    // await closeConnection(client);
})();