const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";


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
    var db = await client.db('local')
    let start = Date.now();
    const browser = await puppeteer.launch({
        headless: false,
        timeout: 1000000
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 926
    });
    let coll = await db.collection('dice').find({
        'category': {
            $exists: true
        }
    }).toArray()
    if (coll.length < 27) {
        db.collection('dice').deleteMany({
            'category': {
                $exists: true
            }
        })
        console.log("opening companies page")
        await page.goto("https://www.dice.com/jobs/browsejobs/q-company-dc-pound-jobs", {
            timeout: 600000
        });
        page.waitFor(10000)
        let allcomps = await page.evaluate(() => {
            var links_final = [],
                links = [];
            links = document.querySelectorAll("body > div.container > div.row.mT20 > div.col-md-9.mTB10 > a")
            links.forEach((Element) => {
                let temp = "https://www.dice.com" + Element.getAttribute('href')
                let name = Element.innerText
                links_final.push({
                    "url": temp,
                    "category": name
                })
            })
            console.log("got all category links")

            return links_final

        })
        page.close()

        db.collection('dice').insertMany(allcomps);
    }

    allcomps = await db.collection('dice').find({
        'status': {
            $exists: false
        },
        'url': {
            $exists: true
        }
    }).toArray()
    if (allcomps.length > 0) {
        await Promise.all(allcomps.map(async Element => {
            var complinks = [];
            const page = await browser.newPage();
            console.log("opening : " + Element.url)
            await page.goto(Element.url, {
                timeout: 600000
            })
            complinks = await page.evaluate(() => {
                var dlinks = [];
                var rows = document.querySelectorAll("a.mR5[href^='/company']")
                rows.forEach(element => {
                    dlinks.push({
                        'url': "https://www.dice.com" + element.getAttribute('href'),
                        'company': element.innerText
                    })
                });
                return dlinks

            })

            await db.collection('dice').updateOne({
                'category': Element.category
            }, {
                $set: {
                    'companies': complinks,
                    'status': 1
                }
            });
            console.log(complinks)
        }))
    }

    let insidelinks = await db.collection('dice').find({
        'status': 1
    }).toArray()

    if (insidelinks.length >= 1) {
        for (let index = 0; index < insidelinks.length; index++) {

            for (let ilinks = 0; ilinks < insidelinks[index].companies.length; ilinks += 5) {
                if (ilinks + 5 >= insidelinks[index].companies.length) {
                    elinks = insidelinks[index].companies.length
                } else {
                    elinks = ilinks + 5
                }
                var insidedatalinks = insidelinks[index].companies.slice(ilinks, elinks)
                await Promise.all(insidedatalinks.map(async element => {
                    const page3 = await browser.newPage();
                    await page3.goto(element.url, {
                        timeout: 600000
                    })
                    let insidedata = await page3.evaluate(() => {
                        try {
                            var website = document.querySelector("div.company-right a:nth-child(2)").href

                        } catch {
                            var website = ""
                        }
                        try {
                            var careerpage = document.querySelector("div.company-right a:nth-child(3)").href
                        } catch {
                            var careerpage = ""
                        }
                        return {
                            'website': website,
                            'careerpage': careerpage
                        }
                    })
                    insidedata.company = element.company

                    await db.collection('dice').insertOne(insidedata)
                    page3.close()
                }))

            }
            console.log("done with " + insidelinks[index].category)
            await db.collection('dice').updateOne({
                'category': insidelinks[index].category
            }, {
                '$set': {
                    'status': 2
                }
            })

        }

    }

})();