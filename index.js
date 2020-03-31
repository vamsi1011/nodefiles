var config = require('./config.js');
const nanoid = require("nanoid");
const log = config.log;
const dateFormat = config.dateFormat;
var now = config.now;
const request = config.request;
const URL = config.URL;
const rp = config.rp;
const local_uri = config.local_uri;
const server_uri = config.server_uri;
const chalk = config.chalk;
const titleunwanted=config.titleunwanted;

const http = config.http;
const bodyParser = config.bodyParser;
const HTTP_PORT = config.HTTP_PORTS;
const formingUrls = config.formingUrls;
const MongoClient = config.MongoClient;
//---function----
const shuffle = config.shuffle;
const randomIntFromInterval = config.randomIntFromInterval
const servers = config.servers;
shuffle(servers)
const roundround = config.roundround;
const serverRound = roundround(servers);
const uniqueDataSet=config.uniqueDataSet;
////---------------
var Diffbot=[
    'e0d4926916c641fda4fcb583efca822b',
   'd3d9af77677b485aa64d6e9374e81730',
   '3c51c71605f14b34969d922880f59183',
   '4260129edb3a4d0596a773536ba81ad7',
   '4ee2fb15bef14efa987014539fc7aef0',
   'b8d9f42f5af24460afdda3a435c1fdb2',
]
var DiffbotRound=roundround(Diffbot)
var url='mongodb://jobiak:jobiak@18.223.47.109:28015/data_cleansing'
var BigmlAllLabels=['http://jobiak-labeler.vpc.bigml.com/predict/labels','http://prod-bigml-java-service-1746202486.us-east-1.elb.amazonaws.com/predict/labels']
var next4=roundround(BigmlAllLabels)

