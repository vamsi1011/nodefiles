'use strict';
var MongoClient = require('mongodb').MongoClient;
var fuzz = require('fuzzball');
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var domains = db.db("domains");
    var urls = db.db("domains")

    urls.collection("urls_new").find({}, {
        projection: {
            _id: 0,
            domain: 1
        }
    }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
    });
    var domainNames = domains.collection("all_domains").find({}).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        return result;
    });
    console.log("domain names------------------start----------------------------------")
    console.log(domainNames);
    console.log("domain names----------------------end------------------------------")
});