"use strict";

/* global document:true, window:true, URL:true */
const express = require('express');
const app = express();
var CommonFile = require('./CommonFile');
var uniqueDataSet=CommonFile.uniqueDataSet;
const URL = require('url');
app.use(CommonFile.bodyParser.urlencoded({
    extended: false
}));
var cors = require('cors')
app.use(cors())
app.use(CommonFile.bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});


let browser;
//allow express to access our html (index.html) file

const HTTP_PORT=7511
CommonFile.puppeteer
    .launch({
        headless: CommonFile.C_HEADELESS,
        slowMo: CommonFile.C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        args: ["--disable-web-security",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            '--ignore-certificate-errors',
            `--window-size=${CommonFile.width},${CommonFile.height}`
        ]
    })
    .then(async b => {
        browser = b;
        var server = CommonFile.http
            .createServer(app)
            .listen(HTTP_PORT, () =>
                console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/DirectPage?url=https://careers.ibm.com/ListJobs/All/?lang=en")
            );
        server.timeout = 240000;
    });

//---------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------

app.get('/Pagination', async (req, res) => {
    const start = Date.now();
    const index = req.url.indexOf('url=');
    console.log("Into the GET Method")
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = decodeURIComponent(req.query.url).trim();
    console.log("Given joburl " + joburl)

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {

        console.log("====================================THE START============================================")
        const response = await Pagination(page, start, joburl);


        var uniqueLinks = [];
        var dataSet = response;
        for (var i = 0; i < dataSet.length; i++) {
            if (uniqueLinks.indexOf(dataSet[i]['Link']) == -1 && dataSet[i]['Link'] != null) {
                uniqueLinks.push(dataSet[i]['Link']);
            }
        }
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("====================================THE END============================================")
        res.status(200).send(uniqueLinks);


    } catch (error) {
        console.error('Error handling request', error);
        console.log("====================================THE END WITH ERROR============================================")
        res.status(500).send([]);

    } finally {
        setTimeout(() => page.close(), 5000);
    }
});
app.post('/Pagination', async (req, res) => {
    const start = Date.now();
    const joburl = decodeURIComponent(req.body.url).trim();
    console.log("Into the POST Method")
    console.log(joburl);

    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred
    //using the server
    console.log(joburl);

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        console.log("==================================THE START==============================================")

        const response = await Pagination(page, start, joburl);

        var uniqueLinks = [];
        var dataSet = response;
        for (var i = 0; i < dataSet.length; i++) {
            if (uniqueLinks.indexOf(dataSet[i]['Link']) == -1 && dataSet[i]['Link'] != null) {
                uniqueLinks.push(dataSet[i]['Link']);
            }
        }
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("===================================THE END=============================================")
        res.status(200).send(uniqueLinks);


    } catch (error) {
        console.error('Error handling request', error);
        res.status(500).send([]);

    } finally {
        setTimeout(() => page.close(), 50000);
    }
    //convert the response in JSON forma
});

//----------------------------------------------------------------------------------------------------------------
    