var DescriptionEndpoints=['http://jobiak-description.vpc.bigml.com/predict/label/jobdescription/','http://prod-bigml-python-service-331630396.us-east-1.elb.amazonaws.com/predict/label/jobdescription/','http://ec2-3-221-92-23.compute-1.amazonaws.com:8443/predict/label/jobdescription/','http://ec2-3-222-93-96.compute-1.amazonaws.com:8443/predict/label/jobdescription/' ,'http://ijiraq.dev.bigml.com:8443/predict/label/jobdescription/']
var DescriptionRound=roundround(DescriptionEndpoints);
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({
    'limit': '50mb',
    'extended': 'true'
}));
app.use(bodyParser.json({
    'limit': '50mb',
    'extended': 'true'
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
MongoClient.connect(server_uri, {'useUnifiedTopology':true,'useNewUrlParser': true} , {
    'poolSize': 10,
}, (err, client) => {
    if (err) return //console.log(err)
    db = client.db('marketingTool') // whatever your database name is
    var server = http
        .createServer(app)
        .listen(HTTP_PORT[0], () =>
            console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT[0])
        );
    server.timeout = 240000;
})
app.get('/marketingTool', async (req, res) => {
    const start = Date.now();
    const index = req.url.indexOf('url=');
    //console.log("Into the GET Method")
    if (index < 0) {
        return res.send('{"message": "No URL provided.", "status": 1}');
    }

    const joburl = decodeURIComponent(req.query.url).trim();
    const navLimit = req.query.navLimit
    const needed = req.query.needed
    const processId = await nanoid(48);
    //console.log("Given joburl " + joburl)
    try {
        console.log("====================================THE START============================================")
        var response = await process(start, joburl, navLimit,needed,processId);
        response.processId=processId;
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("=====================================THE END===========================================");
        res.send(response);

    } catch (error) {
        console.error('Error handling request', error);
        //console.log("====================================THE END WITH ERROR============================================")
        res.status(200).send([]);

    } 
});
app.post('/marketingTool', async (req, res) => {
    const start = Date.now();
    const joburl = decodeURIComponent(req.body.url).trim();
    //console.log("Into the POST Method")
    //this line is optional and will print the response on the command prompt
    //It's useful so that we know what infomration is being transferred
    //using the server
    //console.log(joburl);
    const navLimit = req.body.navLimit
    const needed = req.body.needed
    const processId = await nanoid(48);
    try {
        console.log("====================================THE START============================================")
        var response = await process(start, joburl, navLimit,needed,processId);
        response.processId=processId;
        console.log(Date.now() - start + '(ms)' + joburl + ' page response sent');
        console.log("=====================================THE END===========================================")
        res.send(response);


    } catch (error) {
        console.error('Error handling request', error);
        //console.log("====================================THE END WITH ERROR============================================")
        res.status(200).send([]);

    }
    //convert the response in JSON format
});


app.get('/title', async (req, res) => {
    const processId = req.query.processId
    try {
        //console.log("====================================THE START============================================")
        let goldSet=await db.collection('marketingtool_individual').find({'processId':processId}).toArray();
        var uniqueLabelSet=await uniqueLabels(goldSet);
        //log(uniqueLabelSet.title)
        //console.log("Given processId " + processId)
        await titleIssue(uniqueLabelSet.title);
        let returnData=await db.collection('marketingtool_individual').find({'processId':processId}).project({'job-title':1,'titleissue':1,'titleIssueMatch':1}).toArray();
        //console.log("=====================================THE END===========================================");
        res.send(returnData);

    } catch (error) {
        console.error('Error handling request', error);
        //console.log("====================================THE END WITH ERROR============================================")
        res.status(200).send([]);

    } 
});

async function process(start, joburl, navLimit,needed,processId) {
    const urlParse = URL.parse(joburl);
    //console.log("Domain=" + urlParse.hostname);
    let domain = urlParse.hostname;
    if (domain.includes('workday')) {
        let scrollingData = await apiRequestFuntion(start, '/Scrolling', joburl);
        return await finalDataToReturn(scrollingData,needed,joburl,processId);
    }
    let paginationCheckData = await paginationCheck(start, joburl, navLimit, domain);
    if (paginationCheckData.hasOwnProperty('error')) {
        var finalDataSet = await parallelCallingOtherProcess(start, joburl, navLimit);
        return await finalDataToReturn(finalDataSet,needed,joburl,processId);
    } else {
        if (paginationCheckData.type == 'pagination' || paginationCheckData.type == 'icims') {
            var finalDataSet = await parallelCallingPagination(start, paginationCheckData.paginationUrls, '/DirectPage');
            return await finalDataToReturn(finalDataSet.success,needed,joburl,processId);
        }
        var finalDataSet = await parallelCallingOtherProcess(start, joburl, navLimit);
        return await finalDataToReturn(finalDataSet,needed,joburl,processId);

    }
}

var paginationCheck = async function (start, joburl, navLimit, domain) {
    try {
        let urlData = await db.collection('marketingTool').find({
            'url': joburl
        }, {
            '_id': 0
        }).toArray()
        //console.log("Length of Data:" + urlData.length);
        if (urlData.length) {
            //console.log(chalk.blue(Date.now() - start + " Got the Pagination Response in DB " + joburl));
            //return urlData[0].PageLinks;
            if (urlData[0].type == 'icims') {
                var paginationUrls = await formingUrls(start, joburl, 'icims', [], urlData[0].PageLinks.numberAfterPattern + 1)
                urlData[0].paginationUrls = paginationUrls;
                return urlData[0];
            } else if (urlData[0].type == 'others') {
                return urlData[0];
            } else {
                var paginationUrls = await formingUrls(start, joburl, '', urlData[0].PageLinks, navLimit);
                urlData[0].paginationUrls = paginationUrls;
                return urlData[0];
            }
        } else {
            //console.log(chalk.blue(Date.now() - start + " Requesting for Pagination Response " + joburl));
            let PaginationAPI = await apiRequestFuntion(start, '/Pagination', joburl, navLimit);
            PaginationAPI.type = 'others'
            if (PaginationAPI.paginationUrls.length) {
                if (domain.includes('icims')) {
                    PaginationAPI.type = 'icims'
                } else {
                    PaginationAPI.type = 'pagination'
                }
            }
            PaginationAPI.updatedDate = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
            PaginationAPI.domain = domain,
                PaginationAPI.url = joburl,
                await db.collection('marketingTool').insertMany([PaginationAPI]).then(() => console.log('Inserted Into the Collection'));
            //console.log(chalk.blue(Date.now() - start + " Got Pagination Response " + joburl));
            return PaginationAPI;
        }
    } catch (error) {
        //console.log(chalk.red("Error in paginationCheck:" + error));
        return {
            'error': error
        };
    }

}


function googleapiRequestFuntion(start,title,company,location,joburl,stausBit) {
    var API='/googleForJobs'
    // if (API === "/NextButton") {
    //     API_Endpoint = serverRound() + ':' + 8125
    // } else if (API === "/LoadMore") {
    //     API_Endpoint = serverRound() + ':' + 8125
    // } else {
    //     API_Endpoint = serverRound() + ':' + randomIntFromInterval(8125, 8125)
    // }
    var API_Endpoint = serverRound() + ':' + randomIntFromInterval(8121, 8125)
    var API_url=API_Endpoint + API + '?url=' + encodeURIComponent(joburl) + '&company=' + decodeURIComponent(company)+'&title='+decodeURIComponent(title)+'&location='+decodeURIComponent(location)+'&statusBit='+stausBit;
    log("-----------------------------------------------------------------")
    console.log(API_Endpoint+' '+'joburl:'+joburl);
    log("-----------------------------------------------------------------")
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
function apiRequestFuntion(start, API, joburl, pageLimit) {
    var API_Endpoint = "",
        API_url = ""
    API_Endpoint = serverRound() + ':' + randomIntFromInterval(8121, 8125)
    if (API == '/HTMLPlainText' || API == '/DirectPage' || API == '/Scrolling') {
        API_url = API_Endpoint + API + '?url=' + encodeURIComponent(joburl);
    } else {
        API_url = API_Endpoint + API + '?url=' + encodeURIComponent(joburl) + '&navLimit=' + pageLimit;
    }
    //console.log(Date.now() - start + "(ms) Making Request to " + API_url);
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

async function parallelCallingOtherProcess(start, joburl, pageLimit = 3) {
    try {
        //console.log(Date.now() - start + "(ms){THE START in parallelCalling with Page pageLimit:" + pageLimit);
        const allLinksGetter = [];
        const allLinksGettererrors = [];
        const sourceUrls = ['/LoadMore',
            '/NextButton',
            '/Scrolling', '/DirectPage'
        ]
        await Promise.all(
            sourceUrls.map(async APIurl => {
                try {
                    const AllLinks = await apiRequestFuntion(start, APIurl, decodeURIComponent(joburl).trim(), pageLimit);
                    allLinksGetter.push(AllLinks);
                } catch (error) {
                    console.warn('Error getting label values for: ' + APIurl, error);
                    allLinksGettererrors.push(APIurl);
                }
            })
        );

        //console.log(Date.now() - start + " Completed Getting the AllLink URLs");
        //console.log("-------------------------------------------------------------");

        // //console.log({
        //     'errorUrls': allLinksGettererrors
        // });

        //console.log("-------------------------------------------------------------");
        //console.log("=============================THE END=====================================")
        var finalDataSet = Array.prototype.concat.apply([], allLinksGetter);
        return finalDataSet;
    } catch (error) {
        //console.log("-------------------------------------------------------------");
        //console.log(Date.now() - start + "(ms) Error in parallelCalling Function:" + error);
        //console.log("-------------------------------------------------------------");
        return [];
    }
}
async function parallelCallingPagination(start,jobUrls,apiUrl,pageLimit=5){
    try {
        //console.log(Date.now() - start + "(ms){THE START in parallelCalling Pagination with Page pageLimit:}" + pageLimit);
        var Formated_Result = [],
            Formated_Error = []
        await Promise.all(
            jobUrls.map(async url => {
                var API_url = apiUrl;
                //console.log((Date.now() - start) + "ms Sending " + url + " to " + API_url)
                try {
                    const AllLinks = await apiRequestFuntion(start,API_url, decodeURIComponent(url).trim());
                    if(apiUrl=='/HTMLPlainText'){
                        AllLinks.jobUrl=url;
                    }
                    
                    //console.log('Got the response ' + url + ' in ' + (Date.now() - start) + "ms");
                    Formated_Result.push(AllLinks);
                } catch (error) {
                    console.warn('Error getting label values for: ' + url, error);
                    Formated_Error.push(url);
                }
            })
        );
        var finalDataSet = Array.prototype.concat.apply([], Formated_Result);
        return {'success':finalDataSet,'failed':Formated_Error};
    } catch (error) {
        //console.log("-------------------------------------------------------------");
        //console.log(Date.now()-start+"(ms) Error in parallelCalling Pagination Function:"+error);
        //console.log("-------------------------------------------------------------");
        return [];
    }

}
async function parallelCallingOtherProcess(start,joburl,pageLimit=3){
    try {
        //console.log(Date.now() - start + "(ms){THE START in parallelCalling with Page pageLimit:" + pageLimit);
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
        
        //console.log(Date.now() - start + " Completed Getting the AllLink URLs");
        //console.log("-------------------------------------------------------------");

        //console.log({'errorUrls':allLinksGettererrors});

        //console.log("-------------------------------------------------------------");
        //console.log("=============================THE END=====================================")
        var finalDataSet = Array.prototype.concat.apply([], allLinksGetter);
        return finalDataSet;
    } catch (error) {
        //console.log("-------------------------------------------------------------");
        //console.log(Date.now()-start+"(ms) Error in parallelCalling Function:"+error);
        //console.log("-------------------------------------------------------------");
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
                pageLabels.HTML=data.HTML;
                pageLabels.Jobbody=data.Jobbody;
                try {
                const start = Date.now();
                //console.log( data.jobUrl);
                var startTime=Date.now()
                var responses = await getBigMLLabel(start, 'AllLabels', data.jobUrl,  data.HTML, data.Jobbody,'method',next4());
                if(responses!=={} &&responses.length>=1 && !responses.hasOwnProperty('error')){
                    //console.log("-----------------------------------------------");
                    count=count+1;
                    //console.log(count);
                    //log(startTime, data.jobUrl,'Got the Response');
                    for (const resp of responses) {
                        pageLabels[resp.label] = resp.value;
                      }
                      pageLabels.status=200
                      pageLabels.UpdateTime=new Date();     
                      bigmlSuccessSet.push(pageLabels)
                      //console.log("-----------------------------------------------");   
                      //await db.collection('scrapingProject').updateOne({'jobUrl':data.jobUrl},{$set:pageLabels}).then(() => console.log('Updated Status Into the Collection')); 
                }else{
                    //console.log("-----------------------------------------------");
                    //log(startTime,data.jobUrl,'Got the Error');
                    //await db.collection('scrapingProject').updateOne({'jobUrl':data.jobUrl},{$set:{'status':500,LabelsUpdateTime:new Date()}}).then(() => console.log('Updated Status Into the Collection'));    
                    //console.log("-----------------------------------------------");
                    pageLabels.response=responses
                    bigmlFailureSet.push(data.jobUrl)
                }
                
                 
                } catch (error) {
                    
                    //console.log("-----------------------------------------------");
    
                    //console.log(error);
                    
                    //console.log("-----------------------------------------------");
                    pageLabels.error=error;
                    bigmlFailureSet.push(data.jobUrl)
                    //await db.collection('scrapingProject').updateOne({'jobUrl':data.jobUrl},{$set:{'status':500,LabelsUpdateTime:new Date()}}).then(() => console.log('Updated Status Into the Collection'));    
                }
            })
        ); 
        return {'bigmlSuccessSet':bigmlSuccessSet,'bigmlFailureSet':bigmlFailureSet,}
        //await parallelCallingAllLabels();
    }else{
        return {'bigmlSuccessSet':bigmlSuccessSet,'bigmlFailureSet':bigmlFailureSet,}
    }
    
    
}
async function finalDataToReturn(finalDataSet,needed,joburl,processId){
    finalDataSet=await uniqueDataSet(finalDataSet);
    if(needed.toLowerCase()=="links"){
        finalDataSet=await appendSrc(finalDataSet,joburl)
        return finalDataSet;
    }else if(needed.toLowerCase()=="jobs"){
        now=Date.now();
        let jobsSet=await getjobs(finalDataSet)
        let perfectJobs=await appendSrc(jobsSet.perfectJobs,joburl)
        let noJobs=await appendSrc(jobsSet.noJobs,joburl)
        return {'perfectJobs':perfectJobs,'noJobs':noJobs,'perfectJobsCount':perfectJobs.length,'noJobsCount':noJobs.length,'AllLinksUniqueCount':finalDataSet.length};
    }else if(needed.toLowerCase()=="labels"){
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Got the All Links");
        let jobsSet=await getjobLinks(finalDataSet);
        const start = Date.now();
        log("Perfect Jobs Length:"+jobsSet.perfectJobs.length)
        var previousDatafetching=await previousDataFetchingProcess(jobsSet.perfectJobs,processId);
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Fetched the previous Data");
        log("previousDatafetching DbData Jobs Length:"+previousDatafetching.DbData.length)
        log("previousDatafetching nonDb Jobs Length:"+previousDatafetching.nonDb.length)
        if(previousDatafetching.nonDb.length>=30){
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Calling Parallel HTML and Plaintext");

            var finalDataSet=await parallelCallingPagination(start,previousDatafetching.nonDb.slice(0,30),'/HTMLPlainText');
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Got the response from Parallel HTML and Plaintext");
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Calling Parallel Bigml");
            log("finalDataSet success Jobs Length:"+finalDataSet.success.length)
            //return {finalDataSet}
            var BigmlSet=await parallelCallingAllLabels(start,finalDataSet.success);
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Got response from Parallel Bigml");
            log("BigmlSet success Jobs Length:"+BigmlSet.bigmlSuccessSet.length)
            //return {BigmlSet};
            var finalData=await appendSrc(BigmlSet.bigmlSuccessSet,joburl,processId);
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Appended Src to response");
            await db.collection('marketingOutput').deleteMany({'CareerLink':joburl});
            await dataInsertionProcess(finalData);
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+"Data Inserted");
            var goldSet=previousDatafetching.DbData.concat(BigmlSet.bigmlSuccessSet);
            await db.collection('marketingOutput').insertMany([{'SuccessJobs':goldSet,'HTMLFailureSet':finalDataSet.failed,'BigmlFailureJobs':BigmlSet.bigmlFailureSet,'CareerLink':joburl,'UpdateTime':dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")}]);
            var uniqueLabelSet=await uniqueLabels(goldSet);
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+"Calling Unique Labels ");
            await Promise.all([titleIssue(uniqueLabelSet.title),locationIssues(uniqueLabelSet.location),companyIssues(uniqueLabelSet.company)]);
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Got response from title,location,company Issues");
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Calling googleForJobsWork");
            await googleForJobsWork(uniqueLabelSet.combo);
            let finalCounter=await finalCounts(processId);
            let merged = Object.assign(...finalCounter); 
            log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Returning Data");
            return merged;
        }else{
            var finalDataSet=await parallelCallingPagination(start,previousDatafetching.nonDb,'/HTMLPlainText');
            var BigmlSet=await parallelCallingAllLabels(start,finalDataSet.success);
            var finalData=await appendSrc(BigmlSet.bigmlSuccessSet,joburl);
            await db.collection('marketingOutput').deleteMany({'CareerLink':joburl});
            await db.collection('marketingOutput').insertMany([{'SuccessJobs':finalData,'HTMLFailureSet':finalDataSet.failed,'BigmlFailureJobs':BigmlSet.bigmlFailureSet,'CareerLink':joburl,'UpdateTime':dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")}]);
            await dataInsertionProcess(finalData);
            var goldSet=previousDatafetching.DbData.concat(BigmlSet.bigmlSuccessSet);
            //return await db.collection('marketingtool_individual').find({'processId':processId}).project({'job-title':1,'location':1,'jobUrl':1,company:1,UpdateTime:1}).toArray()
            var uniqueLabelSet=await uniqueLabels(goldSet)
            await Promise.all([titleIssue(uniqueLabelSet.title),locationIssues(uniqueLabelSet.location),companyIssues(uniqueLabelSet.company)]);
            await googleForJobsWork(uniqueLabelSet.combo);
            let finalCounter=await finalCounts(processId);
            let merged = Object.assign(...finalCounter); 
            return merged;
        }

    }else if(needed.toLowerCase()=="htmlplaintext"){
        let jobsSet=await getjobLinks(finalDataSet);
        const start = Date.now();
        var finalDataSet=await parallelCallingPagination(start,jobsSet.perfectJobs,'/HTMLPlainText');
        return finalDataSet;
    }
    else{
        finalDataSet=await appendSrc(finalDataSet,joburl)
        return finalDataSet;
    }
}

async function dataInsertionProcess(dataSet){
    await Promise.all(
        dataSet.map(async Data => {
            let pushData=await db.collection('marketingtool_individual').find({ "jobUrl" :Data.jobUrl}).toArray()
            if(pushData.length==0){
                await db.collection('marketingtool_individual').insertOne(Data);
            }
    }));
}

async function finalCounts(processId){
    let finalcount=[]
    let labeller=['Searchable','Company Posted','ATS','thirdparty','Total Jobs','Not Appearing','Title Issue','Company Issue','Location issue']
    await Promise.all(
        labeller.map(async label => {
            if(label=='Searchable'){
                finalcount.push(await counter({'TL':1,'processId':processId},label))
            }
            if(label=='Company Posted'){
                finalcount.push(await counter({'TLC':1,'processId':processId},label))
            }
            if(label=='ATS'){
                finalcount.push(await counter({'TLC':2,'processId':processId},label))
            }
            if(label=='thirdparty'){
                finalcount.push(await counter({'TLC':3,'processId':processId},label))
            }
            if(label=='Not Appearing'){
                finalcount.push(await counter({'TLC':4,'processId':processId},label))
            }
            if(label=='Title Issue'){
                finalcount.push(await counter({'titleissue':1,'processId':processId},label))
            }
            if(label=='Company Issue'){
                finalcount.push(await counter({'companyIssue':1,'processId':processId},label))
            }
            if(label=='Location issue'){
                finalcount.push(await counter({'locationissue':1,'processId':processId},label))
            }
            if(label=='Total Jobs'){
                finalcount.push(await counter({'processId':processId},label))
            }
            
        }));
        ////console.log(finalcount);
        return finalcount;
}
async function counter(params,label){
    var obj = {};
    obj[label] = await db.collection('marketingtool_individual').find(params).count();
    return obj;
}

async function previousDataFetchingProcess(dataSet,processId){
    var DbData=[],nonDb=[];
    await Promise.all(
        dataSet.map(async Data => {
            let pushData=await db.collection('marketingtool_individual').find({ "jobUrl" :Data}).toArray()
            if(pushData.length){
                DbData.push(pushData[0])
                await db.collection('marketingtool_individual').updateMany({ "jobUrl" :Data},{$set:{'processId':processId}})
            }else{
                nonDb.push(Data)
            }
        }));
    return {DbData,nonDb}
}
async function getjobs(finalDataSet){
    var perfectJobs=[],noJobs=[];
    await Promise.all(
        finalDataSet.map(async Dataset => {
            //log(start,Url,Urls.indexOf(Url));
            let Url=Dataset.Link;
            //console.log(Url);
            if(UrlContainsForJobs(Url)){
                                                
                if(!endsWithUrl(Url)){
                    ////console.log("Pushing into Perfect Jobs="+Url);

                    perfectJobs.push(Dataset);
                    
                }
                else if(CheckLabel(Dataset.Label)){
                    perfectJobs.push(Dataset);
                    
                }
                else{
                    //console.log("Pushing into No Jobs="+Url);
                    noJobs.push(Dataset);  
                }
            }else{
                if(CheckLabel(Dataset.Label)){
                    perfectJobs.push(Dataset);
                    
                }
                else{
                    //console.log("Pushing into No Jobs"+Url);
                    noJobs.push(Dataset);
                    
                }
            }
        }));
    return {'perfectJobs':perfectJobs,'noJobs':noJobs,'perfectJobsCount':perfectJobs.length,'noJobsCount':noJobs.length}
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
                    ////console.log(body);
                    ////console.log(response.statusCode);
                    resolve(body);
                } else {
                    ////console.log(error);
                    ////console.log(response.statusCode);
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
                timeout:50000,
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
                 //console.log(body);
                 //console.log(response.statusCode);
                 resolve(body);
             } else {
                 //console.log(error);
                 ////console.log(response.statusCode);
                 
                 resolve('Api Failed')
             }
         }
 
         var response = request(options, callback);
     });
}
function CheckLabel(label){
    let DataSet=[
        'Apply More Details','More Info'
    ]
    for (let index = 0; index < DataSet.length; index++) {
        const element = DataSet[index];
        if(element==label.trim()){
            //console.log(element + " found");
            return true;
        }
    }
    return false;
}


function endsWithUrl(url){
    var endwithData=['/contact/','?searchphrase=','/staff','/services',"/feedback","search.html",
    "savedJobs.html","MyChart/","save_job/",
    "terms-and-conditions",
    "company.html",
    ".com/apply/",
    "prem-offline-form",
    '/search-and-apply/',
    "careers/#","/patients","/forgot","Research & Innovation","Patients & Visitors","terms/","/refer",'/responsibility','/terms-conditions',"/services",".org/","our-story/","forms/",'save_job/','open-positions/','topjobs/','/google-translate','.edu/','.org/','/volunteer','/join','/privacy/','/pay-your-bill','/terms/','/pay-a-bill','/submissions','/about','/privacy','/search','/your-application','/blog','/job_search#','.ca//','/contact-emerald/','/talk-to-us/','/connect.html','.com/','/contact-us.html','/contact-us','/contact','/contact.html']
    var Patterns=['&pageno=','/jobs/job-search/','/postings/all','page_job=','/jobs/resume','&pagenum=','/search','?pageNum=','page_jobs=','/jobsearch.ftl','/joblist.rss','plus.google.com','googleads.g.doubleclick.net','/location/','/category/','youtube.com','gmail.com','twitter.com','linkedin.com','page_jobs=','?facetcategory=','?facetcategory=','?facetcountry=','/listings.html','twitter.com','&pageNum=','pages=','/jobs/in/','jobOffset=','?folderOffset=', '&page=','&paged=','#page-','?pg=','PGNO=', 'Page-', 'Page=', 'page=','startrow=', 'page-', 'startRow=','#||||','|||||', 'p=', 'offset=','pagenumber=','Pagenumber=','pageNumber=']
    for (let index = 0; index < endwithData.length; index++) {
        const element = endwithData[index];
        if(url.endsWith(element)){
            //console.log(element + " found");

            return true;
        }
    }
    for (let index = 0; index < Patterns.length; index++) {
        const element = Patterns[index];
        if(url.indexOf(element)>=0){
            if(element=='/search'){
                if(url.indexOf('/search/job/')>=0|| url.toLowerCase().indexOf('/search-and-apply/')>=0 || url.toLowerCase().indexOf('/search/apply/all/')>=0 || url.toLowerCase().indexOf('/search-jobs/jobdetails')>=0){
                    return false;
                }
            }
            //console.log(element + " found");
            
            return true;
        }
    }

    return false;
}


function UrlContainsForJobs(url){
    let Dataset=[
        '/indeed-jobs/',
'/jobs?search',
'/career-opportunities/',
'/job-details-page?',
'.com/o/',
'.com/apply/',
'/jb/',
'/show-job-listing/',
'/OpportunityDetail?',
'/search-and-apply/',
'/careers/jobdetails/',
'/careeropportunities/',
'.applytojob.com/apply/',
'.hr/p/',
'/findjobs-details.php?',
'/positions/',
'/epostings/index.cfm?',
'/j/',
'/search-jobs/JobDetails/',
'/epostings/index.cfm?fuseaction=app.jobinfo&jobid=',
'/hr/ats/Posting/',
'/careers/v2/viewRequisition?org=',
'/careers/apply/',
'/x/detail',
'/employment/',
'/current-positions/',
'/JobDetails.aspx?__ID=',
'/JobDetails.aspx?job=',
'/MainInfoReq.asp?R_ID=',
'/jobs/ViewJobDetails?job=',
'/jobs.html?hireology_job_id=',
'/administration-jobs/',
'/find-jobs/',
'?jobID=',
'/careersection/rgi_external/jobdetail.ftl?job=',
'/employment/job-opening.php?req=',
'/career/JobIntroduction.action?clientId=',
'/careers/all-openings/',
'/OpportunityDetail?opportunityId=',
'/search/jobdetails/',
'/careers/openings?',
'/viewRequisition?org=',
'job_details.cfm&cJobId=',
'/bullhorn-career-portal/',
'/careers/discover-openings/vacancy/',
'/job.aspx?job_id=',
'/jobdetails.aspx?jid=',
'/ViewJob.aspx?JobID=',
'/PublicJobs/controller.cfm?jbaction=JobProfile&Job_Id=',
'/jobs?pos=',
'/jobs/view.php?id=',
'/job_postings/',
'/job_board_form?op=view&JOB_ID=',
'/hot-jobs/',
'/career-portal/',
'/search-jobs/',
'/careersite/JobDetails.aspx?id=',
'/pJobDetails.aspx?',
'/info/ItemID/',
'/details.aspx?jobnum=',
'/job-detail/#job_id=',
'/viewjob?t=',
'/it-jobs-careers/',
'/Openings/',
'/careers/requisition.jsp?org=',
'/pages/career-opportunities',
'/careers/PipelineDetail/',
'/jobs/individual-position/?gh_jid=',
'/careers/?p=job/',
'/careers-listing/',
'/Jobs/Details/',
'/careers?gh_jid=',
'/jobSearch.jsp?org=',
'/jobs/search?',
'/job-seeker/jobs/',
'/Jobsbridge1/',
'careers/vacancies/',
'/careers/job/?job_id=',
'/open-opportunities/job-details/?jobcode=',
'/jobdetail/?id=',
'/career-details/?jobid=',
'/job-description/',
'/content/about/',
'/careers?p=job/',
'/job-seeker/job-details/JobCode/',
'/jobs.html?gh_jid=',
'/careers/current-openings/?p=job/',
'/search-jobs/details/?job_id=',
'/job-detail/',
'/?page_id=',
'/careersite/1/home/requisition/',
'/job_listings.html?gh_jid=',
'/jobs?gh_jid=',
'/available-positions?gh_jid=',
'/career-details?job=',
'/apply/jobs/details/',
'/job-details/',
'/employment-opportunities/',
'/index.jsp?POSTING_ID=',
'/job-description.html?',
'/careers/positions/co/data/',
'/careers-at-inteleos/',
'/jobDesc.asp?JobID=',
'/PostingDetails.aspx?pid=',
'/job_details_page.php?id=',
'/current-job-openings&B_ID=',
'/jobdetail.ftl?job=',
'/career-detail/',
'/vacancies/',
'/careers/FolderDetail/',
'/ShowJob/Id/',
'/Job-Postings/',
'/job-openings#op-',
'/our-careers/',
'/employment-ir/',
'/JobDetails.asp?JO=',
'/content/employment.asp',
'/PublicJobs/',
'/Portals/Portals/JobBoard/JobDetail.aspx?JobIDs=',
'/careers.asp',
'/job-seekers/',
'/job_detail/',
'/JobDescription.asp',
'&JobNumber=',
'/jobs/',
'/job/',
'/job?',
'/Posting/',
'/JD/',
'/GetJob/ViewDetails/',
'/JobDetail/',
'/DashJobDetail/',
'?quickFind=',
'/job-description-page/',
'?job_id=',
'/rc/clk?/jobdetail.ftl',
'/ViewJobDetails',
'/careers/opportunity/',
'/ts2__JobDetails?jobId=',
'/ts2__JobDetails',
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
'-jobs-',
'/viewRequisition?',
'.showJob',
'/position-details/?job_id=',
'/position-details/',
'/careers/development/',
'/careers/partner-co-investor-relations/',
'/careers/onsite-property-management/',
'/careers/finance-capital-markets/',
'/careers/human-resources/',
'/careers/compliance/',
'/career-center/?RequirementId=',
'/jobboard.aspx?action=detail&recordid=',
'&recordid=',
'/postings/',
'/Views/Applicant/VirtualStepPositionDetails.aspx',
]
    for (let index = 0; index < Dataset.length; index++) {
        const element = Dataset[index];
        if(url.toLowerCase().indexOf(element.toLowerCase())>=0){
            //console.log(element + " found");
            return true;
        }
    }
    return false;
}
async function getjobLinks(finalDataSet){
    var perfectJobs=[],noJobs=[];
    await Promise.all(
        finalDataSet.map(async Dataset => {
            //log(start,Url,Urls.indexOf(Url));
            let Url=Dataset.Link;
            //console.log(Url);
            if(UrlContainsForJobs(Url)){
                                                
                if(!endsWithUrl(Url)){
                    ////console.log("Pushing into Perfect Jobs="+Url);

                    perfectJobs.push(Dataset.Link);
                    
                }
                else if(CheckLabel(Dataset.Label)){
                    perfectJobs.push(Dataset.Link);
                    
                }
                else{
                    //console.log("Pushing into No Jobs="+Url);
                    noJobs.push(Dataset.Link);  
                }
            }else{
                if(CheckLabel(Dataset.Label)){
                    perfectJobs.push(Dataset.Link);
                    
                }
                else{
                    //console.log("Pushing into No Jobs"+Url);
                    noJobs.push(Dataset.Link);
                    
                }
            }
        }));
    return {'perfectJobs':perfectJobs,'noJobs':noJobs,'perfectJobsCount':perfectJobs.length,'noJobsCount':noJobs.length}
}
async function appendSrc(finalDataSet,joburl,processId=0){
    let newSet=[]
    await Promise.all(
        finalDataSet.map(async Dataset => {
        const element = Dataset;
        element.sourcePoint=joburl;
        if(processId!=0){
            element.processId=processId;
        }
        newSet.push(element)
    }));
    return newSet;
}

async function googleForJobsWork(dataSet){
    try {
        let finaldata=[],errordata=[]
        await Promise.all(
            dataSet.map(async(data) => {
                try{
                    const start=Date.now();
                    let title=data.title
                    let location=data.location
                    let company=data.company
                    let joburl=data.url
                    var requestForData=await Promise.all([googleapiRequestFuntion(start,title,company,location,joburl,0),googleapiRequestFuntion(start,title,company,location,joburl,1)])
                    if(requestForData.length){
                        for (let index = 0; index < requestForData.length; index++) {
                            const element = requestForData[index];
                            if(element.hasOwnProperty('response')){
                                if(element.status=="1"){
                                    await db.collection('marketingtool_individual').updateMany({'jobUrl':data.url},{$set:{'TLC':element.response.type,'TLCresponse':element,'TLCmsg':element.response.msg}})
                                }else{
                                    await db.collection('marketingtool_individual').updateMany({'jobUrl':data.url},{$set:{'TL':element.response.type,'TLresponse':element,'TLmsg':element.response.msg}})
                                }
                            }

                        }
                    }
                    //await db.collection('marketingtool_individual').updateMany({'jobUrl':url},{$set:{'googleforJobs':requestForData}})
                    finaldata.push({'url':joburl,'response':requestForData})
                }catch(error){
                    //log(error);
                    errordata.push(data.url)
                }
            }));
            return {finaldata,errordata}  
    } catch (error) {
        //log("error in googleForJobsWork:"+error);
    }

}
async function uniqueLabels(finalData){
    let uniquetitle=[],uniquelocation=[],uniqueCompany=[],combo=[]
    for (let index = 0; index < finalData.length; index++) {
        const element = finalData[index];
        let label={'title':element['job-title'],location:element['location'],'company':element['company'],'url':element['jobUrl']}
        combo.push(label);
        if(element['job-title']!="" && element['job-title']!=null &&uniquetitle.indexOf(element['job-title'])==-1){
            uniquetitle.push(element['job-title'])
        }
        if(element['location']!="" && element['location']!=null && uniquelocation.indexOf(element.location)==-1){
            uniquelocation.push(element['location'])
        }
        if(element['company']!="" && element['company']!=null && uniqueCompany.indexOf(element.company)==-1){
            uniqueCompany.push(element['company'])
        }
    }
    return {'title':uniquetitle,'location':uniquelocation,'company':uniqueCompany,'combo':combo};          
}


async function titleIssue(titles){
    await Promise.all(
        titles.map(async(title) => {
            try {
                await titleCheck(title);
                return "done";
            } catch (error) {
                //log("error in titles function"+error)
            }
            
        })
    )

}
async function titleCheck(title){
    await Promise.all(    
        titleunwanted.map(async(element) => {
        if(element!=null || element!=""){
            //log("===========================================")
            // log("============================================")
            // log("element:"+element+" title:"+title)
            // log("Status1:"+element.toLowerCase().indexOf(title.toLowerCase()))
            // log("Status2:"+title.toLowerCase().indexOf(element.toLowerCase()))
            
            let Status1=element.toLowerCase().indexOf(title.toLowerCase());
            let Status2=title.toLowerCase().indexOf(element.toLowerCase());
            if(Status1>=0 || Status2>=0){
                await db.collection('marketingtool_individual').updateMany({'job-title':title},{$set:{'titleissue':1,'titleIssueMatch':element}});
                return;
            }
        }

    }))

    return "done";
}
async function locationIssues(locations){
    await Promise.all(locations.map(async(location) => {
        let counter=await db.collection('marketingtool_individual').find({'location':location,'locationissue':{'$exists':true}}).toArray();
        if(counter.length){
            await db.collection('marketingtool_individual').updateMany({'location':location},{$set:{'locationissue':counter[0]['locationissue']}});
        }else{
            let apiresponse=await locationAPI(location)
            if(apiresponse.hasOwnProperty('prediction')){
                var apiLoc=await locationStatus(apiresponse.prediction);
                if(apiLoc){
                    await db.collection('marketingtool_individual').updateMany({'location':location},{$set:{'locationAPI':apiresponse,'locationissue':0}});
                }else{
                    await db.collection('marketingtool_individual').updateMany({'location':location},{$set:{'locationAPI':apiresponse,'locationissue':1}});
                }
                
            }
        }
    }));
}
async function locationStatus(loc){
    if(loc.hasOwnProperty('city') || loc.hasOwnProperty('state') || loc.hasOwnProperty('country') || loc.hasOwnProperty('zipCode')){
        return true
    }
    return false;
}
async function locationAPI(location){
    var params={'loc':location};
    var requestOpts = {
        encoding: 'utf8',
        uri: 'http://devtestapi.jobiak.ai:8102/postLocation',
        method: 'POST',
        json: true,
        body:params
    };
    
    return rp(requestOpts);
}

async function companyIssues(companies){
    await Promise.all(companies.map(async(element) => {
        let dataSet=await db.collection('Glassdoor_Companies').find({'name':{$regex:element}}).toArray();
        if(dataSet.length){
            await db.collection('marketingtool_individual').updateMany({'company':element},{$set:{'companyIssue':0}});
        }else{
            await db.collection('marketingtool_individual').updateMany({'company':element},{$set:{'companyIssue':1}});
        }
    }));
}
