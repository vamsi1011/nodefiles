"use strict";

/* global document:true, window:true, URL:true */
const rp = require("request-promise");
//const request = require('request');
const request = require('request');
const express = require("express");
const URL = require('url');
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
var roundround = require('roundround');
const MongoClient = require('mongodb').MongoClient
let db;
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
var Diffbot=[
    'e0d4926916c641fda4fcb583efca822b',
   'd3d9af77677b485aa64d6e9374e81730',
   '3c51c71605f14b34969d922880f59183',
   '4260129edb3a4d0596a773536ba81ad7',
   '4ee2fb15bef14efa987014539fc7aef0',
   'b8d9f42f5af24460afdda3a435c1fdb2',
]
var servers=['http://18.236.97.154',
'http://18.237.123.153',
'http://18.237.241.115',
'http://34.210.25.114',
'http://34.210.43.217',
'http://34.214.232.47',
'http://34.218.230.16',
'http://34.221.67.62',
'http://34.222.58.72',
// 'http://35.165.236.191',
'http://52.11.100.76',
'http://52.32.73.116',
'http://54.70.77.71',
'http://54.71.46.2',
'http://54.184.110.39',
'http://54.191.80.79',
'http://54.214.83.225',
'http://54.214.127.227']
var serverRound=roundround(servers)
var DiffbotRound=roundround(Diffbot)

var BigmlAllLabels=['http://jobiak-labeler.vpc.bigml.com/predict/labels','http://ec2-52-205-179-112.compute-1.amazonaws.com/predict/labels','http://prod-bigml-java-service-1746202486.us-east-1.elb.amazonaws.com/predict/labels','http://ijiraq.dev.bigml.com/predict/labels']
var next4=roundround(BigmlAllLabels)

var DescriptionEndpoints=['http://jobiak-description.vpc.bigml.com/predict/label/jobdescription/','http://prod-bigml-python-service-331630396.us-east-1.elb.amazonaws.com/predict/label/jobdescription/','http://ec2-3-221-92-23.compute-1.amazonaws.com:8443/predict/label/jobdescription/','http://ec2-3-222-93-96.compute-1.amazonaws.com:8443/predict/label/jobdescription/' ,'http://ijiraq.dev.bigml.com:8443/predict/label/jobdescription/']
var DescriptionRound=roundround(DescriptionEndpoints);
const HTTP_PORT = 8775;



MongoClient.connect("mongodb://jobiak:jobiak@18.223.47.109:28015/data_cleansing", {
    'poolSize': 10,
    'useNewUrlParser': true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('data_cleansing') // whatever your database name is
    const HTTP_PORT = 8775;
    var server = http
    .createServer(app)
    .listen(HTTP_PORT, () =>
        console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/?url=https://careers.ibm.com/ListJobs/All/?lang=en")
    );
    server.timeout = 500000;
})



app.get('/', async (req, res) => {
    const start = Date.now();
    const index = req.url.indexOf('url=');
    console.log(Date.now()-start+"(ms)=======================THE START=============================");
    
    console.log(Date.now()-start+"(ms) Into the GET Method")
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = decodeURIComponent(req.query.url);
    var needed = decodeURIComponent(req.query.needed);
    if(needed==undefined || needed==null){
        needed="Links"
    }
    const pageLimit = req.query.pageLimit;

    try {
        await db.collection('scrapingProject').deleteMany().then(() => console.log('Removed the Data in Table - Success'));
        const FinalResponse=await mainFunction(start,joburl,pageLimit,needed)
        console.log(Date.now()-start+"(ms)=======================THE END(SUCCESS)=============================");
        FinalResponse.throghput=(Date.now()-start)/1000
        res.status(200).send(FinalResponse)
        
    } catch (error) {
        console.log(Date.now()-start+"(ms)=======================THE END(FAILURE)=============================");
        res.status(200).send(error)
    }

});

app.post('/', async (req, res) => {
    const start = Date.now();
    const joburl = decodeURIComponent(req.body.url);
    const pageLimit = req.body.pageLimit;
    console.log(Date.now()-start+"(ms)=======================THE START=============================");
    console.log("Into the POST Method")
    if (joburl===""|| joburl===null || joburl===undefined) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }    
    var needed = decodeURIComponent(req.body.needed);
    if(needed==undefined || needed==null){
        needed="Links"
    }

    try {
        const FinalResponse=await mainFunction(start,joburl,pageLimit,needed)
        console.log(Date.now()-start+"(ms)=======================THE END(SUCCESS)=============================");
        res.status(200).send(FinalResponse)
    } catch (error) {
        console.log(Date.now()-start+"(ms)=======================THE ERROR=============================");
        res.status(200).send(error)
    }

});



