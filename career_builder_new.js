"use strict";
const puppeteer = require("puppeteer");
const rp = require("request-promise");
const MongoClient = require('mongodb').MongoClient
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
var fuzz = require('fuzzball');
app.use(bodyParser.urlencoded({
    extended: false
}));
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json());
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

const width = 1366,
    height = 760;
const HTTP_PORT = 8236;
const C_HEADELESS = false;
const C_OPTIMIZE = true;
const C_SLOWMOTION = 0;

puppeteer
    .launch({
        headless: C_HEADELESS,
        slowMo: C_SLOWMOTION,
        ignoreHTTPSErrors: true,
        args: ["--disable-web-security",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            '--ignore-certificate-errors',
            `--window-size=${width},${height}`
        ]
    })
    .then(async b => {
        browser = b;
        var server = http
            .createServer(app)
            .listen(HTTP_PORT, () =>
                console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/CareerBuilder?joburl=https://careers.ibm.com/ListJobs/All/?lang=en")
            );
        server.timeout = 240000;
    });

    app.get('/CareerBuilder', async (req, res) => {
        
        
        MongoClient.connect('mongodb://admin:jobiak@3.18.238.8:28015/admin',async function(error,db){
            
    
            var db = await db.db('stage_jobs');

            var collection = await db.collection('occupation_category_pending').find({status:0}).skip(33000).limit(1).toArray(async (error,result)=>{
                result.forEach(async (element)=>{
                
                console.log("running title --->"+element.job_titles);
                    const start = Date.now();
                    var title=decodeURIComponent(req.body.title).trim();
                    var location=decodeURIComponent('New York,NY').trim();
                    var Title=title.replace(/\s+/g, '+');
                    var Location=location.replace(/\s+/g, '+');
                    var joburl="https://www.careerbuilder.com/jobs?utf8=✓&keywords="+encodeURIComponent(element.job_titles)+"+&location="+Location;
                    joburl=joburl.replace(/%2B/g,'+')
                    console.log("Into the POST Method")
                    //this line is optional and will print the response on the command prompt
                    //It's useful so that we know what infomration is being transferred
                    //using the server
                    console.log(joburl);
                
                    console.log(Date.now() - start + '(ms) Opening tab');
                    const page = await browser.newPage();
                    try {
                        console.log("====================================THE START============================================")
                        const response = await LinksGetter(page, start, joburl,element.job_titles);

            //console.log(response);
            if (response.length){

                let ele=await response[0].occupation_category
                console.log("----------------------");
                await console.log(ele);
                console.log("----------------------");
                
            console.log("------------> occupation found "+response.hasOwnProperty('occupation_category'));
            //var occupation_category_string = details.occupation_category.occupation_category[1]
            if(ele.length){

            await db.collection('Opt_OccupationCategories').insertOne({job_titles:element.job_titles,status:200,pid:element._id,new_status:200,LDJSON:response,occupation_category:response[0].occupation_category,occupation_category_string:response[0].occupation_category[1],occupation_category_object:response[0].occupation_category,result_from:'career_builder'});
            console.log("------------> saved in Opt_OccupationCategories");
            await db.collection('occupation_category_pending').updateOne({'_id':element._id},{$set:{status:1,success:1}}).then(() => console.log('------------> Updated Status Into the Collection occupation_category_pending 1'));
            
                        }
                        
                    }else{
                        
            await db.collection('occupation_category_pending').updateOne({'_id':element._id},{$set:{status:1}}).then(() => console.log('------------> Updated Status Into the Collection occupation_category_pending no jobs 2'));
                        
                    }




                        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
                        console.log("====================================THE END============================================")
                        // res.status(200).send(uniqueDataSet(response));
                        res.status(200).send(response);
                
                
                    } catch (error) {
                        console.error('Error handling request', error);
                        console.log("====================================THE END WITH ERROR============================================")
                        res.status(200).send([]);
                
                    } finally {
                        setTimeout(() => page.close(), 50000);
                    }
                    //convert the response in JSON forma
            
                });
            });
            await db.close();
        });



    });
    app.post('/CareerBuilder', async (req, res) => {


        MongoClient.connect('mongodb://admin:jobiak@3.18.238.8:28015/admin',async function(error,db){
            
    
            var db = await db.db('stage_jobs');

            var collection = await db.collection('occupation_category_pending').find({status:0}).skip(20000).limit(1).toArray(async (error,result)=>{
                result.forEach(async (element)=>{
                
                console.log("running title --->"+element.job_titles);
                    const start = Date.now();
                    var title=decodeURIComponent(req.body.title).trim();
                    var location=decodeURIComponent('New York,NY').trim();
                    var Title=title.replace(/\s+/g, '+');
                    var Location=location.replace(/\s+/g, '+');
                    var joburl="https://www.careerbuilder.com/jobs?utf8=✓&keywords="+encodeURIComponent(element.job_titles)+"+&location="+Location;
                    joburl=joburl.replace(/%2B/g,'+')
                    console.log("Into the POST Method")
                    //this line is optional and will print the response on the command prompt
                    //It's useful so that we know what infomration is being transferred
                    //using the server
                    console.log(joburl);
                
                    console.log(Date.now() - start + '(ms) Opening tab');
                    const page = await browser.newPage();
                    try {
                        console.log("====================================THE START============================================")
                        const response = await LinksGetter(page, start, joburl,element.job_titles);

            //console.log(response);
            if (response.length){

                let ele=await response[0].occupation_category
                console.log("----------------------");
                await console.log(ele);
                console.log("----------------------");
                
            console.log("------------> occupation found "+response.hasOwnProperty('occupation_category'));
            //var occupation_category_string = details.occupation_category.occupation_category[1]
            if(ele.length){
                            
            await db.collection('Opt_OccupationCategories').insertOne({job_titles:element.job_titles,status:200,pid:element._id,new_status:200,LDJSON:response,occupation_category:response[0].occupation_category,occupation_category_string:response[0].occupation_category[1],occupation_category_object:response[0].occupation_category,result_from:'career_builder'});
            console.log("------------> saved in Opt_OccupationCategories");
            await db.collection('occupation_category_pending').updateOne({'_id':element._id},{$set:{status:1,success:1}}).then(() => console.log('------------> Updated Status Into the Collection occupation_category_pending 1'));  
                        }
                        
                    }else{
                        
            await db.collection('occupation_category_pending').updateOne({'_id':element._id},{$set:{status:1}}).then(() => console.log('------------> Updated Status Into the Collection occupation_category_pending no jobs 2'));
                        
                    }




                        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
                        console.log("====================================THE END============================================")
                        // res.status(200).send(uniqueDataSet(response));
                        res.status(200).send(response);
                
                
                    } catch (error) {
                        console.error('Error handling request', error);
                        console.log("====================================THE END WITH ERROR============================================")
                        res.status(200).send([]);
                
                    } finally {
                        setTimeout(() => page.close(), 50000);
                    }
                    //convert the response in JSON forma
            
                });
            });
            await db.close();
        });







        
    });



    
