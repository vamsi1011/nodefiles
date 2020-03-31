'use strict';
const fs = require('fs');
const MongoDB = require('mongodb');
const csv = require('fast-csv');
const mongoEndpoint = 'mongodb://admin:jobiak@3.18.238.8:28015/admin'
const dbName = 'companiesDataSet';
const collectionName = 'usCompanies';

// CSV Setup
const file = fs.createWriteStream(`output.csv`);
const stream = csv.format({
    'headers': false
});
stream.pipe(file).on('end', file.end);


let offset = 0;
MongoDB.connect(mongoEndpoint, {
    useUnifiedTopology: true
}, async function (err, mongoClient) {
    if (err) throw err;
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);


    collection.aggregate([{
            $match: {
                $and: [{
                    'given_status': 'dec11'
                }, {
                    isUSACompany: 1
                }]
            }
        },
        {
            $group: {
                _id: "$industry",
                companies: {
                    $push: {
                        "company": "$company",
                        "domain": "$domain",
                        "unitedStateJobs": "$unitedStateJobs"
                    }
                },
                length: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                "length": -1
            }
        }
    ]).toArray((err, docs) => {
        if (err) {
            throw err;
        }

        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            const companies = doc['companies'];

            // Industry
            stream.write([doc['_id'], '', '']);

            // Companies
            for (let j = 0; j < companies.length; j++) {
                const {
                    company,
                    domain,
                    unitedStateJobs
                } = companies[j];
                stream.write([company, domain, unitedStateJobs]);
            }

            // Empty space between industries block
            for (let i = 0; i < 5; i++) {
                stream.write(["", "", ""]);
            }
        }

        console.log('Done!');
        stream.end();
        mongoClient.close();
    });

});