///------Main Function
async function mainFunction(start,joburl,pageLimit,needed){
    try {
    console.log(Date.now()-start+"(ms){THE START in mainFunction with Page pageLimit:"+pageLimit);
    //check for the domain
    const urlParse = URL.parse(joburl);
    console.log("Domain=" + urlParse.hostname);
    let domain = urlParse.hostname;    
    if(pageLimit===undefined || pageLimit===null || pageLimit===""){
        pageLimit=40;
    }
    if(domain.includes('icims')){
        let finalDataSet=await icimsDataSet(start,joburl,pageLimit);
        
        return await finalDataToReturn(finalDataSet,needed);
    }else if(domain.includes('workday')){
        let finalDataSet=await workDay(start,joburl);
        return await finalDataToReturn(finalDataSet,needed);
    }else{
        var paginationSelectors_in_Urls = ['from=','&pageno=','page_jobs=','||d-ASC|','page_jobs=','&pageNum=','?pageNum=','pages=','jobOffset=','?folderOffset=', '&page=','&paged=','#page-','?pg=','PGNO=', 'Page-', 'Page=', 'page=', 'page/', 'startrow=', 'page-', 'startRow=','#||||','|||||', 'p=', 'offset=','pagenumber=','Pagenumber=','pageNumber='];
        var SourceUrlPatternCheck=await paginationPattern(start,[joburl],paginationSelectors_in_Urls)
        if (!(SourceUrlPatternCheck.hasOwnProperty('error')) && SourceUrlPatternCheck.matchUrl!=='') {
            console.log(Date.now()-start+"(ms) Got the Pattern in Given Job URL");
            var formUrls=await formingUrls(start,SourceUrlPatternCheck,pageLimit);
            var finalDataSet=await parallelCallingPagination(start,formUrls,'/DirectPage');
            return await finalDataToReturn(finalDataSet,needed);
        }
        else{
            console.log(Date.now()-start+"(ms) Didn't Got the Pattern in Given Job URL");
            let paginationLinks=await paginationLinksGetter(start,joburl);
            var pagePattern=await paginationPattern(start,paginationLinks,paginationSelectors_in_Urls);
        
            if (pagePattern.hasOwnProperty('error') || pagePattern.matchUrl==='') {
                console.log(Date.now()-start+"(ms) Didn't Got the Page Pattern in Going for Parallel Processing NEXT LOAD MORE....");
                var finalDataSet=await parallelCallingOtherProcess(start,joburl,pageLimit);

                return await finalDataToReturn(finalDataSet,needed);
            }else{
                console.log(Date.now()-start+"(ms) Got the Pagination URL's Going for Parallel Processing");
                var formUrls=await formingUrls(start,pagePattern,pageLimit);
                var finalDataSet=await parallelCallingPagination(start,formUrls,'/DirectPage');
                return await finalDataToReturn(finalDataSet,needed);
            }
        }

    }
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in Main Function:"+error);
        console.log("-------------------------------------------------------------");
        return [];
    }
    
}



function uniqueDataSet(originalArray, prop = "Link") {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}
async function finalDataToReturn(finalDataSet,needed){
    finalDataSet=await uniqueDataSet(finalDataSet);
    if(needed=="Links"){
        return finalDataSet;
    }else if(needed=="jobs"){
        return await getjobs(finalDataSet);
    }else{
        let jobsSet=await getjobs(finalDataSet);
         const start = Date.now();
        var finalDataSet=await parallelCallingPagination(start,jobsSet.perfectJobs,'/HTMLPlainText');
        
        await db.collection('scrapingProject').insertMany(finalDataSet).then(() => console.log('Updated Status Into the Collection - Success'));
        
        var BigmlSet=parallelCallingAllLabels(start,finalDataSet);
        //await db.collection('scrapingProject').updateMany({'HTML':{$ne:'','PlainText':{$ne:''}}},{$set:{'status':1}}).then(() => console.log('Updated Status Into the Collection'));
        var DiffBot=ParallelDiffbotget(start,finalDataSet);

        var bigmlWithDiffbot=await Promise.all([DiffBot,BigmlSet])
        var DiffbotPost=await ParallelDiffbotPost(start,finalDataSet)
        return {bigmlWithDiffbot,DiffbotPost};
    }
}