async function LinksGetter(page, start, joburl,title) {

    try {
        console.info(Date.now() - start + ": Opening page: " + joburl);
        var Useragents = ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
            'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
        ];
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
        );
        await page.setRequestInterception(true);
        page.on('request', request => {
            const type = request.resourceType();
            if (type === 'image' || type === 'font' || type === 'media' || type === 'manifest' || type === 'other' || type==='script')
                request.abort();
            else
                request.continue();
        });
        await page.setViewport({
            width: width,
            height: height
        });
        await page.goto(joburl, {
            networkIdle2Timeout: 300000,
            waitUntil: "networkidle2",
            timeout: 0
        });
        
        // await page.click('button[data-gtm="search_form_find_jobs_btn_clicked"]');
        // await page.waitFor(3000);
        //div[class="data-results-content-parent relative"] a.job-listing-item
        const details = await page.evaluate((title) => {
            var block=document.documentElement.querySelectorAll('div[class="data-results-content-parent relative"] a.job-listing-item');
            var dataSet=[];
            for (let index = 0; index < block.length; index++) {
                const element = block[index];
                dataSet.push({
                    'Title':element.querySelectorAll('div[class="data-results-title dark-blue-text b"]')[0].innerText.replace(/\t/g, ' ').replace(/ /g, ' ').replace(/\n/g, ' ').replace(/\s+/g, " ").trim(),
                    'Link':new window.URL(element.getAttribute('href'), window.document.URL).toString(),
                    'source':title
                })
            }
            return dataSet;
          },title);
          var recommendedTitle=[]
          for (let m = 0; m < details.length; m++) {
            const element = details[m].Title;
            if (element.length > title.length) {
                var fuzz_ratio = parseInt(fuzz.token_set_ratio(element, title));
                if (fuzz_ratio > 70) {
                    details[m].matchpercent=fuzz_ratio;
                    recommendedTitle.push(details[m])
                    break;
                }
            } else {
                var fuzz_ratio = parseInt(fuzz.token_set_ratio(title, element));
                if (fuzz_ratio > 70) {
                    details[m].matchpercent=fuzz_ratio;
                    recommendedTitle.push(details[m]);
                    break;
                }
            }

        }
        if(recommendedTitle.length>=1){
            var Ldjson=await LdJsonGetter(page,recommendedTitle[0].Link,start);
            let Ocp=Ldjson.occupation_category
            if (Ocp.length) {
                recommendedTitle[0].occupation_category=Ocp;
                recommendedTitle[0].LdJson=Ldjson.LdJson
            }
            else{
                recommendedTitle[0].occupation_category=[];
                recommendedTitle[0].response=[]
            }

            return recommendedTitle;
        }
        else{
            return recommendedTitle;
        }
        
    } catch (error) {
        console.log("error in nextButton function:"+error);
        return []
    }
}



   

