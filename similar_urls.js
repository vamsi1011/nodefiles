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
    const HTTP_PORT = 8976;
    http
        .createServer(app)
        .listen(HTTP_PORT, () =>
            console.info("Run Sample Using ==> http://localhost:" + HTTP_PORT + "/")
        );
})
//allow express to access our html (index.html) file
app.get('/', async (req, res) => {
    var data = await process();
    res.send(data)
});
async function process() {
    const start = Date.now();
    let success = []
    const Data = await db.collection('urls_30').find({
        "Status": 0
    }).limit(1).toArray()
    console.info(Date.now() - start + "Starting");
    if (Data.length) {
        console.log("-------------------------");
        var domain = await Data[0].domain;
        // var companys = await company.split(" ")
        // var companyname = await company[0]
        console.log(domain)
        var doc = await db.collection('urls_3000').find({
            "name": {
                '$regex': domain
            }
        }).toArray();
        await console.log(doc.length);
        if (doc.length >= 1) {
            doc.forEach(async element => {
                var url = await element.url;
                updatedoc = await db.collection('urls_30').updateOne({}, {
                    $set: {
                        "domain"
                    }
                })


            });
        }
    }
}