async function ParallelDiffbotget(start,finalDataSet){
    //var finalDataset=await db.collection('scrapingProject').find({'status':1}).toArray();
    var diffBotGetSuccess=[],diffBotGetError=[];
    await Promise.all(finalDataSet.map(async Dataset => {
        let joburl= Dataset.jobUrl;
        let Html=Dataset.HTML;
        let jobBody=Dataset.Jobbody 
        
            let diffPromise = getDiffBotResponse(joburl, Html);
            let DiffBot = await diffbotResponse(diffPromise, joburl);
            if (!DiffBot.hasOwnProperty('DiffBotHTML') && !DiffBot.hasOwnProperty('DiffBotPlainText')) {
                DiffBot.Diffstatus=500
                console.log('Updated Status:500 in Post')
                diffBotGetError.push(joburl)
                await db.collection('scrapingProject').updateOne({'jobUrl':Dataset.jobUrl},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));
            }
            else{
                DiffBot.Diffstatus=200
                console.log('Updated Status:200 in Post')
                diffBotGetSuccess.push(joburl)
                await db.collection('scrapingProject').updateOne({'jobUrl':Dataset.jobUrl},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));
            }
        
    }))
    return {'diffBotPostSuccess':diffBotGetSuccess,'diffBotPostError':diffBotGetError}
}