async function LdJsonGetter(page,joburl,start) {
    try {
        console.info(Date.now() - start + ': Opening the Page: ' + joburl);
        await page.goto(joburl, {
            networkIdle2Timeout: 80000,
            waitUntil: 'networkidle2',
            timeout: 0
        });
        const result = await page.evaluate(() => {
            function cleanup(node, type) {
                const scripts = [];
                let els = node.getElementsByTagName(type);
                for (let i = els.length - 1; i >= 0; i--) {
                    if (els[i].type && els[i].type.toLowerCase().indexOf('ld+json') > -1 && els[i].type.toLowerCase().indexOf('"@type":"JobPosting"')) {
                        scripts.push(els[i].innerText.replace(/\t/g, ' ').replace(/ /g, ' '));
                    }
                }
                return scripts;
            }
            //var Urls = []

            // const ldjsons = cleanup(document.documentElement, 'script');

            const ldjsons = cleanup(document.documentElement, 'script');
            let json = {};
            if (ldjsons[0] && ldjsons[0].length) {
                for (const ldjson of ldjsons) {
                    json = Object.assign(json, JSON.parse(ldjson.replace(/\n/g, '')));
                }
            }
            return json;

        });

        console.info(Date.now() - start + ': Successfully Scrapped the Page: ' + joburl);
        console.log(result);
        /*
        if(result.hasOwnProperty('employmentType')){
            return result.employmentType;
        }
        else{

        }*/
        if(result.hasOwnProperty('occupationalCategory')){
            var data = {'occupation_category':result.occupationalCategory,'LdJson':result}
            return data;
        }
        var data = {'occupation_category':[],'LdJson':result}
        return data;

    }
    catch (e) {
        console.log("Some error "+e)
        var data = {'occupation_category':[],'LdJson':[]}
        return data;
    }






}
