const puppeteer = require('puppeteer');
const similar = require('string-similarity');
var unique = require('array-unique');

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
    const browser = await puppeteer.launch({
        headless: false
    });
    for (let i = 0; i < 999; i += 3) {
        await start(browser)

    }
})();

async function start(browser) {
    var client = await getConnection(mongoUrl);
    var db = await client.db('atsCompanies')
    let start = Date.now();
    var titles = await db.collection('titlematch').find({
        'status': {
            $exists: false
        }
    }).skip(0).limit(3).toArray()

    await Promise.all(titles.map(async element => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 926
        });
        console.log("searching title : " + element.title)
        element.title.replace(/[%]/, '').replace(/\+/g, '%2B').replace(/&/g, '%26').replace(/#/, '%23').replace(/\s+/g, '+')
        await page.goto("https://www.google.com/search?q=" + element.title + "&rlz=1C1CHBF_enIN870IN870&oq=jobs&aqs=chrome..69i57j69i59j69i60l3j69i61.1817j0j4&sourceid=chrome&ie=UTF-8&ibp=htl;jobs&sa=X&ved=2ahUKEwiHpJTqu5nnAhUOfisKHTtBDW4Qp4wCMAB6BAgMEAE#htidocid=szlJizT2GD4lOZ9-AAAAAA%3D%3D", {
            timeout: 600000
        });
        page.waitFor(10000)
        var jobBlocks = await page.$$('li.PaEvOc div.BjJfJf');

        if (jobBlocks.length) {
            var blocksData = await page.evaluate(() => {
                var blocks = document.documentElement.querySelectorAll('div[role="treeitem"]');
                var db = [];
                let rank = 0;
                for (const block of blocks) {
                    var jobtitle = block.querySelector('div[role="heading"]').innerText;
                    db.push({
                        jobtitle,
                    })
                }

                return db;
            });

            var filter = [];
            for (let e = 0; e < blocksData.length; e++) {
                var per = (similar.compareTwoStrings(blocksData[e].jobtitle, element.title) + similar.compareTwoStrings(blocksData[e].jobtitle, element.title)) / 2
                console.log(per * 100)
                if (per > 0.60 && per < 1) {
                    filter.push(blocksData[e].jobtitle)
                }
            }
            if (filter.length > 0) {
                var status = 2;
            } else {
                var status = 405;
            }
            filter = unique(filter)
            console.log(filter)
        } else {
            console.log('no result')
            blocksData = []
            var status = 404
        }

        await db.collection('titlematch').updateOne({
            '_id': element._id
        }, {
            '$set': {
                'matches': filter,
                'status': status
            }
        })


        page.close()

    }))
    await closeConnection(client);
};