async function ParallelDiffbotPost(start,finalDataSet){
    console.log(Date.now() - start + "(ms){THE START in parallelDiffbot with Page ");
    var diffBotSuccess = [],diffBotError = [],descriptionSuccess=[],descriptionError=[]
    await Promise.all(
        finalDataSet.map(async Dataset => {
            let joburl=Dataset.jobUrl;
            let Html=Dataset.HTML;
            let diffPromise = getDiffBotResponse(joburl, Html);
            var DiffBot = await diffbotResponse(diffPromise, joburl);
    
            if (!DiffBot.hasOwnProperty('DiffBotHTML') || !DiffBot.hasOwnProperty('DiffBotPlainText')) {
                diffPromise = getDiffBotResponse(joburl, Html, true);
                DiffBot = await diffbotResponse(diffPromise, joburl);
                if (!DiffBot.hasOwnProperty('DiffBotHTML') && !DiffBot.hasOwnProperty('DiffBotPlainText')) {
                    DiffBot.DiffBotHTML='',DiffBot.DiffBotPlainText='';
                    DiffBot.Diffstatus=500
                    DiffBot.jobUrl=joburl
                    var jobDesc=await getBigMLLabel(start,'Description',joburl,Html,PlainText,'region',DescriptionRound());
                    var pageLabels={},Description='';
                    if(jobDesc.hasOwnProperty('value')){
                        let Dataset=jobDesc.value
                        for (const resp of Dataset) {
                            Description=Description+' '+resp.content
                          }
                          descriptionSuccess.push(joburl)
                          await db.collection('scrapingProject').updateOne({'jobUrl':Dataset.jobUrl},{$set:{'job-description':Description,'status':20000}}).then(() => console.log('Updated Status Into the Collection'));  
                    }
                    else{
                        descriptionError.push(joburl)
                        await db.collection('scrapingProject').updateOne({'jobUrl':Dataset.jobUrl},{$set:{'job-description':Description,'status':50000}}).then(() => console.log('Updated Status Into the Collection'));  
                    }
                    diffBotError.push(joburl)
                    console.log('Updated Status:500 in Post')
                    await db.collection('scrapingProject').updateOne({'jobUrl':joburl},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));
                }
                else{
                    
                    DiffBot.jobUrl=joburl
                    DiffBot.Diffstatus=200
                    var jobDesc=await getBigMLLabel(start,'Description',joburl,Html,DiffBot.DiffBotPlainText,'no_model',DescriptionRound());
                    var pageLabels={},Description='';
                    if(jobDesc.hasOwnProperty('value')){
                        let Dataset=jobDesc.value
                        for (const resp of Dataset) {
                            Description=Description+' '+resp.content
                          }
                          descriptionSuccess.push(joburl)
                          DiffBot["job-description"]=Description
                          await db.collection('scrapingProject').updateOne({'jobUrl':joburl},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));  
                    }
                    else{
                        DiffBot["job-description"]==null
                        descriptionError.push(joburl)
                        await db.collection('scrapingProject').updateOne({'jobUrl':joburl},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));  
                    }
                    diffBotSuccess.push(joburl)
                    console.log('Updated Status:200 in Post')
                    //await db.collection('scrapingProject').updateOne({'jobUrl':joburl},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));
                }
                }
        }
    ));
    return {'diffBotPostSuccess':diffBotSuccess,'diffBotPostError':diffBotError,'descriptionSuccess':descriptionSuccess,'descriptionError':descriptionError}

}
async function diffbotResponse(diffPromise, url,Html) {
    let response;
    try {
        const diffResponse = await diffPromise;
        response = JSON.parse(diffResponse);
        if (
            !response ||
            response.error ||
            !response.objects ||
            response.objects.length < 1 ||
            !response.objects[0].text ||
            response.objects[0].text === ''|| response.objects[0].text === '\n'
        ) {
            console.warn(new Date() + ' Diffbot error: ' + response.errorCode + '/' + response.error + ': ' + url);
            return {'Diffbot':response,'Diffbot_update_time':new Date()};
        } else {
            var DiffBotHtml=response.objects[0].html
            var DiffBotPlainText=response.objects[0].text
            return {'DiffBotHTML': DiffBotHtml,'DiffBotPlainText':DiffBotPlainText,'Diffbot':response,'Diffbot_update_time':new Date() };
        }
    } catch (error) {
        console.warn(new Date() + ' Diffbot error: ' + url, error);
        return {'Diffbot':{},'Diffbot_update_time':new Date(),'error':error};

    }


}
async function getjobs(finalDataSet){
    var perfectJobs=[],noJobs=[];
    await Promise.all(
        finalDataSet.map(async Dataset => {
            //log(start,Url,Urls.indexOf(Url));
            let Url=Dataset.Link;
            console.log(Url);
            if(UrlContainsForJobs(Url)){
                                                
                if(!endsWithUrl(Url)){
                    //console.log("Pushing into Perfect Jobs="+Url);

                    perfectJobs.push(Dataset.Link);
                    
                }
                else if(CheckLabel(Dataset.Label)){
                    perfectJobs.push(Dataset.Link);
                    
                }
                else{
                    console.log("Pushing into No Jobs="+Url);
                    noJobs.push(Dataset.Link);
                    
                }
            }else{
                if(CheckLabel(Dataset.Label)){
                    perfectJobs.push(Dataset.Link);
                    
                }
                else{
                    console.log("Pushing into No Jobs"+Url);
                    noJobs.push(Dataset.Link);
                    
                }
            }
        }));
    return {'perfectJobs':perfectJobs,'noJobs':noJobs,'perfectJobsCount':perfectJobs.length,'noJobsCount':noJobs.length}
}

