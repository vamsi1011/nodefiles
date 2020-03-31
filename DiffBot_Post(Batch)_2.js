'use strict';
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://admin:jobiak@3.18.238.8:28015/admin';
let db
var querystring = require('querystring');
var roundround = require('roundround');
var Diffbot = [
    'e0d4926916c641fda4fcb583efca822b',
    'd3d9af77677b485aa64d6e9374e81730',
    '3c51c71605f14b34969d922880f59183',
    '4260129edb3a4d0596a773536ba81ad7',
    '4ee2fb15bef14efa987014539fc7aef0',
    'b8d9f42f5af24460afdda3a435c1fdb2',
];
var DescriptionEndpoints = ['http://jobiak-description.vpc.bigml.com/predict/label/jobdescription/', 'http://prod-bigml-python-service-331630396.us-east-1.elb.amazonaws.com/predict/label/jobdescription/', 'http://ec2-3-221-92-23.compute-1.amazonaws.com:8443/predict/label/jobdescription/', 'http://ec2-3-222-93-96.compute-1.amazonaws.com:8443/predict/label/jobdescription/', 'http://ijiraq.dev.bigml.com:8443/predict/label/jobdescription/']
var DescriptionRound = roundround(DescriptionEndpoints);
var DiffbotRound = roundround(Diffbot);
const rp = require('request-promise');
const request = require('request');
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

MongoClient.connect(url, {
    'poolSize': 10,
    'useNewUrlParser': true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('stage_jobs') // whatever your database name is
    const HTTP_PORT = 8804;
    http
        .createServer(app)
        .listen(HTTP_PORT, () =>
            console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT)
        );
})

async function process() {

    const start = Date.now();
    const Data = await db.collection('Aug_Batch').find({
        'status': 110,
        'Diffstatus': {
            $exists: false
        },
        givenstatus: {
            '$exists': false
        }
    }).skip(0).limit(10).toArray()
    console.log("Length of Data:" + Data.length);
    var count = 0
    var SuccessUrls = []
    await Promise.all(

        Data.map(async element => {
            try {
                console.log(element.URL)
                let joburl = element.URL
                let Html = element.jobHtml
                let PlainText = element.jobBody
                console.info(Date.now() - start + ': Opening page: ' + joburl);
                let diffPromise = getDiffBotResponse(joburl, Html);
                var DiffBot = await diffbotResponse(diffPromise, joburl);

                if (!DiffBot.hasOwnProperty('DiffBotHTML') || !DiffBot.hasOwnProperty('DiffBotPlainText')) {
                    diffPromise = getDiffBotResponse(joburl, Html, true);
                    DiffBot = await diffbotResponse(diffPromise, joburl);
                    if (!DiffBot.hasOwnProperty('DiffBotHTML') && !DiffBot.hasOwnProperty('DiffBotPlainText')) {
                        DiffBot.Diffstatus = 500
                        console.log('Updated Status:500 in Post')
                        await db.collection('Aug_Batch').updateOne({
                            '_id': element._id
                        }, {
                            $set: DiffBot
                        }).then(() => console.log('Updated Status Into the Collection'));
                    } else {
                        DiffBot.Diffstatus = 200
                        console.log('Updated Status:200 in Post')
                        await db.collection('Aug_Batch').updateOne({
                            '_id': element._id
                        }, {
                            $set: DiffBot
                        }).then(() => console.log('Updated Status Into the Collection'));
                    }
                } else {
                    DiffBot.Diffstatus = 200
                    console.log('Updated Status:200 in Get')
                    await db.collection('Aug_Batch').updateOne({
                        '_id': element._id
                    }, {
                        $set: DiffBot
                    }).then(() => console.log('Updated Status Into the Collection'));
                }
                console.info(Date.now() - start + ': Successfully Done Diffbot for the Page: ' + joburl);
                if (DiffBot.Diffstatus == 200) {
                    console.log("Into Diff 200 Description");

                    var jobDesc = await getBigMLLabel(start, 'Description', joburl, Html, DiffBot.DiffBotPlainText, 'no_model', DescriptionRound());
                    console.log(jobDesc);

                    var pageLabels = {},
                        Description = '';
                    if (jobDesc.hasOwnProperty('value')) {
                        let Dataset = jobDesc.value
                        for (const resp of Dataset) {
                            Description = Description + ' ' + resp.content
                        }
                        SuccessUrls.push(joburl)
                        await db.collection('Aug_Batch').updateOne({
                            '_id': element._id
                        }, {
                            $set: {
                                'job-description': Description,
                                'descStatus': 200
                            }
                        }).then(() => console.log('Updated descStatus 200 Into the Collection'));
                    } else {
                        await db.collection('Aug_Batch').updateOne({
                            '_id': element._id
                        }, {
                            $set: {
                                'job-description': Description,
                                'descStatus': 500
                            }
                        }).then(() => console.log('Updated descStatus 500 Into the Collection'));
                    }

                } else {
                    console.log("Into Diff 500 Description");
                    var jobDesc = await getBigMLLabel(start, 'Description', joburl, Html, PlainText, 'region', DescriptionRound());
                    var pageLabels = {},
                        Description = '';
                    if (jobDesc.hasOwnProperty('value')) {
                        let Dataset = jobDesc.value
                        for (const resp of Dataset) {
                            Description = Description + ' ' + resp.content
                        }
                        SuccessUrls.push(joburl)
                        await db.collection('Aug_Batch').updateOne({
                            '_id': element._id
                        }, {
                            $set: {
                                'job-description': Description,
                                'descStatus': 200,
                                'method': 'region'
                            }
                        }).then(() => console.log('Updated Status with region Into the Collection'));
                    } else {
                        await db.collection('Aug_Batch').updateOne({
                            '_id': element._id
                        }, {
                            $set: {
                                'job-description': Description,
                                'descStatus': 500,
                                'method': 'region'

                            }
                        }).then(() => console.log('Updated Status with region Into the Collection'));
                    }
                }
                await new Promise(done => setTimeout(done, 300));
            } catch (error) {

                console.log("-----------------------------------------------");

                console.log(error);

                console.log("-----------------------------------------------");
            }
        })
    )
    console.log("Returning the Data");
    await sleep(4000);
    await process();
    return SuccessUrls;

}


