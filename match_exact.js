"use strict";

/* global document:true, window:true, URL:true */

var fuzz = require('fuzzball');
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
var db;
const MongoClient = require('mongodb').MongoClient
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
MongoClient.connect("mongodb://localhost:27017/", {
    'useNewUrlParser': true
}, (err, client) => {
    if (err) return console.log(err)
    db = client.db('domains') // whatever your database name is
    const HTTP_PORT = 8978;
    http
        .createServer(app)
        .listen(HTTP_PORT, () =>
            console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/")
        );
})

//allow express to access our html (index.html) file
app.get('/', async (req, res) => {

    await process();
    res.send("success")
});


async function process() {
    const start = Date.now();
    let success = []
    const Data = await db.collection('final_urls_new').find({
        "RCheckStatus": {
            $exists: false
        }
    }).skip(0).limit(1000).toArray()
    console.info(Date.now() - start + "Starting");
    if (Data.length) {
        await Promise.all(

            Data.map(async element => {

                console.log("-------------------------");

                var response = await Promise.all([cmpPlainText(element.title, element.Updated_title, 'title', element._id),
                    cmpPlainText(element.location, element.Updated_location, 'location', element._id),
                    cmpPlainText(element.company, element.Updated_company, 'company', element._id),
                    cmpPlainText(element.jobType, element.Updated_jobType, 'jobType', element._id),
                    cmpPlainText(element.jobId, element.Updated_jobId, 'jobId', element._id),
                    cmpPlainText(element.expirationDate, element.Updated_expirationDate, 'expirationDate', element._id),
                    cmpPlainText(element.salary, element.Updated_salary, 'salary', element._id),
                    cmpPlainText(element.postedDate, element.Updated_postedDate, 'postedDate', element._id)
                ]);
                for (let i = 0; i < response.length; i++) {
                    let pb = {}
                    if (response[i].label == 'title') {
                        pb.titleMatchratio = response[i].fuzz_ratio
                        pb.bigml_title_Status = response[i].bigml_Status

                    } else if (response[i].label == 'location') {
                        pb.locationMatchratio = response[i].fuzz_ratio
                        pb.bigml_location_Status = response[i].bigml_Status

                    } else if (response[i].label == 'jobType') {
                        pb.jobTypeMatchratio = response[i].fuzz_ratio
                        pb.bigml_jobType_Status = response[i].bigml_Status

                    } else if (response[i].label == 'jobId') {
                        pb.jobIdMatchratio = response[i].fuzz_ratio
                        pb.bigml_jobId_Status = response[i].bigml_Status

                    } else if (response[i].label == 'expirationDate') {
                        pb.expirationDateMatchratio = response[i].fuzz_ratio
                        pb.bigml_expirationDate_Status = response[i].bigml_Status

                    } else if (response[i].label == 'salary') {
                        pb.salaryMatchratio = response[i].fuzz_ratio
                        pb.bigml_salary_Status = response[i].bigml_Status

                    } else if (response[i].label == 'postedDate') {
                        pb.postedDateMatchratio = response[i].fuzz_ratio
                        pb.bigml_postedDate_Status = response[i].bigml_Status
                    } else {
                        pb.companyMatchratio = response[i].fuzz_ratio
                        pb.bigml_company_Status = response[i].bigml_Status

                    }
                    pb.RCheckStatus = 100;
                    await db.collection('final_urls_new').updateOne({
                        '_id': element._id
                    }, {
                        $set: pb
                    }).then(() => console.log('Updated 200 Status Into the Collection in url contains'));
                }
                success.push({
                    'url': element.URL,
                    response
                })
                console.log("-------------------------");
            }));
        console.info(Date.now() - start + "ending");
        await process();
    } else {
        return 'done'
    }

}

function cmpPlainText(txt1, txt2, label) {
    try {
        if (txt1 !== null && txt2 !== null && txt1.trim() !== "" && txt2.trim() !== "") {
            txt1 = txt1.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ /g, ' ');
            txt2 = txt2.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ /g, ' ')
            console.log(txt1);
            console.log(txt2)
            // if(txt1.toLowerCase()==txt2.toLowerCase()){
            //     return {'fuzz_ratio':100,'bigml_Status':'exact',label};
            // }else{
            //     return {'fuzz_ratio':0,'bigml_Status':'no match',label};
            // }
            let fuzz_ratio = fuzz.token_set_ratio(txt1, txt2);
            console.log({
                fuzz_ratio,
                'bigml_Status': 'exact',
                label
            });
            // return {fuzz_ratio,'bigml_Status':'exact',label};
            if (txt2.length == txt1.length) {
                //bigml partal exists
                let fuzz_ratio = fuzz.token_set_ratio(txt1, txt2);
                console.log({
                    fuzz_ratio,
                    'bigml_Status': 'exact',
                    label
                });
                return {
                    fuzz_ratio,
                    'bigml_Status': 'exact',
                    label
                };
            } else if (txt2.length > txt1.length) {
                let fuzz_ratio = fuzz.token_set_ratio(txt1, txt2);
                // eval("var matchPercent_"+label+" = '"+fuzz_ratio+"';");
                // eval("var bigml_Status_"+label+" = '"+fuzz_ratio+"';");
                console.log({
                    fuzz_ratio,
                    'bigml_Status': 'Partial',
                    label
                });
                return {
                    fuzz_ratio,
                    'bigml_Status': 'Partial',
                    label
                };
            } else {
                //bigml given extra content
                let fuzz_ratio = fuzz.token_set_ratio(txt2, txt1);
                console.log({
                    fuzz_ratio,
                    'bigml_Status': 'bigml predicted extra',
                    label
                });
                return {
                    fuzz_ratio,
                    'bigml_Status': 'bigml predicted extra',
                    label
                };
            }

        } else {
            if (txt1 == null || txt1 == "") {
                return {
                    'fuzz_ratio': 0,
                    'bigml_Status': 'bigml predicted null',
                    label
                };
            } else {
                return {
                    'fuzz_ratio': 0,
                    'bigml_Status': 'manual predicted null',
                    label
                };
            }
        }
    } catch (error) {
        if (txt1 == null || txt1 == "") {
            return {
                'fuzz_ratio': 0,
                'bigml_Status': 'bigml predicted null',
                label
            };
        } else {
            return {
                'fuzz_ratio': 0,
                'bigml_Status': 'manual predicted null',
                label
            };
        }
    }


}