async function parallelCallingPagination(start,jobUrls,apiUrl,pageLimit=0){
    try {
        console.log(Date.now() - start + "(ms){THE START in parallelCalling Pagination with Page pageLimit:}" + pageLimit);
        var Formated_Result = [],
            Formated_Error = []
        await Promise.all(
            jobUrls.map(async url => {
                var API_url = apiUrl;
                console.log((Date.now() - start) + "ms Sending " + url + " to " + API_url)
                try {
                    const AllLinks = await apiRequestFuntion(start,API_url, decodeURIComponent(url).trim());
                    AllLinks.jobUrl=url;
                    console.log('Got the response ' + url + ' in ' + (Date.now() - start) + "ms");
                    Formated_Result.push(AllLinks);
                } catch (error) {
                    console.warn('Error getting label values for: ' + url, error);
                    Formated_Error.push(url);
                }
            })
        );
        var finalDataSet = Array.prototype.concat.apply([], Formated_Result);
        return finalDataSet;
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in parallelCalling Pagination Function:"+error);
        console.log("-------------------------------------------------------------");
        return [];
    }

}
async function parallelCallingOtherProcess(start,joburl,pageLimit=3){
    try {
        console.log(Date.now() - start + "(ms){THE START in parallelCalling with Page pageLimit:" + pageLimit);
        const allLinksGetter = [];
        const allLinksGettererrors = [];
        const sourceUrls = ['/LoadMore',
            '/NextButton',
            '/Scrolling', '/DirectPage'
        ]
        await Promise.all(
            sourceUrls.map(async APIurl => {
                try {
                    const AllLinks = await apiRequestFuntion(start,APIurl, decodeURIComponent(joburl).trim(),pageLimit);
                    allLinksGetter.push(AllLinks);
                } catch (error) {
                    console.warn('Error getting label values for: ' + APIurl, error);
                    allLinksGettererrors.push(APIurl);
                }
            })
        );
        
        console.log(Date.now() - start + " Completed Getting the AllLink URLs");
        console.log("-------------------------------------------------------------");

        console.log({'errorUrls':allLinksGettererrors});

        console.log("-------------------------------------------------------------");
        console.log("=============================THE END=====================================")
        var finalDataSet = Array.prototype.concat.apply([], allLinksGetter);
        return finalDataSet;
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in parallelCalling Function:"+error);
        console.log("-------------------------------------------------------------");
        return [];
    }
}
async function parallelCallingAllLabels(start,Data){
    let bigmlSuccessSet=[],bigmlFailureSet=[],count=0
    //const Data = await db.collection('scrapingProject').find({}).limit(5).toArray();
    if(Data.length>=1){
        await Promise.all(
            Data.map(async data => {
                var pageLabels={};
                pageLabels.jobUrl= data.jobUrl;
                try {
                const start = Date.now();
                console.log( data.jobUrl);
                var startTime=Date.now()
                var responses = await getBigMLLabel(start, 'AllLabels', data.jobUrl,  data.HTML, data.Jobbody,'method',next4());
                if(responses!=={} &&responses.length>=1 && !responses.hasOwnProperty('error')){
                    console.log("-----------------------------------------------");
                    count=count+1;
                    console.log(count);
                    log(startTime, data.jobUrl,'Got the Response');
                    for (const resp of responses) {
                        pageLabels[resp.label] = resp.value;
                      }
                      pageLabels.status=200
                      pageLabels.UpdateTime=new Date();     
                      bigmlSuccessSet.push(data.jobUrl)
                      console.log("-----------------------------------------------");   
                      await db.collection('scrapingProject').updateOne({'jobUrl':data.jobUrl},{$set:pageLabels}).then(() => console.log('Updated Status Into the Collection')); 
                }else{
                    console.log("-----------------------------------------------");
                    log(startTime,data.jobUrl,'Got the Error');
                    await db.collection('scrapingProject').updateOne({'jobUrl':data.jobUrl},{$set:{'status':500,LabelsUpdateTime:new Date()}}).then(() => console.log('Updated Status Into the Collection'));    
                    console.log("-----------------------------------------------");
                    pageLabels.response=responses
                    bigmlFailureSet.push(data.jobUrl)
                }
                
                 
                } catch (error) {
                    
                    console.log("-----------------------------------------------");
    
                    console.log(error);
                    
                    console.log("-----------------------------------------------");
                    pageLabels.error=error;
                    bigmlFailureSet.push(data.jobUrl)
                    await db.collection('scrapingProject').updateOne({'jobUrl':data.jobUrl},{$set:{'status':500,LabelsUpdateTime:new Date()}}).then(() => console.log('Updated Status Into the Collection'));    
                }
            })
        ); 
        return {'bigmlSuccessSet':bigmlSuccessSet,'bigmlFailureSet':bigmlFailureSet,}
        //await parallelCallingAllLabels();
    }else{
        return {'bigmlSuccessSet':bigmlSuccessSet,'bigmlFailureSet':bigmlFailureSet,}
    }
    
    
}
async function getBigMLLabel(start, label, joburl, jobhtml, jobbody, method, apiUrl) {
    if (joburl != "" && joburl != null && jobhtml != '' && jobhtml != null && jobbody != '' && jobbody != null) {
        return await new Promise((resolve, reject) => {
            var formData = {}
            if (label == 'Description') {
                formData = {
                    joburl,
                    jobbody,
                    jobhtml,
                    method
                };
            } else {
                formData = {
                    joburl,
                    jobbody,
                    jobhtml
                };
            }

            var options = {
                url: apiUrl,
                method: 'POST',
                json: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                formData
            };

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //body=JSON.parse(body)
                    //console.log(body);
                    //console.log(response.statusCode);
                    resolve(body);
                } else {
                    //console.log(error);
                    //console.log(response.statusCode);
                    resolve({
                        'error': error
                    })
                }
            }

            var response = request(options, callback);
        });
    } else {
        return {}
    }
}
async function getDiffBotResponse(joburl, body, get) {
    return await new Promise((resolve, reject) => {
        // var dataString = '{ "joburl": "' + (joburl) + '","jobbody":"' + (jobbody) + '","jobhtml":"' + (jobhtml) + '","method":"' + method + '"}';
 
         const options = {
            url: 'https://api.diffbot.com/v3/article',
            method: 'GET',
            qs: {
                token: DiffbotRound(),
                maxTags: 0,
                paging: false,
                discussion: false,
                url: joburl
            }
        };
        if (get) {
            options.method = 'POST';
            options.headers = { 'Content-Type': 'text/html' };
            options.body = body;
        }
         function callback(error, response, body) {
             if (!error && response.statusCode == 200) {
                 console.log(body);
                 console.log(response.statusCode);
                 resolve(body);
             } else {
                 console.log(error);
                 //console.log(response.statusCode);
                 
                 resolve('Api Failed')
             }
         }
 
         var response = request(options, callback);
     });
}
async function paginationLinksGetter(start,joburl,pageLimit=0){
    try {
        console.log(Date.now()-start+"(ms){Into the Pagination Function with Page pageLimit:"+pageLimit+"}");
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        let API_url='/Pagination';
        let finalDataSet = await apiRequestFuntion(start,API_url, decodeURIComponent(joburl.trim()));
        console.log(Date.now()-start+"(ms) Got the Response for " + joburl)
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        return finalDataSet;
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in Pagination Function:"+error);
        console.log("-------------------------------------------------------------");
        return [];
    }
}

