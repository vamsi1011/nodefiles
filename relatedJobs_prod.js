'use strict';
//npm i underscore https mongodb request-promise express body-parser http dateformat fs
var _ = require('underscore');
var https = require('https');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var serverurl= 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
var prodDB="mongodb://jobiakAppUser:7Sz6aNHWVq7*1yHNY%402DnTXp%3Cx5kpW-4c_%7B%26%7DZ91@34.225.95.137:27017/admin"
var localurl = "mongodb://localhost:27017/";
const log=console.log;
var db;
const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
var dateFormat = require('dateformat');
var now = new Date();
const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

var privateKey = fs.readFileSync( '/etc/ssl/certs/jobiak_ai.key' );
var certificate = fs.readFileSync( '/etc/ssl/certs/STAR_jobiak_ai.crt' );

MongoClient.connect(prodDB, {
    'poolSize': 10,
    'useNewUrlParser': true,'useUnifiedTopology':true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('prod_jobiak_ai') // whatever your database name is
    const HTTP_PORT = 8689;
    const HTTPS_PORT = 8690;
    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(HTTPS_PORT, () =>
    console.info("Run Sample Using ==> https://localhost:" + HTTPS_PORT)
    );
    http
        .createServer(app)
        .listen(HTTP_PORT, () =>
            console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
        );
})

app.get('/prod_relatedJobs', async (req, res) => {
    const title=decodeURIComponent(req.query.title);
    const company=decodeURIComponent(req.query.company);
    const jobId=req.query.jobId;
    const thresold=req.query.thresold;
    if(!title || title==null || title==""){
        return res.send({"err":"please provide the title"})
    }
    if(!company || company==null || company==""){
        return res.send({"err":"please provide the company"})
    }
    if(!jobId || jobId==null || jobId==""){
        return res.send({"err":"please provide the jobId"})
    }
    const details = await process(title.trim(),company.trim(),thresold,jobId);
    res.send(details)
});

app.post('/prod_relatedJobs', async (req, res) => {
    const title=decodeURIComponent(req.body.title);
    const company=decodeURIComponent(req.body.company);
    const jobId=req.body.jobId;
    const thresold=req.body.thresold;
    if(!title || title==null || title==""){
        return res.send({"err":"please provide the title"})
    }
    if(!company || company==null || company==""){
        return res.send({"err":"please provide the company"})
    }
    if(!jobId || jobId==null || jobId==""){
        return res.send({"err":"please provide the jobId"})
    }
    log("-----------------------------------------------------");
    const details = await process(title.trim(),company.trim(),thresold,jobId);
    log("-----------------------------------------------------");
    res.send(details)
});


