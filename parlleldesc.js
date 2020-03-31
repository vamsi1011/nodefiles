'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:jobiak@3.18.238.8:28015/admin";
//var url = "mongodb://localhost:27017/";
var db;
var fs = require('fs');
const request = require('request');
var roundround = require('roundround');
"use strict";
var fs = require('fs');
/* global document:true, window:true, URL:true */
const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
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
app.get('/', async (req, res) => {
    const details = await process();
    res.send(details)
});

function log(start, url, msg) {
    console.info(new Date() + ' [' + (Date.now() - start) + ' ms] ' + msg + ': ' + url);
}
MongoClient.connect(url, {
    'poolSize': 10,
    'useNewUrlParser': true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('stage_jobs') // whatever your database name is
    const HTTP_PORT = 7679;
    var server = http
        .createServer(app)
        .listen(HTTP_PORT, () =>
            console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
        );
    server.timeout = 300000;
})

function log(start, url, msg) {
    console.info(new Date() + ' [' + (Date.now() - start) + ' ms] ' + msg + ': ' + url);
}

async function process() {
    const start = Date.now();
    const dataSet = await db.collection('Aug_Batch').find({
        'status': 11
    }).skip(0).limit(10).toArray()
    console.log("Length of Data:" + dataSet.length);
    var successLabels = [],
        errorlabels = [];
    var count = 0
    await Promise.all(

        dataSet.map(async data => {
            try {
                console.log(data.URL);

                var pageLabels = {};
                var startTime = Date.now();
                var responses = await getBigMLLabel(start, 'AllLabels', data.URL, data.HTML, data.PlainText, 'method', 'http://prod-bigml-python-service-331630396.us-east-1.elb.amazonaws.com/predict/label/jobdescription/');

                if (!responses.hasOwnProperty('error')) {
                    console.log("-----------------------------------------------");
                    count = count + 1;
                    console.log(count);
                    log(startTime, data.URL, 'Got the Response');
                    for (const resp of responses) {
                        pageLabels[resp.label] = resp.value;
                    }
                    pageLabels.status = 200
                    pageLabels.UpdateTime = new Date();
                    //await db.collection('goldenSetBigml').updateOne({'_id':data._id},{$set:pageLabels}).then(() => console.log('Updated Status Into the Collection')); 

                    console.log("-----------------------------------------------");

                } else {
                    console.log("-----------------------------------------------");
                    log(startTime, data.URL, 'Got the Error');
                    //await db.collection('goldenSetBigml').updateOne({'_id':data._id},{$set:{'status':500,UpdateTime:new Date()}}).then(() => console.log('Updated Status Into the Collection'));    
                    console.log("-----------------------------------------------");
                }

            } catch (error) {

                console.log("-----------------------------------------------");

                console.log(error);

                console.log("-----------------------------------------------");


            }
        })
    );
    console.log(Date.now() - start + "(secs) Completed the Task");
    //await sleep(4000);

}


function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}


// function getBigMLLabel(start, label, joburl, jobhtml, jobbody,method,apiUrl) {
//     try {
//         log(start, joburl, "Into the getBigMLLabel of " + label)
//         console.log(apiUrl);

//         var formData = {
//             joburl,
//             jobbody,
//             jobhtml
//         };
//         if(label=='Description'){
//             var formData = {
//                 joburl,
//                 jobbody,
//                 jobhtml,
//                 method
//             };
//             return rp({
//                 uri: apiUrl,
//                 method: 'POST',
//                 json: true,
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 },
//                 formData
//             });
//         }
//         return rp({
//             url: apiUrl,
//             method: 'POST',
//             json: true,
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             formData
//         });
//     } catch (error) {
//         console.log(error);
//         return {'error':error}
//     }

// }
function getBigMLLabel(start, label, joburl, jobhtml, jobbody, method, apiUrl) {
    try {
        log(start, joburl, "Into the getBigMLLabel of " + label)
        console.log(apiUrl);

        var formData = {
            joburl,
            jobbody,
            jobhtml
        };
        if (label == 'Description') {
            var formData = {
                joburl,
                jobbody,
                jobhtml,
                method
            };
            return rp({
                uri: apiUrl,
                method: 'POST',
                json: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                formData
            });
        }
        return rp({
            url: apiUrl,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            formData
        });
    } catch (error) {
        console.log(error);
        return {
            'error': 'error'
        }
    }

}

// async function getBigMLLabel(start, label, joburl, jobhtml, jobbody,method,apiUrl) {
//     if (joburl != "" && joburl != null && jobhtml!='' && jobhtml!=null && jobbody!='' && jobbody!=null) {
//     return await new Promise((resolve, reject) => {
//         // var dataString = '{ "joburl": "' + (joburl) + '","jobbody":"' + (jobbody) + '","jobhtml":"' + (jobhtml) + '","method":"' + method + '"}';
//         var formData = {
//             joburl,
//             jobbody,
//             jobhtml
//         };
//         var options = {
//             url: apiUrl,
//             method: 'POST',
//             json: true,
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             formData
//         };
//          function callback(error, response, body) {
//              if (!error && response.statusCode == 200) {
//                  //body=JSON.parse(body)
//                  //console.log(body);
//                  //console.log(response.statusCode);
//                  resolve(body);
//              } else {
//                  //console.log(error);
//                  //console.log(response.statusCode);
//                  resolve({'error':error})
//              }
//          }

//          var response = request(options, callback);
//      });
//     }
//     else{
//         return {}
//     }
// }


//await db.collection('Bigml_batch').updateOne({'_id':element._id},{$set:DiffBot}).then(() => console.log('Updated Status Into the Collection'));