async function paginationPattern(start,UrlsArray,selectors){
    try {

        console.log(Date.now()-start+"(ms){Into the paginationPattern Function}");
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        if(UrlsArray.length==0){
            return {'matchUrl':'','pattern':''}
        }
        for (let index1 = 0; index1 < UrlsArray.length; index1++) {
            const matchUrl = UrlsArray[index1];
            console.log(matchUrl);
            for (let index2 = 0; index2 < selectors.length; index2++) {
                const pattern = selectors[index2];
                console.log(Date.now()-start+"(ms) Checking "+matchUrl + " includes " + pattern)
                if(matchUrl.includes(pattern)){
                    return {'matchUrl':matchUrl,'pattern':pattern}
                }
            }
            
        }
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        return {'matchUrl':'','pattern':''}
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in paginationPattern Function:"+error);
        console.log("-------------------------------------------------------------");
        return {'matchUrl':'','pattern':'','error':error}
    }
}

async function formingUrls(start,pagePattern,pageLimit){
    let UrlFormation=[];
    let matchUrl=pagePattern.matchUrl;
    let pattern=pagePattern.pattern;
    var numberAfterPattern = parseInt(await get_page_number(matchUrl,pattern));
    console.log("PageNumber Found=" + numberAfterPattern)
    var StringToChange = pattern + numberAfterPattern;
    console.log(StringToChange);
    var incr=0,numb=0;
    while(incr<pageLimit){
        if(pattern=='jobOffset='){
            pageLimit=pageLimit*5;
            page_number_value=5
            numb = numb + page_number_value
            var NewValue = pattern + numb
            UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
            incr=incr+1
            incrm = incrm + 1
        }
        else if(pattern=='?folderOffset='){
            pageLimit=pageLimit*20;
            page_number_value=20
            numb = numb + page_number_value
            var NewValue = pattern + numb
            UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
            incrm = incrm + 1
        }
        else if((numberAfterPattern>0 && numberAfterPattern%2==0||numberAfterPattern===1)){
            var NewValue = pattern + (numb+1);
            numb=numb+1
            UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
            incr=incr+1
        }

        else if(pattern.toLowerCase()=='startrow='){
            pageLimit=pageLimit*25;
            page_number_value=25
            numb = numb + page_number_value
            var NewValue = pattern + numb
            UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
            incrm = incrm + 1
        }else if(pattern.toLowerCase()=='from='){
            if(numberAfterPattern==10){
                pageLimit=pageLimit*10;
                page_number_value=10
                numb = numb + page_number_value
                var NewValue = pattern + numb
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
            }else{
                var NewValue = pattern + numb;
                numb=numb+1
                UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
                incr=incr+1
            }
        }
        else{
            var NewValue = pattern + numb;
            numb=numb+1
            UrlFormation.push(matchUrl.replace(StringToChange, NewValue).replace('/null','').trim());
            incr=incr+1
        }

    }
    return UrlFormation;
}
async function workDay(start,joburl,pageLimit=0){
    try {
        console.log(Date.now()-start+"(ms){Into the workDay Function with Page pageLimit:"+pageLimit+"}");
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        let API_url='/Scrolling';
        let finalDataSet = await apiRequestFuntion(start,API_url, decodeURIComponent(joburl.trim()));
        console.log(Date.now()-start+"(ms) Got the Response for " + joburl)
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        return finalDataSet;
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in workDay Function:"+error);
        console.log("-------------------------------------------------------------");
        return [];
    }

}