async function process(title,company,thresold,jobId){
    try {
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Going to title-to-title API 1st Time");
        var GetResponse1=await rp({
            url: "http://prod-bigml-python-service-331630396.us-east-1.elb.amazonaws.com/recommend/title/title/?seed="+encodeURIComponent(title),
            method: 'GET',
            json: true,
          });
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Got the response from title-to-title API 1st Time");
        //log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Extracting titles");
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Going to title-to-title API 2nd time");
        let cleansedTitle=GetResponse1.title;
        log("----------------------------------------------")
        console.log("Clean title:"+cleansedTitle);
        log("----------------------------------------------")
        var GetResponse2=await rp({
            url: "http://prod-bigml-python-service-331630396.us-east-1.elb.amazonaws.com/recommend/title/title/?seed="+encodeURIComponent(cleansedTitle),
            method: 'GET',
            json: true,
          });
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Got the response from title-to-title API 2nd Time");
        let titles=await extractValue(GetResponse2,thresold);

        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Extracted titles");
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Going to Db for Related Jobs");
        let dataSet=await dataGetter(titles,company,jobId);
        dataSet.cleansedTitle=cleansedTitle;
        dataSet.titlesFromT2T_API=titles;
        return dataSet;
    } catch (error) {
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" error in process:"+error)
        return {}
    }
    
}
async function dataGetter(titles,company,jobId){
    let random=[],relatedJobs=[];
    try {
        if(titles.length){

            await Promise.all(
            titles.map(async title => {
                try {
                    relatedJobs.push(await queryData(title,company,jobId))
                    if(titles.indexOf(title)==(titles.length-1) && (company!=null || company!=undefined || company!="") ){
                        //relatedJobs=relatedJobs.concat(await queryData(title,company,jobId))
                        random.push(await randomQueryData(company,jobId))
                    }
                }catch(error){
                log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" error in process:"+error)
                }}));
                log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" done with DB:")
                await shuffle(random)
                //await shuffle(relatedJobs)
                //return {'relatedJobs':relatedJobs,'random':random}
                var finalRandomDataSet = Array.prototype.concat.apply([], random);
                var finalRelatedJobsDataSet = Array.prototype.concat.apply([], relatedJobs);
                finalRelatedJobsDataSet = await _.uniq(finalRelatedJobsDataSet,'title');
                finalRandomDataSet = await  _.uniq(finalRandomDataSet,'title');
                //return {'relatedJobs':finalRelatedJobsDataSet,'random':finalRandomDataSet}
                let newfinalRandomDataSet = await removeDup(finalRandomDataSet,finalRelatedJobsDataSet);
                return {'relatedJobs':finalRelatedJobsDataSet,'random':newfinalRandomDataSet,'finalrelatedJobs':await finalrelatedJobs(finalRelatedJobsDataSet,newfinalRandomDataSet)};
        }else{
            random=random.concat(await randomQueryData(company,jobId))
            await shuffle(random);
            var finalRandomDataSet = Array.prototype.concat.apply([], random);
            finalRandomDataSet = await uniqueDataSet(random,'title');
            return {'relatedJobs':[],'random':finalRandomDataSet,'finalrelatedJobs':await finalrelatedJobs([],finalRandomDataSet)};
        } 
    } catch (error) {
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" error in process:"+error)
    }

 
}
async function removeDup(myArray,toRemove){
    for( var i=myArray.length - 1; i>=0; i--){
        for( var j=0; j<toRemove.length; j++){
            if(myArray[i] && (myArray[i].submittedUrl === toRemove[j].submittedUrl)){
                myArray.splice(i, 1);
            }
        }
    }
    
    return myArray;
}
async function randomQueryData(company,jobId){
    let data=await db.collection('job').find({'company':company,'submittedUrl':{$exists:true},jobId:{$ne:jobId},"isActive" : true}).project({title:1,location:1,submittedUrl:1,company:1,"datePosted": 1}).toArray();
    log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Data got for :"+company+" is "+data.length)
    return data;
}
// async function randomQueryData(company){
//     let data=await db.collection('job').find({'company':company,'submittedUrl':{$exists:true},"isActive" : true}, {projection:{title:1,location:1,submittedUrl:1,company:1,"datePosted": 1}}).toArray();
//     log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Data got for :"+company+" is "+data.length)
//     return data;
// }
async function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}


  async function uniqueDataSet(originalArray, prop = "Link") {
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
async function finalrelatedJobs(relatedJobs,randomJobs){
    let finalArray=[]
    await shuffle(randomJobs);
    //await shuffle(relatedJobs);
    let rellength=relatedJobs.length;
    if(rellength>=5){
        return relatedJobs.slice(0,5);
    }else{
        let relLen=relatedJobs.length;
        let reqLen=5-relLen;
        finalArray=finalArray.concat(relatedJobs);
        if(randomJobs.length==0){
            var finalDataSet = Array.prototype.concat.apply([], finalArray);
            return finalDataSet;
        }
        if(reqLen>randomJobs.length){
            finalArray=finalArray.concat(randomJobs)
            var finalDataSet = Array.prototype.concat.apply([], finalArray);
            return finalDataSet;
        }else{
            finalArray=finalArray.concat(randomJobs.slice(0,reqLen))
            var finalDataSet = Array.prototype.concat.apply([], finalArray);
            return finalDataSet;
        }
        
        //return finalDataSet;
    }
}
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

async function queryData(title,company,jobId){
    try {
        if(company!=null || company!=undefined || company!=""){
            let data=await db.collection('job').find({'title':{$regex:title},'company':company,'submittedUrl':{$exists:true},jobId:{$ne:jobId},"isActive" : true}).project({title:1,location:1,submittedUrl:1,company:1,"datePosted": 1}).toArray();
            //log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Data got for :"+title+" is "+data.length)
            return data;
        }else{
            let data=await db.collection('job').find({'title':{$regex:title},'submittedUrl':{$exists:true},jobId:{$ne:jobId},"isActive" : true}).project({title:1,location:1,submittedUrl:1,company:1,"datePosted": 1}).toArray();
            //log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" Data got for :"+title+" is "+data.length)
            return data;  
        }
    } catch (error) {
        log(dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")+" error in process:"+error);
        return []
    }


}
async function extractValue(response,thresold=0.8){
    let titles=[];
    let dataSet=response.recommendations;
    await Promise.all(
        dataSet.map(async data => {
            if(data.confidence>=thresold){
                titles.push(data.value);
            }
        }));
    return titles;
}