function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}




async function diffbotResponse(diffPromise, url, Html) {
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
            response.objects[0].text === '' || response.objects[0].text === '\n'
        ) {
            console.warn(new Date() + ' Diffbot error: ' + response.errorCode + '/' + response.error + ': ' + url);
            return {
                'Diffbot': response,
                'Diffbot_update_time': new Date()
            };
        } else {
            var DiffBotHtml = response.objects[0].html
            var DiffBotPlainText = response.objects[0].text
            return {
                'DiffBotHTML': DiffBotHtml,
                'DiffBotPlainText': DiffBotPlainText,
                'Diffbot': response,
                'Diffbot_update_time': new Date()
            };
        }
    } catch (error) {
        console.warn(new Date() + ' Diffbot error: ' + url, error);
        return {
            'Diffbot': {},
            'Diffbot_update_time': new Date(),
            'error': error
        };

    }


}


async function getBigMLLabel(start, label, joburl, jobhtml, jobbody, method, apiUrl) {
    return await new Promise((resolve, reject) => {
        // var dataString = '{ "joburl": "' + (joburl) + '","jobbody":"' + (jobbody) + '","jobhtml":"' + (jobhtml) + '","method":"' + method + '"}';
        console.log(apiUrl);

        var form = {
            'joburl': joburl,
            'jobbody': jobbody,
            'jobhtml': jobhtml,
            'method': method
        };
        var formData = querystring.stringify(form);
        var contentLength = formData.length;
        var options = {
            uri: apiUrl,
            method: 'POST',
            json: true,
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        }

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('printing body from callback func________________________________________________________')
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
            options.headers = {
                'Content-Type': 'text/html'
            };
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