/////ICIMS
async function icimsDataSet(start,joburl,pageLimit){
    try {
        console.log(Date.now()-start+"(ms){Into the ICIMS Function with Page pageLimit:"+pageLimit+"}");
        const Parsedurl = URL.parse(joburl);
        var ICIMS_urls = [],ICIMS_Result = [],ICIMS_Error = [],incr=0;
        while (incr < pageLimit) {
            const FormedURL = Parsedurl.protocol + "//" + Parsedurl.host + "/jobs/search?pr=" + incr
            ICIMS_urls[incr] = FormedURL
            incr = incr + 1;
        }
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        
        await Promise.all(
            ICIMS_urls.map(async url => {
                var API_url = '/DirectPage';
                console.log(Date.now()-start+"(ms) Sending " + url + " to " + API_url)
                try {
                    let AllLinks = await apiRequestFuntion(start,API_url, decodeURIComponent(url.trim()));
                    console.log(Date.now()-start+"(ms) Got the Response for " + url)
                    AllLinks.jobUrl=url
                    ICIMS_Result.push(AllLinks)
                } catch (error) {
                    console.warn('Error getting label values for: ' + url, error);
                    ICIMS_Error.push(url);
                }
            })
        );
        console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log("-------------------------------------------------------------");

        console.log({'errorUrls':ICIMS_Error});

        console.log("-------------------------------------------------------------");
        var finalDataSet = Array.prototype.concat.apply([], ICIMS_Result);
        return finalDataSet;
    } catch (error) {
        console.log("-------------------------------------------------------------");
        console.log(Date.now()-start+"(ms) Error in ICIMS Function:"+error);
        console.log("-------------------------------------------------------------");
        return [];
    }

}
function CheckLabel(label){
    let DataSet=[
        'Apply More Details','More Info'
    ]
    for (let index = 0; index < DataSet.length; index++) {
        const element = DataSet[index];
        if(element==label.trim()){
            console.log(element + " found");
            return true;
        }
    }
    return false;
}


function endsWithUrl(url){
    var endwithData=['/contact/','/staff','/services',"/feedback","search.html",
    "savedJobs.html","MyChart/","save_job/",
    "terms-and-conditions",
    "company.html",
    "prem-offline-form",
    "careers/#","/patients","/forgot","Research & Innovation","Patients & Visitors","terms/","/refer",'/responsibility','/terms-conditions',"/services",".org/","our-story/","forms/",'save_job/','open-positions/','topjobs/','/google-translate','.edu/','.org/','/volunteer','/join','/privacy/','/pay-your-bill','/terms/','/pay-a-bill','/submissions','/about','/privacy','/search','/your-application','/blog','/job_search#','.ca//','/contact-emerald/','/talk-to-us/','/connect.html','.com/','/contact-us.html','/contact-us','/contact','/contact.html']
    var Patterns=['&pageno=','/jobs/job-search/','/jobs/resume','/search','?pageNum=','page_jobs=','/jobsearch.ftl','/joblist.rss','plus.google.com','googleads.g.doubleclick.net','/location/','/category/','youtube.com','gmail.com','twitter.com','linkedin.com','page_jobs=','?facetcategory=','?facetcategory=','?facetcountry=','/listings.html','twitter.com','&pageNum=','pages=','/jobs/in/','jobOffset=','?folderOffset=', '&page=','&paged=','#page-','?pg=','PGNO=', 'Page-', 'Page=', 'page=', 'page/', 'startrow=', 'page-', 'startRow=','#||||','|||||', 'p=', 'offset=','pagenumber=','Pagenumber=','pageNumber=']
    for (let index = 0; index < Patterns.length; index++) {
        const element = Patterns[index];
        if(url.indexOf(element)>=0){
            if(element=='/search'){
                if(url.indexOf('/search/job/')>=0 || url.indexOf('/Search/Apply/all/')>=0){
                    return false;
                }
            }
            console.log(element + " found");
            
            return true;
        }
    }
    for (let index = 0; index < endwithData.length; index++) {
        const element = endwithData[index];
        if(url.endsWith(element)){
            console.log(element + " found");

            return true;
        }
    }
    return false;
}