app.get('/Scrolling', async (req, res) => {
    const start = Date.now();
    const index = req.url.indexOf('url=');
    console.log("Into the GET Method")
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = decodeURIComponent(req.query.url).trim();
    console.log("Given joburl " + joburl)

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        console.log("====================================THE START============================================")
        const urlParse = CommonFile.URL.parse(joburl);
        console.log("Domain=" + urlParse.hostname);
        let domain = urlParse.hostname
        if (domain.includes('workday')) {
            console.log("Into the Workday functionality");

            const response = await WorkDay(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(uniqueDataSet(response));

        } else {
            console.log("Into the Scrolling functionality");
            const response = await Scrolling(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(uniqueDataSet(response));
        }

    } catch (error) {
        console.error('Error handling request', error);
        console.log("====================================THE END WIT ERROR============================================")
        res.status(200).send([]);

    } finally {
        setTimeout(() => page.close(), 60000);
    }
});
app.post('/Scrolling', async (req, res) => {
    const start = Date.now();
    const joburl = decodeURIComponent(req.body.url).trim();
    console.log("Into the POST Method")
    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred
    //using the server
    console.log(joburl);
    console.log("Given joburl " + joburl)
    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        console.log("====================================THE START============================================")
        const urlParse = CommonFile.URL.parse(joburl);
        console.log("Domain=" + urlParse.hostname);
        let domain = urlParse.hostname
        if (domain.includes('workday')) {
            console.log("Into the Workday functionality");

            const response = await WorkDay(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(uniqueDataSet(response));

        } else {
            console.log("Into the Scrolling functionality");
            const response = await Scrolling(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(uniqueDataSet(response));
        }

    } catch (error) {
        console.error('Error handling request', error);
        console.log("====================================THE END WIT ERROR============================================")
        res.status(200).send([]);

    } finally {
        setTimeout(() => page.close(), 60000);
    }
    //convert the response in JSON forma
});
    
//-----------------------------------------------------------------------------------------------------------------
   
app.get('/DirectPage', async (req, res) => {
    const start = Date.now();
    const index = req.url.indexOf('url=');
    console.log("Into the GET Method of DirectPage")
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = decodeURIComponent(req.query.url).trim();
    console.log("Given joburl " + joburl)
    const urlParse = URL.parse(joburl);
    console.log("Domain=" + urlParse.hostname);
    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {

        let domain = urlParse.hostname
        if (domain.includes('icims')) {
            console.log("Into the ICIMS functionality");
            const response = await ICIMS_AnchorTags(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(response);
        } else {
            console.log("Into the Direct Page functionality");
            const response = await DirectPage(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(response);
        }
    } catch (error) {
        console.error('Error handling request', error);
        res.status(200).send([]);
    } finally {
        setTimeout(() => page.close(), 40000);
    }
});
app.post('/DirectPage', async (req, res) => {
    const start = Date.now();
    const joburl = decodeURIComponent(req.body.url).trim();
    console.log("Into the POST Method of DirectPage")
    console.log(joburl);

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        const urlParse = URL.parse(joburl);
        console.log("Domain=" + urlParse.hostname);
        let domain = urlParse.hostname
        if (domain.includes('icims')) {
            console.log("Into the ICIMS functionality");

            const response = await ICIMS_AnchorTags(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(uniqueDataSet(response));

        } else {
            console.log("Into the Direct Page functionality");
            const response = await DirectPage(page, start, joburl);
            console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
            console.log("====================================THE END============================================");
            res.send(uniqueDataSet(response));
        }
    } catch (error) {
        console.error('Error handling request', error);
        res.status(200).send([]);

    } finally {
        setTimeout(() => page.close(), 40000);
    }
    //convert the response in JSON forma
});

//-----------------------------------------------------------------------------------------------------------------

app.get('/GoogleFilterAPI', async (req, res) => {
    const start = Date.now();
    const index1 = req.url.indexOf('title=');
    const index2 = req.url.indexOf('location=');
    console.log("Into the GET Method")
    if (index1 < 0 && index2 < 0) {
        return res.send('{"message": "No title and location provided.", "status": 1}');
    }

    var title = decodeURIComponent(req.query.title.trim())
    var location = decodeURIComponent(req.query.location.trim())
    title = title.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '+')
    location = location.replace(/[^a-zA-Z0-9 ,_-]/g, '').replace(/\s+/g, '+')
    var joburl = "https://www.google.com/search?q=" + title + "+" + location + "+&ibp=htl;jobs&htivrt=jobs&gl=us&htivrt=jobs"
    console.log("Given joburl " + joburl)

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        const response = await GoogleFilterAPI(page, start, joburl);
        res.send(response);
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("================================================================================")

    } catch (error) {
        console.error('Error handling request', error);
        res.status(500);

    } finally {
        setTimeout(() => page.close(), 20000);
    }
});
app.post('/GoogleFilterAPI', async (req, res) => {
    const start = Date.now();
    var location = req.body.location;
    var title = req.body.title;
    title = title.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '+')
    location = location.replace(/[^a-zA-Z0-9 ,_-]/g, '').replace(/\s+/g, '+')
    var joburl = "https://www.google.com/search?q=" + title + "+" + location + "+&ibp=htl;jobs&htivrt=jobs&gl=us&htivrt=jobs"
    console.log("Into the POST Method")
    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred
    //using the server
    console.log(joburl);

    console.log(Date.now() - start + '(ms) Opening tab');
    const page = await browser.newPage();
    try {
        const response = await GoogleFilterAPI(page, start, joburl);
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("================================================================================")
        res.send(response);


    } catch (error) {
        console.error('Error handling request', error);
        res.status(500).send([]);

    } finally {
        setTimeout(() => page.close(), 50000);
    }
    //convert the response in JSON forma
});

//-----------------------------------------------------------------------------------------------------------------

app.get("/HTMLPlainText", async (req, res) => {
    const start = Date.now();
    const index = req.url.indexOf("url=");
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const url = req.query.url;
    const Url = decodeURIComponent(url);
    const page = await browser.newPage();
    console.log(Date.now() - start + 'Opening tab');
    try {
        const details = await LDJSONGetter(page, start, Url.trim());
        console.log("-------------------------------------------------------------------");
        const used = process.memoryUsage();
        for (let key in used) {
            console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }
        console.log("-------------------------------------------------------------------");
        res.send(details);
        console.log(Date.now() - start + 'Google page response sent');

    } catch (error) {
        console.error('Error handling request', error);

        res.sendStatus(500);

    } finally {
        setTimeout(() => page.close(), 30000);
    }
});

app.post("/HTMLPlainText", async (req, res) => {
    const start = Date.now();
    let url = req.body.url;
    if (!url || url.trim() === '') {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    console.log(Date.now() - start + 'Opening tab');
    const page = await browser.newPage();
    try {
        const response = await LDJSONGetter(page, start, url.trim());
        const used = process.memoryUsage();
        console.log("-------------------------------------------------------------------");
        for (let key in used) {
            console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }
        console.log("-------------------------------------------------------------------");
        res.send(response);
        console.log(Date.now() - start + 'Google page response sent');

    } catch (error) {
        console.error('Error handling request', error);
        res.status(500);

    } finally {
        setTimeout(() => page.close(), 30000);
    }
});

//------------------------------------------------------------------------------------
    async function DirectPage(page, start, joburl) {
        try {
            console.info(Date.now() - start + ": Opening page: " + joburl);
            var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            ];
            await page.setUserAgent(
                Useragents[Math.floor(Math.random() * Useragents.length)]
            );
            await page.setViewport({
                width: 1366,
                height: 671
            });
    
            await page.goto(joburl, {
                networkIdle2Timeout: 90000,
                waitUntil: "networkidle2",
                timeout: 90000
            });
            //await page._frameManager._mainFrame.waitForNavigation();
            //const doc = await page._client.send('DOM.getDocument');
            const urlParse = CommonFile.URL.parse(joburl);
            console.log("Domain=" + urlParse.hostname);
            let domain = urlParse.hostname
            if (CommonFile.exceptionDomain.includes(domain)) {
                await page.waitFor(10000).then(() => console.log('Waiting for 10 Sec'));
            } else {
                await page.waitFor(1000).then(() => console.log('Waiting for 1 Sec'));
            }
    
    
            const results = await GetJobLinks(page);
            console.info(
                Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
            );
            console.log("---------------------------------------------------------");
            console.log("Length:"+results.length);
            console.log("---------------------------------------------------------");
            
            return results;
        } catch (e) {
            console.log("-------------------------------------------------------");
            console.log("Sorry Some Error has " + e + " Occured in DirectPage");
            console.log("-------------------------------------------------------");
            return []
        }
    
    }
    async function ICIMS_AnchorTags(page, start, joburl) {
        try {
            console.info(Date.now() - start + ": Opening page: " + joburl);
            var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            ];
            await page.setUserAgent(
                Useragents[Math.floor(Math.random() * Useragents.length)]
            );
            await page.setRequestInterception(true);
            page.on('request', request => {
                const type = request.resourceType();
                if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other')
                    request.abort();
                else
                    request.continue();
            });
            await page.setViewport({
                width: 1366,
                height: 671
            });
            await page.goto(joburl, {
                networkIdle2Timeout: 60000,
                waitUntil: "networkidle2",
                timeout: 60000
            });
    
            //const doc = await page._client.send('DOM.getDocument');
            await delay(2000);
    
            const results = await page.evaluate(() => {
                function removeComments(node) {
                    if (node.nodeType === 8) {
                        node.parentNode.removeChild(node);
                    }
    
                    for (let i = 0; i < node.childNodes.length; i++) {
                        removeComments(node.childNodes[i]);
                    }
                }
    
                function cleanup(node, type) {
                    let els = node.getElementsByTagName(type);
                    for (let i = els.length - 1; i >= 0; i--) {
                        /*
                        if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                            scripts.push(els[i].innerText);
                        }*/
                        els[i].parentNode.removeChild(els[i]);
                    }
                    return node;
                }
                for (const frame of document.querySelectorAll("iframe")) {
                    const frameDocument =
                        frame.contentDocument || frame.contentWindow.document;
                    //cleanup(frameDocument, 'nav')
                    //cleanup(frameDocument, 'footer')
                    cleanup(frameDocument, 'style')
                    cleanup(frameDocument, 'script')
                    cleanup(frameDocument, 'noscript')
                    cleanup(frameDocument, 'meta')
                    cleanup(document.documentElement,'select')
                    //cleanup(frameDocument, 'header')
                    removeComments(frameDocument)
                    //frame.sandbox = 'allow-same-origin allow-scripts';
                    const div = document.createElement("div");
                    for (const attr of frame.attributes) {
                        if (
                            attr.name !== "src" &&
                            attr.name !== "srcdoc" &&
                            attr.name !== "sandbox"
                        ) {
                            div.setAttribute(attr.name, attr.value);
                        }
                    }
                    div.innerHTML = frameDocument.documentElement.innerHTML;
                    frame.parentNode.replaceChild(div, frame);
                }
    
                //cleanup(document.documentElement, 'nav')
                //cleanup(document.documentElement, 'footer')
                cleanup(document.documentElement, 'style')
                cleanup(document.documentElement,'select')
                cleanup(document.documentElement, 'noscript')
                cleanup(document.documentElement, 'meta')
                //cleanup(document.documentElement, 'header')
                removeComments(document.documentElement)
                let data = [];
                let elements = document.querySelectorAll('li[class="row"]');
    
                for (var j = 0; j < elements.length; j++) {
                    var element = elements[j]
                    try {
                        let title = element.querySelector('a[class="iCIMS_Anchor"]').innerText;
                        let Link = new window.URL(element.querySelector("a[class=\"iCIMS_Anchor\"]").getAttribute('href'), window.document.URL).toString()
                        //let company="AccentCare";
                        //let datePosted=element.querySelector('span.jobDate').innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, ' ').replace(/\s+/g, " ").trim();
                        data.push({
                            'Label': title.replace('Job Title\n', ' ').replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, ' ').replace(/\s+/g, " ").trim(),
                            'Link': Link,
                        });
                    } catch (e) {
                        console.log("Soory have an error in ICIMS " + e);
                        break;
                    }
                }
    
                return data;
            });
    
            console.info(
                Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
            );
            return results;
        } catch (e) {
            console.log("Sorry Some Error has " + e + " Occured")
            return []
        }
    
        function delay(time) {
            return new Promise(function (resolve) {
                setTimeout(resolve, time);
            });
        }
    }
    async function Pagination(page, start, joburl) {
        try {
            console.info(Date.now() - start + ": Opening page: " + joburl);
            var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            ];
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            );
            await page.setViewport({
                width: 1366,
                height: 671
            });
            console.log("Given URL==>" + joburl);
    
            await page.goto(joburl, {
                networkIdle2Timeout: 5000,
                waitUntil: "networkidle2",
                timeout: 0
            });
            const urlParse = CommonFile.URL.parse(joburl);
            console.log("Domain=" + urlParse.hostname);
            let domain = urlParse.hostname
            if (CommonFile.exceptionDomain.includes(domain)) {
                await page.waitFor(10000).then(() => console.log('Waiting for 10 Sec'));
            } else {
                await page.waitFor(1000).then(() => console.log('Waiting for 1 Sec'));
            }
            let div_selector_to_remove= ".pager-container-reduced";
            await page.evaluate((sel) => {
                var elements = document.querySelectorAll(sel);
                for(var i=0; i< elements.length; i++){
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, div_selector_to_remove)
            //const doc = await page._client.send('DOM.getDocument');
            await delay(500);
            const results = await getPaginationLinks(page);
            var paginationSelectors_in_Urls = ['from=','&pageno=','page_jobs=','||d-ASC|','page_jobs=','&pageNum=','?pageNum=','pages=','jobOffset=','?folderOffset=', '&page=','&paged=','#page-','?pg=','PGNO=', 'Page-', 'Page=', 'page=', 'page/', 'startrow=', 'page-', 'startRow=','#||||','|||||', 'p=', 'offset=','pagenumber=','Pagenumber=','pageNumber='];
            
            var paginationSelector = '';
            for (var m = 0; m < CommonFile.nextButtonSelectors.length; m++) {
                const data =  CommonFile.nextButtonSelectors[m]
                const linkHandlers = await page.$x(data);
                if (linkHandlers.length > 0) {
                    //await linkHandlers[0].click();
                    console.log(data + " Found in " + joburl)
                    paginationSelector = data;
                    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                    break;
                } else {
                    console.log(data + " NotFound in " + joburl);
                    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                }
            };
            if (paginationSelector != "") {
    
                var paginationSelectorCount = await page.$x(paginationSelector);
                console.log('Selector Check in L1=>' + paginationSelectorCount.length);
                //await page.$x(paginationSelector).click() .then(() => console.log('next button Clicked going to Paage'));
                try {
                    //await page.waitFor(1000).then(() => console.log('Waiting for 1 Secs to Navigate'));
                    //results=results.concat(await Anchor_Tags_Getter(page));
    
                    paginationSelectorCount = await page.$x(paginationSelector);
                    console.log('Selector Check=>' + paginationSelectorCount.length);
                    await paginationSelectorCount[0].click().then(() => console.log('next button Clicked going to Paage'));
                    //await page._frameManager._mainFrame.waitForNavigation();
                    await page.waitFor(4000).then(() => console.log('Waiting for 4 Secs to Navigate'));
                    let OriginalURL = page.mainFrame().url();
                    results.unshift(await getPaginationLinks(page));
                    results.unshift({
                        'Label': 'MainURL',
                        'Link': OriginalURL
                    })
                    console.log(results)
                    console.info(
                        Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
                    );
                    return results
                } catch (error) {
                    console.log(error);
    
                    console.info(
                        Date.now() - start + "(ms) : No Next Buuton found Successfully Scrapped the Page: " + joburl
                    );
                    let OriginalURL = page.mainFrame().url();
                    //results.unshift(await getPaginationLinks(page));
                    results.unshift({
                        'Label': 'MainURL',
                        'Link': OriginalURL
                    })
                    console.log(results)
                    console.info(
                        Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
                    );
                    return results
                }
    
            } else {
                console.info(
                    Date.now() - start + "(ms) : No Next Buuton found Successfully Scrapped the Page: " + joburl
                );
                let OriginalURL = page.mainFrame().url();
                //results.unshift(await getPaginationLinks(page));
                results.unshift({
                    'Label': 'MainURL',
                    'Link': OriginalURL
                })
                console.log(results)
                console.info(
                    Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
                );
                return results
            }
    
        } catch (e) {
            console.log("Sorry Some Error has " + e + " Occured")
            return []
        }
    
        function delay(time) {
            return new Promise(function (resolve) {
                setTimeout(resolve, time);
            });
        }
    }
    async function WorkDay(page, start, joburl) {
        try {
            //const start = Date.now();
            console.info(Date.now() - start + ": Opening page: " + joburl);
            await page.setRequestInterception(true);
            page.on('request', request => {
                const type = request.resourceType();
                if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other')
                    request.abort();
                else
                    request.continue();
            });
            await page.setViewport({
                width: 1366,
                height: 671
            });
            await page.goto(joburl, {
                networkIdle2Timeout: 80000,
                waitUntil: 'networkidle2',
                timeout: 0
            });
    
            //const doc = await page._client.send('DOM.getDocument');
            await page.waitFor(1000);
    
            // var counter = await page.$$('li[data-automation-id="compositeContainer"]');
            // var count = counter.length;
            const autoScroll = async (page) => {
                await page.evaluate(async () => {
                    await new Promise((resolve, reject) => {
                        let totalHeight = 0
                        let distance = 100
    
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight
                            window.scrollBy(0, distance)
                            totalHeight += distance
                            if (totalHeight >= scrollHeight) {
                                clearInterval(timer)
                                resolve()
                            }
                        }, 210)
                    })
                })
            }
            await page.waitForXPath('//div[@aria-label="Search Results"]')
            .then(() => console.log('Got the Xpath!'))
            .catch(e => console.log(e))
            console.log("--------------------------------------------------");
            console.log("Scrolling Started");
            await autoScroll(page);
            console.log("Scrolling Done");
            console.log("--------------------------------------------------");
            const result = await page.evaluate((joburl) => {
                const required_apply_link = [];
                let mainelement = document.documentElement.querySelectorAll('li[data-automation-id="compositeContainer"] ');
                for (let m = 0; m < mainelement.length; m++) {
                    const dataset = mainelement[m];
                    let Title = dataset.querySelector('div[data-automation-id="promptOption"]').innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
                    let Locationdata = dataset.querySelector('span[data-automation-id="compositeSubHeaderOne"]').innerText.replace(/\t/g, ' ').replace(/ /g, ' ').split('   |   ');
                    let EditedTitle = Title.replace(/\s+/g, " ").replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '-')
                    let EditedString = EditedTitle + '_' + Locationdata[1]
                    let Editedlocation = Locationdata[0].replace(", ", " ").replace(/\s+/g, " ").replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '-')
                    var GeneratedURL = joburl + "/job/" + Editedlocation + "/" + EditedString;
    
                    required_apply_link[m] = {
                        "Label": Title,
                        "Link": GeneratedURL,
                    };
                }
                return required_apply_link
    
    
            }, joburl);
            console.log("Total Jobs Loaded:"+result.length);
            
    
            console.info(Date.now() - start + ': Successfully Scrapped the Page: ' + joburl);
    
            console.log(result.length);
    
            return result;
    
        } catch (e) {
            return []
        }
    }
    async function LDJSONGetter(page, start, joburl) {
        try {
            console.info(Date.now() - start + ": Opening page: " + joburl);
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            );
            await page.setRequestInterception(true);
            page.on('request', request => {
                const type = request.resourceType();
                if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other'  || type === 'stylesheet')
                    request.abort();
                else
                    request.continue();
            });
            await page.setViewport({
                width: 1366,
                height: 671
            });
            await page.goto(joburl, {
                networkIdle2Timeout: 90000,
                waitUntil: "networkidle2",
                timeout: 20000
            });
            await page.waitFor(1000).then(()=>console.log("Waiting for 1 Sec"))
    
    
            var result = await page.evaluate(() => {
                for (const frame of document.querySelectorAll("iframe")) {
                    const frameDocument =
                        frame.contentDocument || frame.contentWindow.document;
    
                    const div = document.createElement("div");
                    for (const attr of frame.attributes) {
                        if (
                            attr.name !== "src" &&
                            attr.name !== "srcdoc" &&
                            attr.name !== "sandbox"
                        ) {
                            div.setAttribute(attr.name, attr.value);
                        }
                    }
                    div.innerHTML = frameDocument.documentElement.innerHTML;
                    frame.parentNode.replaceChild(div, frame);
                }
                // eslint-disable-line no-irregular-whitespace
                function cleanup(node, type) {
                    const scripts = [];
                    let els = node.getElementsByTagName(type);
                    for (let i = els.length - 1; i >= 0; i--) {
                        if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1) {
                            scripts.push(els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' '));
                        }
    
                            els[i].parentNode.removeChild(els[i]);
    
                        
                    }
                    return scripts;
                }
                const jobbody = document.documentElement.innerText.replace(/\t/g, ' ').replace(/ /g, ' ');
                var LDJSON =[]
                var LDJSON = cleanup(document.documentElement, "script")
                cleanup(document.documentElement, "noscript")
                cleanup(document.documentElement, "meta")
                cleanup(document.documentElement, "style")
                cleanup(document.documentElement, "select")
                var HTML = document.documentElement.outerHTML;
               
                if (LDJSON.length == 0) {
                    var LDJSON = {}
                    let itemProps = document.documentElement.querySelectorAll('*[itemprop]')
                    for (let index = 0; index < itemProps.length; index++) {
                        const element = itemProps[index];
                        let key = element.getAttribute('itemprop')
                        let value = element.innerText
                        LDJSON[key] = value;
                    }
                    return {
                        'HTML': HTML,
                        'Jobbody': jobbody,
                        'LDJSON': LDJSON
                    };
                } else {
                    let json = {};
                    if (LDJSON && LDJSON.length) {
                        for (const ldjson of LDJSON) {
                            json = Object.assign(json, JSON.parse(ldjson.replace(/\n/g, '')));
                        }
                    }                if(json.hasOwnProperty("0")){
                        if(json['0'].hasOwnProperty('@type')){
                            if(json['0']['@type']==="JobPosting"){
                                let ldjsondata=json['0']
                                return {
                                    'HTML': HTML,
                                    'Jobbody': jobbody,
                                    'LDJSON': ldjsondata
                                };
                            }
    
                        }
                    } if(json.hasOwnProperty("1")){
                        if(json['1'].hasOwnProperty('@type')){
                            if(json['1']['@type']==="JobPosting"){
                                let ldjsondata=json['1']
                                return {
                                    'HTML': HTML,
                                    'Jobbody': jobbody,
                                    'LDJSON': ldjsondata
                                };
                            }
    
                        }
    
                    }
                    return {
                        'HTML': HTML,
                        'Jobbody': jobbody,
                        'LDJSON': json
                    };
                }
    
            });
            console.info(
                Date.now() - start + ":Scraping Successfull: " + joburl
            );
            return result;
    
    
        } catch (error) {
            console.log("Having Some Error===>" + error);
            return {};
        }
    
    
    }
    async function GoogleFilterAPI(page, start, joburl) {
        try {
            console.info(Date.now() - start + ": Opening page: " + joburl);
            var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            ];
            await page.setUserAgent(
                Useragents[Math.floor(Math.random() * Useragents.length)]
            );
            await page.setRequestInterception(true);
            page.on('request', request => {
                const type = request.resourceType();
                if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other')
                    request.abort();
                else
                    request.continue();
            });
            await page.setViewport({
                width: 1366,
                height: 671
            });
            await page.goto(joburl, {
                networkIdle2Timeout: 90000,
                waitUntil: "networkidle2",
                timeout: 90000
            });
    
            //const doc = await page._client.send('DOM.getDocument');
            var LocationSpot = await page.$$('div[class="Pcqv8c"] span[data-facet="city"]')
    
            const LocationSpotLength = LocationSpot.length;
            console.log(LocationSpotLength);
    
            if (LocationSpotLength) {
                const ele = LocationSpot[0]
                await ele.click().then(() => console.log('Location button Clicked'));
                await page.waitFor(200);
                var Sixtymiles = await page.$$('div[jsname="YwaXHc"] :nth-child(6)')
    
                if (Sixtymiles.length) {
                    const ele5 = Sixtymiles[0]
                    await ele5.click().then(() => console.log('60miles button Clicked'));
    
                    await page.waitFor(1400);
                } else {
                    var Anywhere = await page.$$('div[jsname="YwaXHc"] div[data-display-value="Anywhere"]')
    
                    if (Anywhere.length) {
                        const ele6 = Anywhere[0]
                        await ele6.click().then(() => console.log('60miles button Clicked'));
                        await page.waitFor(1400);
                    }
                }
            }
            console.log("Getting the Categories");
            var MenuSet = await page.evaluate(() => {
                function ArrayDataGetter(node, QuerySelector) {
                    var Arraydata = []
                    var testdata = node.querySelectorAll(QuerySelector);
                    for (let indexno = 0; indexno < testdata.length; indexno++) {
                        var data = "";
                        data = testdata[indexno].innerText;
                        if (data != "__placeholder__") {
                            Arraydata.push(data)
                        } else {
                            break;
                        }
                    }
                    Arraydata.shift();
                    return Arraydata;
    
                }
                var Categories = ArrayDataGetter(document.documentElement, 'div[data-facet="gcat_category.id"] span[data-facet="gcat_category.id"]');
    
                var Titles = ArrayDataGetter(document.documentElement, 'div[data-facet="job_family_1"] span[data-facet="job_family_1"]');
    
                var Locations = ArrayDataGetter(document.documentElement, 'div[data-facet="city"] span[data-facet="city"]');
    
                var IndustrySet = ArrayDataGetter(document.documentElement, 'div[data-facet="industry.id"] span[data-facet="industry.id"]');
    
                var Employer = ArrayDataGetter(document.documentElement, 'div[data-facet="organization_mid"] span[data-facet="organization_mid"]');
    
                var DatePosted = ArrayDataGetter(document.documentElement, 'div[data-facet="date_posted"] span[data-facet="date_posted"]');
    
                var JobType = ArrayDataGetter(document.documentElement, 'div[data-facet="employment_type"] span[data-facet="employment_type"]');
    
                return {
                    'Categories': Categories,
                    'Titles': Titles,
                    'Locations': Locations,
                    'IndustrySet': IndustrySet,
                    'Employer': Employer,
                    'DatePosted': DatePosted,
                    'JobType': JobType
    
                };
            });
    
            return MenuSet;
    
    
        } catch (error) {
            console.log(error);
    
            return {
                'error': error
            }
        }
    }
    async function extractPaginationLinks(page) {
        try {
            return page.evaluate(() => {
                function isValidURL(string) {
                    // string=string.replace(/\;jsessionid=.*/,'');
                    // var pattern = new RegExp(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi);
                    // var res = string.match(pattern);
                    // return (res !== null)
                    return string.startsWith('http')
                };
        
                function dataGetter(node,selector,attribute){
                    let finalData=[];
                    let dataSet = node.querySelectorAll(selector);
                    for (let j=0;j<dataSet.length;j++){
                        var element1=dataSet[j];
                        var Label=element1.innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim()
                        if (Label == "") {
                            Label = element1.innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim();
                        }
                        if (element1.hasAttribute(attribute)) {
                            try {
                                let Link=new window.URL(element1.getAttribute(attribute), window.document.URL).toString();
                                if(isValidURL(Link) && !isNaN(Label) && !(Label.trim()==="") || (Label.toUpperCase().includes("NEXT")) || (Label.toUpperCase().includes("LAST")) || (Label.includes("»")) ||  (Label.toLowerCase().match("^page") && Label.match(/\d+$/))){
                                    finalData.push({'Label':Label,
                                    'Link':Link})
            
                                }
                            } catch (error) {
                                console.log(error);
                            }
        
                        }
                    }
                    return finalData;
                }
                var paginationLinks=[]
        
                paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"a[href]",'href'))
        
                paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body a",'data-href'))
        
                paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body a",'data-url'))
        
                paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body a",'data-surl'))
        
                paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body tr",'data-href'))
        
                paginationLinks=paginationLinks.concat(dataGetter(document.documentElement,"body tr",'href'))
        
                return paginationLinks;
            }); 
        } catch (error) {
            console.log("--------------------------------------------------");
            console.log("Error in extracting Links:"+error);
            console.log("--------------------------------------------------");
            return [];
        }
    
    
    
    }

    async function getPaginationLinks(page) {
        try {
            var results = await extractPaginationLinks(page);
            const frames = await page.frames();
            for (let index = 0; index < frames.length; index++) {
                const framePage = frames[index];
                results=results.concat(await extractPaginationLinks(framePage))
            }
            return results;
        } catch (error) {
            console.log("--------------------------------------------------");
            console.log("Error in getPaginationLinks:"+error);
            console.log("--------------------------------------------------");
            return [];
        }
    
    }
    async function Scrolling(page, start, joburl) {
        try {
            console.info(Date.now() - start + ": Opening page: " + joburl);
            var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
            ];
            await page.setUserAgent(
                Useragents[Math.floor(Math.random() * Useragents.length)]
            );
            await page.setRequestInterception(true);
            page.on('request', request => {
                const type = request.resourceType();
                if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other')
                    request.abort();
                else
                    request.continue();
            });
            await page.setViewport({
                width: 1366,
                height: 671
            });
            await page.goto(joburl, {
                networkIdle2Timeout: 90000,
                waitUntil: "networkidle2",
                timeout: 90000
            });
    
            //const doc = await page._client.send('DOM.getDocument');
            const autoScroll = async (page) => {
                await page.evaluate(async () => {
                    await new Promise((resolve, reject) => {
                        let totalHeight = 0
                        let distance = 100
    
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight
                            window.scrollBy(0, distance)
                            totalHeight += distance
                            if (totalHeight >= scrollHeight) {
                                clearInterval(timer)
                                resolve()
                            }
                        }, 150)
                    })
                })
            }
            await delay(1500);
            console.log("--------------------------------------------------");
            console.log("Scrolling Started");
            await autoScroll(page);
            console.log("Scrolling Done");
            console.log("--------------------------------------------------");
            const results = await GetJobLinks(page);
            //const response = await WorkDay(page, start, joburl);
            console.info(
                Date.now() - start + "(ms) : Successfully Scrapped the Page: " + joburl
            );
            return results;
        } catch (e) {
            console.log("Sorry Some Error has " + e + " Occured")
            return [];
        }
    
        function delay(time) {
            return new Promise(function (resolve) {
                setTimeout(resolve, time);
            });
        }
    }
    async function extractedEvaluateCall(page,from) {
        try {
            return page.evaluate((from) => {
                function isValidURL(string) {
                    // string=string.replace(/\;jsessionid=.*/,'');
                    // var pattern = new RegExp(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi);
                    // var res = string.match(pattern);
                    // return (res !== null)
                    return string.startsWith('http')
                };
        
                function dataGetter(node,selector,attribute,from){
                    let finalData=[];
                    let dataSet = node.querySelectorAll(selector);
                    for (let j=0;j<dataSet.length;j++){
                        var element1=dataSet[j];
                        var Label=element1.innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim()
                        if (Label == "") {
                            Label = element1.innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, '').replace(/\s+/g, " ").trim();
                        }
                        if (element1.hasAttribute(attribute)) {
                            try {
                                let Link=new window.URL(element1.getAttribute(attribute), window.document.URL).toString();
                                if(isValidURL(Link)){
                                    finalData.push({'Label':Label,
                                    'from':from,
                                    'Link':Link})
            
                                }
                            } catch (error) {
                                console.log(error);
                            }
        
                        }
                    }
                    return finalData;
                }
                var required_apply_link=[]
        
                required_apply_link=required_apply_link.concat(dataGetter(document.documentElement,"a[href]",'href',from))
        
                required_apply_link=required_apply_link.concat(dataGetter(document.documentElement,"body a",'data-href',from))
        
                required_apply_link=required_apply_link.concat(dataGetter(document.documentElement,"body a",'data-url',from))
        
                required_apply_link=required_apply_link.concat(dataGetter(document.documentElement,"body a",'data-surl',from))
        
                required_apply_link=required_apply_link.concat(dataGetter(document.documentElement,"body tr",'data-href',from))
        
                required_apply_link=required_apply_link.concat(dataGetter(document.documentElement,"body tr",'href',from))
        
                return required_apply_link;
            },from); 
        } catch (error) {
            console.log("--------------------------------------------------");
            console.log("Error in extracting Links:"+error);
            console.log("--------------------------------------------------");
            return [];
        }


    
    }
    async function GetJobLinks(page) {
        try {
            var from='Page';
            var results = await extractedEvaluateCall(page,from);
            const frames = await page.frames();
            for (let index = 0; index < frames.length; index++) {
                const framePage = frames[index];
                from='frames-'+index
                results=results.concat(await extractedEvaluateCall(framePage,from))
            }
            return results;
        } catch (error) {
            console.log("--------------------------------------------------");
            console.log("Error in GetJobLinks:"+error);
            console.log("--------------------------------------------------");
            return [];
        }

    }
//------------------------------------------------------------------------------------


    //==============Individual Function Section===============================