function UrlContainsForJobs(url){
    let Dataset=[
        '/job-seekers/',
        '/job_detail/',
        '/JobDescription.asp',
        '&JobNumber=',
        '/jobs/',
        '/job/',
        '/job?',
        '/Posting/',
        '/posting/',
        '/JD/',
        '/GetJob/ViewDetails/',
        '/JobDetail/',
        '/DashJobDetail/',
        '?quickFind=',
        '/rc/clk?','/jobdetail.ftl',
        '/ViewJobDetails',
        '/careers/opportunity/',
        '/Jobs/Details/',
        '/ts2__JobDetails?jobId=',
        '/ts2__JobDetails',
        '/Jobs/',
        '/jobs/ViewJobDetails',
       '/ShowJob/',
       '/MainInfoReq.asp',
       '/jobdetail',
       '/myjobs/',
       '/myjobs/openjob',
       '/JobPosting/',
       '/careers/detail/',
       '/Search/Apply/all/',
       '/search/job',
       '/DistrictJobPosting/',
       '/epostings/',
       '-jobs-','/viewRequisition?',
       '.showJob','/position-details/?job_id=',
       '/position-details/','/careers/development/','/careers/partner-co-investor-relations/','/careers/onsite-property-management/','/careers/finance-capital-markets/',
       '/careers/human-resources/','/careers/compliance/','/careers/partner-co-investor-relations/','/career-center/?RequirementId='
    ]
    for (let index = 0; index < Dataset.length; index++) {
        const element = Dataset[index];
        if(url.indexOf(element)>=0){
            console.log(element + " found");
            return true;
        }
    }
    return false;
}


function get_page_number(url, selector) {

    var page_number = -1;
    page_number = url.lastIndexOf(selector);
    if (page_number != -1) {
        page_number = page_number + selector.length;
    }
    var number_string_value = url.substring(page_number, page_number + 5);
    if (number_string_value.match(/\d/g)) {
        return number_string_value.match(/\d/g).join('').toString();
    } else {
        return '';
    }

}
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function apiRequestFuntion(start,API, joburl,pageLimit) {
    var API_Endpoint="",API_url=""
    if (API==="/NextButton") {
        API_Endpoint = serverRound()+':'+7517
    }else if(API==="/LoadMore"){
        API_Endpoint = serverRound()+':'+7516
    }else{
        API_Endpoint = serverRound()+':'+randomIntFromInterval(7511,7515)
    }
    if(API=='/HTMLPlainText' || API=='/Pagination' || API=='/DirectPage' || API=='/Scrolling'){
        API_url = API_Endpoint + API+'?url='+encodeURIComponent(joburl);
    }
    else{
        API_url = API_Endpoint + API+'?url='+encodeURIComponent(joburl)+'&pageLimit='+pageLimit;
    }
    console.log(Date.now()-start+"(ms) Making Request to " + API_url);
    var Options = {
        url: API_url,
        strictSSL: true,
        headers: {
            'content-type': 'application/json'
        },
        method: "GET",
        //timeout: 120000,
        json: true,
        body: {
            "url": encodeURIComponent(joburl)
        }
    }
    return rp(Options);

}

function log(start, url, msg) {
    console.info(new Date() + ' [' + (Date.now() - start) + ' ms] ' + msg + ': ' + url);
  }




